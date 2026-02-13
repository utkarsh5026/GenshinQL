import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  TrackedCharacter,
  TrackedTeam,
  TrackedWeapon,
  TrackingReason,
} from '@/types';

// Helper to generate UUIDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface TrackerState {
  trackedCharacters: TrackedCharacter[];
  trackedWeapons: TrackedWeapon[];
  teams: TrackedTeam[];

  // Character actions
  addCharacter: (name: string, reason: TrackingReason, teamId?: string) => void;
  removeCharacter: (name: string) => void;
  updateCharacterReason: (name: string, reason: TrackingReason) => void;
  isCharacterTracked: (name: string) => boolean;

  // Weapon actions
  addWeapon: (
    name: string,
    reason: TrackingReason,
    targetCharacter?: string
  ) => void;
  removeWeapon: (name: string) => void;
  updateWeaponReason: (name: string, reason: TrackingReason) => void;
  isWeaponTracked: (name: string) => boolean;

  // Legacy weapon pairing (for backward compatibility)
  pairWeaponToCharacter: (
    characterName: string,
    weaponName: string | null
  ) => void;
  getPairedWeapon: (characterName: string) => string | null;
  getCharactersForWeapon: (weaponName: string) => string[];

  // New multi-weapon pairing actions
  addWeaponToCharacter: (characterName: string, weaponName: string) => void;
  removeWeaponFromCharacter: (
    characterName: string,
    weaponName: string
  ) => void;
  setCharacterWeapons: (characterName: string, weaponNames: string[]) => void;

  // Team actions
  createTeam: (name: string, characters: string[], icon?: string) => string;
  deleteTeam: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<TrackedTeam>) => void;
  addCharactersToTeam: (teamId: string, characterNames: string[]) => void;
  removeCharacterFromTeam: (teamId: string, characterName: string) => void;

  // Utility actions
  clearAll: () => void;
}

const initialState = {
  trackedCharacters: [] as TrackedCharacter[],
  trackedWeapons: [] as TrackedWeapon[],
  teams: [] as TrackedTeam[],
};

export const useTrackerStore = create<TrackerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Character actions
        addCharacter: (name, reason, teamId) => {
          const { trackedCharacters } = get();
          if (trackedCharacters.some((c) => c.name === name)) return;

          set(
            {
              trackedCharacters: [
                ...trackedCharacters,
                {
                  name,
                  reason,
                  addedAt: Date.now(),
                  pairedWeapons: [],
                  teamId,
                },
              ],
            },
            false,
            'tracker/addCharacter'
          );
        },

        removeCharacter: (name) => {
          set(
            (state) => ({
              trackedCharacters: state.trackedCharacters.filter(
                (c) => c.name !== name
              ),
            }),
            false,
            'tracker/removeCharacter'
          );
        },

        updateCharacterReason: (name, reason) => {
          set(
            (state) => ({
              trackedCharacters: state.trackedCharacters.map((c) =>
                c.name === name ? { ...c, reason } : c
              ),
            }),
            false,
            'tracker/updateCharacterReason'
          );
        },

        isCharacterTracked: (name) => {
          return get().trackedCharacters.some((c) => c.name === name);
        },

        // Weapon actions
        addWeapon: (name, reason, targetCharacter) => {
          const { trackedWeapons } = get();
          if (trackedWeapons.some((w) => w.name === name)) return;

          set(
            {
              trackedWeapons: [
                ...trackedWeapons,
                { name, reason, targetCharacter, addedAt: Date.now() },
              ],
            },
            false,
            'tracker/addWeapon'
          );
        },

        removeWeapon: (name) => {
          set(
            (state) => ({
              trackedWeapons: state.trackedWeapons.filter(
                (w) => w.name !== name
              ),
            }),
            false,
            'tracker/removeWeapon'
          );
        },

        updateWeaponReason: (name, reason) => {
          set(
            (state) => ({
              trackedWeapons: state.trackedWeapons.map((w) =>
                w.name === name ? { ...w, reason } : w
              ),
            }),
            false,
            'tracker/updateWeaponReason'
          );
        },

        isWeaponTracked: (name) => {
          return get().trackedWeapons.some((w) => w.name === name);
        },

        // Legacy weapon pairing (for backward compatibility)
        pairWeaponToCharacter: (characterName, weaponName) => {
          set(
            (state) => {
              const character = state.trackedCharacters.find(
                (c) => c.name === characterName
              );
              if (!character) return state;

              // Use new pairedWeapons array
              const newPairedWeapons = weaponName ? [weaponName] : [];

              return {
                trackedCharacters: state.trackedCharacters.map((c) =>
                  c.name === characterName
                    ? { ...c, pairedWeapons: newPairedWeapons }
                    : c
                ),
              };
            },
            false,
            'tracker/pairWeaponToCharacter'
          );
        },

        getPairedWeapon: (characterName) => {
          const character = get().trackedCharacters.find(
            (c) => c.name === characterName
          );
          return character?.pairedWeapons?.[0] || null;
        },

        getCharactersForWeapon: (weaponName) => {
          return get()
            .trackedCharacters.filter((c) =>
              c.pairedWeapons?.includes(weaponName)
            )
            .map((c) => c.name);
        },

        // New multi-weapon pairing actions
        addWeaponToCharacter: (characterName, weaponName) => {
          set(
            (state) => ({
              trackedCharacters: state.trackedCharacters.map((c) => {
                if (c.name === characterName) {
                  const currentWeapons = c.pairedWeapons || [];
                  // Don't add duplicates
                  if (currentWeapons.includes(weaponName)) return c;
                  return {
                    ...c,
                    pairedWeapons: [...currentWeapons, weaponName],
                  };
                }
                return c;
              }),
            }),
            false,
            'tracker/addWeaponToCharacter'
          );
        },

        removeWeaponFromCharacter: (characterName, weaponName) => {
          set(
            (state) => ({
              trackedCharacters: state.trackedCharacters.map((c) =>
                c.name === characterName
                  ? {
                      ...c,
                      pairedWeapons: (c.pairedWeapons || []).filter(
                        (w) => w !== weaponName
                      ),
                    }
                  : c
              ),
            }),
            false,
            'tracker/removeWeaponFromCharacter'
          );
        },

        setCharacterWeapons: (characterName, weaponNames) => {
          set(
            (state) => ({
              trackedCharacters: state.trackedCharacters.map((c) =>
                c.name === characterName
                  ? { ...c, pairedWeapons: weaponNames }
                  : c
              ),
            }),
            false,
            'tracker/setCharacterWeapons'
          );
        },

        // Team actions
        createTeam: (name, characters, icon = 'sword') => {
          const teamId = generateId();
          const newTeam: TrackedTeam = {
            id: teamId,
            name,
            characters,
            icon,
            createdAt: Date.now(),
          };

          set(
            (state) => ({
              teams: [...state.teams, newTeam],
            }),
            false,
            'tracker/createTeam'
          );

          return teamId;
        },

        deleteTeam: (teamId) => {
          set(
            (state) => ({
              teams: state.teams.filter((t) => t.id !== teamId),
              // Clear teamId from characters that belonged to this team
              trackedCharacters: state.trackedCharacters.map((c) =>
                c.teamId === teamId ? { ...c, teamId: undefined } : c
              ),
            }),
            false,
            'tracker/deleteTeam'
          );
        },

        updateTeam: (teamId, updates) => {
          set(
            (state) => ({
              teams: state.teams.map((t) =>
                t.id === teamId ? { ...t, ...updates } : t
              ),
            }),
            false,
            'tracker/updateTeam'
          );
        },

        addCharactersToTeam: (teamId, characterNames) => {
          set(
            (state) => {
              const team = state.teams.find((t) => t.id === teamId);
              if (!team) return state;

              const updatedCharacters = Array.from(
                new Set([...team.characters, ...characterNames])
              );

              return {
                teams: state.teams.map((t) =>
                  t.id === teamId ? { ...t, characters: updatedCharacters } : t
                ),
                trackedCharacters: state.trackedCharacters.map((c) =>
                  characterNames.includes(c.name) ? { ...c, teamId } : c
                ),
              };
            },
            false,
            'tracker/addCharactersToTeam'
          );
        },

        removeCharacterFromTeam: (teamId, characterName) => {
          set(
            (state) => {
              const team = state.teams.find((t) => t.id === teamId);
              if (!team) return state;

              return {
                teams: state.teams.map((t) =>
                  t.id === teamId
                    ? {
                        ...t,
                        characters: t.characters.filter(
                          (name) => name !== characterName
                        ),
                      }
                    : t
                ),
                trackedCharacters: state.trackedCharacters.map((c) =>
                  c.name === characterName && c.teamId === teamId
                    ? { ...c, teamId: undefined }
                    : c
                ),
              };
            },
            false,
            'tracker/removeCharacterFromTeam'
          );
        },

        // Utility
        clearAll: () => set(initialState, false, 'tracker/clearAll'),
      }),
      {
        name: 'genshinql-tracker',
        // Migration logic for old data
        migrate: (persistedState: unknown) => {
          const state = persistedState as TrackerState;

          // Migrate pairedWeapon to pairedWeapons array
          if (state.trackedCharacters) {
            state.trackedCharacters = state.trackedCharacters.map((char) => {
              // If old pairedWeapon exists but no pairedWeapons array
              if (char.pairedWeapon && !char.pairedWeapons) {
                return {
                  ...char,
                  pairedWeapons: [char.pairedWeapon],
                  pairedWeapon: undefined, // Clear old field
                };
              }
              // If pairedWeapons doesn't exist, initialize as empty array
              if (!char.pairedWeapons) {
                return { ...char, pairedWeapons: [] };
              }
              return char;
            });
          }

          // Initialize teams if not present
          if (!state.teams) {
            state.teams = [];
          }

          return state;
        },
      }
    ),
    { name: 'TrackerStore' }
  )
);

// Selector hooks for fine-grained subscriptions
export const useTrackedCharacters = () =>
  useTrackerStore((state) => state.trackedCharacters);
export const useTrackedWeapons = () =>
  useTrackerStore((state) => state.trackedWeapons);
export const useTrackedTeams = () => useTrackerStore((state) => state.teams);

// Action hooks
export const useAddCharacter = () =>
  useTrackerStore((state) => state.addCharacter);
export const useRemoveCharacter = () =>
  useTrackerStore((state) => state.removeCharacter);
export const useAddWeapon = () => useTrackerStore((state) => state.addWeapon);
export const useRemoveWeapon = () =>
  useTrackerStore((state) => state.removeWeapon);

// Legacy weapon pairing hooks
export const usePairWeaponToCharacter = () =>
  useTrackerStore((state) => state.pairWeaponToCharacter);
export const useGetPairedWeapon = () =>
  useTrackerStore((state) => state.getPairedWeapon);
export const useGetCharactersForWeapon = () =>
  useTrackerStore((state) => state.getCharactersForWeapon);
