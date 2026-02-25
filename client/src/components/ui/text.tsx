import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Font sizes are mobile-first with 3-step responsive scaling:
 * default (mobile) → sm: 640px (tablet) → md: 768px (desktop)
 *
 * xs   11px → 12px
 * sm   12px → 13px → 14px
 * base 14px → 15px → 16px
 * lg   16px → 17px → 18px
 * xl   18px → 19px → 20px
 * 2xl  20px → 22px → 24px
 * 3xl  24px → 27px → 30px
 * 4xl  30px → 33px → 36px
 */
const SIZE_VARIANTS = {
  xs: 'text-[11px] sm:text-xs',
  sm: 'text-xs sm:text-[13px] md:text-sm',
  base: 'text-sm sm:text-[15px] md:text-base',
  lg: 'text-base sm:text-[17px] md:text-lg',
  xl: 'text-lg sm:text-[19px] md:text-xl',
  '2xl': 'text-xl sm:text-[22px] md:text-2xl',
  '3xl': 'text-2xl sm:text-[27px] md:text-3xl',
  '4xl': 'text-3xl sm:text-[33px] md:text-4xl',
} as const;

const COLOR_VARIANTS = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  gold: 'text-legendary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  danger: 'text-destructive',
  inherit: 'text-inherit',
} as const;

const WEIGHT_VARIANTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

const ALIGN_VARIANTS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const LEADING_VARIANTS = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

const WRAP_VARIANTS = {
  pretty: 'text-pretty',
  balance: 'text-balance',
  nowrap: 'text-nowrap',
} as const;

/**
 * Controls max line length for readability.
 * The typographic sweet spot is 45–75 characters per line.
 *
 * narrow  45ch — dense UI labels, sidebars
 * normal  65ch — body paragraphs, articles
 * wide    80ch — wider content areas
 */
const MEASURE_VARIANTS = {
  narrow: 'max-w-[45ch]',
  normal: 'max-w-[65ch]',
  wide: 'max-w-[80ch]',
} as const;

/**
 * Default line-height per size group for Text (not Heading).
 * Small text breathes more; large display text stays tight.
 * Overridable via the `leading` prop.
 */
const TEXT_LEADING_BY_SIZE: Record<
  keyof typeof SIZE_VARIANTS,
  keyof typeof LEADING_VARIANTS
> = {
  xs: 'relaxed',
  sm: 'relaxed',
  base: 'normal',
  lg: 'normal',
  xl: 'snug',
  '2xl': 'snug',
  '3xl': 'tight',
  '4xl': 'tight',
};

/* ─────────────────────────────────────────────
   Text
   Polymorphic inline/block text component.

   Usage:
     <Text>Body paragraph</Text>
     <Text as="span" size="sm" color="muted">Secondary</Text>
     <Text size="lg" weight="semibold" color="gold">Legendary</Text>
     <Text size="xs" truncate>Very long label that gets clipped</Text>
     <Text measure="normal">Long-form paragraph with ideal line length</Text>
     <Text asChild><label htmlFor="input">Label</label></Text>
───────────────────────────────────────────── */

const textVariants = cva('font-sans m-0 antialiased text-pretty', {
  variants: {
    size: SIZE_VARIANTS,
    color: COLOR_VARIANTS,
    weight: WEIGHT_VARIANTS,
    align: ALIGN_VARIANTS,
    leading: LEADING_VARIANTS,
    wrap: WRAP_VARIANTS,
    measure: MEASURE_VARIANTS,
    truncate: {
      true: 'truncate',
    },
    uppercase: {
      true: 'uppercase tracking-widest',
    },
  },
  defaultVariants: {
    size: 'base',
    color: 'default',
    weight: 'normal',
  },
});

type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'li'
  | 'strong'
  | 'em'
  | 'small'
  | 'blockquote';

export interface TextProps
  extends
    Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof textVariants> {
  /** HTML tag to render. Defaults to `p`. */
  as?: TextElement;
  /** Render as child element via Radix Slot. */
  asChild?: boolean;
  /** Controls text-wrap. Defaults to `pretty` (prevents orphaned words). */
  wrap?: keyof typeof WRAP_VARIANTS;
  /**
   * Constrains max line length for readability (uses `ch` units).
   * Omit for no constraint (default).
   */
  measure?: keyof typeof MEASURE_VARIANTS;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      align,
      as: Tag = 'p',
      asChild = false,
      className,
      color = 'default',
      leading,
      measure,
      size = 'base',
      truncate,
      uppercase,
      weight = 'normal',
      wrap,
      ...props
    },
    ref
  ) => {
    const Comp = (asChild ? Slot : Tag) as React.ElementType;
    const resolvedLeading = leading ?? TEXT_LEADING_BY_SIZE[size ?? 'base'];
    return (
      <Comp
        className={cn(
          textVariants({
            align,
            color,
            leading: resolvedLeading,
            measure,
            size,
            truncate,
            uppercase,
            weight,
            wrap,
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

/* ─────────────────────────────────────────────
   Heading
   Semantic heading with responsive size.
   The `level` prop controls the HTML tag (h1–h6).
   The `size` prop controls the visual size independently —
   if omitted it auto-selects a sensible default for the level.

   Usage:
     <Heading level={1}>Page Title</Heading>
     <Heading level={2} size="2xl" color="gold">Section</Heading>
     <Heading level={3} weight="bold" uppercase>Sub-section</Heading>
     <Heading level={4} size="base" color="muted" truncate>Clipped header</Heading>
     <Heading level={2} measure="normal">Constrained heading width</Heading>
───────────────────────────────────────────── */

const headingVariants = cva(
  'font-sans m-0 leading-tight tracking-tight antialiased text-balance',
  {
    variants: {
      size: SIZE_VARIANTS,
      color: COLOR_VARIANTS,
      weight: WEIGHT_VARIANTS,
      align: ALIGN_VARIANTS,
      leading: LEADING_VARIANTS,
      wrap: WRAP_VARIANTS,
      measure: MEASURE_VARIANTS,
      truncate: {
        true: 'truncate',
      },
      uppercase: {
        true: 'uppercase tracking-widest',
      },
    },
    defaultVariants: {
      color: 'default',
      weight: 'semibold',
    },
  }
);

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextSize = NonNullable<VariantProps<typeof textVariants>['size']>;

/** Default visual size for each heading level when `size` prop is not provided. */
const HEADING_SIZE_DEFAULTS: Record<HeadingLevel, TextSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'base',
};

export interface HeadingProps
  extends
    Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  /** Semantic HTML heading level. Controls the rendered tag. Defaults to `2`. */
  level?: HeadingLevel;
  /** Render as child element via Radix Slot. */
  asChild?: boolean;
  /** Controls text-wrap. Defaults to `balance` (evens out multi-line headings). */
  wrap?: keyof typeof WRAP_VARIANTS;
  /**
   * Constrains max line length for readability (uses `ch` units).
   * Omit for no constraint (default).
   */
  measure?: keyof typeof MEASURE_VARIANTS;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      align,
      asChild = false,
      className,
      color = 'default',
      leading,
      level = 2,
      measure,
      size,
      truncate,
      uppercase,
      weight = 'semibold',
      wrap,
      ...props
    },
    ref
  ) => {
    const Tag = asChild
      ? (Slot as React.ElementType)
      : (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

    const resolvedSize = size ?? HEADING_SIZE_DEFAULTS[level];

    return (
      <Tag
        className={cn(
          headingVariants({
            align,
            color,
            leading,
            measure,
            size: resolvedSize,
            truncate,
            uppercase,
            weight,
            wrap,
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

// eslint-disable-next-line react-refresh/only-export-components
export { Heading, headingVariants, Text, textVariants };
