import React, { useMemo, useState } from 'react';

import { AppInput } from '@/components/ui/app-input';
import { Card } from '@/components/ui/card';
import { ElementBadge } from '@/components/ui/genshin-game-icons';
import { ELEMENTS } from '@/constants';
import { CharacterAvatar } from '@/features/characters';
import { getElementTextClass } from '@/lib/game-colors';
import { cn } from '@/lib/utils';
import type { Character, Element } from '@/types';

import type { CharacterGroup } from '../../utils/computeCharacterGroups';

const SectionCard: React.FC<{
  label: string;
  element?: string;
  elementUrl?: string;
  count: number;
  children: React.ReactNode;
}> = ({ label, element, elementUrl, count, children }) => (
  <Card className="border-border/30 bg-accent/20 overflow-hidden">
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
      {element && elementUrl && (
        <ElementBadge
          name={element}
          url={elementUrl}
          size="xs"
          showLabel={false}
        />
      )}
      <span
        className={cn(
          'text-xs font-semibold',
          element ? getElementTextClass(element) : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground/50">({count})</span>
    </div>
    <div className="p-2">{children}</div>
  </Card>
);

const ElementGroupedGrid: React.FC<{
  characters: Character[];
  elementUrlMap: Record<string, string>;
  selectedNames: Set<string>;
  onSelect: (c: Character) => void;
}> = ({ characters, elementUrlMap, selectedNames, onSelect }) => {
  const subgroups = useMemo(() => {
    const map = new Map<string, Character[]>();
    for (const c of characters) {
      if (!map.has(c.element)) map.set(c.element, []);
      map.get(c.element)!.push(c);
    }
    return [...map.keys()]
      .sort((a, b) => {
        const ia = ELEMENTS.indexOf(a as Element);
        const ib = ELEMENTS.indexOf(b as Element);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map((el) => ({ element: el, chars: map.get(el)! }));
  }, [characters]);

  return (
    <div className="flex flex-col gap-4">
      {subgroups.map(({ element, chars }) => (
        <div key={element}>
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <ElementBadge
              name={element}
              url={elementUrlMap[element.toLowerCase()] ?? ''}
              size="xs"
            />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
            {chars.map((c) => {
              const isSelected = selectedNames.has(c.name);
              return (
                <GenshinCharacter
                  key={c.name}
                  isSelected={isSelected}
                  character={c}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

interface InlinePickerProps {
  groups: CharacterGroup[];
  elementUrlMap: Record<string, string>;
  selectedCharacters: (Character | null)[];
  onSelect: (c: Character) => void;
}

export const InlineCharacterPicker: React.FC<InlinePickerProps> = ({
  groups,
  elementUrlMap,
  selectedCharacters,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const selectedNames = useMemo(
    () => new Set(selectedCharacters.filter(Boolean).map((c) => c!.name)),
    [selectedCharacters]
  );

  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        characters: group.characters.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase().trim())
        ),
      }))
      .filter((group) => group.characters.length > 0);
  }, [groups, search]);

  const totalCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.characters.length, 0),
    [filteredGroups]
  );

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {/** Search */}
      <AppInput
        placeholder="Search characters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        autoFocus
        className="bg-accent/40 border-border/50 rounded-lg py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/60"
      />

      {/** Sectioned character cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filteredGroups.map((group) => (
          <SectionCard
            key={group.id}
            label={group.label}
            element={group.element}
            elementUrl={
              group.element
                ? elementUrlMap[group.element.toLowerCase()]
                : undefined
            }
            count={group.characters.length}
          >
            {group.id === 'recommended' || group.id === 'other' ? (
              <ElementGroupedGrid
                characters={group.characters}
                elementUrlMap={elementUrlMap}
                selectedNames={selectedNames}
                onSelect={onSelect}
              />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
                {group.characters.map((c) => {
                  const isSelected = selectedNames.has(c.name);
                  return (
                    <GenshinCharacter
                      key={c.name}
                      isSelected={isSelected}
                      character={c}
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            )}
          </SectionCard>
        ))}
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <span className="text-sm">No characters found</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface GenshinCharacterProps {
  isSelected: boolean;
  character: Character;
  onSelect: (c: Character) => void;
}
const GenshinCharacter: React.FC<GenshinCharacterProps> = ({
  isSelected,
  character,
  onSelect,
}) => {
  return (
    <div className="relative flex justify-center">
      <CharacterAvatar
        characterName={character.name}
        size="md"
        onClick={isSelected ? () => {} : () => onSelect(character)}
        className={isSelected ? 'opacity-40 cursor-not-allowed' : undefined}
      />
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] font-bold text-white/80 bg-black/50 px-1 rounded">
            In Team
          </span>
        </div>
      )}
    </div>
  );
};
