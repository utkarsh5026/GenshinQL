import { BookOpen, Calendar, Sparkles, Sword } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import { useRandomBanner } from '@/hooks/useRandomBanner';
import { cn } from '@/lib/utils';
import type { ImageUrl } from '@/types';

import { useTodayCalendar } from '../hooks';
import type { MaterialItem } from '../types';

interface TrackedCharacterAvatarProps {
  name: string;
  isTracked?: boolean;
}

const TrackedCharacterAvatar: React.FC<TrackedCharacterAvatarProps> = ({
  name,
  isTracked,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-lg transition-all',
        isTracked && 'ring-2 ring-amber-500 bg-amber-500/10 p-1'
      )}
    >
      <CharacterAvatar characterName={name} showName={false} />
      {isTracked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background" />
      )}
    </div>
  );
};

interface TrackedWeaponAvatarProps {
  name: string;
  isTracked?: boolean;
}

const TrackedWeaponAvatar: React.FC<TrackedWeaponAvatarProps> = ({
  name,
  isTracked,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-lg transition-all',
        isTracked && 'ring-2 ring-amber-500 bg-amber-500/10 p-1'
      )}
    >
      <WeaponAvatar weaponName={name} showName={false} />
      {isTracked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background" />
      )}
    </div>
  );
};

interface RegionMaterialsProps {
  region: string;
  regionIconUrl?: string;
  books: { name: string; url: string }[];
  characters: MaterialItem[];
}

const RegionTalentMaterials: React.FC<RegionMaterialsProps> = ({
  region,
  regionIconUrl,
  books,
  characters,
}) => {
  const trackedChars = characters.filter((c) => c.isTracked);
  const otherChars = characters.filter((c) => !c.isTracked);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {regionIconUrl && (
          <CachedImage
            src={regionIconUrl}
            alt={region}
            width={20}
            height={20}
            className="w-5 h-5 rounded"
          />
        )}
        <span className="text-sm font-medium text-foreground">{region}</span>
        <div className="flex gap-1">
          {books.map((book) => (
            <CachedImage
              key={book.name}
              src={book.url}
              alt={book.name}
              width={24}
              height={24}
              className="w-5 h-5 md:w-6 md:h-6 rounded"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {trackedChars.map((char) => (
          <TrackedCharacterAvatar key={char.name} name={char.name} isTracked />
        ))}
        {otherChars.slice(0, 8).map((char) => (
          <TrackedCharacterAvatar key={char.name} name={char.name} />
        ))}
        {otherChars.length > 8 && (
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted text-muted-foreground text-xs">
            +{otherChars.length - 8}
          </div>
        )}
      </div>
    </div>
  );
};

const DayBadge: React.FC<{ day: string; isBanner: boolean }> = ({
  day,
  isBanner,
}) => (
  <Badge
    variant="outline"
    className={cn(
      'text-xs gap-1',
      isBanner && 'border-white/30 text-white/90 bg-black/20 backdrop-blur-sm'
    )}
  >
    <Calendar className="w-3 h-3" />
    {day}
  </Badge>
);

export const DailyFarmingGuide: React.FC = () => {
  const { currentDay, isSunday, talentMaterials, weaponMaterials } =
    useTodayCalendar();

  const talentBanner = useRandomBanner('characters');
  const weaponBanner = useRandomBanner('weapons');

  const hasTalentBanner = !!talentBanner;
  const hasWeaponBanner = !!weaponBanner;

  console.log(talentBanner, weaponBanner);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Talent Materials Card */}
      <GameModeCard
        bannerImage={talentBanner}
        header={
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen
                  className={cn(
                    'w-5 h-5',
                    hasTalentBanner
                      ? 'text-purple-400 drop-shadow-md'
                      : 'text-purple-500'
                  )}
                />
                <span
                  className={cn(
                    'text-lg font-semibold leading-none tracking-tight',
                    hasTalentBanner && 'text-white drop-shadow-md'
                  )}
                >
                  Talent Materials
                </span>
              </div>
              <DayBadge day={currentDay} isBanner={hasTalentBanner} />
            </div>
            <div
              className={cn(
                'text-sm',
                hasTalentBanner ? 'text-white/80' : 'text-muted-foreground'
              )}
            >
              {isSunday ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  All materials available today!
                </span>
              ) : (
                `Available talent books for ${currentDay}`
              )}
            </div>
          </>
        }
      >
        {talentMaterials.map(({ region, regionIconUrl, books, characters }) => (
          <RegionTalentMaterials
            key={region}
            region={region}
            regionIconUrl={regionIconUrl}
            books={books}
            characters={characters}
          />
        ))}
      </GameModeCard>

      {/* Weapon Materials Card */}
      <GameModeCard
        bannerImage={weaponBanner}
        header={
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sword
                  className={cn(
                    'w-5 h-5',
                    hasWeaponBanner
                      ? 'text-orange-400 drop-shadow-md'
                      : 'text-orange-500'
                  )}
                />
                <span
                  className={cn(
                    'text-lg font-semibold leading-none tracking-tight',
                    hasWeaponBanner && 'text-white drop-shadow-md'
                  )}
                >
                  Weapon Materials
                </span>
              </div>
              <DayBadge day={currentDay} isBanner={hasWeaponBanner} />
            </div>
            <div
              className={cn(
                'text-sm',
                hasWeaponBanner ? 'text-white/80' : 'text-muted-foreground'
              )}
            >
              {isSunday ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  All materials available today!
                </span>
              ) : (
                `Available weapon materials for ${currentDay}`
              )}
            </div>
          </>
        }
      >
        {weaponMaterials.map(
          ({ nation, nationIconUrl, weapons, materials }) => {
            if (weapons.length === 0) return null;

            const trackedWeapons = weapons.filter((w) => w.isTracked);
            const otherWeapons = weapons.filter((w) => !w.isTracked);

            return (
              <div key={nation} className="space-y-3">
                <div className="flex items-center gap-2">
                  {nationIconUrl && (
                    <CachedImage
                      src={nationIconUrl}
                      alt={nation}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {nation}
                  </span>
                  <div className="flex gap-1">
                    {materials.slice(0, 4).map((mat: ImageUrl) => (
                      <CachedImage
                        key={mat.caption}
                        src={mat.url}
                        alt={mat.caption}
                        width={24}
                        height={24}
                        className="w-5 h-5 md:w-6 md:h-6 rounded"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trackedWeapons.map((weapon) => (
                    <TrackedWeaponAvatar
                      key={weapon.name}
                      name={weapon.name}
                      isTracked
                    />
                  ))}
                  {otherWeapons.slice(0, 6).map((weapon) => (
                    <TrackedWeaponAvatar key={weapon.name} name={weapon.name} />
                  ))}
                  {otherWeapons.length > 6 && (
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted text-muted-foreground text-xs">
                      +{otherWeapons.length - 6}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </GameModeCard>
    </div>
  );
};

export default DailyFarmingGuide;
