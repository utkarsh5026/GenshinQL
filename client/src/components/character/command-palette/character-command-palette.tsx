import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useCharacters } from '@/stores/useCharactersStore';
import type { Character } from '@/types';

/**
 * Element color mapping for badges
 */
const elementColors: Record<string, string> = {
  anemo: 'bg-anemo-500/20 text-anemo-400 border-anemo-500/30',
  pyro: 'bg-pyro-500/20 text-pyro-400 border-pyro-500/30',
  hydro: 'bg-hydro-500/20 text-hydro-400 border-hydro-500/30',
  electro: 'bg-electro-500/20 text-electro-400 border-electro-500/30',
  cryo: 'bg-cryo-500/20 text-cryo-400 border-cryo-500/30',
  geo: 'bg-geo-500/20 text-geo-400 border-geo-500/30',
  dendro: 'bg-dendro-500/20 text-dendro-400 border-dendro-500/30',
};

/**
 * Global command palette for quick character navigation
 * Opens with Ctrl+K (or ⌘+K on Mac)
 */
const CharacterCommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const characters = useCharacters();

  // Group characters by element
  const charactersByElement = useMemo(() => {
    const grouped: Record<string, Character[]> = {};

    characters.forEach((char) => {
      const element = char.element.toLowerCase();
      if (!grouped[element]) {
        grouped[element] = [];
      }
      grouped[element].push(char);
    });

    // Sort each group alphabetically
    Object.keys(grouped).forEach((element) => {
      grouped[element].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [characters]);

  // Element order for display
  const elementOrder = [
    'pyro',
    'hydro',
    'anemo',
    'electro',
    'cryo',
    'geo',
    'dendro',
  ];

  // Keyboard shortcut to open palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K, Cmd+K, or Ctrl+/ (alternative that won't conflict with browser)
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'k') ||
        (e.ctrlKey && e.key === '/')
      ) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const handleSelectCharacter = (characterName: string) => {
    setOpen(false);
    navigate(`/characters/${characterName}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search characters... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>No characters found.</CommandEmpty>

        {elementOrder.map((element) => {
          const chars = charactersByElement[element];
          if (!chars || chars.length === 0) return null;

          return (
            <CommandGroup
              key={element}
              heading={
                <span className="flex items-center gap-2">
                  <span className="capitalize">{element}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${elementColors[element] || ''}`}
                  >
                    {chars.length}
                  </Badge>
                </span>
              }
            >
              {chars.map((character) => (
                <CommandItem
                  key={character.name}
                  value={character.name}
                  onSelect={() => handleSelectCharacter(character.name)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={character.iconUrl} />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {character.rarity}★ • {character.weaponType}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
};

export default CharacterCommandPalette;
