import { Calendar, Gamepad2, Star, Swords, Target, Users } from 'lucide-react';
import { useMemo } from 'react';

import { useCharacters } from '@/features/characters';
import { useWeapons } from '@/features/weapons/stores/useWeaponsStore';

import type { CharacterResult, NavigationItem, WeaponResult } from '../types';

const navigationItems: NavigationItem[] = [
  {
    type: 'navigation',
    route: '/talents',
    label: 'Talents Calendar',
    icon: Calendar,
    iconColor: 'var(--color-pyro-400)',
  },
  {
    type: 'navigation',
    route: '/characters/table',
    label: 'Characters',
    icon: Users,
    iconColor: 'var(--color-hydro-400)',
  },
  {
    type: 'navigation',
    route: '/characters/routine',
    label: 'Characters Routine',
    icon: Target,
    iconColor: 'var(--color-electro-400)',
  },
  {
    type: 'navigation',
    route: '/weapons/calendar',
    label: 'Weapons Calendar',
    icon: Calendar,
    iconColor: 'var(--color-celestial-500)',
  },
  {
    type: 'navigation',
    route: '/weapons/grid',
    label: 'Weapons Detailed',
    icon: Swords,
    iconColor: 'var(--color-geo-400)',
  },
  {
    type: 'navigation',
    route: '/tierlist',
    label: 'Tier List',
    icon: Star,
    iconColor: 'var(--color-dendro-400)',
  },
  {
    type: 'navigation',
    route: '/guesser',
    label: 'Genshin Guesser',
    icon: Gamepad2,
    iconColor: 'var(--color-epic-400)',
  },
] as const;

export interface GlobalSearchResults {
  navigation: NavigationItem[];
  characters: CharacterResult[];
  weapons: WeaponResult[];
}

export function useGlobalSearch(query: string): {
  results: GlobalSearchResults;
  hasResults: boolean;
} {
  const characters = useCharacters();
  const weapons = useWeapons();

  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return {
        navigation: navigationItems,
        characters: [],
        weapons: [],
      };
    }

    const filteredNavigation = navigationItems.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
    const filteredCharacters: CharacterResult[] = characters
      .filter(
        (char) =>
          char.name.toLowerCase().includes(normalizedQuery) ||
          char.element.toLowerCase().includes(normalizedQuery) ||
          char.weaponType.toLowerCase().includes(normalizedQuery)
      )
      .map((char) => ({
        type: 'character' as const,
        name: char.name,
        iconUrl: char.iconUrl,
        rarity: char.rarity,
        element: char.element,
        weaponType: char.weaponType,
      }));

    // Filter weapons by name or weapon type
    const filteredWeapons: WeaponResult[] = weapons
      .filter(
        (weapon) =>
          weapon.name.toLowerCase().includes(normalizedQuery) ||
          weapon.weaponType.toLowerCase().includes(normalizedQuery)
      )
      .map((weapon) => ({
        type: 'weapon' as const,
        name: weapon.name,
        iconUrl: weapon.iconUrl,
        rarity: weapon.rarity,
        weaponType: weapon.weaponType,
      }));

    return {
      navigation: filteredNavigation,
      characters: filteredCharacters,
      weapons: filteredWeapons,
    };
  }, [query, characters, weapons]);

  const hasResults =
    results.navigation.length > 0 ||
    results.characters.length > 0 ||
    results.weapons.length > 0;

  return { results, hasResults };
}
