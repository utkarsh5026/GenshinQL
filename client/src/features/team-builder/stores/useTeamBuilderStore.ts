import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { WeaponSummary } from '@/features/weapons';
import type { Character } from '@/types';

import {
  type ArtifactConfig,
  type CharacterRole,
  createEmptySlot,
  createEmptyTeam,
  type Team,
  type TeamCharacterSlot,
} from '../types';

// ─── State Shape ─────────────────────────────────────────────────────────────

interface TeamBuilderState {
  teams: Team[];
  activeTeamId: string | null;

  // Team management
  createTeam: () => void;
  deleteTeam: (id: string) => void;
  duplicateTeam: (id: string) => void;
  setActiveTeam: (id: string) => void;
  updateTeamName: (teamId: string, name: string) => void;

  // Slot management
  setCharacterSlot: (
    teamId: string,
    slotIndex: number,
    character: Character | null
  ) => void;
  setWeaponSlot: (
    teamId: string,
    slotIndex: number,
    weapon: WeaponSummary | null
  ) => void;
  setRefinementSlot: (
    teamId: string,
    slotIndex: number,
    refinement: number
  ) => void;
  setArtifactSlot: (
    teamId: string,
    slotIndex: number,
    artifacts: ArtifactConfig | null
  ) => void;
  setRolesSlot: (
    teamId: string,
    slotIndex: number,
    roles: CharacterRole[]
  ) => void;
  setConstellationSlot: (
    teamId: string,
    slotIndex: number,
    constellation: number
  ) => void;
  setLevelSlot: (teamId: string, slotIndex: number, level: number) => void;
  setNotesSlot: (teamId: string, slotIndex: number, notes: string) => void;
  setMainStatsSlot: (
    teamId: string,
    slotIndex: number,
    mainStats: TeamCharacterSlot['mainStats']
  ) => void;
  setSubstatsSlot: (
    teamId: string,
    slotIndex: number,
    substats: string[]
  ) => void;
  reorderSlots: (teamId: string, newSlots: Team['slots']) => void;
  clearSlot: (teamId: string, slotIndex: number) => void;

  setRotation: (teamId: string, rotation: string) => void;
}

const generateId = () =>
  `team-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const updateSlot = (
  team: Team,
  slotIndex: number,
  updater: (slot: TeamCharacterSlot) => TeamCharacterSlot
): Team => {
  const newSlots = [...team.slots] as Team['slots'];
  newSlots[slotIndex as 0 | 1 | 2 | 3] = updater(newSlots[slotIndex]);
  return { ...team, slots: newSlots, updatedAt: Date.now() };
};

const updateTeamById = (
  teams: Team[],
  teamId: string,
  updater: (team: Team) => Team
): Team[] => teams.map((t) => (t.id === teamId ? updater(t) : t));

export const useTeamBuilderStore = create<TeamBuilderState>()(
  devtools(
    persist(
      (set, get) => ({
        teams: [],
        activeTeamId: null,

        createTeam: () => {
          const id = generateId();
          const newTeam = createEmptyTeam(id);
          set((state) => ({
            teams: [...state.teams, newTeam],
            activeTeamId: id,
          }));
        },

        deleteTeam: (id) => {
          set((state) => {
            const teams = state.teams.filter((t) => t.id !== id);
            const activeTeamId =
              state.activeTeamId === id
                ? (teams[teams.length - 1]?.id ?? null)
                : state.activeTeamId;
            return { teams, activeTeamId };
          });
        },

        duplicateTeam: (id) => {
          const team = get().teams.find((t) => t.id === id);
          if (!team) return;
          const newId = generateId();
          const duplicate: Team = {
            ...team,
            id: newId,
            name: `${team.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            teams: [...state.teams, duplicate],
            activeTeamId: newId,
          }));
        },

        setActiveTeam: (id) => set({ activeTeamId: id }),

        updateTeamName: (teamId, name) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) => ({
              ...t,
              name,
              updatedAt: Date.now(),
            })),
          }));
        },

        setCharacterSlot: (teamId, slotIndex, character) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({
                ...slot,
                character,
                weapon: character ? slot.weapon : null,
                weaponRefinement: character ? slot.weaponRefinement : 1,
              }))
            ),
          }));
        },

        setWeaponSlot: (teamId, slotIndex, weapon) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({
                ...slot,
                weapon,
                weaponRefinement: weapon ? slot.weaponRefinement : 1,
              }))
            ),
          }));
        },

        setRefinementSlot: (teamId, slotIndex, refinement) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({
                ...slot,
                weaponRefinement: refinement,
              }))
            ),
          }));
        },

        setArtifactSlot: (teamId, slotIndex, artifacts) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, artifacts }))
            ),
          }));
        },

        setRolesSlot: (teamId, slotIndex, roles) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, roles }))
            ),
          }));
        },

        setConstellationSlot: (teamId, slotIndex, constellation) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, constellation }))
            ),
          }));
        },

        setLevelSlot: (teamId, slotIndex, level) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, level }))
            ),
          }));
        },

        setNotesSlot: (teamId, slotIndex, notes) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, notes }))
            ),
          }));
        },

        setMainStatsSlot: (teamId, slotIndex, mainStats) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, mainStats }))
            ),
          }));
        },

        setSubstatsSlot: (teamId, slotIndex, substats) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, substats }))
            ),
          }));
        },

        reorderSlots: (teamId, newSlots) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) => ({
              ...t,
              slots: newSlots,
              updatedAt: Date.now(),
            })),
          }));
        },

        clearSlot: (teamId, slotIndex) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, () => createEmptySlot())
            ),
          }));
        },

        setRotation: (teamId, rotation) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) => ({
              ...t,
              rotation,
              updatedAt: Date.now(),
            })),
          }));
        },
      }),
      {
        name: 'genshinql-teams',
        version: 2,
        migrate: (persisted: unknown, version: number) => {
          if (version < 2) {
            /** Migrate mainStats from `{ sands: string }` → `{ sands: string[] }` */
            const state = persisted as {
              teams?: Array<{
                slots: Array<{
                  mainStats: {
                    sands: unknown;
                    goblet: unknown;
                    circlet: unknown;
                  };
                }>;
              }>;
            };
            state.teams?.forEach((team) =>
              team.slots.forEach((slot) => {
                const ms = slot.mainStats as {
                  sands: unknown;
                  goblet: unknown;
                  circlet: unknown;
                };
                slot.mainStats = {
                  sands:
                    typeof ms?.sands === 'string' && ms.sands ? [ms.sands] : [],
                  goblet:
                    typeof ms?.goblet === 'string' && ms.goblet
                      ? [ms.goblet]
                      : [],
                  circlet:
                    typeof ms?.circlet === 'string' && ms.circlet
                      ? [ms.circlet]
                      : [],
                };
              })
            );
          }
          return persisted as TeamBuilderState;
        },
      }
    ),
    { name: 'TeamBuilderStore' }
  )
);

// ─── Selector hooks ───────────────────────────────────────────────────────────

export const useTeams = () => useTeamBuilderStore((s) => s.teams);
export const useActiveTeamId = () => useTeamBuilderStore((s) => s.activeTeamId);
export const useActiveTeam = () =>
  useTeamBuilderStore((s) =>
    s.activeTeamId
      ? (s.teams.find((t) => t.id === s.activeTeamId) ?? null)
      : null
  );
export const useTeamById = (id: string) =>
  useTeamBuilderStore((s) => s.teams.find((t) => t.id === id) ?? null);
