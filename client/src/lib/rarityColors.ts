/**
 * Utility functions for rarity-themed color styling
 */

/**
 * Get the Tailwind color class for a given rarity
 */
export const getRarityColor = (rarity: number): string => {
  const colorMap: Record<number, string> = {
    5: 'amber-500',
    4: 'violet-500',
    3: 'blue-500',
    2: 'green-500',
    1: 'gray-400',
  };
  return colorMap[rarity] || 'gray-400';
};

/**
 * Get border class for weapon cards based on rarity
 */
export const getRarityBorderClass = (rarity: number): string => {
  const borderMap: Record<number, string> = {
    5: 'border-4 border-amber-500/60 shadow-lg shadow-amber-500/20',
    4: 'border-4 border-violet-500/60 shadow-lg shadow-violet-500/20',
    3: 'border-2 border-blue-500/50 shadow-md shadow-blue-500/15',
    2: 'border-2 border-green-500/50 shadow-md shadow-green-500/15',
    1: 'border border-gray-400/40 shadow-sm',
  };
  return borderMap[rarity] || borderMap[1];
};

/**
 * Get glass-morphism background class for weapon cards
 */
export const getRarityGlassClass = (rarity: number): string => {
  const glassMap: Record<number, string> = {
    5: 'bg-gradient-to-br from-amber-500/[0.08] via-yellow-500/[0.03] to-transparent backdrop-blur-md',
    4: 'bg-gradient-to-br from-violet-500/[0.08] via-purple-500/[0.03] to-transparent backdrop-blur-md',
    3: 'bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent backdrop-blur-sm',
    2: 'bg-gradient-to-br from-green-500/[0.05] via-transparent to-transparent backdrop-blur-sm',
    1: 'bg-gradient-to-br from-gray-400/[0.03] via-transparent to-transparent',
  };
  return glassMap[rarity] || glassMap[1];
};

/**
 * Get CSS module animation class name for rarity
 */
export const getRarityAnimationClass = (rarity: number): string => {
  const animationMap: Record<number, string> = {
    5: 'legendary',
    4: 'epic',
    3: 'rare',
    2: 'uncommon',
    1: 'common',
  };
  return animationMap[rarity] || 'common';
};

/**
 * Get hover glow class name for CSS modules
 */
export const getRarityGlowClass = (rarity: number): string => {
  const glowMap: Record<number, string> = {
    5: 'legendaryGlow',
    4: 'epicGlow',
    3: 'rareGlow',
    2: 'uncommonGlow',
    1: 'commonGlow',
  };
  return glowMap[rarity] || 'commonGlow';
};

/**
 * Get text color class for stars based on rarity
 */
export const getRarityStarColor = (rarity: number): string => {
  const colorMap: Record<number, string> = {
    5: 'text-amber-400',
    4: 'text-violet-400',
    3: 'text-blue-400',
    2: 'text-green-400',
    1: 'text-gray-400',
  };
  return colorMap[rarity] || 'text-gray-400';
};
