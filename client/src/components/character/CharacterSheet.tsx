import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Character } from "@/graphql/types";

interface CharacterSheetProps {
  character: Character;
  children: React.ReactNode;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  children,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{character.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <p>Element: {character.element}</p>
          <p>Rarity: {character.rarity}</p>
          <p>Weapon Type: {character.weaponType}</p>
          <p>Region: {character.region}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CharacterSheet;
