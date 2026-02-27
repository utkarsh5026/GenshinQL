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
  clearSlot: (teamId: string, slotIndex: number) => void;

  // Rotation
  setRotation: (teamId: string, rotation: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTeamBuilderStore = create<TeamBuilderState>()(
  devtools(
    persist(
      (set, get) => ({
        teams: [],
        activeTeamId: null,

        // ── Team management ────────────────────────────────────────────────

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

        // ── Slot management ────────────────────────────────────────────────

        setCharacterSlot: (teamId, slotIndex, character) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({
                ...slot,
                character,
                // Reset weapon if character changes (weapon type may differ)
                weapon: character ? slot.weapon : null,
              }))
            ),
          }));
        },

        setWeaponSlot: (teamId, slotIndex, weapon) => {
          set((state) => ({
            teams: updateTeamById(state.teams, teamId, (t) =>
              updateSlot(t, slotIndex, (slot) => ({ ...slot, weapon }))
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
      { name: 'genshinql-teams' }
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
