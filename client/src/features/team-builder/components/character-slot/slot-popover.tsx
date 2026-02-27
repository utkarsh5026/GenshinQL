import React from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** ── SlotPopover ───────────────────────────────────────────────────────────
 *  Shared wrapper for all badge-style trigger popovers in a character slot.
 *  Renders a small dark pill button as the trigger and a labelled popover
 *  panel as the content. Pass slot-specific options as `children`.
 */
interface SlotPopoverProps {
  label: string;
  title: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  contentClassName?: string;
  triggerClassName?: string;
  children: React.ReactNode;
}

export const SlotPopover: React.FC<SlotPopoverProps> = ({
  label,
  title,
  side = 'right',
  align = 'start',
  sideOffset = 6,
  contentClassName,
  triggerClassName,
  children,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded bg-midnight-950/60 text-foreground/80 hover:bg-midnight-950/80 hover:text-foreground transition-all border border-border/40',
          triggerClassName
        )}
        title={`Set ${title.toLowerCase()}`}
      >
        {label}
      </button>
    </PopoverTrigger>
    <PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      className={cn('p-2', contentClassName)}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </p>
      {children}
    </PopoverContent>
  </Popover>
);
