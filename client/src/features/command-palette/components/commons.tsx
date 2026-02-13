import React from 'react';

import { Badge } from '@/components/ui/badge';
import { CommandItem } from '@/components/ui/command';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';

import { getSearchElementColor } from '../constants';
import type { CharacterResult, NavigationItem, WeaponResult } from '../types';

interface SectionHeadingProps {
  title: string;
  count: number;
  icon?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  count,
  icon,
}) => {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{title}</span>
      <Badge variant="outline" className="text-xs">
        {count}
      </Badge>
    </span>
  );
};

interface SearchResultAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export const SearchResultAvatar: React.FC<SearchResultAvatarProps> = ({
  src,
  alt,
  className = 'w-8 h-8',
}) => {
  return (
    <CachedImage
      src={src}
      alt={alt}
      showSkeleton={true}
      skeletonShape="circle"
      className={className}
    />
  );
};

interface ElementBadgeProps {
  element: string;
  className?: string;
}

export const ElementBadge: React.FC<ElementBadgeProps> = ({
  element,
  className,
}) => {
  return (
    <span
      className={cn(getSearchElementColor(element), 'px-1 rounded', className)}
    >
      {element}
    </span>
  );
};

interface WeaponSearchResultProps {
  weapon: WeaponResult;
  onSelect: (weapon: WeaponResult) => void;
  className?: string;
}

export const WeaponSearchResult: React.FC<WeaponSearchResultProps> = ({
  weapon,
  onSelect,
  className,
}) => {
  return (
    <CommandItem
      key={weapon.name}
      value={weapon.name}
      onSelect={() => onSelect(weapon)}
      className={className}
    >
      <SearchResultAvatar src={weapon.iconUrl} alt={weapon.name} />
      <div className="flex flex-col">
        <span className="font-medium">{weapon.name}</span>
        <span className="text-xs text-muted-foreground">
          {weapon.rarity}★ • {weapon.weaponType}
        </span>
      </div>
    </CommandItem>
  );
};

interface NavigationSearchResultProps {
  item: NavigationItem;
  onSelect: (item: NavigationItem) => void;
  className?: string;
}

export const NavigationSearchResult: React.FC<NavigationSearchResultProps> = ({
  item,
  onSelect,
  className,
}) => {
  return (
    <CommandItem
      key={item.route}
      value={item.label}
      onSelect={() => onSelect(item)}
      className={className}
    >
      <item.icon className="h-5 w-5" style={{ color: item.iconColor }} />
      <span className="font-medium">{item.label}</span>
    </CommandItem>
  );
};

interface CharacterSearchResultProps {
  character: CharacterResult;
  onSelect: (character: CharacterResult) => void;
  className?: string;
}

export const CharacterSearchResult: React.FC<CharacterSearchResultProps> = ({
  character,
  onSelect,
  className,
}) => {
  return (
    <CommandItem
      key={character.name}
      value={character.name}
      onSelect={() => onSelect(character)}
      className={className}
    >
      <SearchResultAvatar src={character.iconUrl} alt={character.name} />
      <div className="flex flex-col">
        <span className="font-medium">{character.name}</span>
        <span className="text-xs text-muted-foreground">
          {character.rarity}★ • <ElementBadge element={character.element} /> •{' '}
          {character.weaponType}
        </span>
      </div>
    </CommandItem>
  );
};
