import { Calendar, Sparkles, Theater, Users } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { cn } from '@/lib/utils';
import { useImaginarium } from '@/stores';

import { ELEMENT_COLORS } from '../../constants';

const BANNER_IMAGE = '/images/imaginarium-theater-beautiful.jpg';
const BG_IMAGE = '/images/imaginarium-theater.jpg';

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
    <Card className="overflow-hidden">
      {/* Hero Banner */}
      <div className="relative h-36">
        <img
          src={BANNER_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/60 to-card/10" />
        <CardHeader className="relative z-10 h-full justify-end pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Theater className="w-5 h-5 text-rose-400 drop-shadow-md" />
              <CardTitle className="text-lg text-white drop-shadow-md">
                Imaginarium Theater
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
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
            </div>
          </div>
          <CardDescription>
            <div className="flex items-start gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/70" />
              <span className="text-xs whitespace-pre-line text-white/70">
                {dateRange}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
      </div>

      {/* Content with subtle background */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-[0.06] bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <CardContent className="relative space-y-4 pt-4">
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
        </CardContent>
      </div>
    </Card>
  );
};
