import * as React from 'react';

import {
  type Element,
  getElementEntry,
  getRarityEntry,
  type Rarity,
} from '@/lib/game-colors';
import { cn } from '@/lib/utils';

export type ChipVariant = 'solid' | 'outline' | 'ghost';

export interface GenshinChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Genshin element (e.g. "Pyro", "Hydro"). Colors the chip. */
  element?: Element | string;
  /** Item rarity 1–5. Used when no element is provided. */
  rarity?: Rarity | number;
  /**
   * Visual style variant:
   * - `solid`   — filled game-color background + border (default)
   * - `outline` — transparent background, game-color border only
   * - `ghost`   — no background, no border, just colored text
   */
  variant?: ChipVariant;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Renders a × dismiss button. Stops propagation to the chip. */
  onDismiss?: () => void;
  /** Whether the chip appears selected / active (higher opacity). */
  selected?: boolean;
}

const GenshinChip = React.forwardRef<HTMLButtonElement, GenshinChipProps>(
  (
    {
      children,
      className,
      element,
      rarity,
      variant = 'solid',
      leftIcon,
      onDismiss,
      selected = false,
      ...props
    },
    ref
  ) => {
    let bg: string;
    let border: string;
    let text: string;

    if (element != null) {
      const c = getElementEntry(element);
      bg = variant === 'solid' ? c.bg : 'bg-transparent';
      border = variant === 'ghost' ? 'border-transparent' : c.border;
      text = c.text;
    } else if (rarity != null) {
      const c = getRarityEntry(rarity);
      bg = variant === 'solid' ? c.bg : 'bg-transparent';
      border = variant === 'ghost' ? 'border-transparent' : c.borderSoft;
      text = c.text;
    } else {
      bg = variant === 'solid' ? 'bg-white/5' : 'bg-transparent';
      border = variant === 'ghost' ? 'border-transparent' : 'border-white/10';
      text = 'text-muted-foreground';
    }

    return (
      <button
        ref={ref}
        data-selected={selected}
        className={cn(
          'inline-flex items-center gap-1 rounded px-2 py-0.5',
          'border text-xs font-medium whitespace-nowrap select-none',
          'transition-opacity duration-150 cursor-pointer',
          'disabled:opacity-50 disabled:pointer-events-none',
          bg,
          border,
          text,
          !selected && 'opacity-60 hover:opacity-90',
          className
        )}
        {...props}
      >
        {leftIcon != null && (
          <span className="inline-flex items-center shrink-0">{leftIcon}</span>
        )}

        {children}

        {onDismiss != null && (
          <span
            aria-label="Remove"
            role="button"
            tabIndex={-1}
            className="ml-0.5 opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          >
            ×
          </span>
        )}
      </button>
    );
  }
);

GenshinChip.displayName = 'GenshinChip';

export { GenshinChip };
