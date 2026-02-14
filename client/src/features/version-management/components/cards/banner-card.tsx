import { useMemo } from 'react';

import CharacterAvatar from '@/features/characters/components/utils/character-avatar';

import { useEventCountdown } from '../../hooks/useEventCountdown';
import type { EventWish } from '../../types';
import { stripSoftHyphens } from '../../utils';
import CountdownBadge from '../countdown-badge';

interface BannerCardProps {
  banner: EventWish;
}

export default function BannerCard({ banner }: BannerCardProps) {
  const name = useMemo(
    () => stripSoftHyphens(banner.bannerName),
    [banner.bannerName]
  );

  const countdown = useEventCountdown(banner.duration);

  const { fiveStars, fourStars } = useMemo(() => {
    const fiveStars = banner.featuredCharacters.filter(
      (char) => char.rarity === 5
    );
    const fourStars = banner.featuredCharacters.filter(
      (char) => char.rarity === 4
    );
    return { fiveStars, fourStars };
  }, [banner.featuredCharacters]);

  return (
    <div
      className="group overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-celestial-500/50 hover:shadow-xl hover:shadow-midnight-950/50"
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {/* Banner Image */}
      {banner.bannerImage && (
        <div className="relative h-48 overflow-hidden md:h-60">
          {/* Gradient overlay for better badge visibility */}
          <div className="absolute inset-0 bg-linear-to-t from-midnight-950/60 via-transparent to-midnight-950/30" />

          <img
            src={banner.bannerImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Phase Badge */}
          <div className="absolute left-3 top-3 md:left-4 md:top-4">
            <span className="inline-flex items-center rounded-lg border border-celestial-500/30 bg-celestial-900/70 px-2.5 py-0.5 text-xs font-semibold text-celestial-200 backdrop-blur-sm md:px-3 md:py-1 md:text-sm">
              {banner.phase}
            </span>
          </div>

          {/* Countdown Badge */}
          <div className="absolute right-3 top-3 md:right-4 md:top-4">
            <CountdownBadge
              status={countdown.status}
              countdown={countdown.formattedTime}
            />
          </div>
        </div>
      )}

      <div className="space-y-2.5 p-3 md:space-y-3 md:p-4">
        {/* Banner Name */}
        <h3 className="text-base font-bold text-foreground md:text-lg">
          {name}
        </h3>

        {/* 5-Star Characters (Featured/Main Attractions) */}
        {fiveStars.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-legendary-400">
              5-Star Featured
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {fiveStars.map((char) => {
                const charName = stripSoftHyphens(char.name);
                return (
                  <div key={charName} className=" p-1.5">
                    <CharacterAvatar
                      characterName={charName}
                      size="md"
                      badgePosition="bottom-right"
                      avatarClassName="shadow-lg shadow-legendary-500/20"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4-Star Characters */}
        {fourStars.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              4-Star Rate-Up
            </p>
            <div className="flex flex-wrap gap-2">
              {fourStars.map((char) => {
                const charName = stripSoftHyphens(char.name);
                return (
                  <CharacterAvatar
                    key={charName}
                    characterName={charName}
                    size="md"
                    badgePosition="bottom-right"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
