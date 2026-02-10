import type { TalentBookCalendar } from '../types';
import { useCalendar } from './useCalendar';

export function useTalentCalendar(nDays: number, talent: TalentBookCalendar) {
  return useCalendar(nDays, talent.days);
}
