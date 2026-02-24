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

const MAX_GUESSES = 5;

const HEADERS = [
  { full: 'Character', short: 'Char' },
  { full: 'Region', short: 'Rgn' },
  { full: 'Weapon', short: 'Wpn' },
  { full: 'Element', short: 'Elm' },
  { full: 'Version', short: 'Ver' },
];

interface GuessTableProps {
  characters: Character[];
  correctCharacter: Character;
}

const GuessTable: React.FC<GuessTableProps> = ({
  characters,
  correctCharacter,
}) => {
  const slots: (Character | null)[] = Array.from(
    { length: MAX_GUESSES },
    (_, i) => characters[i] ?? null
  );

  const isCorrect = (correct: string, guess: string) => correct === guess;

  const handleVersion = (
    correct: string,
    guess: string
  ): -2 | -1 | 0 | 1 | 2 => {
    if (correct === guess) return 0;

    const [correctPatch, correctVersion] = correct.split('.');
    const [guessPatch, guessVersion] = guess.split('.');

    if (correctPatch === guessPatch) {
      return correctVersion < guessVersion ? 1 : -1;
    }

    return correctPatch < guessPatch ? 2 : -2;
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="md:min-w-120">
        <TableHeader>
          <TableRow className="border-b-2 border-border hover:bg-transparent">
            {HEADERS.map(({ full, short }) => (
              <TableHead
                key={full}
                className="px-1.5 md:px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                <span className="hidden md:inline">{full}</span>
                <span className="md:hidden">{short}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((character, idx) =>
            character ? (
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
                <TableCell className="px-1.5 md:px-4">
                  <CharacterAvatar
                    characterName={character.name}
                    showName
                    size="sm"
                    nameClassName="max-w-14 truncate md:max-w-none"
                  />
                </TableCell>
                <TableCell className="px-1.5 md:px-4">
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
                      avatarClassName="w-4 h-4 md:w-6 md:h-6"
                    />
                  </GuessTableCell>
                </TableCell>
                <TableCell className="px-1.5 md:px-4">
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
                      avatarClassName="w-4 h-4 md:w-6 md:h-6"
                    />
                  </GuessTableCell>
                </TableCell>
                <TableCell className="px-1.5 md:px-4">
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
                      avatarClassName="w-4 h-4 md:w-6 md:h-6"
                    />
                  </GuessTableCell>
                </TableCell>
                <TableCell className="px-1.5 md:px-4">
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
            ) : (
              <tr
                key={`empty-${idx}`}
                className={cn(
                  'border-b',
                  idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                )}
              >
                <TableCell className="px-1.5 md:px-4">
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted/20 border border-dashed border-muted-foreground/20 shrink-0" />
                    <div className="w-12 md:w-16 h-2.5 rounded bg-muted/20" />
                  </div>
                </TableCell>
                {[0, 1, 2, 3].map((i) => (
                  <TableCell key={i} className="px-1.5 md:px-4">
                    <PlaceholderCell />
                  </TableCell>
                ))}
              </tr>
            )
          )}
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
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl border',
        'p-1 rounded-md w-8 h-8 md:p-3 md:rounded-lg md:w-full md:h-full md:min-w-12.5 md:min-h-17.5',
        isCorrect ? 'bg-success-800' : 'bg-error-800'
      )}
    >
      <div className="absolute inset-0 rounded-[inherit] opacity-20 pointer-events-none bg-linear-to-br from-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
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

const PlaceholderCell: React.FC = () => (
  <div className="border border-dashed border-muted-foreground/20 rounded-md md:rounded-lg bg-muted/10 w-8 h-8 md:w-full md:min-w-12.5 md:min-h-17.5" />
);

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
        return (
          <ChevronsDown className="w-3 h-3 md:w-4 md:h-4 text-error-400" />
        );
      case -1:
        return <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-error-400" />;
      case 0:
        return null;
      case 1:
        return <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-success-400" />;
      case 2:
        return (
          <ChevronsUp className="w-3 h-3 md:w-4 md:h-4 text-success-400" />
        );
    }
  };

  return (
    <div className="flex items-center justify-center gap-0.5 md:gap-1 text-xs md:text-sm">
      {getVersionIcon()}
      <span>{value}</span>
    </div>
  );
};

export default GuessTable;
