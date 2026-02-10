import {
  Calendar,
  Clock,
  Gamepad2,
  Star,
  Swords,
  Target,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { useGlobalSearch } from '../hooks';
import { useAddRecent, useRecents } from '../stores';
import type {
  CharacterResult,
  NavigationItem,
  RecentItem,
  SearchResult,
  WeaponResult,
} from '../types';
import {
  CharacterSearchResult,
  ElementBadge,
  NavigationSearchResult,
  SearchResultAvatar,
  SectionHeading,
  WeaponSearchResult,
} from './commons';

const iconComponents: Record<string, React.ElementType> = {
  Calendar,
  Users,
  Target,
  Swords,
  Star,
  Gamepad2,
};

interface GlobalSearchContentProps {
  onSelect: () => void;
  isMobile?: boolean;
}

const GlobalSearchContent: React.FC<GlobalSearchContentProps> = ({
  onSelect,
  isMobile = false,
}) => {
  const [query, setQuery] = useState('');
  const { results } = useGlobalSearch(query);
  const recents = useRecents();
  const addRecent = useAddRecent();
  const navigate = useNavigate();

  const handleSelect = (result: SearchResult) => {
    addRecent(result);
    switch (result.type) {
      case 'navigation':
        navigate(result.route);
        break;
      case 'character':
        navigate(`/characters/${result.name}`);
        break;
      case 'weapon':
        navigate(`/weapons/${result.name}`);
        break;
    }
    onSelect();
  };

  const handleRecentSelect = (recent: RecentItem) => {
    navigate(recent.route);
    onSelect();
  };

  const itemClassName = isMobile
    ? 'flex items-center gap-3 cursor-pointer py-3'
    : 'flex items-center gap-3 cursor-pointer';

  const hasQuery = query.trim().length > 0;
  const showRecents = !hasQuery && recents.length > 0;

  return (
    <Command className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
      <CommandInput
        placeholder="Search characters, weapons, pages..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className={isMobile ? 'max-h-[70vh]' : 'max-h-100'}>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recents Section - shown when no query */}
        {showRecents && (
          <CommandGroup
            heading={
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </span>
            }
          >
            {recents.map((recent) => {
              const IconComponent =
                recent.iconName && iconComponents[recent.iconName];

              return (
                <CommandItem
                  key={recent.route}
                  value={`recent-${recent.name}`}
                  onSelect={() => handleRecentSelect(recent)}
                  className={itemClassName}
                >
                  {recent.type === 'navigation' && IconComponent ? (
                    <IconComponent
                      className="h-5 w-5"
                      style={{ color: recent.iconColor }}
                    />
                  ) : (
                    <SearchResultAvatar
                      src={recent.iconUrl || ''}
                      alt={recent.name}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {recent.label || recent.name}
                    </span>
                    {recent.type === 'character' && recent.element && (
                      <span className="text-xs text-muted-foreground">
                        {recent.rarity}★ •{' '}
                        <ElementBadge element={recent.element} /> •{' '}
                        {recent.weaponType}
                      </span>
                    )}
                    {recent.type === 'weapon' && (
                      <span className="text-xs text-muted-foreground">
                        {recent.rarity}★ • {recent.weaponType}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {results.navigation.length > 0 && (
          <CommandGroup
            heading={
              <SectionHeading
                title="Quick Navigation"
                count={results.navigation.length}
              />
            }
          >
            {results.navigation.slice(0, 6).map((item: NavigationItem) => (
              <NavigationSearchResult
                key={item.route}
                item={item}
                onSelect={handleSelect}
                className={itemClassName}
              />
            ))}
          </CommandGroup>
        )}

        {results.characters.length > 0 && (
          <CommandGroup
            heading={
              <SectionHeading
                title="Characters"
                count={results.characters.length}
              />
            }
          >
            {results.characters
              .slice(0, 6)
              .map((character: CharacterResult) => (
                <CharacterSearchResult
                  key={character.name}
                  character={character}
                  onSelect={handleSelect}
                  className={itemClassName}
                />
              ))}
          </CommandGroup>
        )}

        {results.weapons.length > 0 && (
          <CommandGroup
            heading={
              <SectionHeading title="Weapons" count={results.weapons.length} />
            }
          >
            {results.weapons.slice(0, 6).map((weapon: WeaponResult) => (
              <WeaponSearchResult
                key={weapon.name}
                weapon={weapon}
                onSelect={handleSelect}
                className={itemClassName}
              />
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};

export default GlobalSearchContent;
