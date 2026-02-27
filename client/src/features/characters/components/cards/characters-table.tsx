import React from 'react';
import { Link } from 'react-router-dom';

import {
  ElementBadge,
  NationBadge,
  WeaponTypeBadge,
} from '@/components/ui/genshin-game-icons';
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
    return (
      <TableRow className="group cursor-pointer">
        <TableCell className="py-3">
          <Link
            to={`/characters/${character.name}`}
            className="flex items-center gap-3 no-underline text-inherit min-w-45"
          >
            <div
              className={cn(
                'relative w-11 h-11 rounded-full overflow-hidden shrink-0'
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
          <ElementBadge
            name={character.element}
            url={character.elementUrl}
            size="md"
          />
        </TableCell>
        <TableCell className="text-center py-3">
          <WeaponTypeBadge
            name={character.weaponType}
            url={character.weaponUrl}
            size="md"
          />
        </TableCell>
        <TableCell className="text-center py-3">
          <NationBadge
            name={character.region}
            url={character.regionUrl}
            size="md"
          />
        </TableCell>
        <TableCell className="text-center py-3">
          <span className={cn('text-[0.8125rem] tracking-tight')}>
            {character.rarity}
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
