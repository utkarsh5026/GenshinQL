// Character Store
export {
  useCharactersStore,
  useCharacters,
  useCharacterMap,
  useCharactersLoading,
  useCharactersError,
} from './useCharactersStore';

// Weapons Store
export {
  useWeaponsStore,
  useWeapons,
  useWeaponMap,
  useWeaponTypeMap,
  useWeaponsLoading,
  useWeaponsError,
} from './useWeaponsStore';

// Talent Books Store
export {
  useTalentBooksStore,
  useTalentCalendar,
  useTalentCharMap,
  useTalentBooksLoading,
  useTalentBooksError,
} from './useTalentBooksStore';
export type { TalentBook } from './useTalentBooksStore';

// Weapon Material Store
export {
  useWeaponMaterialStore,
  useWeaponMaterialSchedule,
  useWeaponMapFromMaterials,
  useWeaponMaterialLoading,
  useWeaponMaterialError,
} from './useWeaponMaterialStore';
export type { WeaponMaterial } from './useWeaponMaterialStore';

// Genshin Guesser Store
export {
  useGenshinGuesserStore,
  useGenshinGuesserGuessedChars,
  useGenshinGuesserCurrentChar,
  useGenshinGuesserGameOver,
  useGenshinGuesserGameWon,
  useGenshinGuesserStreak,
} from './useGenshinGuesserStore';

// Re-export common types for convenience
export type { Character, Weapon, TalentBookCalendar, WeaponMaterialSchedule } from '@/types';
