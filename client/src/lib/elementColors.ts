/**
 * Utility functions for element-themed color styling
 */

export const getElementColor = (element: string): string => {
  const normalized = element.toLowerCase();

  const colorMap: Record<string, string> = {
    anemo: 'cyan-400',
    pyro: 'red-500',
    hydro: 'blue-500',
    electro: 'purple-500',
    cryo: 'blue-300',
    geo: 'yellow-600',
    dendro: 'green-500',
  };

  return colorMap[normalized] || 'gray-400';
};

export const getElementBorderClass = (element: string): string => {
  const color = getElementColor(element);
  return `border-8 border-${color} shadow-xl shadow-${color}`;
};

export const getElementHoverClass = (element: string): string => {
  const color = getElementColor(element);
  return `hover:bg-gradient-to-b from-${color}/10 to-transparent`;
};

export const getElementGlassClass = (element: string): string => {
  const normalized = element.toLowerCase();

  const glassMap: Record<string, string> = {
    anemo:
      'bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-cyan-400/[0.08]',
    pyro: 'bg-gradient-to-br from-red-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-red-500/[0.08]',
    hydro:
      'bg-gradient-to-br from-blue-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-blue-500/[0.08]',
    electro:
      'bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-purple-500/[0.08]',
    cryo: 'bg-gradient-to-br from-blue-300/[0.02] via-transparent to-transparent backdrop-blur-md border border-blue-300/[0.08]',
    geo: 'bg-gradient-to-br from-yellow-600/[0.02] via-transparent to-transparent backdrop-blur-md border border-yellow-600/[0.08]',
    dendro:
      'bg-gradient-to-br from-green-500/[0.02] via-transparent to-transparent backdrop-blur-md border border-green-500/[0.08]',
  };

  return (
    glassMap[normalized] ||
    'bg-gradient-to-br from-gray-400/[0.02] via-transparent to-transparent backdrop-blur-md border border-gray-400/[0.08]'
  );
};

/**
 * Get element-specific CSS animation class name for character card animations
 * Returns: 'anemo' | 'pyro' | 'hydro' | etc.
 */
export const getElementAnimationClass = (element: string): string => {
  const normalized = element.toLowerCase();
  const animationMap: Record<string, string> = {
    anemo: 'anemo',
    pyro: 'pyro',
    hydro: 'hydro',
    electro: 'electro',
    cryo: 'cryo',
    geo: 'geo',
    dendro: 'dendro',
  };
  return animationMap[normalized] || '';
};

/**
 * Get element-specific hover glow class name
 * Returns: 'anemoGlow' | 'pyroGlow' | etc.
 */
export const getElementGlowClass = (element: string): string => {
  const normalized = element.toLowerCase();
  const glowMap: Record<string, string> = {
    anemo: 'anemoGlow',
    pyro: 'pyroGlow',
    hydro: 'hydroGlow',
    electro: 'electroGlow',
    cryo: 'cryoGlow',
    geo: 'geoGlow',
    dendro: 'dendroGlow',
  };
  return glowMap[normalized] || '';
};
