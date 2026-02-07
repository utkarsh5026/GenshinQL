import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { ItemNavigation } from '@/components/utils';
import { getRarityHexColor } from '@/components/weapons/utils/color-map';
import { fetchWeaponDetailed } from '@/services/dataService';
import { useWeapons } from '@/stores/useWeaponsStore';
import type { WeaponDetailedType } from '@/types';

import WeaponDescription from './weapon-description';

const WeaponDetail = () => {
  const { weaponName } = useParams<{ weaponName: string }>();
  const weapons = useWeapons();
  const [weapon, setWeapon] = useState<WeaponDetailedType | null>(null);
  const [loading, setLoading] = useState(!!weaponName);
  const [error, setError] = useState(!weaponName);

  useEffect(() => {
    if (!weaponName) return;

    const loadWeapon = async () => {
      setLoading(true);
      setError(false);

      // Transform URL param to filename: "Skyward Blade" → "Skyward_Blade"
      const fileName = weaponName.split(' ').join('_');
      const weaponData = await fetchWeaponDetailed(fileName);

      if (weaponData) {
        setWeapon(weaponData);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    loadWeapon();
  }, [weaponName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading weapon...</div>
      </div>
    );
  }

  if (error || !weapon) {
    return <Navigate to="/weapons/grid" replace />;
  }

  const rarityColor = getRarityHexColor(weapon.rarity);

  return (
    <div className="flex flex-col h-full gap-3">
      <ItemNavigation
        items={weapons}
        currentItemName={weapon.name}
        routePrefix="/weapons"
        accentColor={rarityColor}
        labelSingular="weapon"
      />
      <WeaponDescription weapon={weapon} />
    </div>
  );
};

export default WeaponDetail;
