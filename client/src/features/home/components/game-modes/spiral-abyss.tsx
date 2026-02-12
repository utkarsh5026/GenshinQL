import { ChevronDown, ChevronUp, Flame, Star, Swords } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { useCharacterMap, useSpiralAbyss } from '@/stores';

const BANNER_IMAGE = '/images/spiral-abyss-beautiful.jpg';

export const SpiralAbyssCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const spiralAbyss = useSpiralAbyss();
  const characterMap = useCharacterMap();

  if (!spiralAbyss) return null;

  const { version, phase, blessing, recommendedCharacters, recommendedTeams } =
    spiralAbyss;

  return (
    <GameModeCard
      bannerImage={BANNER_IMAGE}
      header={
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-indigo-400 drop-shadow-md" />
              <span className="text-lg font-semibold leading-none tracking-tight text-white drop-shadow-md">
                Spiral Abyss
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-white/30 text-white/90 bg-black/20 backdrop-blur-sm"
            >
              v{version} Phase {phase}
            </Badge>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <Flame className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 drop-shadow-md" />
            <span className="text-sm text-white/80">
              <strong>{blessing.name}:</strong> {blessing.description}
            </span>
          </div>
        </>
      }
    >
      {/* Recommended Characters */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" />
          Recommended Characters
        </h4>
        <div className="grid gap-2">
          {recommendedCharacters.slice(0, 4).map((char) => {
            return (
              <CharacterAvatar key={char.name} characterName={char.name} />
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
              return (
                <CharacterAvatar key={char.name} characterName={char.name} />
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
                    <div className="font-medium text-sm mb-1">{team.name}</div>
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
    </GameModeCard>
  );
};
