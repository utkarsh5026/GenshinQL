import { Calendar, Sparkles, Theater, Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { cn } from '@/lib/utils';
import { useImaginarium } from '@/stores';

import { ELEMENT_COLORS } from '../../constants';

const BANNER_IMAGE = '/images/imaginarium-theater-beautiful.jpg';

export const ImaginariumCard: React.FC = () => {
  const imaginarium = useImaginarium();

  if (!imaginarium) return null;

  const {
    seasonNumber,
    dateRange,
    versionName,
    openingCharacters,
    theaterEffect,
    elements,
    specialGuestCharacters,
  } = imaginarium;

  return (
    <GameModeCard
      bannerImage={BANNER_IMAGE}
      icon={<Theater className="w-5 h-5 text-rose-400" />}
      title="Imaginarium Theater"
      badges={
        <>
          {versionName && (
            <Badge
              variant="outline"
              className="text-xs border-white/30 text-white/90 bg-black/20 backdrop-blur-sm"
            >
              {versionName}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-xs border-white/30 text-white/90 bg-black/20 backdrop-blur-sm"
          >
            Season {seasonNumber}
          </Badge>
        </>
      }
      description={
        <>
          <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/70" />
          <span className="text-xs whitespace-pre-line text-white/70">
            {dateRange}
          </span>
        </>
      }
    >
      {/* Allowed Elements */}
      {elements.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Elements:</span>
          {elements.map((el) => (
            <Badge
              key={el.name}
              variant="outline"
              className={cn(
                'text-xs gap-1 px-2 py-0.5',
                ELEMENT_COLORS[el.name]
              )}
            >
              <CachedImage
                src={el.iconUrl}
                alt={el.name}
                width={14}
                height={14}
                className="w-3.5 h-3.5"
                showSkeleton={false}
              />
              {el.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Opening Characters */}
      {openingCharacters.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Opening Characters
          </h4>
          <div className="flex flex-wrap gap-2">
            {openingCharacters.map((char) => (
              <CharacterAvatar
                key={char.name}
                characterName={char.name}
                showName={false}
                size="md"
                avatarClassName="bg-transparent border-none"
                imageClassName=""
              />
            ))}
          </div>
          {theaterEffect && (
            <p className="text-xs text-muted-foreground italic mt-2 pl-0.5">
              {theaterEffect}
            </p>
          )}
        </div>
      )}

      {/* Special Guests */}
      {specialGuestCharacters.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Special Guests
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialGuestCharacters.map(({ name }) => (
              <CharacterAvatar
                key={name}
                characterName={name}
                showName={false}
                size="md"
                avatarClassName="bg-transparent border-none"
                imageClassName=""
              />
            ))}
          </div>
        </div>
      )}
    </GameModeCard>
  );
};
