import { Map } from 'lucide-react';

import { useNewAreas } from '../../stores';
import AreaCard from '../cards/area-card';
import SectionContainer from '../section-container';

export default function NewAreasSection() {
  const areas = useNewAreas();

  if (areas.length === 0) return null;

  return (
    <SectionContainer id="areas" title="New Areas" icon={Map}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <AreaCard key={area.name} area={area} />
        ))}
      </div>
    </SectionContainer>
  );
}
