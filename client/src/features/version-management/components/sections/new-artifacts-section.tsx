import { Gem } from 'lucide-react';

import { useNewArtifacts } from '../../stores';
import ArtifactSetCard from '../cards/artifact-set-card';
import SectionContainer from '../section-container';

export default function NewArtifactsSection() {
  const artifacts = useNewArtifacts();

  if (artifacts.length === 0) return null;

  return (
    <SectionContainer id="artifacts" title="New Artifacts" icon={Gem}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {artifacts.map((artifact) => (
          <ArtifactSetCard key={artifact.name} artifact={artifact} />
        ))}
      </div>
    </SectionContainer>
  );
}
