import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

import styles from './genshin-button.module.css';

const genshinButtonVariants = cva(styles.base, {
  variants: {
    variant: {
      danger: styles.danger,
      ghost: styles.ghost,
      gold: styles.gold,
      outline: styles.outline,
      secondary: styles.secondary,
    },
    size: {
      icon: styles.icon,
      lg: styles.lg,
      md: styles.md,
      sm: styles.sm,
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'gold',
  },
});

export interface GenshinButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof genshinButtonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const GenshinButton = React.forwardRef<HTMLButtonElement, GenshinButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'gold',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    if (asChild) {
      return (
        <Comp
          className={cn(genshinButtonVariants({ size, variant }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(genshinButtonVariants({ size, variant }), className)}
        ref={ref}
        {...props}
      >
        <span aria-hidden="true" className={styles.shimmer} />

        <span className={styles.content}>
          {leftIcon != null && (
            <span className={styles.iconWrapper}>{leftIcon}</span>
          )}
          {children}
          {rightIcon != null && (
            <span className={styles.iconWrapper}>{rightIcon}</span>
          )}
        </span>
      </Comp>
    );
  }
);

GenshinButton.displayName = 'GenshinButton';

// eslint-disable-next-line react-refresh/only-export-components
export { GenshinButton, genshinButtonVariants };
