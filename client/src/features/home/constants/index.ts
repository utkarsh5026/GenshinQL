/* Export all constants from home feature */
import type { CharacterPriority, TrackingReason } from '@/types';

// Date and day-related constants
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const DAY_SCHEDULE = [
  'Monday/Thursday',
  'Tuesday/Friday',
  'Wednesday/Saturday',
] as const;

// Tracking reasons
export const REASON_COLORS: Record<TrackingReason, string> = {
  building: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  farming: 'bg-green-500/20 text-green-400 border-green-500/50',
  wishlist: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

export const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

// Character priority colors
export const PRIORITY_COLORS: Record<CharacterPriority, string> = {
  S: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  A: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  B: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  C: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

// Element colors
export const ELEMENT_COLORS: Record<string, string> = {
  Pyro: 'text-red-400',
  Hydro: 'text-blue-400',
  Electro: 'text-purple-400',
  Cryo: 'text-cyan-400',
  Anemo: 'text-teal-400',
  Geo: 'text-amber-400',
  Dendro: 'text-green-400',
};
