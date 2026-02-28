/* Export all types from team-builder feature */

import type { WeaponSummary } from '@/features/weapons';
import type { Character } from '@/types';

export type CharacterRole =
  | 'DPS'
  | 'Sub DPS'
  | 'Support'
  | 'Healer'
  | 'Buffer'
  | 'Shielder'
  | 'Driver'
  | 'Enabler';

export type ArtifactConfig =
  | { mode: '4pc'; set: string; setIconUrl?: string }
  | {
      mode: '2+2pc';
      setA: string;
      setAIconUrl?: string;
      setB: string;
      setBIconUrl?: string;
    };

export interface TeamCharacterSlot {
  /** Stable UUID for Framer Motion Reorder key — persisted with the slot */
  id: string;
  character: Character | null;
  weapon: WeaponSummary | null;
  /** Weapon refinement rank: 1–5 */
  weaponRefinement: number;
  artifacts: ArtifactConfig | null;
  roles: CharacterRole[];
  /** Constellation level: 0–6 */
  constellation: number;
  /** Character level: 1–90 */
  level: number;
  /** Free-text note for rotation/role context */
  notes: string;
  /** Artifact main stat selections for Sands, Goblet, Circlet — multi-select arrays */
  mainStats: { sands: string[]; goblet: string[]; circlet: string[] };
  /** Selected artifact substats */
  substats: string[];
}

export interface Team {
  id: string;
  name: string;
  slots: [
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
  ];
  rotation: string;
  createdAt: number;
  updatedAt: number;
}

export const createEmptySlot = (): TeamCharacterSlot => ({
  id: crypto.randomUUID(),
  character: null,
  weapon: null,
  weaponRefinement: 1,
  artifacts: null,
  roles: [],
  constellation: 0,
  level: 90,
  notes: '',
  mainStats: { sands: [], goblet: [], circlet: [] },
  substats: [],
});

export const createEmptyTeam = (id: string): Team => ({
  id,
  name: 'My Team',
  slots: [
    createEmptySlot(),
    createEmptySlot(),
    createEmptySlot(),
    createEmptySlot(),
  ],
  rotation: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export type RotationAbility = 'E' | 'Q' | 'NA' | 'CA';

export type TalentIconEntry = { name: string; iconUrl: string };

/** Indexed as [Normal Attack, Elemental Skill, Elemental Burst] */
export type CharTalentsMap = Record<
  string,
  [TalentIconEntry, TalentIconEntry, TalentIconEntry]
>;

export interface RotationSegment {
  /** Stable UI-only identifier for Framer Motion Reorder — never serialized */
  id: string;
  characterName: string;
  characterIconUrl: string;
  /** Ordered sequence of abilities for this character's turn, e.g. ['E','CA','Q'] */
  abilities: RotationAbility[];
  note: string;
}
