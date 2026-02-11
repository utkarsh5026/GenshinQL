import { ArrowRight } from 'lucide-react';
import React, { useEffect } from 'react';

import { CachedImage } from '@/features/cache';

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
  buildData?: CharacterBuild;
}

export const BuildsSummary: React.FC<BuildsSummaryProps> = ({
  characterName,
  elementColor,
  onNavigate,
  buildData,
}) => {
  const artifactsData = useArtifactLinks();
  const fetchArtifactLinks = useFetchArtifactLinks();

  useEffect(() => {
    fetchArtifactLinks();
  }, [characterName, fetchArtifactLinks]);

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
