import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import AvatarWithSkeleton from "@/components/utils/AvatarWithSkeleton";
import { Character } from "@/types";
import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleVersion = (correct: string, guess: string) => {
    if (correct === guess) return 0;

    const [correctPatch, correctVersion] = correct.split(".");
    const [guessPatch, guessVersion] = guess.split(".");

    if (correctPatch === guessPatch) {
      return correctVersion < guessVersion ? 1 : -1;
    }

    return correctPatch < guessPatch ? 2 : -2;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-border hover:bg-transparent">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Icon</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Region</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weapon</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Element</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character, idx) => (
            <TableRow
              key={character.name}
              className={cn(
                "text-left transition-colors duration-200",
                idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
              )}
            >
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
              <TableCell>
                <GuessTableCell index={3} isCorrect={true}>
                  <VersionTableCell
                    version={handleVersion("2.4", "2.4")}
                    value="1.4"
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
      initial={{ opacity: 0, rotateX: 90, scale: 0.8 }}
      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.34, 1.56, 0.64, 1], // Elastic ease out
      }}
      whileHover={{ scale: 1.05 }}
      className={`relative w-full h-full p-3 rounded-lg flex items-center justify-center min-w-[50px] min-h-[70px] transition-all duration-300 shadow-md hover:shadow-xl border ${
        isCorrect
          ? "bg-game-correct-bg border-game-correct"
          : "bg-game-wrong-bg border-game-wrong"
      }`}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-lg opacity-20 pointer-events-none bg-gradient-to-br from-white/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Pulse effect for correct answers */}
      {isCorrect && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-game-correct"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.6, delay: index * 0.12 + 0.3 }}
        />
      )}
    </motion.div>
  );
};

interface VersionTableCellProps {
  version: -2 | -1 | 0 | 1 | 2;
  value: string;
}

const VersionTableCell: React.FC<VersionTableCellProps> = ({
  version,
  value,
}) => {
  const getVersionIcon = () => {
    switch (version) {
      case -2:
        return <ChevronsDown className="text-red-500" />;
      case -1:
        return <ChevronDown className="text-red-500" />;
      case 0:
        return null;
      case 1:
        return <ChevronUp className="text-green-500" />;
      case 2:
        return <ChevronsUp className="text-green-500" />;
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {getVersionIcon()}
      <div>{value}</div>
    </div>
  );
};

export default GuessTable;
