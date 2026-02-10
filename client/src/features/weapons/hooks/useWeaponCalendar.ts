import { useCalendar } from '@/features/calendar';

import type { WeaponMaterialSchedule } from '../stores/useWeaponMaterialStore';

export const useWeaponCalendar = (
  nDays: number,
  schedule: WeaponMaterialSchedule
) => {
  return useCalendar(nDays, schedule.materials);
};
