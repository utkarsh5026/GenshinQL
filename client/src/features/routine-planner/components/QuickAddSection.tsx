import { Calendar } from 'lucide-react';
import React, { useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGameContentStore, useSpiralAbyss, useTrackerStore } from '@/stores';
import type { RecommendedTeam, TrackingReason } from '@/types';

import { QuickAddCard } from './QuickAddCard';

export const QuickAddSection: React.FC = () => {
  const spiralAbyss = useSpiralAbyss();
  const { fetchSpiralAbyss, loading, error } = useGameContentStore();
  const { addCharacter, createTeam } = useTrackerStore();

  useEffect(() => {
    fetchSpiralAbyss();
  }, [fetchSpiralAbyss]);

  const handleAddCharacters = (
    characterNames: string[],
    reason: TrackingReason
  ) => {
    characterNames.forEach((name) => {
      addCharacter(name, reason);
    });
  };

  const handleAddTeam = (team: RecommendedTeam, reason: TrackingReason) => {
    const teamId = createTeam(team.name, team.characters);
    team.characters.forEach((charName) => {
      addCharacter(charName, reason, teamId);
    });
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading game content...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load game content. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Spiral Abyss */}
      {spiralAbyss && (
        <QuickAddCard
          title="Spiral Abyss"
          icon={Calendar}
          characters={spiralAbyss.recommendedCharacters}
          teams={spiralAbyss.recommendedTeams}
          version={spiralAbyss.version}
          onAddCharacters={handleAddCharacters}
          onAddTeam={handleAddTeam}
        />
      )}

      {/* Imaginarium Theater quick add removed - data source no longer includes recommended characters */}
    </div>
  );
};
