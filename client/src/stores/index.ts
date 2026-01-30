export {
  useCharacterMap,
  useCharacters,
  useCharactersError,
  useCharactersLoading,
  useCharactersStore,
} from './useCharactersStore';
export {
  useGenshinGuesserCurrentChar,
  useGenshinGuesserGameOver,
  useGenshinGuesserGameWon,
  useGenshinGuesserGuessedChars,
  useGenshinGuesserStore,
  useGenshinGuesserStreak,
} from './useGenshinGuesserStore';
export type { TalentBook } from './useTalentBooksStore';
export {
  useTalentBooksError,
  useTalentBooksLoading,
  useTalentBooksStore,
  useTalentCalendar,
  useTalentCharMap,
} from './useTalentBooksStore';
export type { WeaponMaterial } from './useWeaponMaterialStore';
export {
  useWeaponMapFromMaterials,
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
  useWeaponMaterialStore,
} from './useWeaponMaterialStore';
export {
  useWeaponMap,
  useWeapons,
  useWeaponsError,
  useWeaponsLoading,
  useWeaponsStore,
  useWeaponTypeMap,
} from './useWeaponsStore';

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
export type {
  Character,
  PrimitiveItem,
  Primitives,
  TalentBookCalendar,
  Weapon,
  WeaponMaterialSchedule,
} from '@/types';
