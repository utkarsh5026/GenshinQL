/* Export all public APIs from calendar feature */
export * from './components';
export * from './constants';
export * from './services';
export * from './types';

/* Hooks - export all */
export { useCalendar, useWeaponCalendar } from './hooks';
/* Note: useTalentCalendar hook (from hooks/) takes (nDays, talent) params.
   Import directly from '@/features/calendar/hooks' if needed. */

/* Stores - export all */
export type { WeaponMaterialSchedule } from './stores';
export {
  useTalentBooksError,
  useTalentBooksLoading,
  useTalentBooksStore,
  useTalentCalendar,
  useTalentCharMap,
  useWeaponMapFromMaterials,
  useWeaponMaterialError,
  useWeaponMaterialLoading,
  useWeaponMaterialSchedule,
  useWeaponMaterialStore,
} from './stores';
