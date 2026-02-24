import React from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';

import type { Character } from '../../types';

interface CharacterTableProps {
  characters: Character[];
}

const RARITY_STARS: Record<string, string> = {
  '5': '\u2605\u2605\u2605\u2605\u2605',
  '4': '\u2605\u2605\u2605\u2605',
};

const CharacterTable: React.FC<CharacterTableProps> = ({ characters }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/50">
          <TableHead>Character</TableHead>
          <TableHead className="text-center">Element</TableHead>
          <TableHead className="text-center">Weapon</TableHead>
          <TableHead className="text-center">Region</TableHead>
          <TableHead className="text-center">Rarity</TableHead>
          <TableHead className="text-center hidden md:table-cell">
            Version
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {characters.map((character) => (
          <CharacterTableRow key={character.name} character={character} />
        ))}
      </TableBody>
    </Table>
  );
};

export default React.memo(CharacterTable);

interface CharacterTableRowProps {
  character: Character;
}

const CharacterTableRow: React.FC<CharacterTableRowProps> = React.memo(
  ({ character }) => {
    const is5Star = character.rarity === '5';

    return (
      <TableRow className="group cursor-pointer">
        <TableCell className="py-3">
          <Link
            to={`/characters/${character.name}`}
            className="flex items-center gap-3 no-underline text-inherit min-w-[180px]"
          >
            <div
              className={cn(
                'relative w-11 h-11 rounded-full overflow-hidden shrink-0',
                is5Star
                  ? 'ring-2 ring-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                  : 'ring-2 ring-violet-400/50 shadow-[0_0_12px_rgba(167,139,250,0.15)]'
              )}
            >
              <CachedImage
                src={character.iconUrl}
                alt={character.name}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-sm text-foreground/90 truncate">
                {character.name}
              </span>
              <span className="text-[0.6875rem] text-muted-foreground capitalize">
                {character.modelType}
              </span>
            </div>
          </Link>
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/40 rounded-full">
            <CachedImage
              src={character.elementUrl}
              alt={character.element}
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {character.element}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/40 rounded-full">
            <CachedImage
              src={character.weaponUrl}
              alt={character.weaponType}
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {character.weaponType}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/40 rounded-full">
            <CachedImage
              src={character.regionUrl}
              alt={character.region}
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {character.region}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center py-3">
          <span
            className={cn(
              'text-[0.8125rem] tracking-tight',
              is5Star
                ? 'text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]'
                : 'text-violet-400 drop-shadow-[0_0_3px_rgba(167,139,250,0.5)]'
            )}
          >
            {RARITY_STARS[character.rarity] ?? character.rarity}
          </span>
        </TableCell>
        <TableCell className="text-center hidden md:table-cell py-3">
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted/30 rounded-full">
            v{character.version}
          </span>
        </TableCell>
      </TableRow>
    );
  }
);

CharacterTableRow.displayName = 'CharacterTableRow';
