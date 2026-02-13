import React, { useEffect } from 'react';

import { useGameContentStore, useImaginarium, useSpiralAbyss } from '@/stores';

import { ImaginariumCard } from './imaginarium-theater';
import { SpiralAbyssCard } from './spiral-abyss';

export const GameModesSection: React.FC = () => {
  const { fetchAll } = useGameContentStore();
  const spiralAbyss = useSpiralAbyss();
  const imaginarium = useImaginarium();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hasContent = spiralAbyss || imaginarium;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SpiralAbyssCard />
      <ImaginariumCard />
    </div>
  );
};

export default GameModesSection;
