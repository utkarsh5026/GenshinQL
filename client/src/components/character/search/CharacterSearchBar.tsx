import React, { useRef, useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Character } from "@/graphql/types";

interface CharacterSearchBarProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
}

const CharacterSearchBar: React.FC<CharacterSearchBarProps> = ({
  characters = [],
  onCharacterSelect,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const commandRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(true);

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
              {characters.map((character) => (
                <CommandItem
                  key={character.name}
                  onSelect={() => onCharacterSelect?.(character)}
                >
                  <img
                    src={character.iconUrl}
                    alt={character.name}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  {character.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
};

export default CharacterSearchBar;
