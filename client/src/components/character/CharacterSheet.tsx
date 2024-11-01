import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Character } from "@/graphql/types";
import { GET_CHARACTER } from "@/graphql/queries";
import { useLazyQuery } from "@apollo/client";

interface CharacterSheetProps {
  character: Character;
  children: React.ReactNode;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  children,
}) => {
  const [fetchCharacter, { loading, data }] = useLazyQuery(GET_CHARACTER);

  const handleSheetOpen = (open: boolean) => {
    if (open) {
      fetchCharacter({ variables: { name: character.name } });
    }
  };

  return (
    <Sheet onOpenChange={handleSheetOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{character.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {loading ? <p>Loading...</p> : <p>Element: {data?.element}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CharacterSheet;
