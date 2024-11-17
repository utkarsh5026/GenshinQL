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

interface ChipSearchBarProps {
  items: SearchBarItem[];
  selectedItems: SearchBarItem[];
  onItemSelect: (item: SearchBarItem) => void;
  onItemRemove: (item: SearchBarItem) => void;
  placeholder?: string;
}

const ChipSearchBar: React.FC<ChipSearchBarProps> = ({
  items,
  selectedItems,
  onItemSelect,
  onItemRemove,
  placeholder = "Search...",
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
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

  const handleItemSelect = (item: SearchBarItem) => {
    onItemSelect(item);
    setInputValue("");
  };

  const filteredItems = items.filter(
    (item) => !selectedItems.some((selected) => selected.name === item.name)
  );

  return (
    <div className="w-full">
      <Command className="rounded-lg border shadow-md" ref={commandRef}>
        <div className="flex flex-wrap gap-2 p-2">
          {selectedItems.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 h-8 text-sm"
            >
              <img
                src={item.iconUrl}
                alt={item.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="whitespace-nowrap text-xs">{item.name}</span>
              <button
                onClick={() => onItemRemove(item)}
                className="ml-1 text-gray-500 hover:text-gray-700 hover:bg-red-900/20 rounded-full w-5 h-5 flex items-center justify-center"
                aria-label={`Remove ${item.name}`}
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex-1 min-w-[200px]">
            <CommandInput
              value={inputValue}
              onClick={() => setShowResults(true)}
              onValueChange={handleInputChange}
              placeholder={placeholder}
              className="h-8 bg-transparent px-0 py-2 focus:outline-none w-full"
            />
          </div>
        </div>

        <CommandList>
          {showResults && (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => handleItemSelect(item)}
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
    </div>
  );
};

export default ChipSearchBar;
