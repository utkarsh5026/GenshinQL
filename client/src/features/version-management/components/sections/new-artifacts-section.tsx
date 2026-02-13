import { Gem } from 'lucide-react';

import { useNewArtifacts } from '../../stores';
import ArtifactSetCard from '../cards/artifact-set-card';
import SectionContainer from '../section-container';

export default function NewArtifactsSection() {
  const artifacts = useNewArtifacts();

  if (artifacts.length === 0) return null;

  // Extract shared showcase image from first artifact
  const showcaseImage = artifacts[0]?.showcaseImage;

  return (
    <SectionContainer id="artifacts" title="New Artifacts" icon={Gem}>
      <div className="space-y-6">
        {/* Shared Showcase Banner */}
        {showcaseImage && (
          <div className="group/banner relative overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40">
            <div className="relative overflow-hidden">
              <img
                src={showcaseImage}
                alt="New Artifact Sets"
                className="h-auto w-full object-cover transition-transform duration-500 group-hover/banner:scale-105"
                loading="lazy"
              />
              {/* Gradient Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-midnight-950/80 via-midnight-950/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Artifact Set Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {artifacts.map((artifact) => (
            <ArtifactSetCard key={artifact.name} artifact={artifact} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
