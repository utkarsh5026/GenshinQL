/**
 * Constellation Tag Extraction Utility
 * Extracts tags from constellation descriptions based on keyword patterns.
 */

export interface TagConfig {
  id: string;
  label: string;
  patterns: RegExp[];
  color: string;
  priority: number;
}

const TAG_CONFIGS: TagConfig[] = [
  {
    id: 'dmg',
    label: 'DMG',
    patterns: [/\bDMG\b/i, /\bdamage\b/i, /DMG Bonus/i],
    color: 'pyro',
    priority: 1,
  },
  {
    id: 'crit-rate',
    label: 'CRIT Rate',
    patterns: [/CRIT Rate/i, /Critical Rate/i, /CRIT.*Rate/i],
    color: 'error',
    priority: 2,
  },
  {
    id: 'crit-dmg',
    label: 'CRIT DMG',
    patterns: [/CRIT DMG/i, /Critical Damage/i, /CRIT.*DMG/i],
    color: 'celestial',
    priority: 3,
  },
  {
    id: 'atk',
    label: 'ATK',
    patterns: [/\bATK\b/i, /\battack\b/i],
    color: 'warning',
    priority: 4,
  },
  {
    id: 'elemental-mastery',
    label: 'EM',
    patterns: [/Elemental Mastery/i, /\bEM\b/],
    color: 'geo',
    priority: 5,
  },
  {
    id: 'hp',
    label: 'HP',
    patterns: [/\bHP\b/, /\bMax HP\b/i, /HP restoration/i],
    color: 'dendro',
    priority: 6,
  },
  {
    id: 'def',
    label: 'DEF',
    patterns: [/\bDEF\b/, /\bdefense\b/i],
    color: 'uncommon',
    priority: 7,
  },
  {
    id: 'shield',
    label: 'Shield',
    patterns: [/\bshield/i, /shield strength/i, /shield absorption/i],
    color: 'anemo',
    priority: 8,
  },
  {
    id: 'healing',
    label: 'Healing',
    patterns: [
      /\bheal/i,
      /\bhealing\b/i,
      /\bregenerates?\b.*HP/i,
      /HP.*restore/i,
    ],
    color: 'success',
    priority: 9,
  },
  {
    id: 'resistance',
    label: 'RES',
    patterns: [/\bRES\b/, /resistance/i, /RES is.*decreased/i],
    color: 'cryo',
    priority: 10,
  },
  {
    id: 'energy',
    label: 'Energy',
    patterns: [
      /\benergy\b/i,
      /Energy Recharge/i,
      /regenerat.*Energy/i,
      /restores?.*Energy/i,
      /Elemental Particle/i,
    ],
    color: 'hydro',
    priority: 11,
  },
  {
    id: 'cd-reduction',
    label: 'CD',
    patterns: [/\bCD\b/, /cooldown/i, /CD is.*decreased/i, /CD.*reduced/i],
    color: 'info',
    priority: 12,
  },
  {
    id: 'duration',
    label: 'Duration',
    patterns: [/duration/i, /lasts?\s+.*longer/i, /\bextend/i],
    color: 'starlight',
    priority: 13,
  },
  {
    id: 'charge',
    label: 'Charge',
    patterns: [
      /additional charge/i,
      /max.*charges?/i,
      /extra charge/i,
      /charges? of/i,
    ],
    color: 'electro',
    priority: 14,
  },
  {
    id: 'stamina',
    label: 'Stamina',
    patterns: [/stamina/i, /stamina consumption/i],
    color: 'epic',
    priority: 15,
  },
  {
    id: 'talent-level',
    label: 'Talent Lv.',
    patterns: [/Increases the Level of/i, /Skill Lv\./i],
    color: 'success',
    priority: 16,
  },
  {
    id: 'stack',
    label: 'Stack',
    patterns: [/\bstack/i, /stacks? of/i, /stacking/i, /max stacks/i],
    color: 'legendary',
    priority: 17,
  },
  {
    id: 'elemental-reaction',
    label: 'Reaction',
    patterns: [
      /\breaction/i,
      /Vaporize/i,
      /Melt/i,
      /Overloaded/i,
      /Superconduct/i,
      /Electro-Charged/i,
      /Swirl/i,
      /Bloom/i,
      /Burning/i,
      /Aggravate/i,
      /Spread/i,
      /Hyperbloom/i,
      /Burgeon/i,
      /Frozen/i,
      /Shatter/i,
    ],
    color: 'rare',
    priority: 18,
  },
  {
    id: 'movement',
    label: 'Movement',
    patterns: [/movement speed/i, /\bmovement\b/i, /sprint/i, /gliding/i],
    color: 'midnight',
    priority: 19,
  },
  {
    id: 'aoe',
    label: 'AoE',
    patterns: [/\bAoE\b/i, /area of effect/i, /\bradius\b/i, /\brange\b/i],
    color: 'common',
    priority: 20,
  },
];

const TAG_CONFIG_MAP = new Map<string, TagConfig>(
  TAG_CONFIGS.map((config) => [config.id, config])
);

/**
 * Extract matching tags from a constellation description.
 * Returns an array of tag IDs sorted by priority.
 */
export function extractConstellationTags(description: string): string[] {
  const matchedTags: string[] = [];

  for (const config of TAG_CONFIGS) {
    const hasMatch = config.patterns.some((pattern) =>
      pattern.test(description)
    );
    if (hasMatch) {
      matchedTags.push(config.id);
    }
  }

  return matchedTags.sort((a, b) => {
    const configA = TAG_CONFIG_MAP.get(a);
    const configB = TAG_CONFIG_MAP.get(b);
    return (configA?.priority ?? 99) - (configB?.priority ?? 99);
  });
}

/**
 * Get the full configuration for a tag by ID.
 */
export function getTagConfig(tagId: string): TagConfig | undefined {
  return TAG_CONFIG_MAP.get(tagId);
}

/**
 * Get all tag configurations.
 */
export function getAllTagConfigs(): TagConfig[] {
  return TAG_CONFIGS;
}
