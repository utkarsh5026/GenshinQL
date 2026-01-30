import React, { useState, useRef, useEffect } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { motion } from 'framer-motion';
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
  const [showResults, setShowResults] = useState<boolean>(true);
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
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showResults]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowResults(true);
  };

  return (
    <Command
      className={cn(
        'rounded-xl border-2 shadow-lg transition-all duration-300',
        'focus-within:border-game-hover focus-within:shadow-game-hover/30',
        'bg-card/95 backdrop-blur-sm'
      )}
      ref={commandRef}
    >
      <CommandInput
        value={inputValue}
        onClick={() => setShowResults(true)}
        onValueChange={handleInputChange}
        placeholder="Search characters... (Press / to focus)"
        className="h-12 w-full px-4 py-3 text-base font-medium focus:outline-none transition-all duration-200"
      />

      {/* Animated underline */}
      <motion.div
        className="h-0.5 bg-gradient-to-r from-transparent via-game-hover to-transparent"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: inputValue ? 1 : 0,
          scaleX: inputValue ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      <CommandList className="max-h-[300px] overflow-y-auto scrollbar-hide">
        {showResults && (
          <>
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup heading="Characters">
              {items.map((item) => (
                <CommandItem
                  key={item.name}
                  onSelect={() => onItemSelect?.(item)}
                  className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                >
                  <img
                    src={item.iconUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-border"
                  />
                  <span className="font-medium">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
};

export default SearchBar;
