import { Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';

/** True when the device has a touch screen — computed once at module load. */
const isTouchDevice =
  typeof window !== 'undefined' && navigator.maxTouchPoints > 0;

interface AppInputProps extends React.ComponentProps<'input'> {
  /**
   * Icon shown on the left side of the input.
   * - Omit or pass `undefined` → default `Search` icon is shown.
   * - Pass `false` → no icon (plain form field).
   * - Pass a `ReactNode` → renders that node instead.
   */
  leftIcon?: React.ReactNode | false;
  /**
   * When provided, an `×` clear button appears on the right whenever the
   * input has a non-empty value.  The callback is responsible for clearing
   * the controlled value (e.g. `() => setSearch('')`).
   */
  onClear?: () => void;
  /** Extra class names applied to the outer wrapper `div`. */
  wrapperClassName?: string;
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      leftIcon,
      onClear,
      wrapperClassName,
      autoFocus,
      className,
      value,
      ...rest
    },
    ref
  ) => {
    const resolvedIcon =
      leftIcon === false ? null : (leftIcon ?? <Search className="w-4 h-4" />);

    const showClear = Boolean(onClear && value && String(value).length > 0);

    return (
      <div className={cn('relative', wrapperClassName)}>
        {resolvedIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
            {resolvedIcon}
          </span>
        )}

        <Input
          ref={ref}
          value={value}
          autoFocus={autoFocus && !isTouchDevice ? autoFocus : undefined}
          className={cn(resolvedIcon && 'pl-9', showClear && 'pr-9', className)}
          {...rest}
        />

        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
AppInput.displayName = 'AppInput';

export { AppInput };
