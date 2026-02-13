/**
 * Region-to-Element Theme Mapping
 *
 * Maps Genshin Impact regions to their associated element colors
 * for consistent theming across the application.
 */

export type ElementTheme =
  | 'anemo'
  | 'geo'
  | 'electro'
  | 'dendro'
  | 'hydro'
  | 'pyro'
  | 'cryo'
  | 'midnight';

/**
 * Maps region names to their primary element themes
 */
export const REGION_THEMES: Record<string, ElementTheme> = {
  Mondstadt: 'anemo',
  Liyue: 'geo',
  Inazuma: 'electro',
  Sumeru: 'dendro',
  Fontaine: 'hydro',
  Natlan: 'pyro',
  Snezhnaya: 'cryo',
};

/**
 * Get the element theme for a region
 * @param region - Region name
 * @returns Element theme, defaults to 'midnight' for unknown regions
 */
export function getRegionTheme(region: string): ElementTheme {
  return REGION_THEMES[region] || 'midnight';
}

/**
 * Generate element-themed class names for styling
 */
export function getRegionThemeClasses(region: string) {
  const theme = getRegionTheme(region);

  return {
    // Border styling
    border: `border border-${theme}-500/30`,

    // Background gradients
    cardBg: `bg-gradient-to-br from-${theme}-950/20 via-surface-200/50 to-transparent`,
    headerBg: `bg-gradient-to-r from-${theme}-900/40 via-${theme}-800/20 to-transparent`,
    materialBg: `bg-gradient-to-r from-${theme}-950/30 to-transparent`,

    // Shadow and glow
    shadow: `shadow-lg shadow-${theme}-900/20`,
    glow: `hover:shadow-${theme}-500/30`,

    // Text colors
    textPrimary: `text-${theme}-200`,
    textAccent: `text-${theme}-400`,

    // Badge styling
    badgeBg: `bg-${theme}-950/40 border-${theme}-500/50 text-${theme}-200`,

    // Section borders
    sectionBorder: `border-t-2 border-${theme}-500/40`,

    // Icon colors
    iconColor: `text-${theme}-400 fill-${theme}-400`,
  };
}

/**
 * Get CSS custom property for element color (for dynamic styling)
 */
export function getRegionThemeColor(
  region: string,
  shade: number = 400
): string {
  const theme = getRegionTheme(region);
  return `rgb(var(--color-${theme}-${shade}))`;
}
