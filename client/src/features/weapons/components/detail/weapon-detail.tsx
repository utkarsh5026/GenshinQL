import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { ItemNavigation } from '@/components/utils';
import { useAddRecent } from '@/features/command-palette/stores/useRecentsStore';
import { fetchWeaponProfile } from '@/features/weapons/services';
import { useWeapons } from '@/features/weapons/stores/useWeaponsStore';
import { getRarityHexColor } from '@/features/weapons/utils/color-map';
import type { WeaponDetailedType } from '@/types';

import WeaponDescription from './weapon-description';

const WeaponDetail = () => {
  const { weaponName } = useParams<{ weaponName: string }>();
  const weapons = useWeapons();
  const [weapon, setWeapon] = useState<WeaponDetailedType | null>(null);
  const [loading, setLoading] = useState(!!weaponName);
  const [error, setError] = useState(!weaponName);
  const addRecent = useAddRecent();

  useEffect(() => {
    if (!weaponName) return;

    const loadWeapon = async () => {
      setLoading(true);
      setError(false);

      const fileName = weaponName.split(' ').join('_');
      const weaponData = await fetchWeaponProfile(fileName);

      if (weaponData) {
        setWeapon(weaponData);
        const matchingWeapon = weapons.find((w) => w.name === weaponData.name);
        addRecent({
          type: 'weapon',
          ...weaponData,
          weaponType: matchingWeapon?.weaponType ?? '',
        });
      } else {
        setError(true);
      }
      setLoading(false);
    };

    loadWeapon();
  }, [weaponName, addRecent, weapons]);

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
