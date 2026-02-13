import { Star } from 'lucide-react';
import { useMemo } from 'react';

import { useEventCountdown } from '../../hooks/useEventCountdown';
import type { EventWish } from '../../types';
import {
  getElementBorderClass,
  getRarityBorderClass,
  stripSoftHyphens,
} from '../../utils';
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

  // Separate 5-star and 4-star characters
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
        <div className="relative h-60 overflow-hidden">
          {/* Gradient overlay for better badge visibility */}
          <div className="absolute inset-0 bg-linear-to-t from-midnight-950/60 via-transparent to-midnight-950/30" />

          <img
            src={banner.bannerImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Phase Badge */}
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-lg border border-celestial-500/30 bg-celestial-900/70 px-3 py-1 text-sm font-semibold text-celestial-200 backdrop-blur-sm">
              {banner.phase}
            </span>
          </div>

          {/* Countdown Badge */}
          <div className="absolute right-4 top-4">
            <CountdownBadge
              status={countdown.status}
              countdown={countdown.formattedTime}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* Banner Name */}
        <h3 className="text-lg font-bold text-foreground">{name}</h3>

        {/* 5-Star Characters (Featured/Main Attractions) */}
        {fiveStars.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-legendary-400">
              5-Star Featured
            </p>
            <div className="flex flex-wrap gap-3">
              {fiveStars.map((char) => {
                const charName = stripSoftHyphens(char.name);
                return (
                  <div
                    key={charName}
                    className="flex items-center gap-2 rounded-lg border border-legendary-500/30 bg-legendary-950/20 p-2 transition-all duration-300 hover:border-legendary-500/50 hover:bg-legendary-950/30"
                  >
                    <div
                      className={`overflow-hidden rounded-full border-2 ${getRarityBorderClass(char.rarity)} ${getElementBorderClass(char.element)} bg-midnight-900/60 shadow-lg shadow-legendary-500/20`}
                    >
                      <img
                        src={char.icon}
                        alt={charName}
                        className="h-12 w-12 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-legendary-200">
                        {charName}
                      </span>
                      <Star className="h-4 w-4 fill-current text-legendary-400" />
                    </div>
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
                  <div key={charName} className="flex items-center gap-1.5">
                    <div
                      className={`overflow-hidden rounded-full border-2 ${getRarityBorderClass(char.rarity)} ${getElementBorderClass(char.element)} bg-midnight-900/60`}
                    >
                      <img
                        src={char.icon}
                        alt={charName}
                        className="h-9 w-9 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {charName}
                      </span>
                      <Star className="h-3 w-3 fill-current text-epic-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
