import { Flame, Shield, Sparkles, Star, Swords } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';
import { useCharacterMap, useTrackerStore } from '@/stores';
import type { TrackingReason } from '@/types';

const TEAM_ICONS = [
  { id: 'sword', label: 'Sword', Icon: Swords },
  { id: 'shield', label: 'Shield', Icon: Shield },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'flame', label: 'Flame', Icon: Flame },
  { id: 'sparkles', label: 'Sparkles', Icon: Sparkles },
] as const;

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

interface TeamCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamCreationDialog: React.FC<TeamCreationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [teamName, setTeamName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('sword');
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(
    new Set()
  );
  const [trackingReason, setTrackingReason] =
    useState<TrackingReason>('building');
  const [search, setSearch] = useState('');

  const characterMap = useCharacterMap();
  const { createTeam, addCharacter } = useTrackerStore();

  const characters = useMemo(() => Object.values(characterMap), [characterMap]);

  const filteredCharacters = useMemo(() => {
    if (!search) return characters;
    return characters.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [characters, search]);

  const handleToggleCharacter = (name: string) => {
    const newSelected = new Set(selectedCharacters);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedCharacters(newSelected);
  };

  const handleCreateTeam = (addToTracker: boolean) => {
    if (!teamName.trim() || selectedCharacters.size === 0) {
      return;
    }

    const charactersArray = Array.from(selectedCharacters);
    const teamId = createTeam(teamName, charactersArray, selectedIcon);

    if (addToTracker) {
      charactersArray.forEach((charName) => {
        addCharacter(charName, trackingReason, teamId);
      });
    }

    // Reset form
    setTeamName('');
    setSelectedIcon('sword');
    setSelectedCharacters(new Set());
    setTrackingReason('building');
    setSearch('');
    onOpenChange(false);
  };

  const SelectedIcon =
    TEAM_ICONS.find((i) => i.id === selectedIcon)?.Icon || Swords;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a team composition to organize your farming routine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Team Name and Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g., Hyperbloom Core"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Team Icon</Label>
              <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_ICONS.map(({ id, label, Icon }) => (
                    <SelectItem key={id} value={id}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Character Search */}
          <div className="space-y-2">
            <Label>Select Characters</Label>
            <Input
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Character Grid */}
          <div className="border rounded-lg p-4 bg-card/30 min-h-50 max-h-75 overflow-y-auto">
            <div className="grid grid-cols-6 gap-3">
              {filteredCharacters.map((char) => {
                const isSelected = selectedCharacters.has(char.name);
                return (
                  <button
                    key={char.name}
                    onClick={() => handleToggleCharacter(char.name)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                      'hover:bg-accent/50',
                      isSelected && 'bg-primary/20 ring-2 ring-primary'
                    )}
                  >
                    <CachedImage
                      src={char.iconUrl}
                      alt={char.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg"
                    />
                    <span className="text-[10px] text-center line-clamp-2 max-w-full">
                      {char.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredCharacters.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No characters found
              </div>
            )}
          </div>

          {/* Selected Count */}
          <div className="text-sm text-muted-foreground">
            Selected: {selectedCharacters.size} character
            {selectedCharacters.size !== 1 ? 's' : ''}
          </div>

          {/* Tracking Reason (for Add to Tracker action) */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Tracking Reason (when adding to tracker)</Label>
            <div className="flex gap-2">
              {(['building', 'farming', 'wishlist'] as TrackingReason[]).map(
                (reason) => (
                  <Button
                    key={reason}
                    size="sm"
                    variant={trackingReason === reason ? 'default' : 'outline'}
                    onClick={() => setTrackingReason(reason)}
                    className={cn(
                      'flex-1 text-xs',
                      trackingReason === reason && REASON_COLORS[reason]
                    )}
                  >
                    {REASON_LABELS[reason]}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleCreateTeam(false)}
            disabled={!teamName.trim() || selectedCharacters.size === 0}
            className="flex-1"
          >
            <SelectedIcon className="w-4 h-4 mr-2" />
            Create Team Only
          </Button>
          <Button
            onClick={() => handleCreateTeam(true)}
            disabled={!teamName.trim() || selectedCharacters.size === 0}
            className="flex-1"
          >
            <SelectedIcon className="w-4 h-4 mr-2" />
            Create & Add to Tracker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
