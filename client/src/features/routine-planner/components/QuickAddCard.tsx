import type { LucideIcon } from 'lucide-react';
import { Check, ChevronDown, ChevronUp, Plus, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import { useCharacterMap } from '@/stores';
import type {
  CharacterPriority,
  RecommendedCharacter,
  RecommendedTeam,
  TrackingReason,
} from '@/types';

const PRIORITY_COLORS: Record<CharacterPriority, string> = {
  S: 'text-amber-400 border-amber-400/50',
  A: 'text-silver-400 border-silver-400/50',
  B: 'text-orange-400 border-orange-400/50',
  C: 'text-gray-400 border-gray-400/50',
};

const REASON_COLORS: Record<TrackingReason, string> = {
  building: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  farming: 'bg-green-500/20 text-green-400 border-green-500/50',
  wishlist: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

interface QuickAddCardProps {
  title: string;
  icon: LucideIcon;
  characters: RecommendedCharacter[];
  teams?: RecommendedTeam[];
  version?: string;
  onAddCharacters: (characterNames: string[], reason: TrackingReason) => void;
  onAddTeam: (team: RecommendedTeam, reason: TrackingReason) => void;
}

export const QuickAddCard: React.FC<QuickAddCardProps> = ({
  title,
  icon: Icon,
  characters,
  teams = [],
  version,
  onAddCharacters,
  onAddTeam,
}) => {
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(
    new Set()
  );
  const [selectedReason, setSelectedReason] =
    useState<TrackingReason>('building');
  const [showTeams, setShowTeams] = useState(false);

  const characterMap = useCharacterMap();

  // Group characters by priority
  const groupedCharacters = useMemo(() => {
    const groups: Record<CharacterPriority, RecommendedCharacter[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
    };

    characters.forEach((char) => {
      groups[char.priority].push(char);
    });

    return groups;
  }, [characters]);

  const handleToggleCharacter = (name: string) => {
    const newSelected = new Set(selectedCharacters);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedCharacters(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedCharacters.size === 0) return;
    onAddCharacters(Array.from(selectedCharacters), selectedReason);
    setSelectedCharacters(new Set());
  };

  const handleAddTeam = (team: RecommendedTeam) => {
    onAddTeam(team, selectedReason);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {version && (
                <CardDescription className="text-xs">
                  v{version}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tracking Reason Selector */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Tracking Reason
          </label>
          <div className="flex gap-2">
            {(['building', 'farming', 'wishlist'] as TrackingReason[]).map(
              (reason) => (
                <Button
                  key={reason}
                  size="sm"
                  variant={selectedReason === reason ? 'default' : 'outline'}
                  onClick={() => setSelectedReason(reason)}
                  className={cn(
                    'flex-1 text-xs h-7',
                    selectedReason === reason && REASON_COLORS[reason]
                  )}
                >
                  {REASON_LABELS[reason]}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Recommended Characters by Priority */}
        <div className="space-y-3">
          {(['S', 'A', 'B'] as CharacterPriority[]).map((priority) => {
            const chars = groupedCharacters[priority];
            if (chars.length === 0) return null;

            return (
              <div key={priority} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0',
                      PRIORITY_COLORS[priority]
                    )}
                  >
                    {priority} Tier
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {chars.length} character{chars.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {chars.map((char) => {
                    const characterData = characterMap[char.name];
                    if (!characterData) return null;

                    const isSelected = selectedCharacters.has(char.name);
                    const isSpecialGuest = char.isSpecialGuest;

                    return (
                      <button
                        key={char.name}
                        onClick={() => handleToggleCharacter(char.name)}
                        className={cn(
                          'relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                          'hover:bg-accent/50',
                          isSelected && 'bg-primary/20 ring-2 ring-primary'
                        )}
                      >
                        {isSpecialGuest && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                        <CachedImage
                          src={characterData.iconUrl}
                          alt={char.name}
                          width={48}
                          height={48}
                          className="w-10 h-10 rounded-lg"
                        />
                        <span className="text-[9px] text-center line-clamp-1 max-w-full">
                          {char.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Count and Add Button */}
        {selectedCharacters.size > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground flex-1">
              {selectedCharacters.size} selected
            </span>
            <Button size="sm" onClick={handleAddSelected} className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              Add Selected
            </Button>
          </div>
        )}

        {/* Recommended Teams */}
        {teams.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTeams(!showTeams)}
              className="w-full text-xs justify-between"
            >
              <span>Recommended Teams ({teams.length})</span>
              {showTeams ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>

            {showTeams && (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.name}
                    className="p-3 rounded-lg bg-accent/20 border border-border/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {team.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddTeam(team)}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      {team.characters.slice(0, 4).map((charName) => {
                        const char = characterMap[charName];
                        if (!char) return null;
                        return (
                          <CachedImage
                            key={charName}
                            src={char.iconUrl}
                            alt={charName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
