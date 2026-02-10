export {
  useWeaponMap,
  useWeapons,
  useWeaponsError,
  useWeaponsLoading,
  useWeaponsStore,
  useWeaponTypeMap,
} from '../features/weapons/stores/useWeaponsStore';
export {
  useCharacterMap,
  useCharacters,
  useCharactersError,
  useCharactersLoading,
  useCharactersStore,
  useCharacterTalents,
} from './useCharactersStore';
export {
  useGenshinGuesserCurrentChar,
  useGenshinGuesserGameOver,
  useGenshinGuesserGameWon,
  useGenshinGuesserGuessedChars,
  useGenshinGuesserStore,
  useGenshinGuesserStreak,
} from './useGenshinGuesserStore';

// Primitives Store
export {
  useElements,
  usePrimitives,
  usePrimitivesError,
  usePrimitivesLoading,
  usePrimitivesStore,
  useRegions,
  useWeaponTypes,
} from './usePrimitivesStore';

// Re-export common types for convenience
export type { Character, PrimitiveItem, Primitives } from '@/types';
