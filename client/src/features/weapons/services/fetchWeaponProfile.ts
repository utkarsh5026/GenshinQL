import { fetchWithCache } from '@/features/cache';

import type { WeaponProfile } from '../types/weapon-profile';

/**
 * Fetches detailed weapon profile data from JSON files
 * @param weaponName - The weapon name (e.g., "Skyward_Blade")
 * @returns Promise resolving to WeaponProfile or null if not found
 */
export async function fetchWeaponProfile(
  weaponName: string
): Promise<WeaponProfile | null> {
  try {
    const result = await fetchWithCache<WeaponProfile>(
      `weapons/${weaponName}.json`
    );
    return result.data;
  } catch (error) {
    console.error(`Failed to fetch weapon profile for ${weaponName}:`, error);
    return null;
  }
}
