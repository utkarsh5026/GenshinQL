import React from 'react';

import { Heading } from '@/components/ui/text';
import { ArtifactLink, CharacterBuild } from '@/types';

import { ArtifactSetCard } from './artifact-set-card';

interface ArtifactSetsDisplayProps {
  artifacts: CharacterBuild['artifacts'];
  artifactsData: readonly ArtifactLink[];
  elementColor: string;
}

export const ArtifactSetsDisplay: React.FC<ArtifactSetsDisplayProps> = ({
  artifacts,
  artifactsData,
  elementColor,
}) => {
  return (
    <div className="space-y-6">
      {/* Recommended Section */}
      <div>
        <Heading
          level={4}
          size="sm"
          weight="semibold"
          uppercase
          className="tracking-wider mb-4"
          style={{ color: elementColor }}
        >
          Recommended
        </Heading>
        <ArtifactSetCard
          artifactBuild={artifacts.recommended}
          artifactsData={artifactsData}
          elementColor={elementColor}
          isRecommended={true}
        />
      </div>

      {/* Alternatives Section */}
      {artifacts.alternatives.length > 0 && (
        <div>
          <Heading
            level={4}
            size="sm"
            weight="semibold"
            uppercase
            className="tracking-wider mb-4"
            style={{ color: elementColor }}
          >
            Alternatives
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artifacts.alternatives.map((alt, index) => (
              <ArtifactSetCard
                key={index}
                artifactBuild={alt}
                artifactsData={artifactsData}
                elementColor={elementColor}
                isRecommended={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
