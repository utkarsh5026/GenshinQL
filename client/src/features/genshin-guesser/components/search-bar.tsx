import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

type SearchBarItem = {
  name: string;
  iconUrl: string;
};

interface SearchBarProps {
  items: SearchBarItem[];
  onItemSelect: (item: SearchBarItem) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ items, onItemSelect }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !showResults &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        setShowResults(true);
        const input = commandRef.current?.querySelector('input');
        input?.focus();
      }

      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setInputValue('');
        setShowResults(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showResults]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowResults(true);
  };

  const handleClear = () => {
    setInputValue('');
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleSelect = (item: SearchBarItem) => {
    onItemSelect(item);
    setInputValue('');
    setShowResults(false);
  };

  return (
    <div className="relative" ref={commandRef}>
      <Command
        className={cn(
          'rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm',
          'transition-colors duration-200',
          'focus-within:border-game-hover/70 focus-within:bg-card'
        )}
        shouldFilter={true}
      >
        {/* Input row */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground/60 pointer-events-none shrink-0" />
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onClick={() => setShowResults(true)}
            onFocus={() => setShowResults(true)}
            onValueChange={handleInputChange}
            placeholder="Search characters…"
            className="h-11 pl-9 pr-9 w-full text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-0.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showResults && (
          <CommandList className="border-t border-border/40 max-h-52 sm:max-h-64 overflow-y-auto scrollbar-hide">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              No characters found.
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.name}
                  value={item.name}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-accent/40 transition-colors duration-150"
                >
                  <img
                    src={item.iconUrl}
                    alt={item.name}
                    className="w-7 h-7 rounded-full border border-border/60 shrink-0"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>

      {/* Keyboard hint — desktop only */}
      {!inputValue && (
        <p className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/35 pointer-events-none select-none">
          Press /
        </p>
      )}
    </div>
  );
};

export default SearchBar;
