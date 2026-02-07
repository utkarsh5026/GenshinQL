import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/components/utils/CachedImage';

/**
 * Minimum shape required for any item to be navigable
 */
export interface NavigableItem {
  name: string;
  iconUrl: string;
}

interface NavigationButtonProps<T extends NavigableItem> {
  item: T | null;
  direction: 'previous' | 'next';
  onNavigate: (itemName: string) => void;
  accentColor: string;
  labelSingular: string;
}

/**
 * Reusable navigation button component
 */
function NavigationButton<T extends NavigableItem>({
  item,
  direction,
  onNavigate,
  accentColor,
  labelSingular,
}: NavigationButtonProps<T>): React.ReactElement {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const keyboardHint = isPrevious ? '←' : '→';
  const label = isPrevious ? 'Previous' : 'Next';

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          onClick={() => item && onNavigate(item.name)}
          disabled={!item}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200
            ${
              item
                ? 'bg-midnight-800/50 hover:bg-midnight-700/60 border border-midnight-600/40 hover:border-opacity-60 cursor-pointer'
                : 'bg-midnight-800/20 border border-midnight-700/20 cursor-not-allowed opacity-40'
            }
          `}
          style={item ? { borderColor: `${accentColor}30` } : undefined}
        >
          {isPrevious && <Icon className="w-4 h-4 text-starlight-400" />}

          {item && (
            <>
              {!isPrevious && (
                <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                  {item.name}
                </span>
              )}

              <Avatar className="w-6 h-6 border border-midnight-600/40">
                <CachedImage
                  lazy
                  src={item.iconUrl}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full"
                  skeletonSize="sm"
                  skeletonShape="circle"
                />
              </Avatar>

              {isPrevious && (
                <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                  {item.name}
                </span>
              )}
            </>
          )}

          {!isPrevious && <Icon className="w-4 h-4 text-starlight-400" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium">
        {item ? (
          <div className="flex items-center gap-2">
            <span>
              {label} {labelSingular}: {item.name}
            </span>
            <kbd className="px-1.5 py-0.5 text-xs bg-midnight-700 rounded">
              {keyboardHint}
            </kbd>
          </div>
        ) : (
          `No ${direction} ${labelSingular}`
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export interface ItemNavigationProps<T extends NavigableItem> {
  /** Array of items to navigate through */
  items: T[];

  /** Name of the currently displayed item */
  currentItemName: string;

  /** Route prefix for navigation (e.g., '/characters', '/weapons') */
  routePrefix: string;

  /** Accent color for borders (hex format, e.g., '#D4A84B') */
  accentColor: string;

  /**
   * Singular form of item type for tooltip labels
   * @default 'item'
   */
  labelSingular?: string;

  /** Additional CSS classes for container */
  className?: string;
}

/**
 * Generic navigation component for switching between items with Prev/Next buttons.
 * Supports keyboard navigation with Arrow Left/Right keys.
 */
function ItemNavigation<T extends NavigableItem>({
  items,
  currentItemName,
  routePrefix,
  accentColor,
  labelSingular = 'item',
  className,
}: ItemNavigationProps<T>): React.ReactElement | null {
  const navigate = useNavigate();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const currentIndex = useMemo(() => {
    return sortedItems.findIndex(
      (item) => item.name.toLowerCase() === currentItemName.toLowerCase()
    );
  }, [sortedItems, currentItemName]);

  const prevItem = currentIndex > 0 ? sortedItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex < sortedItems.length - 1
      ? sortedItems[currentIndex + 1]
      : null;

  const navigateToItem = useCallback(
    (itemName: string) => {
      navigate(`${routePrefix}/${itemName}`);
    },
    [navigate, routePrefix]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevItem) {
        e.preventDefault();
        navigateToItem(prevItem.name);
      } else if (e.key === 'ArrowRight' && nextItem) {
        e.preventDefault();
        navigateToItem(nextItem.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevItem, nextItem, navigateToItem]);

  if (sortedItems.length === 0) return null;

  return (
    <TooltipProvider>
      <div
        className={`flex items-center justify-between gap-4 w-full mb-4 ${className || ''}`}
      >
        <NavigationButton
          item={prevItem}
          direction="previous"
          onNavigate={navigateToItem}
          accentColor={accentColor}
          labelSingular={labelSingular}
        />

        {/* Item Counter */}
        <div className="text-xs text-starlight-500 font-medium">
          {currentIndex + 1} / {sortedItems.length}
        </div>

        <NavigationButton
          item={nextItem}
          direction="next"
          onNavigate={navigateToItem}
          accentColor={accentColor}
          labelSingular={labelSingular}
        />
      </div>
    </TooltipProvider>
  );
}

export default ItemNavigation;
