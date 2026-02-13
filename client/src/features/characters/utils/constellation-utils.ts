export function getElementClasses(element?: string) {
  const elementLower = element?.toLowerCase() ?? '';
  const elementClassMap: Record<
    string,
    {
      border: string;
      hoverBorder: string;
      levelGradient: string;
      accent: string;
    }
  > = {
    anemo: {
      border: 'border-anemo-500/30',
      hoverBorder: 'hover:border-anemo-400/50',
      levelGradient: 'from-anemo-500 to-anemo-700',
      accent: 'text-anemo-400',
    },
    pyro: {
      border: 'border-pyro-500/30',
      hoverBorder: 'hover:border-pyro-400/50',
      levelGradient: 'from-pyro-500 to-pyro-700',
      accent: 'text-pyro-400',
    },
    hydro: {
      border: 'border-hydro-500/30',
      hoverBorder: 'hover:border-hydro-400/50',
      levelGradient: 'from-hydro-500 to-hydro-700',
      accent: 'text-hydro-400',
    },
    electro: {
      border: 'border-electro-500/30',
      hoverBorder: 'hover:border-electro-400/50',
      levelGradient: 'from-electro-500 to-electro-700',
      accent: 'text-electro-400',
    },
    cryo: {
      border: 'border-cryo-500/30',
      hoverBorder: 'hover:border-cryo-400/50',
      levelGradient: 'from-cryo-500 to-cryo-700',
      accent: 'text-cryo-400',
    },
    geo: {
      border: 'border-geo-500/30',
      hoverBorder: 'hover:border-geo-400/50',
      levelGradient: 'from-geo-500 to-geo-700',
      accent: 'text-geo-400',
    },
    dendro: {
      border: 'border-dendro-500/30',
      hoverBorder: 'hover:border-dendro-400/50',
      levelGradient: 'from-dendro-500 to-dendro-700',
      accent: 'text-dendro-400',
    },
  };

  return (
    elementClassMap[elementLower] || {
      border: 'border-border/40',
      hoverBorder: 'hover:border-border/60',
      levelGradient: 'from-celestial-600 to-celestial-800',
      accent: 'text-celestial-400',
    }
  );
}

export const getConstellationStyles = (level: number) => {
  const talentUpgradeStyle = {
    isTalentUpgrade: true,
  };

  const styles = [
    { isTalentUpgrade: false }, // C1
    { isTalentUpgrade: false }, // C2
    talentUpgradeStyle, // C3
    { isTalentUpgrade: false }, // C4
    talentUpgradeStyle, // C5
    { isTalentUpgrade: false }, // C6
  ];

  return styles[level - 1] || styles[0];
};
