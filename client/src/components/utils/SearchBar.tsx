import React, { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

type SearchBarItem = {
  name: string;
  iconUrl: string;
};

interface SearchBarProps {
  items: SearchBarItem[];
  onItemSelect: (item: SearchBarItem) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ items, onItemSelect }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(true);
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowResults(true);
  };

  return (
    <Command className="rounded-lg border shadow-md" ref={commandRef}>
      <CommandInput
        value={inputValue}
        onClick={() => setShowResults(true)}
        onValueChange={handleInputChange}
        placeholder="Search characters..."
        className="h-11 w-full bg-transparent px-0 py-3 focus:outline-none"
      />

      <CommandList>
        {showResults && (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Characters">
              {items.map((item) => (
                <CommandItem
                  key={item.name}
                  onSelect={() => onItemSelect?.(item)}
                >
                  <img
                    src={item.iconUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  {item.name}
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
