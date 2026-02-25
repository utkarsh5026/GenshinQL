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
  /** Color applied to the active tab text and glass card tint (e.g. element color) */
  activeColor?: string;
  /** Framer Motion layoutId for the glass card indicator. Must be unique per page. */
  indicatorId?: string;
  className?: string;
}

/**
 * Horizontally scrollable tab bar.
 * Each item can have a label, an optional React icon, or an optional image URL.
 * Provides a frosted glass card indicator via Framer Motion.
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

  /**
   * Scroll the
   */
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
      className={cn(
        'relative w-full min-w-0',
        'mask-[linear-gradient(to_right,transparent_0px,black_20px,black_calc(100%-20px),transparent_100%)]',
        className
      )}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide rounded-2xl bg-muted/30 p-1"
      >
        <div className="relative inline-flex gap-0.5">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={isActive ? activeButtonRef : undefined}
                onClick={() => onChange(item.id)}
                className={cn(
                  'relative flex items-center gap-1.5 whitespace-nowrap',
                  'px-4 py-2.5 text-sm font-medium rounded-xl',
                  'transition-colors duration-200',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground/60 hover:text-foreground/70 hover:bg-white/5'
                )}
                style={
                  isActive && activeColor ? { color: activeColor } : undefined
                }
              >
                {isActive && (
                  <motion.span
                    layoutId={indicatorId}
                    className="absolute inset-0 rounded-xl border-2 backdrop-blur-sm"
                    style={
                      activeColor
                        ? {
                            backgroundColor: `color-mix(in srgb, ${activeColor} 12%, hsl(var(--background) / 0.7))`,
                            borderColor: `color-mix(in srgb, ${activeColor} 28%, hsl(var(--border)))`,
                          }
                        : {
                            backgroundColor: 'hsl(var(--background) / 0.6)',
                            borderColor: 'hsl(var(--border) / 0.5)',
                          }
                    }
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}

                {/* Content layer sits above the glass card */}
                <span className="relative z-10 flex items-center gap-1.5">
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
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
