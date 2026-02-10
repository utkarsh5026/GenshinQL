import React from 'react';

import { cn } from '@/lib/utils';

interface FilterButtonProps {
  isSelected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable filter toggle button component
 * Used across weapon filter interfaces for consistent styling and behavior
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  isSelected,
  onClick,
  ariaLabel,
  children,
  gap = 'md',
  className,
}) => {
  const gapClass = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }[gap];

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center shrink-0',
        'px-2 py-1 text-xs md:px-3 md:py-1.5 md:text-sm',
        'rounded-full border-none',
        'transition-all duration-200',
        gapClass,
        isSelected
          ? 'bg-primary/10 border-primary/20 text-primary'
          : 'bg-muted/50 border-border hover:bg-muted',
        className
      )}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
    >
      {children}
    </button>
  );
};
