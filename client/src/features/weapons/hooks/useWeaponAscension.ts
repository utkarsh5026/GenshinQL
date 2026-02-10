import { useCallback, useMemo, useState } from 'react';

import { AscensionPhase } from '../types';

export const useWeaponAscension = (phases: AscensionPhase[]) => {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [prevPhase, setPrevPhase] = useState(0);

  const calculateStatComparison = useCallback(
    (
      phases: AscensionPhase[],
      currentPhaseIndex: number,
      statType: 'baseAttack' | 'subStat'
    ) => {
      const currentPhase = phases[currentPhaseIndex];
      const firstPhase = phases[0];
      const lastPhase = phases[phases.length - 1];
      const prevPhase =
        currentPhaseIndex > 0 ? phases[currentPhaseIndex - 1] : null;

      const currentMax = currentPhase[statType].max;
      const currentMin = currentPhase[statType].min;
      const firstMax = firstPhase[statType].max;
      const finalMax = lastPhase[statType].max;
      const prevMax = prevPhase ? prevPhase[statType].max : currentMax;

      const fromPreviousPhase =
        prevPhase && prevMax > 0 ? ((currentMax - prevMax) / prevMax) * 100 : 0;

      const fromPhaseZero =
        firstMax > 0 ? ((currentMax - firstMax) / firstMax) * 100 : 0;

      const totalGrowth = finalMax - firstMax;
      const currentGrowth = currentMax - firstMax;
      const progressPercent =
        totalGrowth > 0 ? (currentGrowth / totalGrowth) * 100 : 0;

      return {
        currentMin,
        currentMax,
        fromPreviousPhase: Math.round(fromPreviousPhase * 10) / 10,
        fromPhaseZero: Math.round(fromPhaseZero * 10) / 10,
        progressPercent: Math.round(progressPercent),
      };
    },
    []
  );

  const changePhase = useCallback(
    (value: number[]) => {
      const newPhase = value[0];
      if (newPhase >= 0 && newPhase <= phases.length - 1) {
        setPrevPhase(selectedPhase);
        setSelectedPhase(newPhase);
      }
    },
    [phases.length, selectedPhase]
  );

  const atkComparison = useMemo(
    () => calculateStatComparison(phases, selectedPhase, 'baseAttack'),
    [phases, selectedPhase, calculateStatComparison]
  );

  const substatComparison = useMemo(
    () => calculateStatComparison(phases, selectedPhase, 'subStat'),
    [phases, selectedPhase, calculateStatComparison]
  );

  const phaseComparison = useMemo(() => {
    return phases.map((phase, idx) => {
      const atkStats = calculateStatComparison(phases, idx, 'baseAttack');
      const subStats = calculateStatComparison(phases, idx, 'subStat');
      return {
        ...phase,
        atkStats,
        subStats,
      };
    });
  }, [phases, calculateStatComparison]);

  const handlePhaseChange = useCallback(
    (prev: number, current: number) => {
      if (current >= 0 && current <= phases.length - 1) {
        setPrevPhase(prev);
        setSelectedPhase(current);
      }
    },
    [phases.length]
  );

  return {
    atkComparison,
    substatComparison,
    changePhase,
    selectedPhase,
    prevPhase,
    calculateStatComparison,
    phaseComparison,
    handlePhaseChange,
  };
};
