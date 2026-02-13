import { ExternalLink, MapPin } from 'lucide-react';
import { useMemo } from 'react';

import type { NewArea } from '../../types';
import { stripSoftHyphens } from '../../utils';

interface AreaCardProps {
  area: NewArea;
}

export default function AreaCard({ area }: AreaCardProps) {
  const name = useMemo(() => stripSoftHyphens(area.name), [area.name]);
  const nation = useMemo(
    () => stripSoftHyphens(area.nationName),
    [area.nationName]
  );

  const heroImage = area.areaImage || area.galleryImages[0];

  return (
    <div className="overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40 backdrop-blur-sm transition-all duration-300 hover:border-geo-500/30">
      {/* Area Image */}
      {heroImage && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={heroImage}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-midnight-950 to-transparent p-4 pt-8" />
        </div>
      )}

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-geo-300">
              <MapPin className="h-3.5 w-3.5" />
              <span>{nation}</span>
            </div>
          </div>
          <a
            href={area.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-hydro-300 transition-colors hover:text-hydro-200"
            title="View on Wiki"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Gallery thumbnails */}
        {area.galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {area.galleryImages.slice(1, 4).map((img, i) => (
              <div
                key={i}
                className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-midnight-600/50"
              >
                <img
                  src={img}
                  alt={`${name} gallery ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
