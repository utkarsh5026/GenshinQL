import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { fetchWeaponDetailed } from '@/services/dataService';
import type { WeaponDetailedType } from '@/types';

import WeaponDescription from './weapon-description';

const WeaponDetail = () => {
  const { weaponName } = useParams<{ weaponName: string }>();
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

  return <WeaponDescription weapon={weapon} />;
};

export default WeaponDetail;
