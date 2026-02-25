import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface ScrollTabItem<T extends string = string> {
  id: T;
  label: string;
  /** React node rendered to the left of the label */
  icon?: React.ReactNode;
  /** URL of a small image rendered to the left of the label */
  imageUrl?: string;
}

interface ScrollTabsProps<T extends string = string> {
  items: ScrollTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  /** Color applied to the active tab text and indicator (e.g. element color) */
  activeColor?: string;
  /** Framer Motion layoutId for the sliding indicator. Must be unique per page. */
  indicatorId?: string;
  className?: string;
}

/**
 * Horizontally scrollable tab bar.
 * Each item can have a label, an optional React icon, or an optional image URL.
 * Provides a sliding underline indicator via Framer Motion.
 * The active tab is automatically scrolled into view (important on mobile).
 */
export function ScrollTabs<T extends string = string>({
  items,
  activeId,
  onChange,
  activeColor,
  indicatorId = 'scroll-tabs-indicator',
  className,
}: ScrollTabsProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll the active tab into view whenever activeId changes
  useEffect(() => {
    const button = activeButtonRef.current;
    const container = scrollRef.current;
    if (!button || !container) return;

    const btnLeft = button.offsetLeft;
    const btnRight = btnLeft + button.offsetWidth;
    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;

    if (btnLeft < containerLeft) {
      container.scrollTo({ left: btnLeft - 16, behavior: 'smooth' });
    } else if (btnRight > containerRight) {
      container.scrollTo({
        left: btnRight - container.clientWidth + 16,
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'w-full min-w-0 overflow-x-auto scrollbar-hide border border-border/40 rounded-2xl',
        className
      )}
    >
      <div className="relative inline-flex">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={isActive ? activeButtonRef : undefined}
              onClick={() => onChange(item.id)}
              className={cn(
                'relative flex items-center gap-1.5 whitespace-nowrap',
                'px-4 py-3 text-sm font-medium',
                'transition-colors duration-200',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
              style={
                isActive && activeColor ? { color: activeColor } : undefined
              }
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                  aria-hidden
                />
              ) : item.icon ? (
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  {item.icon}
                </span>
              ) : null}

              <span>{item.label}</span>

              {isActive && (
                <motion.span
                  layoutId={indicatorId}
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{
                    backgroundColor: activeColor ?? 'hsl(var(--foreground))',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
