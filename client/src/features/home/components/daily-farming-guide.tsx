import { BookOpen, Calendar, Sparkles, Sword } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
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
      'text-xs gap-1',
      isBanner && 'border-white/30 text-white/90 bg-black/20 backdrop-blur-sm'
    )}
  >
    <Calendar className="w-3 h-3" />
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
    <div className="flex flex-wrap gap-1 items-center">
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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground text-[10px] font-medium">
          +{overflowCount}
        </div>
      )}
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
    <div className="grid gap-4 md:grid-cols-2">
      {/* Talent Materials Card */}
      <GameModeCard
        bannerImage={talentBanner}
        icon={<BookOpen className="w-5 h-5 text-purple-400" />}
        title="Talent Materials"
        badges={<DayBadge day={currentDay} isBanner={hasTalentBanner} />}
        description={
          isSunday ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3 h-3" />
              All materials available today!
            </span>
          ) : (
            `Available talent books for ${currentDay}`
          )
        }
      >
        <Table>
          <TableBody>
            {talentMaterials.map(
              ({ region, regionIconUrl, books, characters }) => {
                const tracked = characters.filter((c) => c.isTracked);
                const others = characters.filter((c) => !c.isTracked);

                return (
                  <TableRow key={region}>
                    <TableCell className="p-2 whitespace-nowrap w-[1%]">
                      <div className="flex items-center gap-1.5">
                        {regionIconUrl && (
                          <CachedImage
                            src={regionIconUrl}
                            alt={region}
                            width={18}
                            height={18}
                            className="w-4.5 h-4.5 rounded shrink-0"
                          />
                        )}
                        <span className="text-xs font-medium text-foreground">
                          {region}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 w-[1%]">
                      <div className="flex gap-0.5">
                        {books.map((book) => (
                          <CachedImage
                            key={book.name}
                            src={book.url}
                            alt={book.name}
                            width={22}
                            height={22}
                            className="w-5.5 h-5.5 rounded"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <AvatarCell
                        tracked={tracked}
                        others={others}
                        max={MAX_CHARS}
                        type="character"
                      />
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </GameModeCard>

      {/* Weapon Materials Card */}
      <GameModeCard
        bannerImage={weaponBanner}
        icon={<Sword className="w-5 h-5 text-orange-400" />}
        title="Weapon Materials"
        badges={<DayBadge day={currentDay} isBanner={hasWeaponBanner} />}
        description={
          isSunday ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3 h-3" />
              All materials available today!
            </span>
          ) : (
            `Available weapon materials for ${currentDay}`
          )
        }
      >
        <Table>
          <TableBody>
            {weaponMaterials.map(
              ({ nation, nationIconUrl, weapons, materials }) => {
                if (weapons.length === 0) return null;

                const tracked = weapons.filter((w) => w.isTracked);
                const others = weapons.filter((w) => !w.isTracked);

                return (
                  <TableRow key={nation}>
                    <TableCell className="p-2 whitespace-nowrap w-[1%]">
                      <div className="flex items-center gap-1.5">
                        {nationIconUrl && (
                          <CachedImage
                            src={nationIconUrl}
                            alt={nation}
                            width={18}
                            height={18}
                            className="w-4.5 h-4.5 rounded shrink-0"
                          />
                        )}
                        <span className="text-xs font-medium text-foreground">
                          {nation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 w-[1%]">
                      <div className="flex gap-0.5">
                        {materials.slice(0, 4).map((mat: ImageUrl) => (
                          <CachedImage
                            key={mat.caption}
                            src={mat.url}
                            alt={mat.caption}
                            width={22}
                            height={22}
                            className="w-5.5 h-5.5 rounded"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <AvatarCell
                        tracked={tracked}
                        others={others}
                        max={MAX_WEAPONS}
                        type="weapon"
                      />
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </GameModeCard>
    </div>
  );
};

export default DailyFarmingGuide;
