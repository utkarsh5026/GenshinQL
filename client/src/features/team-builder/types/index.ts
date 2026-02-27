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
  character: Character | null;
  weapon: WeaponSummary | null;
  artifacts: ArtifactConfig | null;
  roles: CharacterRole[];
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
  character: null,
  weapon: null,
  artifacts: null,
  roles: [],
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

export interface RotationStep {
  characterName: string;
  characterIconUrl: string;
  ability: RotationAbility;
  note: string;
}
