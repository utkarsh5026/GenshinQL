import React, { useEffect, useState } from 'react';

import { fetchCharacterBuild } from '@/services/dataService';

import { useArtifactLinks, useFetchArtifactLinks } from '../../../stores';
import { CharacterBuild, CharacterDetailed } from '../../../types';
import { ArtifactSetsDisplay } from './artifact-sets-display';
import { ConstellationInfo } from './constellation-info';
import { StatsDisplay } from './stats-display';
import { TeamsDisplay } from './teams-display';
import { WeaponsDisplay } from './weapons-display';

interface BuildsDetailedProps {
  character: CharacterDetailed;
  elementColor: string;
}

export const BuildsDetailed: React.FC<BuildsDetailedProps> = ({
  character,
  elementColor,
}) => {
  const [buildData, setBuildData] = useState<CharacterBuild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const artifactsData = useArtifactLinks();
  const fetchArtifactLinks = useFetchArtifactLinks();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [build] = await Promise.all([
          fetchCharacterBuild(character.name),
          fetchArtifactLinks(),
        ]);

        setBuildData(build);
      } catch (err) {
        console.error('Failed to load build data:', err);
        setError('Failed to load build data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [character.name, fetchArtifactLinks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-midnight-800/40 rounded-xl animate-pulse" />
        <div className="h-64 bg-midnight-800/40 rounded-xl animate-pulse" />
        <div className="h-96 bg-midnight-800/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: `${elementColor}20`,
            color: elementColor,
            border: `1px solid ${elementColor}40`,
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!buildData) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Build information coming soon for {character.name}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artifacts Section */}
      <section>
        <SectionHeader title="Artifacts" elementColor={elementColor} />
        <ArtifactSetsDisplay
          artifacts={buildData.artifacts}
          artifactsData={artifactsData}
          elementColor={elementColor}
        />
      </section>

      {/* Weapons Section */}
      {(buildData.weapons.fiveStar.length > 0 ||
        buildData.weapons.fourStar.length > 0) && (
        <section>
          <SectionHeader title="Weapons" elementColor={elementColor} />
          <WeaponsDisplay
            weapons={buildData.weapons}
            elementColor={elementColor}
          />
        </section>
      )}

      {/* Main Stats & Substats Section */}
      <section>
        <SectionHeader title="Stat Priority" elementColor={elementColor} />
        <StatsDisplay
          mainStats={buildData.mainStats}
          substats={buildData.substats}
          elementColor={elementColor}
        />
      </section>

      {/* Constellations Section */}
      {buildData.constellations && (
        <section>
          <SectionHeader title="Constellations" elementColor={elementColor} />
          <ConstellationInfo
            constellations={buildData.constellations}
            elementColor={elementColor}
          />
        </section>
      )}

      {/* Team Compositions Section */}
      {buildData.teams.length > 0 && (
        <section>
          <SectionHeader
            title="Team Compositions"
            elementColor={elementColor}
          />
          <TeamsDisplay teams={buildData.teams} elementColor={elementColor} />
        </section>
      )}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  elementColor: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  elementColor,
}) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-starlight-300">
      {title}
    </h3>
    <div
      className="flex-1 h-px"
      style={{
        background: elementColor
          ? `linear-gradient(to right, ${elementColor}40, transparent)`
          : 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)',
      }}
    />
  </div>
);
