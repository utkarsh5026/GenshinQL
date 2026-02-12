import {
  ChevronDown,
  ChevronUp,
  Flame,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trash2,
  UserPlus,
} from 'lucide-react';
import React, { useState } from 'react';

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
import {
  useCharacterMap,
  useTrackedCharacters,
  useTrackerStore,
} from '@/stores';
import type { TrackedTeam, TrackingReason } from '@/types';

const TEAM_ICONS = {
  sword: Swords,
  shield: Shield,
  star: Star,
  flame: Flame,
  sparkles: Sparkles,
} as const;

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

interface TeamCardProps {
  team: TrackedTeam;
  onEdit?: (teamId: string) => void;
  onDelete: (teamId: string) => void;
  onAddToTracker: (teamId: string, reason: TrackingReason) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onDelete,
  onAddToTracker,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<TrackingReason>('building');

  const characterMap = useCharacterMap();
  const trackedCharacters = useTrackedCharacters();
  const { deleteTeam } = useTrackerStore();

  const TeamIcon = TEAM_ICONS[team.icon as keyof typeof TEAM_ICONS] || Swords;

  const teamCharacters = team.characters
    .map((name) => characterMap[name])
    .filter((char) => char !== undefined);

  const trackedCharacterNames = new Set(trackedCharacters.map((c) => c.name));
  const untrackedCount = team.characters.filter(
    (name) => !trackedCharacterNames.has(name)
  ).length;

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete team "${team.name}"? This will not remove tracked characters.`
      )
    ) {
      deleteTeam(team.id);
      onDelete(team.id);
    }
  };

  const handleAddToTracker = () => {
    onAddToTracker(team.id, selectedReason);
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:bg-accent/30 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TeamIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{team.name}</CardTitle>
              <CardDescription className="text-xs">
                {team.characters.length} character
                {team.characters.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Character Avatars */}
        <div className="flex items-center gap-2 flex-wrap">
          {teamCharacters.slice(0, 4).map((char) => {
            const isTracked = trackedCharacterNames.has(char.name);
            return (
              <div key={char.name} className="relative">
                <CachedImage
                  src={char.iconUrl}
                  alt={char.name}
                  width={40}
                  height={40}
                  className={cn(
                    'w-10 h-10 rounded-lg border',
                    isTracked ? 'border-primary' : 'border-border'
                  )}
                />
                {isTracked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border border-background" />
                )}
              </div>
            );
          })}
          {teamCharacters.length > 4 && (
            <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center bg-card text-xs text-muted-foreground">
              +{teamCharacters.length - 4}
            </div>
          )}
        </div>

        {/* Add to Tracker Section */}
        {untrackedCount > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{untrackedCount} not tracked yet</span>
            </div>
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
            <Button size="sm" onClick={handleAddToTracker} className="w-full">
              <UserPlus className="w-3 h-3 mr-2" />
              Add All to Tracker
            </Button>
          </div>
        )}

        {/* Expand Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {teamCharacters.map((char) => {
              const isTracked = trackedCharacterNames.has(char.name);
              const trackedChar = trackedCharacters.find(
                (c) => c.name === char.name
              );

              return (
                <div
                  key={char.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CachedImage
                      src={char.iconUrl}
                      alt={char.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded"
                    />
                    <span className="text-xs">{char.name}</span>
                  </div>
                  {isTracked && trackedChar ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs px-2 py-0',
                        REASON_COLORS[trackedChar.reason]
                      )}
                    >
                      {REASON_LABELS[trackedChar.reason]}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not tracked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
