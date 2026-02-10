import type { WeaponMaterialSchedule } from '../stores/useWeaponMaterialStore';
import { useCalendar } from './useCalendar';

export const useWeaponCalendar = (
  nDays: number,
  schedule: WeaponMaterialSchedule
) => {
  return useCalendar(nDays, schedule.materials);
};
