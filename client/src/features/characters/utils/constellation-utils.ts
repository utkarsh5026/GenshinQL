import { ELEMENT_COLORS } from '@/lib/game-colors';

export function getElementClasses(element?: string) {
  const entry = element
    ? ELEMENT_COLORS[element.toLowerCase() as keyof typeof ELEMENT_COLORS]
    : undefined;

  if (!entry) {
    return {
      border: 'border-border/40',
      hoverBorder: 'hover:border-border/60',
      levelGradient: 'from-celestial-600 to-celestial-800',
      accent: 'text-celestial-400',
    };
  }

  return {
    border: entry.borderSoft,
    hoverBorder: entry.hoverBorder,
    levelGradient: entry.levelGradient,
    accent: entry.textAccent,
  };
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
