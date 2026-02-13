import { Sword } from 'lucide-react';

import { useNewWeapons } from '../../stores';
import WeaponCard from '../cards/weapon-card';
import SectionContainer from '../section-container';

export default function NewWeaponsSection() {
  const weapons = useNewWeapons();

  if (weapons.length === 0) return null;

  return (
    <SectionContainer id="weapons" title="New Weapons" icon={Sword}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {weapons.map((weapon) => (
          <WeaponCard key={weapon.name} weapon={weapon} />
        ))}
      </div>
    </SectionContainer>
  );
}
