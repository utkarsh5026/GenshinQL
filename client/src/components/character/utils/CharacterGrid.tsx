import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";

interface CharacterGridProps {
  characters: {
    name: string;
    url: string;
  }[];
}

/**
 * CharacterGrid component displays a grid of character avatars and names.
 *
 * @param {CharacterGridProps} props - The props for the component.
 * @param {Array<{name: string, url: string}>} props.characters - The list of characters to display.
 * @returns {JSX.Element} The rendered grid component.
 */
const CharacterGrid: React.FC<CharacterGridProps> = ({ characters }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {characters.map((char) => (
        <div
          key={char.name}
          className="flex flex-col justify-start align-start gap-1 cursor-pointer transition duration-300 ease-in-out hover:scale-150"
        >
          <Avatar className="h-12 w-12 my-1 bg-black">
            <AvatarImage src={char.url} alt={char.name} loading={"lazy"} />
          </Avatar>
          <span className="text-xs">{char.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CharacterGrid;