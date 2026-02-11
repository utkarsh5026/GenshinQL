import {
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  Star,
  Swords,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import {
  useCharacterMap,
  useGameContentStore,
  useImaginarium,
  useSpiralAbyss,
  useTrackedCharacters,
} from '@/stores';
import type { RecommendedCharacter } from '@/types';

import { ELEMENT_COLORS, PRIORITY_COLORS } from '../constants';
import { ImaginariumCard } from './game-modes/imaginarium-theater';

interface RecommendedCharacterCardProps {
  character: RecommendedCharacter;
  iconUrl?: string;
  isTracked: boolean;
}

const RecommendedCharacterCard: React.FC<RecommendedCharacterCardProps> = ({
  character,
  iconUrl,
  isTracked,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg',
        'bg-card/30 border border-border/30',
        isTracked && 'ring-1 ring-amber-500/50 bg-amber-500/5'
      )}
    >
      {iconUrl && (
        <CachedImage
          src={iconUrl}
          alt={character.name}
          width={40}
          height={40}
          className="w-9 h-9 rounded-lg"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{character.name}</span>
          {character.isSpecialGuest && (
            <Sparkles className="w-3 h-3 text-amber-400" />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {character.element && (
            <span className={ELEMENT_COLORS[character.element]}>
              {character.element}
            </span>
          )}
          <span>{character.role}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isTracked && (
          <Badge
            variant="outline"
            className="text-[10px] px-1 py-0 bg-amber-500/20"
          >
            Tracking
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn('text-xs px-1.5', PRIORITY_COLORS[character.priority])}
        >
          {character.priority}
        </Badge>
      </div>
    </div>
  );
};

const SpiralAbyssCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const spiralAbyss = useSpiralAbyss();
  const characterMap = useCharacterMap();
  const trackedCharacters = useTrackedCharacters();

  const trackedNames = useMemo(
    () => new Set(trackedCharacters.map((c) => c.name)),
    [trackedCharacters]
  );

  if (!spiralAbyss) return null;

  const { version, phase, blessing, recommendedCharacters, recommendedTeams } =
    spiralAbyss;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-lg">Spiral Abyss</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            v{version} Phase {phase}
          </Badge>
        </div>
        <CardDescription className="flex items-start gap-2">
          <Flame className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <span>
            <strong>{blessing.name}:</strong> {blessing.description}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommended Characters */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            Recommended Characters
          </h4>
          <div className="grid gap-2">
            {recommendedCharacters.slice(0, 4).map((char) => {
              const charData = characterMap[char.name];
              return (
                <RecommendedCharacterCard
                  key={char.name}
                  character={char}
                  iconUrl={charData?.iconUrl}
                  isTracked={trackedNames.has(char.name)}
                />
              );
            })}
          </div>
        </div>

        {/* Collapsible section for more details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {isOpen ? 'Show less' : 'Show more characters & teams'}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* More Characters */}
            <div className="grid gap-2">
              {recommendedCharacters.slice(4).map((char) => {
                const charData = characterMap[char.name];
                return (
                  <RecommendedCharacterCard
                    key={char.name}
                    character={char}
                    iconUrl={charData?.iconUrl}
                    isTracked={trackedNames.has(char.name)}
                  />
                );
              })}
            </div>

            {/* Teams */}
            {recommendedTeams && recommendedTeams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recommended Teams</h4>
                <div className="space-y-2">
                  {recommendedTeams.map((team) => (
                    <div
                      key={team.name}
                      className="p-3 rounded-lg bg-card/30 border border-border/30"
                    >
                      <div className="font-medium text-sm mb-1">
                        {team.name}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {team.characters.map((charName) => {
                          const charData = characterMap[charName];
                          return charData ? (
                            <CachedImage
                              key={charName}
                              src={charData.iconUrl}
                              alt={charName}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded"
                            />
                          ) : (
                            <div
                              key={charName}
                              className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[8px]"
                            >
                              {charName.slice(0, 2)}
                            </div>
                          );
                        })}
                      </div>
                      {team.description && (
                        <p className="text-xs text-muted-foreground">
                          {team.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export const GameModesSection: React.FC = () => {
  const { fetchAll } = useGameContentStore();
  const spiralAbyss = useSpiralAbyss();
  const imaginarium = useImaginarium();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hasContent = spiralAbyss || imaginarium;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SpiralAbyssCard />
      <ImaginariumCard />
    </div>
  );
};

export default GameModesSection;
