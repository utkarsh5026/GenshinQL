import { ArrowRight } from 'lucide-react';
import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AvatarWithSkeleton from '@/components/utils/AvatarWithSkeleton';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import { cn } from '@/lib/utils';

import type {
  TalentMaterialGroup,
  WeaponMaterialGroup,
} from '../../types/routine';
import CharacterAvatarWithBadge from './CharacterAvatarWithBadge';

interface TalentGroupProps {
  group: TalentMaterialGroup;
  className?: string;
}

/**
 * Displays a talent material group with book icons and characters needing them
 */
export const TalentGroup: React.FC<TalentGroupProps> = ({
  group,
  className,
}) => {
  const { book, characters } = group;
  const { teachingUrl, guideUrl, philosophyUrl, bookName } = book;

  const visibleChars = characters.slice(0, 8);
  const remainingCount = characters.length - 8;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-start gap-3 md:gap-4',
        'p-3 rounded-lg bg-card/30 border border-border/30',
        className
      )}
    >
      {/* Talent Books Section */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Talent Books
        </div>
        <div className="flex flex-row items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AvatarWithSkeleton
                  name={`Teaching of ${bookName}`}
                  url={teachingUrl}
                  avatarClassName="w-8 h-8 bg-slate-800"
                />
              </TooltipTrigger>
              <TooltipContent>Teaching of {bookName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AvatarWithSkeleton
                  name={`Guide of ${bookName}`}
                  url={guideUrl}
                  avatarClassName="w-8 h-8 bg-slate-800"
                />
              </TooltipTrigger>
              <TooltipContent>Guide to {bookName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AvatarWithSkeleton
                  name={`Philosophies of ${bookName}`}
                  url={philosophyUrl}
                  avatarClassName="w-8 h-8 bg-slate-800"
                />
              </TooltipTrigger>
              <TooltipContent>Philosophies of {bookName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Divider (desktop only) */}
      <div className="hidden md:block w-px bg-border self-stretch" />

      {/* Characters Section */}
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Characters ({characters.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleChars.map((char) => (
            <CharacterAvatarWithBadge
              key={char.name}
              character={char}
              size="sm"
              showReasonBadge
              showTeamBadge
            />
          ))}
          {remainingCount > 0 && (
            <div
              className="flex items-center justify-center w-10 h-10 text-xs font-medium text-muted-foreground bg-surface-100 rounded-full border border-border cursor-help"
              title={`${remainingCount} more character${remainingCount > 1 ? 's' : ''}`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface WeaponGroupProps {
  group: WeaponMaterialGroup;
  className?: string;
}

/**
 * Displays a weapon material group with material icons and character-weapon pairs
 */
export const WeaponGroup: React.FC<WeaponGroupProps> = ({
  group,
  className,
}) => {
  const { materialImages, characterWeaponPairs, materialName } = group;

  const visiblePairs = characterWeaponPairs.slice(0, 8);
  const remainingCount = characterWeaponPairs.length - 8;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-start gap-3 md:gap-4',
        'p-3 rounded-lg bg-card/30 border border-border/30',
        className
      )}
    >
      {/* Weapon Materials Section */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Weapon Materials
        </div>
        <div className="flex flex-row items-center gap-2">
          {materialImages.map((img, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger>
                  <AvatarWithSkeleton
                    name={img.caption}
                    url={img.url}
                    avatarClassName="w-8 h-8 bg-slate-800"
                  />
                </TooltipTrigger>
                <TooltipContent>{img.caption}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="text-[9px] text-muted-foreground/70 max-w-[120px]">
          {materialName}
        </div>
      </div>

      {/* Divider (desktop only) */}
      <div className="hidden md:block w-px bg-border self-stretch" />

      {/* Character-Weapon Pairs Section */}
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Builds ({characterWeaponPairs.length})
        </div>
        <div className="flex flex-wrap gap-3">
          {visiblePairs.map((pair, idx) => (
            <div
              key={`${pair.character.name}-${pair.weapon.name}-${idx}`}
              className="flex items-center gap-1.5"
            >
              <CharacterAvatarWithBadge
                character={pair.character}
                size="sm"
                showReasonBadge
                showTeamBadge
              />
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <WeaponAvatar
                weaponName={pair.weapon.name}
                size="sm"
                showName={false}
              />
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className="flex items-center justify-center w-10 h-10 text-xs font-medium text-muted-foreground bg-surface-100 rounded-full border border-border cursor-help"
              title={`${remainingCount} more build${remainingCount > 1 ? 's' : ''}`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export both as named exports and memoized versions
export const MemoizedTalentGroup = React.memo(TalentGroup);
export const MemoizedWeaponGroup = React.memo(WeaponGroup);
