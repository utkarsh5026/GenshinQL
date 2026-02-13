import { Flame, Shield, Sparkles, Star, Sword, Swords } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { cn } from '@/lib/utils';
import type { AvatarSize } from '@/utils/avatar-utils';

import type { EnrichedCharacter } from '../../types';

const TEAM_ICONS = {
  sword: Swords,
  shield: Shield,
  star: Star,
  flame: Flame,
  sparkles: Sparkles,
} as const;

interface CharacterAvatarWithBadgeProps {
  character: EnrichedCharacter;
  size?: AvatarSize;
  showReasonBadge?: boolean;
  showWeaponBadge?: boolean;
  showTeamBadge?: boolean;
  className?: string;
}

/**
 * Character avatar enhanced with tracking context badges
 * - Tracking reason badge (bottom-right): Building/Farming/Wishlist
 * - Weapon count badge (top-right): Number of paired weapons
 * - Team badge (top-left): Team icon if character belongs to a team
 */
const CharacterAvatarWithBadge: React.FC<CharacterAvatarWithBadgeProps> = ({
  character,
  size = 'sm',
  showReasonBadge = true,
  showWeaponBadge = false,
  showTeamBadge = false,
  className,
}) => {
  const TeamIcon =
    character.teamIcon && showTeamBadge
      ? TEAM_ICONS[character.teamIcon as keyof typeof TEAM_ICONS]
      : null;

  const weaponCount = character.pairedWeapons.length;

  const renderBadges = () => (
    <>
      {/* Tracking Reason Badge - Bottom Right */}
      {showReasonBadge && (
        <div className="absolute -bottom-1 -right-1 z-10">
          <Badge
            variant="outline"
            className={cn(
              'text-[8px] px-1 py-0 h-5',
              character.reasonBadgeClass
            )}
          >
            {character.reasonLabel}
          </Badge>
        </div>
      )}

      {/* Weapon Count Badge - Top Right */}
      {showWeaponBadge && weaponCount > 0 && (
        <div className="absolute -top-1 -right-1 z-10 flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <Sword className="w-3 h-3 text-muted-foreground" />
            {weaponCount > 1 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary text-[8px] rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                {weaponCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Team Icon Badge - Top Left */}
      {TeamIcon && character.teamName && (
        <div className="absolute -top-1 -left-1 z-10">
          <div
            className="w-5 h-5 rounded-full bg-accent/80 border border-border flex items-center justify-center"
            title={character.teamName}
          >
            <TeamIcon className="w-3 h-3 text-foreground" />
          </div>
        </div>
      )}
    </>
  );

  return (
    <CharacterAvatar
      characterName={character.name}
      size={size}
      showName={false}
      renderBadge={renderBadges}
      badgePosition="top-right"
      className={className}
    />
  );
};

export default React.memo(CharacterAvatarWithBadge);
