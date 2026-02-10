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

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

const elementColors: Record<string, string> = {
  anemo: 'bg-anemo-500/20 text-anemo-400 border-anemo-500/30',
  pyro: 'bg-pyro-500/20 text-pyro-400 border-pyro-500/30',
  hydro: 'bg-hydro-500/20 text-hydro-400 border-hydro-500/30',
  electro: 'bg-electro-500/20 text-electro-400 border-electro-500/30',
  cryo: 'bg-cryo-500/20 text-cryo-400 border-cryo-500/30',
  geo: 'bg-geo-500/20 text-geo-400 border-geo-500/30',
  dendro: 'bg-dendro-500/20 text-dendro-400 border-dendro-500/30',
};

// Map icon names to components
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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={recent.iconUrl} alt={recent.name} />
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {recent.label || recent.name}
                    </span>
                    {recent.type === 'character' && (
                      <span className="text-xs text-muted-foreground">
                        {recent.rarity}★ •{' '}
                        <span
                          className={`${elementColors[recent.element?.toLowerCase() || ''] || ''} px-1 rounded`}
                        >
                          {recent.element}
                        </span>{' '}
                        • {recent.weaponType}
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
              <span className="flex items-center gap-2">
                <span>Quick Navigation</span>
                <Badge variant="outline" className="text-xs">
                  {results.navigation.length}
                </Badge>
              </span>
            }
          >
            {results.navigation.slice(0, 6).map((item: NavigationItem) => (
              <CommandItem
                key={item.route}
                value={item.label}
                onSelect={() => handleSelect(item)}
                className={itemClassName}
              >
                <item.icon
                  className="h-5 w-5"
                  style={{ color: item.iconColor }}
                />
                <span className="font-medium">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.characters.length > 0 && (
          <CommandGroup
            heading={
              <span className="flex items-center gap-2">
                <span>Characters</span>
                <Badge variant="outline" className="text-xs">
                  {results.characters.length}
                </Badge>
              </span>
            }
          >
            {results.characters
              .slice(0, 6)
              .map((character: CharacterResult) => (
                <CommandItem
                  key={character.name}
                  value={character.name}
                  onSelect={() => handleSelect(character)}
                  className={itemClassName}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={character.iconUrl} alt={character.name} />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {character.rarity}★ •{' '}
                      <span
                        className={`${elementColors[character.element.toLowerCase()] || ''} px-1 rounded`}
                      >
                        {character.element}
                      </span>{' '}
                      • {character.weaponType}
                    </span>
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        {results.weapons.length > 0 && (
          <CommandGroup
            heading={
              <span className="flex items-center gap-2">
                <span>Weapons</span>
                <Badge variant="outline" className="text-xs">
                  {results.weapons.length}
                </Badge>
              </span>
            }
          >
            {results.weapons.slice(0, 6).map((weapon: WeaponResult) => (
              <CommandItem
                key={weapon.name}
                value={weapon.name}
                onSelect={() => handleSelect(weapon)}
                className={itemClassName}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={weapon.iconUrl} alt={weapon.name} />
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{weapon.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {weapon.rarity}★ • {weapon.weaponType}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};

export default GlobalSearchContent;
