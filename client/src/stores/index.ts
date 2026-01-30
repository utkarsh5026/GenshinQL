export {
  useCharactersStore,
  useCharacters,
  useCharacterMap,
  useCharactersLoading,
  useCharactersError,
} from './useCharactersStore';

export {
  useWeaponsStore,
  useWeapons,
  useWeaponMap,
  useWeaponTypeMap,
  useWeaponsLoading,
  useWeaponsError,
} from './useWeaponsStore';

export {
  useTalentBooksStore,
  useTalentCalendar,
  useTalentCharMap,
  useTalentBooksLoading,
  useTalentBooksError,
} from './useTalentBooksStore';
export type { TalentBook } from './useTalentBooksStore';

export {
  useWeaponMaterialStore,
  useWeaponMaterialSchedule,
  useWeaponMapFromMaterials,
  useWeaponMaterialLoading,
  useWeaponMaterialError,
} from './useWeaponMaterialStore';
export type { WeaponMaterial } from './useWeaponMaterialStore';

export {
  useGenshinGuesserStore,
  useGenshinGuesserGuessedChars,
  useGenshinGuesserCurrentChar,
  useGenshinGuesserGameOver,
  useGenshinGuesserGameWon,
  useGenshinGuesserStreak,
} from './useGenshinGuesserStore';

// Primitives Store
export {
  usePrimitivesStore,
  usePrimitives,
  useElements,
  useRegions,
  useWeaponTypes,
  usePrimitivesLoading,
  usePrimitivesError,
} from './usePrimitivesStore';

// Re-export common types for convenience
export type { Character, Weapon, TalentBookCalendar, WeaponMaterialSchedule, Primitives, PrimitiveItem } from '@/types';
