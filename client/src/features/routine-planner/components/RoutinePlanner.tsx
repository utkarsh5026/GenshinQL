import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import {
  useCharacterMap,
  useTrackedCharacters,
  useTrackerStore,
} from '@/stores';
import { useTrackedTeams } from '@/stores/useTrackerStore';
import type { TrackingReason } from '@/types';

import { CharacterWeaponCard } from './CharacterWeaponCard';
import { QuickAddSection } from './QuickAddSection';
import { PlannerRoutineTable } from './routine';
import { TeamCard } from './teams/team-card';
import { TeamCreationDialog } from './teams/team-creation-dialog';

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

interface AddTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTrackingDialog: React.FC<AddTrackingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] =
    useState<TrackingReason>('building');

  const characterMap = useCharacterMap();
  const trackedCharacters = useTrackedCharacters();
  const { addCharacter } = useTrackerStore();

  const trackedCharacterNames = useMemo(
    () => new Set(trackedCharacters.map((c) => c.name)),
    [trackedCharacters]
  );

  const filteredCharacters = useMemo(() => {
    const characters = Object.values(characterMap);
    if (!search)
      return characters.filter((c) => !trackedCharacterNames.has(c.name));
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !trackedCharacterNames.has(c.name)
    );
  }, [characterMap, search, trackedCharacterNames]);

  const handleAddCharacter = (name: string) => {
    addCharacter(name, selectedReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Character to Planner</DialogTitle>
          <DialogDescription>
            Select characters to track and plan their farming routine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mb-4">
          <Input
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {(['building', 'farming', 'wishlist'] as TrackingReason[]).map(
              (reason) => (
                <Button
                  key={reason}
                  size="sm"
                  variant={selectedReason === reason ? 'default' : 'outline'}
                  onClick={() => setSelectedReason(reason)}
                  className={cn(
                    'flex-1 text-xs',
                    selectedReason === reason && REASON_COLORS[reason]
                  )}
                >
                  {REASON_LABELS[reason]}
                </Button>
              )
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {filteredCharacters.slice(0, 24).map((char) => (
              <button
                key={char.name}
                onClick={() => {
                  handleAddCharacter(char.name);
                  onOpenChange(false);
                }}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg',
                  'hover:bg-accent/50 transition-colors'
                )}
              >
                <CachedImage
                  src={char.iconUrl}
                  alt={char.name}
                  width={48}
                  height={48}
                  className="w-10 h-10 rounded-lg"
                />
                <span className="text-[10px] text-center line-clamp-1 max-w-[60px]">
                  {char.name}
                </span>
              </button>
            ))}
          </div>
          {filteredCharacters.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No characters found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const RoutinePlanner: React.FC = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  const trackedCharacters = useTrackedCharacters();
  const teams = useTrackedTeams();
  const characterMap = useCharacterMap();
  const { removeCharacter, addCharacter } = useTrackerStore();

  // Calculate total unique weapons for summary stats
  const totalWeapons = useMemo(() => {
    const weaponNames = new Set<string>();
    trackedCharacters.forEach((char) => {
      char.pairedWeapons?.forEach((weaponName) => {
        weaponNames.add(weaponName);
      });
    });
    return weaponNames.size;
  }, [trackedCharacters]);

  const handleAddTeamToTracker = (teamId: string, reason: TrackingReason) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    team.characters.forEach((charName) => {
      if (!trackedCharacters.some((c) => c.name === charName)) {
        addCharacter(charName, reason, teamId);
      }
    });
  };

  const hasTrackedCharacters = trackedCharacters.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Routine Planner</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Plan your character builds and track their farming routines
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Quick Add
            {showQuickAdd ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Character
          </Button>
        </div>
      </div>

      {/* Quick Add Section */}
      {showQuickAdd && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Quick Add from Game Content
            </h2>
          </div>
          <QuickAddSection />
        </div>
      )}

      {/* Summary Stats */}
      {hasTrackedCharacters && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Characters:</span>
            <span className="font-semibold">{trackedCharacters.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Weapons:</span>
            <span className="font-semibold">{totalWeapons}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Teams:</span>
            <span className="font-semibold">{teams.length}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasTrackedCharacters && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No characters tracked yet. Add characters to plan your routine.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Character
              </Button>
              <Button
                variant="outline"
                onClick={() => setTeamDialogOpen(true)}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Create Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Section */}
      {teams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Your Teams</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTeamDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={() => {}}
                onAddToTracker={handleAddTeamToTracker}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tracked Characters Grid */}
      {hasTrackedCharacters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Tracked Builds</CardTitle>
            <CardDescription>
              Select weapons for each character to see their farming schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trackedCharacters.map((tracked) => {
                const char = characterMap[tracked.name];
                if (!char) return null;

                return (
                  <CharacterWeaponCard
                    key={tracked.name}
                    character={char}
                    trackedData={tracked}
                    onRemove={() => removeCharacter(tracked.name)}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routine Table - only show if characters are tracked */}
      {hasTrackedCharacters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Farming Schedule</CardTitle>
            <CardDescription>
              Plan your weekly farming routine with tracking status, team
              context, and advanced filtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlannerRoutineTable />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddTrackingDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <TeamCreationDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
      />
    </div>
  );
};

export default RoutinePlanner;
