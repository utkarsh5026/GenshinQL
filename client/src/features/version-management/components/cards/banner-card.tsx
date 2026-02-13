import { Clock, Star } from 'lucide-react';
import { useMemo } from 'react';

import type { EventWish } from '../../types';
import {
  getElementBorderClass,
  getRarityBorderClass,
  stripSoftHyphens,
} from '../../utils';

interface BannerCardProps {
  banner: EventWish;
}

export default function BannerCard({ banner }: BannerCardProps) {
  const name = useMemo(
    () => stripSoftHyphens(banner.bannerName),
    [banner.bannerName]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/50 backdrop-blur-sm transition-all duration-300 hover:border-celestial-500/30 hover:shadow-lg hover:shadow-midnight-950/50">
      {/* Banner Image */}
      {banner.bannerImage && (
        <div className="relative overflow-hidden">
          <img
            src={banner.bannerImage}
            alt={name}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
          {/* Phase Badge */}
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-lg border border-celestial-500/30 bg-celestial-900/70 px-3 py-1 text-sm font-semibold text-celestial-200 backdrop-blur-sm">
              {banner.phase}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4 p-5">
        {/* Banner Name */}
        <h3 className="text-xl font-bold text-foreground">{name}</h3>

        {/* Duration */}
        {banner.duration.start && (
          <div className="flex items-center gap-2 text-sm text-starlight-300">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {banner.duration.start} — {banner.duration.end}
            </span>
          </div>
        )}

        {/* Featured Characters */}
        {banner.featuredCharacters.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Featured Characters
            </p>
            <div className="flex flex-wrap gap-3">
              {banner.featuredCharacters.map((char) => {
                const charName = stripSoftHyphens(char.name);
                return (
                  <div key={charName} className="flex items-center gap-2">
                    <div
                      className={`overflow-hidden rounded-full border-2 ${getRarityBorderClass(char.rarity)} ${getElementBorderClass(char.element)} bg-midnight-900/60`}
                    >
                      <img
                        src={char.icon}
                        alt={charName}
                        className="h-10 w-10 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {charName}
                      </span>
                      {char.rarity && (
                        <Star
                          className={`h-3 w-3 fill-current ${char.rarity === 5 ? 'text-legendary-400' : 'text-epic-400'}`}
                        />
                      )}
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
