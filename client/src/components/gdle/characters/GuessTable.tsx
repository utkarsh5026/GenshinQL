import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import AvatarWithSkeleton from "@/components/utils/AvatarWithSkeleton";
import { Character } from "@/graphql/types";
import React from "react";
import { motion } from "framer-motion";

interface GuessTableProps {
  characters: Character[];
  correctCharacter: Character;
}

/**
 * GuessTable component displays a table of guessed characters and compares them with the correct character.
 * It shows visual feedback for correct/incorrect guesses for region, weapon, and element.
 *
 * @param characters - Array of Character objects representing the guessed characters
 * @param correctCharacter - The target Character that players need to guess
 * @returns A table showing guessed characters with visual feedback on matches
 */
const GuessTable: React.FC<GuessTableProps> = ({
  characters,
  correctCharacter,
}) => {
  const isCorrect = (correct: string, guess: string) => {
    return correct === guess;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Weapon</TableHead>
            <TableHead>Element</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.name} className="text-left">
              <TableCell>
                <AvatarWithSkeleton
                  name={character.name}
                  url={character.iconUrl}
                />
              </TableCell>
              <TableCell>{character.name}</TableCell>
              <TableCell>
                <GuessTableCell
                  isCorrect={isCorrect(
                    character.region,
                    correctCharacter.region
                  )}
                  index={0}
                >
                  <AvatarWithSkeleton
                    name={character.region}
                    url={character.regionUrl}
                  />
                </GuessTableCell>
              </TableCell>
              <TableCell>
                <GuessTableCell
                  isCorrect={isCorrect(
                    character.weaponType,
                    correctCharacter.weaponType
                  )}
                  index={1}
                >
                  <AvatarWithSkeleton
                    name={character.weaponType}
                    url={character.weaponUrl}
                  />
                </GuessTableCell>
              </TableCell>
              <TableCell>
                <GuessTableCell
                  isCorrect={isCorrect(
                    character.element,
                    correctCharacter.element
                  )}
                  index={2}
                >
                  <AvatarWithSkeleton
                    name={character.element}
                    url={character.elementUrl}
                  />
                </GuessTableCell>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

type GuessTableCellProps = {
  isCorrect: boolean;
  children: React.ReactNode;
  index: number;
};

const GuessTableCell: React.FC<GuessTableCellProps> = ({
  isCorrect,
  children,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      className={`${isCorrect ? "bg-green-900" : "bg-red-900"} w-full h-full p-2 rounded-md flex items-center justify-center`}
    >
      {children}
    </motion.div>
  );
};

export default GuessTable;
