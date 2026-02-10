import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { CachedImage } from '@/features/cache';
import { fetchCharacterBuild } from '@/services/dataService';

import { useArtifactLinks, useFetchArtifactLinks } from '../../stores';
import type {
  ArtifactLink,
  CharacterBuild,
  CharacterMenuItem,
} from '../../types';
import {
  detectArtifactSetConfiguration,
  getArtifactIconUrl,
} from '../../utils/artifact-utils';

interface BuildsSummaryProps {
  characterName: string;
  elementColor: string;
  onNavigate: (menuItem: CharacterMenuItem) => void;
}

export const BuildsSummary: React.FC<BuildsSummaryProps> = ({
  characterName,
  elementColor,
  onNavigate,
}) => {
  const [buildData, setBuildData] = useState<CharacterBuild | null>(null);
  const [loading, setLoading] = useState(true);

  // Use artifact store
  const artifactsData = useArtifactLinks();
  const fetchArtifactLinks = useFetchArtifactLinks();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [build] = await Promise.all([
          fetchCharacterBuild(characterName),
          fetchArtifactLinks(),
        ]);

        setBuildData(build);
      } catch (err) {
        console.error('Failed to load build data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [characterName, fetchArtifactLinks]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-midnight-800/40 animate-pulse h-24" />
    );
  }

  if (!buildData || !buildData.artifacts.recommended) {
    return null;
  }

  const recommended = buildData.artifacts.recommended;
  const config = detectArtifactSetConfiguration(recommended.sets);

  return (
    <div
      className="group relative p-4 rounded-xl border transition-all duration-300"
      style={{
        borderColor: `${elementColor}40`,
        boxShadow: `0 4px 20px ${elementColor}15`,
        background: `linear-gradient(135deg, ${elementColor}08 0%, transparent 100%)`,
      }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Artifact Icons */}
        <div className="flex items-center gap-3">
          {config.type === '4pc' && (
            <div className="flex flex-col items-center gap-1.5">
              <ArtifactIcon
                setName={config.sets[0].name}
                artifactsData={artifactsData}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: elementColor }}
              >
                4pc
              </span>
            </div>
          )}

          {config.type === '2pc+2pc' && (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <ArtifactIcon
                  setName={config.sets[0].name}
                  artifactsData={artifactsData}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: elementColor }}
                >
                  2pc
                </span>
              </div>
              <div className="text-lg font-bold text-muted-foreground">+</div>
              <div className="flex flex-col items-center gap-1.5">
                <ArtifactIcon
                  setName={config.sets[1].name}
                  artifactsData={artifactsData}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: elementColor }}
                >
                  2pc
                </span>
              </div>
            </>
          )}

          {config.type === 'mixed' && (
            <div className="flex items-center gap-2">
              {config.sets.map((set, index) => (
                <React.Fragment key={set.name}>
                  {index > 0 && (
                    <div className="text-sm font-bold text-muted-foreground">
                      +
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <ArtifactIcon
                      setName={set.name}
                      artifactsData={artifactsData}
                    />
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: elementColor }}
                    >
                      {set.pieces}pc
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Artifact Info */}
        <div className="flex-1">
          <div className="font-medium text-sm text-starlight-200">
            {config.sets.map((set) => set.name).join(' + ')}
          </div>
          {recommended.notes && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {recommended.notes}
            </p>
          )}
        </div>

        {/* View Full Builds Button */}
        <button
          onClick={() => onNavigate('Builds')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:gap-3 whitespace-nowrap"
          style={{
            backgroundColor: `${elementColor}20`,
            color: elementColor,
            border: `1px solid ${elementColor}40`,
          }}
        >
          View Full Builds
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ArtifactIconProps {
  setName: string;
  artifactsData: readonly ArtifactLink[];
}

const ArtifactIcon: React.FC<ArtifactIconProps> = ({
  setName,
  artifactsData,
}) => {
  const iconUrl = getArtifactIconUrl(setName, artifactsData);

  if (!iconUrl) {
    return (
      <div className="w-12 h-12 rounded-lg bg-midnight-700 flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-midnight-600">
        {setName.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <CachedImage
      src={iconUrl}
      alt={setName}
      lazy={true}
      rootMargin="200px"
      showSkeleton={true}
      skeletonShape="rounded"
      skeletonSize="sm"
      className="w-12 h-12 rounded-lg object-cover border border-midnight-600/50"
    />
  );
};
