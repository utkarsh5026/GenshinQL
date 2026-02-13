import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { useVersionMeta, useVersionWallpaper } from '../stores';

export default function VersionHeroBanner() {
  const meta = useVersionMeta();
  const wallpaperUrl = useVersionWallpaper();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div className="relative h-[40vh] min-h-80 md:h-[60vh] md:min-h-100">
        {wallpaperUrl ? (
          <img
            src={wallpaperUrl}
            alt={meta ? `Version ${meta.version} - ${meta.name}` : 'Version'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-midnight-900 via-midnight-800 to-midnight-950" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-linear-to-r from-background/40 via-transparent to-background/40" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-12">
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Version Badge */}
            {meta && (
              <Badge
                variant="outline"
                className="border-legendary-500/50 bg-legendary-950/40 px-3 py-1.5 text-sm font-semibold text-legendary-200 backdrop-blur-sm border-4"
              >
                <Star className="mr-1.5 h-3.5 w-3.5 fill-legendary-400 text-legendary-400" />
                Version {meta.version}
              </Badge>
            )}

            {/* Version Name */}
            <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl">
              <span className="bg-linear-to-r from-celestial-200 via-legendary-300 to-celestial-200 bg-clip-text text-transparent drop-shadow-lg">
                {meta?.name || 'Current Version'}
              </span>
            </h1>

            {/* Theme */}
            {meta?.theme && (
              <p className="max-w-xl text-lg text-starlight-300 md:text-xl">
                {meta.theme}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
