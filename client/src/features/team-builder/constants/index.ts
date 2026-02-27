/* Export all constants from team-builder feature */
import type { CharacterRole } from '../types';

export const ALL_ROLES: CharacterRole[] = [
  'DPS',
  'Sub DPS',
  'Support',
  'Healer',
  'Buffer',
  'Shielder',
  'Driver',
  'Enabler',
];

export const ROLE_COLORS: Record<CharacterRole, string> = {
  DPS: 'oklch(55% 0.22 25)',
  'Sub DPS': 'oklch(60% 0.18 40)',
  Support: 'oklch(58% 0.18 240)',
  Healer: 'oklch(58% 0.20 145)',
  Buffer: 'oklch(58% 0.20 300)',
  Shielder: 'oklch(55% 0.16 210)',
  Driver: 'oklch(60% 0.22 60)',
  Enabler: 'oklch(62% 0.18 180)',
};
