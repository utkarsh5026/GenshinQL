import { BookOpen, Calendar, Sparkles, Sword } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import { cn } from '@/lib/utils';
import { useWallpaper } from '@/stores/useWallpaperStore';
import type { ImageUrl } from '@/types';

import { useTodayCalendar } from '../hooks';
import type { MaterialItem } from '../types';

const MAX_CHARS = 10;
const MAX_WEAPONS = 8;

const DayBadge: React.FC<{ day: string; isBanner: boolean }> = ({
  day,
  isBanner,
}) => (
  <Badge
    variant="outline"
    className={cn(
      'text-xs sm:text-sm gap-1 px-2 py-1',
      isBanner && 'border-white/30 text-white/90 bg-black/20 backdrop-blur-sm'
    )}
  >
    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
    {day}
  </Badge>
);

interface AvatarCellProps {
  tracked: MaterialItem[];
  others: MaterialItem[];
  max: number;
  type: 'character' | 'weapon';
}

const AvatarCell: React.FC<AvatarCellProps> = ({
  tracked,
  others,
  max,
  type,
}) => {
  const remaining = max - tracked.length;
  const visibleOthers = others.slice(0, Math.max(0, remaining));
  const overflowCount = others.length - visibleOthers.length;

  return (
    <div className="flex flex-wrap gap-1 sm:gap-1.5 items-center">
      {tracked.map((item) => (
        <div key={item.name}>
          {type === 'character' ? (
            <CharacterAvatar
              characterName={item.name}
              size="md"
              showName={false}
              namePosition="tooltip"
              avatarClassName="border-none"
            />
          ) : (
            <WeaponAvatar
              weaponName={item.name}
              size="md"
              showName={false}
              namePosition="tooltip"
            />
          )}
        </div>
      ))}
      {visibleOthers.map((item) =>
        type === 'character' ? (
          <CharacterAvatar
            key={item.name}
            characterName={item.name}
            size="md"
            showName={false}
            avatarClassName="border-none"
          />
        ) : (
          <WeaponAvatar
            key={item.name}
            weaponName={item.name}
            size="md"
            showName={false}
            namePosition="tooltip"
          />
        )
      )}
      {overflowCount > 0 && (
        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted text-muted-foreground text-[10px] sm:text-xs font-medium">
          +{overflowCount}
        </div>
      )}
    </div>
  );
};

interface MaterialRowProps {
  regionName: string;
  regionIconUrl?: string;
  materials: Array<{ name: string; url: string } | ImageUrl>;
  tracked: MaterialItem[];
  others: MaterialItem[];
  max: number;
  type: 'character' | 'weapon';
}

const MaterialRow: React.FC<MaterialRowProps> = ({
  regionName,
  regionIconUrl,
  materials,
  tracked,
  others,
  max,
  type,
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card/30 rounded-lg border border-border/40 hover:bg-card/40 transition-colors">
      {/* Region Header */}
      <div className="flex items-center gap-2">
        {regionIconUrl && (
          <CachedImage
            src={regionIconUrl}
            alt={regionName}
            width={24}
            height={24}
            className="w-6 h-6 rounded shrink-0"
          />
        )}
        <span className="text-sm sm:text-base font-semibold text-foreground">
          {regionName}
        </span>
      </div>

      {/* Materials */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground font-medium min-w-[70px] sm:min-w-[80px]">
          Materials:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {materials.slice(0, 4).map((mat) => {
            const matUrl = 'caption' in mat ? mat.url : mat.url;
            const matName = 'caption' in mat ? mat.caption : mat.name;
            return (
              <CachedImage
                key={matName}
                src={matUrl}
                alt={matName}
                width={28}
                height={28}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded"
              />
            );
          })}
        </div>
      </div>

      {/* Characters/Weapons */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
          {type === 'character' ? 'Characters:' : 'Weapons:'}
        </span>
        <AvatarCell tracked={tracked} others={others} max={max} type={type} />
      </div>
    </div>
  );
};

export const DailyFarmingGuide: React.FC = () => {
  const { currentDay, isSunday, talentMaterials, weaponMaterials } =
    useTodayCalendar();

  const talentBanner = useWallpaper('daily-farming-talent');
  const weaponBanner = useWallpaper('daily-farming-weapon');

  const hasTalentBanner = !!talentBanner;
  const hasWeaponBanner = !!weaponBanner;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Talent Materials Card */}
      <GameModeCard
        bannerImage={talentBanner}
        icon={<BookOpen className="w-5 h-5 text-purple-400" />}
        title="Talent Materials"
        badges={<DayBadge day={currentDay} isBanner={hasTalentBanner} />}
        description={
          isSunday ? (
            <span className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              All materials available today!
            </span>
          ) : (
            <span className="text-xs sm:text-sm">
              Available talent books for {currentDay}
            </span>
          )
        }
      >
        <div className="flex flex-col gap-3">
          {talentMaterials.map(
            ({ region, regionIconUrl, books, characters }) => {
              const tracked = characters.filter((c) => c.isTracked);
              const others = characters.filter((c) => !c.isTracked);

              return (
                <MaterialRow
                  key={region}
                  regionName={region}
                  regionIconUrl={regionIconUrl}
                  materials={books}
                  tracked={tracked}
                  others={others}
                  max={MAX_CHARS}
                  type="character"
                />
              );
            }
          )}
        </div>
      </GameModeCard>

      {/* Weapon Materials Card */}
      <GameModeCard
        bannerImage={weaponBanner}
        icon={<Sword className="w-5 h-5 text-orange-400" />}
        title="Weapon Materials"
        badges={<DayBadge day={currentDay} isBanner={hasWeaponBanner} />}
        description={
          isSunday ? (
            <span className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              All materials available today!
            </span>
          ) : (
            <span className="text-xs sm:text-sm">
              Available weapon materials for {currentDay}
            </span>
          )
        }
      >
        <div className="flex flex-col gap-3">
          {weaponMaterials.map(
            ({ nation, nationIconUrl, weapons, materials }) => {
              if (weapons.length === 0) return null;

              const tracked = weapons.filter((w) => w.isTracked);
              const others = weapons.filter((w) => !w.isTracked);

              return (
                <MaterialRow
                  key={nation}
                  regionName={nation}
                  regionIconUrl={nationIconUrl}
                  materials={materials}
                  tracked={tracked}
                  others={others}
                  max={MAX_WEAPONS}
                  type="weapon"
                />
              );
            }
          )}
        </div>
      </GameModeCard>
    </div>
  );
};

export default DailyFarmingGuide;
