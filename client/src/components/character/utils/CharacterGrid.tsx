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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {characters.map((char) => (
        <div
          key={char.name}
          className="flex flex-col justify-start align-start gap-1 cursor-pointer transition duration-300 ease-in-out hover:scale-110 md:hover:scale-150"
        >
          <Avatar className="h-10 w-10 md:h-12 md:w-12 my-1 bg-black">
            <AvatarImage src={char.url} alt={char.name} loading={"lazy"} />
          </Avatar>
          <span className="text-[0.625rem] md:text-xs leading-tight">{char.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CharacterGrid;