import {
  Flame,
  Plus,
  Shield,
  Sparkles,
  Star,
  Sword,
  Swords,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import { useTrackedTeams, useTrackerStore, useWeaponMap } from '@/stores';
import type { Character, TrackedCharacter, TrackingReason } from '@/types';

import { WeaponSelector } from './WeaponSelector';

const TEAM_ICONS = {
  sword: Swords,
  shield: Shield,
  star: Star,
  flame: Flame,
  sparkles: Sparkles,
} as const;

const REASON_COLORS: Record<TrackingReason, string> = {
  building: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  farming: 'bg-green-500/20 text-green-400 border-green-500/50',
  wishlist: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

interface CharacterWeaponCardProps {
  character: Character;
  trackedData: TrackedCharacter;
  onRemove: () => void;
}

export const CharacterWeaponCard: React.FC<CharacterWeaponCardProps> = ({
  character,
  trackedData,
  onRemove,
}) => {
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);

  const weaponMap = useWeaponMap();
  const teams = useTrackedTeams();
  const { addWeaponToCharacter, removeWeaponFromCharacter } = useTrackerStore();

  // Get team info if character belongs to a team
  const team = teams.find((t) => t.id === trackedData.teamId);
  const TeamIcon = team
    ? TEAM_ICONS[team.icon as keyof typeof TEAM_ICONS] || Swords
    : null;

  // Get weapon objects for paired weapons
  const pairedWeapons = (trackedData.pairedWeapons || [])
    .map((name) => weaponMap[name])
    .filter((w) => w !== undefined);

  const handleAddWeapon = (weaponName: string | null) => {
    if (weaponName) {
      addWeaponToCharacter(character.name, weaponName);
    }
    setShowWeaponSelector(false);
  };

  const handleRemoveWeapon = (weaponName: string) => {
    removeWeaponFromCharacter(character.name, weaponName);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 p-4 rounded-xl',
        'bg-card/50 border border-border/50',
        'hover:bg-accent/30 hover:border-accent transition-all'
      )}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          'absolute -top-2 -right-2 w-6 h-6 rounded-full z-10',
          'bg-destructive/80 text-destructive-foreground',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'flex items-center justify-center hover:bg-destructive'
        )}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Character Avatar and Name */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <CachedImage
            src={character.iconUrl}
            alt={character.name}
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 rounded-lg"
          />
          {pairedWeapons.length > 0 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
              <Sword className="w-3 h-3 text-muted-foreground" />
              {pairedWeapons.length > 1 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-[8px] rounded-full flex items-center justify-center text-primary-foreground">
                  {pairedWeapons.length}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-center line-clamp-2 max-w-full px-1">
          {character.name}
        </span>
      </div>

      {/* Weapons List */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Sword className="w-3 h-3" />
          Weapons {pairedWeapons.length > 0 && `(${pairedWeapons.length})`}
        </label>

        {/* Weapon Chips */}
        {pairedWeapons.length > 0 && (
          <div className="space-y-1.5">
            {pairedWeapons.map((weapon) => (
              <div
                key={weapon.name}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-accent/30 border border-border/50"
              >
                <CachedImage
                  src={weapon.iconUrl}
                  alt={weapon.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded"
                />
                <span className="text-xs flex-1 truncate">{weapon.name}</span>
                <button
                  onClick={() => handleRemoveWeapon(weapon.name)}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Weapon Button/Selector */}
        {showWeaponSelector ? (
          <WeaponSelector
            weaponType={character.weaponType}
            selectedWeapon={null}
            onSelect={handleAddWeapon}
            className="text-xs h-8"
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWeaponSelector(true)}
            className="w-full text-xs h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Weapon
          </Button>
        )}
      </div>

      {/* Team Badge */}
      {team && TeamIcon && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded bg-accent/20">
          <TeamIcon className="w-3 h-3" />
          <span className="truncate">{team.name}</span>
        </div>
      )}

      {/* Tracking Reason Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs px-2 py-0.5 justify-center',
          REASON_COLORS[trackedData.reason]
        )}
      >
        {REASON_LABELS[trackedData.reason]}
      </Badge>
    </div>
  );
};
