import type { Character } from '../../../types';

/**
 * Compare two version strings (e.g., "1.0", "3.5", "4.2")
 * Returns: negative if v1 < v2, 0 if equal, positive if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parse = (v: string) => v.split('.').map(Number);
  const [major1, minor1 = 0] = parse(v1);
  const [major2, minor2 = 0] = parse(v2);

  if (major1 !== major2) return major1 - major2;
  return minor1 - minor2;
};

/**
 * Check if a version string is valid numeric format (e.g., "1.0", "3.5")
 */
export const isValidNumericVersion = (version: string): boolean => {
  const parsed = parseFloat(version);
  return !isNaN(parsed) && /^\d+\.\d+$/.test(version);
};

/**
 * Check if character version is before the target version
 */
export const isVersionBefore = (
  charVersion: string,
  targetVersion: string
): boolean => {
  return compareVersions(charVersion, targetVersion) < 0;
};

/**
 * Check if character version is after the target version
 */
export const isVersionAfter = (
  charVersion: string,
  targetVersion: string
): boolean => {
  return compareVersions(charVersion, targetVersion) > 0;
};

/**
 * Get valid version range for link generation
 * Min: 1.1 (don't ask about before 1.0)
 * Max: current version - 0.1 (don't ask about future versions)
 */
export const getValidVersionRange = (
  allCharacters: Character[]
): { min: number; max: number } => {
  const versions = allCharacters
    .filter((c) => c.version && isValidNumericVersion(c.version))
    .map((c) => parseFloat(c.version!))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);

  if (versions.length === 0) {
    return { min: 1.1, max: 5.0 };
  }

  const minVersion = Math.max(1.1, versions[0]);
  const maxVersion = versions[versions.length - 1] - 0.1;

  return { min: minVersion, max: Math.max(minVersion, maxVersion) };
};

/**
 * Generate a random version number within valid range
 */
export const getRandomVersionInRange = (min: number, max: number): string => {
  const randomVersion = Math.random() * (max - min) + min;
  return randomVersion.toFixed(1);
};
