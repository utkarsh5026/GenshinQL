import { Calendar, Sparkles, Star } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { useVersionStore } from '@/stores/useVersionStore';
import { useWallpaper } from '@/stores/useWallpaperStore';

import { getFormattedDate } from '../utils';

export const HeroSection: React.FC = () => {
  const heroWallpaper = useWallpaper('home-hero');
  const { versionData, fetchVersionData } = useVersionStore();
  const formattedDate = useMemo(() => getFormattedDate(), []);

  useEffect(() => {
    fetchVersionData();
  }, [fetchVersionData]);

  const versionNumber = versionData?.version || '6.3';
  const versionName = versionData?.name || 'Luna IV';
  const versionTheme =
    versionData?.theme || 'Lantern Rite Festival Returns to Liyue';

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {heroWallpaper ? (
          <img
            src={heroWallpaper}
            alt="Genshin Impact"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-midnight-900/40 via-hydro-900/40 to-electro-900/40" />
        )}

        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-background/60" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 md:px-8 md:py-16 space-y-6">
        {/* Animated Sparkles */}
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-5 h-5 text-legendary-400 animate-pulse"
            style={{ animationDelay: '0ms' }}
          />
          <Sparkles
            className="w-4 h-4 text-celestial-300 animate-pulse"
            style={{ animationDelay: '200ms' }}
          />
          <Sparkles
            className="w-3 h-3 text-legendary-500 animate-pulse"
            style={{ animationDelay: '400ms' }}
          />
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-linear-to-r from-legendary-200 via-celestial-300 to-legendary-200 bg-clip-text text-transparent drop-shadow-lg">
              Welcome back,
            </span>
            <br />
            <span className="bg-linear-to-r from-hydro-200 via-cryo-200 to-epic-200 bg-clip-text text-transparent drop-shadow-lg">
              Traveler
            </span>
          </h1>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm md:text-base">{formattedDate}</span>
          </div>
        </div>

        {/* Version & Theme Info */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Version Badge */}
          <Badge
            variant="outline"
            className="px-3 py-1.5 text-sm font-semibold border-legendary-500/50 bg-legendary-950/30 text-legendary-200 backdrop-blur-sm"
          >
            <Star className="w-3.5 h-3.5 mr-1.5 fill-legendary-400 text-legendary-400" />
            Version {versionNumber} - {versionName}
          </Badge>

          {/* Theme Badge */}
          <Badge
            variant="outline"
            className="px-3 py-1.5 text-sm border-epic-500/50 bg-epic-950/30 text-epic-200 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-epic-400" />
            {versionTheme}
          </Badge>
        </div>

        {/* Version Highlights */}
        {versionData?.versionOverview?.highlights && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-hydro-950/40 to-epic-950/40 border border-hydro-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-hydro-400 shrink-0" />
              <p className="text-sm text-hydro-100/90 line-clamp-1">
                {versionData.versionOverview.highlights[0]}
              </p>
            </div>
          </div>
        )}

        {/* Decorative floating elements */}
        <div className="absolute top-10 right-10 opacity-20 pointer-events-none hidden md:block">
          <Star
            className="w-16 h-16 text-legendary-300 animate-pulse"
            style={{ animationDelay: '600ms' }}
          />
        </div>
        <div className="absolute bottom-10 right-20 opacity-10 pointer-events-none hidden md:block">
          <Sparkles
            className="w-12 h-12 text-epic-300 animate-pulse"
            style={{ animationDelay: '800ms' }}
          />
        </div>
      </div>

      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent" />
    </div>
  );
};

export default HeroSection;
