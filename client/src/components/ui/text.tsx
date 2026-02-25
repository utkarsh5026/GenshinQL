import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Font sizes are mobile-first: the first class is the mobile size,
 * the `sm:` prefix kicks in at 640px for the full desktop size.
 *
 * xs   11px → 12px
 * sm   12px → 14px
 * base 14px → 16px
 * lg   16px → 18px
 * xl   18px → 20px
 * 2xl  20px → 24px
 * 3xl  24px → 30px
 * 4xl  30px → 36px
 */
const SIZE_VARIANTS = {
  xs: 'text-[11px] sm:text-xs',
  sm: 'text-xs sm:text-sm',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
  '2xl': 'text-xl sm:text-2xl',
  '3xl': 'text-2xl sm:text-3xl',
  '4xl': 'text-3xl sm:text-4xl',
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
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
} as const;

const WRAP_VARIANTS = {
  pretty: 'text-pretty',
  balance: 'text-balance',
  nowrap: 'text-nowrap',
} as const;

/* ─────────────────────────────────────────────
   Text
   Polymorphic inline/block text component.

   Usage:
     <Text>Body paragraph</Text>
     <Text as="span" size="sm" color="muted">Secondary</Text>
     <Text size="lg" weight="semibold" color="gold">Legendary</Text>
     <Text size="xs" truncate>Very long label that gets clipped</Text>
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
    leading: 'normal',
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
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      align,
      as: Tag = 'p',
      asChild = false,
      className,
      color = 'default',
      leading = 'normal',
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
    return (
      <Comp
        className={cn(
          textVariants({
            align,
            color,
            leading,
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
───────────────────────────────────────────── */

const headingVariants = cva(
  'font-sans m-0 leading-tight tracking-tight antialiased text-balance',
  {
    variants: {
      size: SIZE_VARIANTS,
      color: COLOR_VARIANTS,
      weight: WEIGHT_VARIANTS,
      align: ALIGN_VARIANTS,
      wrap: WRAP_VARIANTS,
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
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      align,
      asChild = false,
      className,
      color = 'default',
      level = 2,
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
