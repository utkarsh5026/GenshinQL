/* Export all constants from tier-list feature */
import type { TierConfig } from '../types';
/**
 * Default tier configurations (industry-standard colors)
 */
export const DEFAULT_TIER_CONFIGS: TierConfig[] = [
  { id: 'tier-s', name: 'S', color: '#ef4444', order: 0 }, // red-500
  { id: 'tier-a', name: 'A', color: '#f97316', order: 1 }, // orange-500
  { id: 'tier-b', name: 'B', color: '#eab308', order: 2 }, // yellow-500
  { id: 'tier-c', name: 'C', color: '#22c55e', order: 3 }, // green-500
  { id: 'tier-d', name: 'D', color: '#3b82f6', order: 4 }, // blue-500
];

/**
 * Preset color palette for tier customization
 */
export const PRESET_TIER_COLORS = [
  '#ef4444', // red-500 (S tier standard)
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#64748b', // slate-500
  '#6b7280', // gray-500
];
