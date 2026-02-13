import React, { useState } from 'react';

import { CachedImage } from '@/features/cache';
import { ArtifactBuild, ArtifactLink } from '@/types';

import {
  detectArtifactSetConfiguration,
  getArtifactIconUrl,
} from '../../../utils/artifact-utils';

interface ArtifactSetCardProps {
  artifactBuild: ArtifactBuild;
  artifactsData: readonly ArtifactLink[];
  elementColor: string;
  isRecommended?: boolean;
}

export const ArtifactSetCard: React.FC<ArtifactSetCardProps> = ({
  artifactBuild,
  artifactsData,
  elementColor,
  isRecommended = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = detectArtifactSetConfiguration(artifactBuild.sets);

  return (
    <div
      className="group relative p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: isRecommended ? `${elementColor}60` : `${elementColor}30`,
        boxShadow: isHovered
          ? `0 8px 24px ${elementColor}25`
          : `0 4px 12px ${elementColor}15`,
        background: isRecommended
          ? `linear-gradient(135deg, ${elementColor}08 0%, transparent 100%)`
          : 'rgba(0, 0, 0, 0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div
          className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `${elementColor}40`,
            color: `${elementColor}`,
            border: `1px solid ${elementColor}60`,
            boxShadow: `0 2px 8px ${elementColor}30`,
          }}
        >
          Recommended
        </div>
      )}

      {/* Artifact icons and labels */}
      <div className="flex items-center gap-4">
        {config.type === '4pc' && (
          <div className="flex flex-col items-center gap-2">
            <ArtifactIcon
              setName={config.sets[0].name}
              artifactsData={artifactsData}
              size="lg"
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: elementColor }}
            >
              4pc
            </span>
          </div>
        )}

        {config.type === '2pc+2pc' && (
          <>
            <div className="flex flex-col items-center gap-2">
              <ArtifactIcon
                setName={config.sets[0].name}
                artifactsData={artifactsData}
                size="lg"
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: elementColor }}
              >
                2pc
              </span>
            </div>
            <div className="text-xl font-bold text-muted-foreground">+</div>
            <div className="flex flex-col items-center gap-2">
              <ArtifactIcon
                setName={config.sets[1].name}
                artifactsData={artifactsData}
                size="lg"
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: elementColor }}
              >
                2pc
              </span>
            </div>
          </>
        )}

        {config.type === 'mixed' && (
          <div className="flex items-center gap-3 overflow-x-auto">
            {config.sets.map((set, index) => (
              <React.Fragment key={set.name}>
                {index > 0 && (
                  <div className="text-lg font-bold text-muted-foreground">
                    +
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <ArtifactIcon
                    setName={set.name}
                    artifactsData={artifactsData}
                    size="md"
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: elementColor }}
                  >
                    {set.pieces}pc
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Artifact set names */}
        <div className="flex-1">
          <div className="font-medium text-sm text-starlight-200">
            {config.sets.map((set) => set.name).join(' + ')}
          </div>
          {artifactBuild.notes && (
            <p className="mt-2 text-xs text-muted-foreground">
              {artifactBuild.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ArtifactIconProps {
  setName: string;
  artifactsData: readonly ArtifactLink[];
  size?: 'sm' | 'md' | 'lg';
}

const ArtifactIcon: React.FC<ArtifactIconProps> = ({
  setName,
  artifactsData,
  size = 'md',
}) => {
  const iconUrl = getArtifactIconUrl(setName, artifactsData);
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  if (!iconUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-midnight-700 flex items-center justify-center text-xs font-bold text-muted-foreground border border-midnight-600`}
      >
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
      skeletonSize={size}
      className={`${sizeClasses[size]} rounded-lg object-cover border border-midnight-600/50`}
    />
  );
};
