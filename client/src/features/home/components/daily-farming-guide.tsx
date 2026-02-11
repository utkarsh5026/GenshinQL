import { BookOpen, Calendar, Sparkles, Sword } from 'lucide-react';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import WeaponAvatar from '@/features/weapons/components/shared/card/weapon-avatar';
import { useWeaponMap } from '@/features/weapons/stores/useWeaponsStore';
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
  const weaponMap = useWeaponMap();
  const weapon = weaponMap[name];
  return (
    <div
      className={cn(
        'relative rounded-lg transition-all',
        isTracked && 'ring-2 ring-amber-500 bg-amber-500/10 p-1'
      )}
    >
      <WeaponAvatar weapon={weapon} showName={false} />
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

export const DailyFarmingGuide: React.FC = () => {
  const { currentDay, isSunday, talentMaterials, weaponMaterials } =
    useTodayCalendar();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Talent Materials Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-lg">Talent Materials</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{currentDay}</span>
            </div>
          </div>
          <CardDescription>
            {isSunday ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-3 h-3" />
                All materials available today!
              </span>
            ) : (
              `Available talent books for ${currentDay}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {talentMaterials.map(
            ({ region, regionIconUrl, books, characters }) => (
              <RegionTalentMaterials
                key={region}
                region={region}
                regionIconUrl={regionIconUrl}
                books={books}
                characters={characters}
              />
            )
          )}
        </CardContent>
      </Card>

      {/* Weapon Materials Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg">Weapon Materials</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{currentDay}</span>
            </div>
          </div>
          <CardDescription>
            {isSunday ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-3 h-3" />
                All materials available today!
              </span>
            ) : (
              `Available weapon materials for ${currentDay}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      <TrackedWeaponAvatar
                        key={weapon.name}
                        name={weapon.name}
                      />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyFarmingGuide;
