import { motion } from 'framer-motion';
import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp } from 'lucide-react';
import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AvatarWithSkeleton from '@/components/utils/AvatarWithSkeleton';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { cn } from '@/lib/utils';
import { Character } from '@/types';

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

    const [correctPatch, correctVersion] = correct.split('.');
    const [guessPatch, guessVersion] = guess.split('.');

    if (correctPatch === guessPatch) {
      return correctVersion < guessVersion ? 1 : -1;
    }

    return correctPatch < guessPatch ? 2 : -2;
  };

  return (
    <div className="w-full">
      {/* MOBILE: compact single-row list — hidden at md+ */}
      <div className="md:hidden">
        {/* Column header labels */}
        {characters.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 pb-1 mb-1 border-b border-border">
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Character
            </span>
            <div className="flex gap-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="w-8 text-center">Rgn</span>
              <span className="w-8 text-center">Wpn</span>
              <span className="w-8 text-center">Elm</span>
            </div>
            <span className="w-10 shrink-0 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ver
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {characters.map((character, idx) => (
            <MobileGuessRow
              key={character.name}
              character={character}
              correctCharacter={correctCharacter}
              isCorrect={isCorrect}
              handleVersion={handleVersion}
              idx={idx}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP: table — shown at md+ only */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table className="min-w-120">
          <TableHeader>
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              {['Character', 'Region', 'Weapon', 'Element', 'Version'].map(
                (header) => (
                  <TableHead
                    key={header}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {header}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {characters.map((character, idx) => (
              <motion.tr
                key={character.name}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={cn(
                  'text-left transition-colors duration-200 border-b',
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                )}
              >
                <TableCell>
                  <CharacterAvatar
                    characterName={character.name}
                    showName
                    size="md"
                  />
                </TableCell>
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
                  <GuessTableCell
                    index={3}
                    isCorrect={
                      handleVersion(
                        character.version ?? '1.0',
                        correctCharacter.version ?? '1.0'
                      ) === 0
                    }
                  >
                    <VersionTableCell
                      version={handleVersion(
                        character.version ?? '1.0',
                        correctCharacter.version ?? '1.0'
                      )}
                      value={character.version ?? '?'}
                    />
                  </GuessTableCell>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

type GuessTableCellProps = {
  isCorrect: boolean;
  children: React.ReactNode;
  index: number;
  compact?: boolean;
};

const GuessTableCell: React.FC<GuessTableCellProps> = ({
  isCorrect,
  children,
  index,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90, scale: 0.8 }}
      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl border',
        compact
          ? 'p-1 rounded-md w-8 h-8'
          : 'w-full h-full p-3 rounded-lg min-w-0 md:min-w-12.5 min-h-17.5',
        isCorrect ? 'bg-success-800' : 'bg-error-800'
      )}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-[inherit] opacity-20 pointer-events-none bg-linear-to-br from-white/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Pulse effect for correct answers */}
      {isCorrect && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] border-2 border-success-400"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.6, delay: index * 0.12 + 0.3 }}
        />
      )}
    </motion.div>
  );
};

interface MobileGuessRowProps {
  character: Character;
  correctCharacter: Character;
  isCorrect: (correct: string, guess: string) => boolean;
  handleVersion: (correct: string, guess: string) => -2 | -1 | 0 | 1 | 2;
  idx: number;
}

const MobileGuessRow: React.FC<MobileGuessRowProps> = ({
  character,
  correctCharacter,
  isCorrect,
  handleVersion,
  idx,
}) => {
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border',
        idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      {/* Character avatar + name */}
      <CharacterAvatar
        characterName={character.name}
        showName
        size="xs"
        nameClassName="max-w-14 truncate"
      />

      {/* Region | Weapon | Element — compact cells */}
      <div className="flex gap-1 shrink-0">
        <GuessTableCell
          isCorrect={isCorrect(character.region, correctCharacter.region)}
          index={0}
          compact
        >
          <AvatarWithSkeleton
            name={character.region}
            url={character.regionUrl}
            avatarClassName="w-4 h-4"
          />
        </GuessTableCell>
        <GuessTableCell
          isCorrect={isCorrect(
            character.weaponType,
            correctCharacter.weaponType
          )}
          index={1}
          compact
        >
          <AvatarWithSkeleton
            name={character.weaponType}
            url={character.weaponUrl}
            avatarClassName="w-4 h-4"
          />
        </GuessTableCell>
        <GuessTableCell
          isCorrect={isCorrect(character.element, correctCharacter.element)}
          index={2}
          compact
        >
          <AvatarWithSkeleton
            name={character.element}
            url={character.elementUrl}
            avatarClassName="w-4 h-4"
          />
        </GuessTableCell>
      </div>

      {/* Version — inline text + icon */}
      <div className="shrink-0 w-10 flex items-center justify-center gap-0.5">
        <VersionTableCell
          version={handleVersion(
            character.version ?? '1.0',
            correctCharacter.version ?? '1.0'
          )}
          value={character.version ?? '?'}
          compact
        />
      </div>
    </motion.div>
  );
};

interface VersionTableCellProps {
  version: -2 | -1 | 0 | 1 | 2;
  value: string;
  compact?: boolean;
}

const VersionTableCell: React.FC<VersionTableCellProps> = ({
  version,
  value,
  compact = false,
}) => {
  const iconClass = compact ? 'w-3 h-3' : undefined;

  const getVersionIcon = () => {
    switch (version) {
      case -2:
        return <ChevronsDown className={cn('text-error-400', iconClass)} />;
      case -1:
        return <ChevronDown className={cn('text-error-400', iconClass)} />;
      case 0:
        return null;
      case 1:
        return <ChevronUp className={cn('text-success-400', iconClass)} />;
      case 2:
        return <ChevronsUp className={cn('text-success-400', iconClass)} />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1',
        compact ? 'text-xs' : 'gap-2'
      )}
    >
      {getVersionIcon()}
      <span>{value}</span>
    </div>
  );
};

export default GuessTable;
