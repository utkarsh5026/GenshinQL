/** Describes a single elemental reaction and its partner element. */
export interface ElementalReaction {
  /** Display name of the reaction (e.g., "Vaporize", "Melt") */
  reactionName: string;
  /** The element that reacts with the keyed element */
  partnerElement: string;
}

/**
 * Maps each element to the reactions it can trigger.
 * Keys are capitalized element names matching Character.element.
 */
export const ELEMENTAL_REACTIONS: Record<string, ElementalReaction[]> = {
  Pyro: [
    { reactionName: 'Vaporize', partnerElement: 'Hydro' },
    { reactionName: 'Melt', partnerElement: 'Cryo' },
    { reactionName: 'Overloaded', partnerElement: 'Electro' },
    { reactionName: 'Burning', partnerElement: 'Dendro' },
  ],
  Hydro: [
    { reactionName: 'Vaporize', partnerElement: 'Pyro' },
    { reactionName: 'Freeze', partnerElement: 'Cryo' },
    { reactionName: 'Electro-Charged', partnerElement: 'Electro' },
    { reactionName: 'Bloom', partnerElement: 'Dendro' },
  ],
  Cryo: [
    { reactionName: 'Melt', partnerElement: 'Pyro' },
    { reactionName: 'Freeze', partnerElement: 'Hydro' },
    { reactionName: 'Superconduct', partnerElement: 'Electro' },
  ],
  Electro: [
    { reactionName: 'Overloaded', partnerElement: 'Pyro' },
    { reactionName: 'Electro-Charged', partnerElement: 'Hydro' },
    { reactionName: 'Superconduct', partnerElement: 'Cryo' },
    { reactionName: 'Quicken', partnerElement: 'Dendro' },
  ],
  Dendro: [
    { reactionName: 'Burning', partnerElement: 'Pyro' },
    { reactionName: 'Bloom', partnerElement: 'Hydro' },
    { reactionName: 'Quicken', partnerElement: 'Electro' },
  ],
  Anemo: [
    { reactionName: 'Swirl', partnerElement: 'Pyro' },
    { reactionName: 'Swirl', partnerElement: 'Hydro' },
    { reactionName: 'Swirl', partnerElement: 'Cryo' },
    { reactionName: 'Swirl', partnerElement: 'Electro' },
  ],
  Geo: [
    { reactionName: 'Crystallize', partnerElement: 'Pyro' },
    { reactionName: 'Crystallize', partnerElement: 'Hydro' },
    { reactionName: 'Crystallize', partnerElement: 'Cryo' },
    { reactionName: 'Crystallize', partnerElement: 'Electro' },
  ],
};

/** Describes an elemental resonance triggered by having 2 characters of the same element. */
export interface ElementalResonance {
  /** Display name of the resonance */
  name: string;
  /** Short description of the effect */
  description: string;
}

/**
 * Maps each element to its resonance data.
 * Resonance activates when 2+ characters of the same element are on the team.
 */
export const ELEMENTAL_RESONANCES: Record<string, ElementalResonance> = {
  Pyro: { name: 'Fervent Flames', description: '+25% ATK' },
  Hydro: { name: 'Soothing Water', description: '+25% HP' },
  Electro: {
    name: 'High Voltage',
    description: 'Electro particles on reactions',
  },
  Cryo: { name: 'Shattering Ice', description: '+15% CRIT Rate' },
  Anemo: {
    name: 'Impetuous Winds',
    description: '-15% Stamina, +10% Move SPD',
  },
  Geo: {
    name: 'Enduring Rock',
    description: '+15% Shield STR, +15% DMG when shielded',
  },
  Dendro: { name: 'Sprawling Greenery', description: '+50 EM on reactions' },
};
