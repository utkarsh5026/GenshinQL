import { ArtifactLink } from '@/types';

export interface ArtifactSetConfig {
  name: string;
  pieces: number;
}

export interface ArtifactConfiguration {
  type: '4pc' | '2pc+2pc' | 'mixed';
  sets: ArtifactSetConfig[];
}

/**
 * Detects the artifact set configuration from an array of set names
 * @param sets Array of artifact set names
 * @returns Configuration object describing how to display the artifacts
 */
export function detectArtifactSetConfiguration(
  sets: string[]
): ArtifactConfiguration {
  if (sets.length === 1) {
    return {
      type: '4pc',
      sets: [{ name: sets[0], pieces: 4 }],
    };
  }

  if (sets.length === 2) {
    return {
      type: '2pc+2pc',
      sets: [
        { name: sets[0], pieces: 2 },
        { name: sets[1], pieces: 2 },
      ],
    };
  }

  // Handle 3+ sets (mixed builds) - assume 2pc each
  return {
    type: 'mixed',
    sets: sets.map((name) => ({ name, pieces: 2 })),
  };
}

/**
 * Gets the artifact icon URL for a given set name
 * @param setName The artifact set name
 * @param artifactsData Array of artifact links data
 * @returns Icon URL or undefined if not found
 */
export function getArtifactIconUrl(
  setName: string,
  artifactsData: readonly ArtifactLink[]
): string | undefined {
  return artifactsData.find((a) => a.name === setName)?.flowerIconUrl;
}

/**
 * Gets the artifact wiki URL for a given set name
 * @param setName The artifact set name
 * @param artifactsData Array of artifact links data
 * @returns Wiki URL or undefined if not found
 */
export function getArtifactUrl(
  setName: string,
  artifactsData: readonly ArtifactLink[]
): string | undefined {
  return artifactsData.find((a) => a.name === setName)?.url;
}
