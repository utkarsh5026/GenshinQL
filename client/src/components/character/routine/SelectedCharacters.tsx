import React from "react";
import type { AvatarRequirement } from "@/types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface SelectedCharactersProps {
  characters: AvatarRequirement[];
  handleRemoveCharacter: (character: AvatarRequirement) => void;
}

/**
 * SelectedCharacters component displays a scrollable list of selected characters
 * with their avatars and names, allowing users to remove characters from the selection.
 *
 * @component
 * @param {Object} props - Component props
 * @param {AvatarRequirement[]} props.characters - Array of selected characters to display
 * @param {Function} props.handleRemoveCharacter - Callback function to handle removing a character
 * @returns {JSX.Element} Rendered component
 */
const SelectedCharacters: React.FC<SelectedCharactersProps> = ({
  characters,
  handleRemoveCharacter,
}) => {
  return (
    <div className="flex-1 flex-col flex flex-wrap gap-1 mt-2 overflow-y-auto max-h-[calc(100vh-200px)]">
      {characters.map((character) => (
        <div
          key={character.name}
          className="flex items-center justify-between px-1 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500 w-28 h-8 flex-shrink-0"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={character.iconUrl} />
          </Avatar>
          <span className="mx-1 truncate">{character.name}</span>
          <button
            onClick={() => handleRemoveCharacter(character)}
            className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full p-0.5 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedCharacters;
