/**
 * Type definitions for character builds
 * Based on characterBuilds.json and artifacts-links.json structure
 */

// Artifact-related types
export interface ArtifactBuild {
  sets: string[];
  notes?: string;
}

export interface ArtifactLink {
  name: string;
  url: string;
  flowerIconUrl: string;
}

// Weapon-related types
export interface WeaponOption {
  name: string;
  notes: string;
}

export interface WeaponRecommendations {
  fiveStar: WeaponOption[];
  fourStar: WeaponOption[];
}

// Stats-related types
export interface MainStats {
  sands: string[];
  goblet: string[];
  circlet: string[];
}

// Constellation-related types
export interface ConstellationInfo {
  c0: string;
  breakpoints: string[];
  notes?: string;
}

// Team composition types
export interface TeamComp {
  name: string;
  characters: string[];
  roles: Record<string, string>;
  rotation: string;
  notes?: string;
}

// Main character build type
export interface CharacterBuild {
  name: string;
  element: string;
  weaponType: string;
  roles: string[];
  artifacts: {
    recommended: ArtifactBuild;
    alternatives: ArtifactBuild[];
  };
  weapons: WeaponRecommendations;
  mainStats: MainStats;
  substats: string[];
  constellations?: ConstellationInfo;
  teams: TeamComp[];
}

// Root structure of characterBuilds.json
export interface CharacterBuildsData {
  version: string;
  lastUpdated: string;
  characters: Record<string, CharacterBuild>;
}
