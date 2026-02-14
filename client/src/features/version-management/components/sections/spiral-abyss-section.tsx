import { Swords } from 'lucide-react';

import { useSpiralAbyssData } from '../../stores';
import AbyssPhaseCard from '../cards/abyss-phase-card';
import SectionContainer from '../section-container';

export default function SpiralAbyssSection() {
  const abyss = useSpiralAbyssData();

  if (!abyss || abyss.phases.length === 0) return null;

  return (
    <SectionContainer id="abyss" title="Spiral Abyss" icon={Swords}>
      <div className="grid grid-cols-1 gap-4  md:gap-6">
        {abyss.phases.map((phase) => (
          <AbyssPhaseCard key={phase.phase} phase={phase} />
        ))}
      </div>
    </SectionContainer>
  );
}
