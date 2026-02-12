import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { Character, Weapon } from '@/types';

import {
  type CharacterTierListState,
  DEFAULT_TIER_CONFIGS,
  type TierConfig,
  type WeaponTierListState,
} from '../types';

// Character Tierlist Store
interface CharacterTierListStore extends CharacterTierListState {
  // Tier Management
  addTier: (name: string, color: string) => void;
  deleteTier: (tierId: string) => void;
  updateTierName: (tierId: string, newName: string) => void;
  updateTierColor: (tierId: string, newColor: string) => void;
  reorderTiers: (fromIndex: number, toIndex: number) => void;

  // Item Management
  assignItem: (itemName: string, tierId: string) => void;
  unassignItem: (itemName: string) => void;
  moveItem: (itemName: string, fromTierId: string, toTierId: string) => void;
  initializeUnassignedPool: (characters: Character[]) => void;

  // Utilities
  resetToDefaults: () => void;
  getTierForItem: (itemName: string) => string | null;
}

// Weapon Tierlist Store
interface WeaponTierListStore extends WeaponTierListState {
  // Tier Management
  addTier: (name: string, color: string) => void;
  deleteTier: (tierId: string) => void;
  updateTierName: (tierId: string, newName: string) => void;
  updateTierColor: (tierId: string, newColor: string) => void;
  reorderTiers: (fromIndex: number, toIndex: number) => void;

  // Item Management
  assignItem: (itemName: string, tierId: string) => void;
  unassignItem: (itemName: string) => void;
  moveItem: (itemName: string, fromTierId: string, toTierId: string) => void;
  initializeUnassignedPool: (weapons: Weapon[]) => void;

  // Utilities
  resetToDefaults: () => void;
  getTierForItem: (itemName: string) => string | null;
}

// Initial state factory
const createInitialState = <T>(): Omit<
  CharacterTierListState | WeaponTierListState,
  'unassignedPool'
> & { unassignedPool: T[] } => ({
  tiers: DEFAULT_TIER_CONFIGS.map((tier) => ({ ...tier })), // Deep copy
  tierAssignments: {},
  unassignedPool: [],
  version: 1,
  lastUpdated: Date.now(),
});

// Generate unique tier ID
const generateTierId = () =>
  `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Character Tierlist Store
export const useCharacterTierListStore = create<CharacterTierListStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState<Character>(),

        // Tier Management
        addTier: (name, color) => {
          const { tiers } = get();

          // Validate unique name
          if (tiers.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
            console.warn(`Tier with name "${name}" already exists`);
            return;
          }

          const newTier: TierConfig = {
            id: generateTierId(),
            name,
            color,
            order: tiers.length, // Add at end
          };

          set(
            {
              tiers: [...tiers, newTier],
              tierAssignments: { ...get().tierAssignments, [newTier.id]: [] },
              lastUpdated: Date.now(),
            },
            false,
            'characterTierlist/addTier'
          );
        },

        deleteTier: (tierId) => {
          const { tiers, tierAssignments, unassignedPool } = get();

          // Prevent deleting last tier
          if (tiers.length <= 1) {
            console.warn('Cannot delete the last tier');
            return;
          }

          // Move items from deleted tier to unassigned pool
          const itemsToUnassign = tierAssignments[tierId] || [];
          const updatedAssignments = { ...tierAssignments };
          delete updatedAssignments[tierId];

          // Find actual character objects for items being unassigned
          const itemsToAdd = itemsToUnassign
            .map((name) => {
              // Try to find in other tiers or existing unassigned pool
              const existingInPool = unassignedPool.find(
                (c) => c.name === name
              );
              return existingInPool;
            })
            .filter((item): item is Character => item !== undefined);

          // Reorder remaining tiers
          const updatedTiers = tiers
            .filter((t) => t.id !== tierId)
            .map((tier, index) => ({
              ...tier,
              order: index,
            }));

          set(
            {
              tiers: updatedTiers,
              tierAssignments: updatedAssignments,
              unassignedPool: [...unassignedPool, ...itemsToAdd],
              lastUpdated: Date.now(),
            },
            false,
            'characterTierlist/deleteTier'
          );
        },

        updateTierName: (tierId, newName) => {
          const { tiers } = get();

          // Validate unique name (excluding current tier)
          if (
            tiers.some(
              (t) =>
                t.id !== tierId &&
                t.name.toLowerCase() === newName.toLowerCase()
            )
          ) {
            console.warn(`Tier with name "${newName}" already exists`);
            return;
          }

          // Validate not empty
          if (!newName.trim()) {
            console.warn('Tier name cannot be empty');
            return;
          }

          set(
            (state) => ({
              tiers: state.tiers.map((tier) =>
                tier.id === tierId ? { ...tier, name: newName.trim() } : tier
              ),
              lastUpdated: Date.now(),
            }),
            false,
            'characterTierlist/updateTierName'
          );
        },

        updateTierColor: (tierId, newColor) => {
          // Basic hex color validation
          if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
            console.warn(`Invalid hex color: ${newColor}`);
            return;
          }

          set(
            (state) => ({
              tiers: state.tiers.map((tier) =>
                tier.id === tierId ? { ...tier, color: newColor } : tier
              ),
              lastUpdated: Date.now(),
            }),
            false,
            'characterTierlist/updateTierColor'
          );
        },

        reorderTiers: (fromIndex, toIndex) => {
          const { tiers } = get();

          if (
            fromIndex < 0 ||
            fromIndex >= tiers.length ||
            toIndex < 0 ||
            toIndex >= tiers.length
          ) {
            console.warn('Invalid tier reorder indices');
            return;
          }

          const updatedTiers = [...tiers];
          const [movedTier] = updatedTiers.splice(fromIndex, 1);
          updatedTiers.splice(toIndex, 0, movedTier);

          // Update order values
          updatedTiers.forEach((tier, index) => {
            tier.order = index;
          });

          set(
            { tiers: updatedTiers, lastUpdated: Date.now() },
            false,
            'characterTierlist/reorderTiers'
          );
        },

        // Item Management
        assignItem: (itemName, tierId) => {
          const { tierAssignments, unassignedPool, tiers } = get();

          // Validate tier exists
          if (!tiers.some((t) => t.id === tierId)) {
            console.warn(`Tier ${tierId} does not exist`);
            return;
          }

          // Find current tier of item
          const currentTierId = get().getTierForItem(itemName);

          // If already in this tier, do nothing
          if (currentTierId === tierId) return;

          const updatedAssignments = { ...tierAssignments };

          // Remove from current tier if exists
          if (currentTierId) {
            updatedAssignments[currentTierId] = updatedAssignments[
              currentTierId
            ].filter((name) => name !== itemName);
          }

          // Add to new tier
          if (!updatedAssignments[tierId]) {
            updatedAssignments[tierId] = [];
          }
          updatedAssignments[tierId] = [
            ...updatedAssignments[tierId],
            itemName,
          ];

          // Remove from unassigned pool
          const updatedPool = unassignedPool.filter((c) => c.name !== itemName);

          set(
            {
              tierAssignments: updatedAssignments,
              unassignedPool: updatedPool,
              lastUpdated: Date.now(),
            },
            false,
            'characterTierlist/assignItem'
          );
        },

        unassignItem: (itemName) => {
          const { tierAssignments, unassignedPool } = get();

          // Find current tier
          const currentTierId = get().getTierForItem(itemName);
          if (!currentTierId) return;

          // Remove from tier
          const updatedAssignments = { ...tierAssignments };
          updatedAssignments[currentTierId] = updatedAssignments[
            currentTierId
          ].filter((name) => name !== itemName);

          // Add to unassigned pool (if not already there)
          const updatedPool = unassignedPool;
          if (!unassignedPool.some((c) => c.name === itemName)) {
            // Note: We don't have the full character object here
            // This will be handled during initialization
            console.warn(
              `Character ${itemName} removed from tier but object not available for pool`
            );
          }

          set(
            {
              tierAssignments: updatedAssignments,
              unassignedPool: updatedPool,
              lastUpdated: Date.now(),
            },
            false,
            'characterTierlist/unassignItem'
          );
        },

        moveItem: (itemName, _fromTierId, toTierId) => {
          // Move is just assign to new tier (handles removal from old tier)
          get().assignItem(itemName, toTierId);
        },

        initializeUnassignedPool: (characters) => {
          const { tierAssignments, unassignedPool } = get();

          // Only initialize if pool is empty
          if (unassignedPool.length > 0) return;

          // Find all assigned character names
          const assignedNames = new Set(Object.values(tierAssignments).flat());

          // Add unassigned characters to pool
          const unassigned = characters.filter(
            (char) => !assignedNames.has(char.name)
          );

          if (unassigned.length > 0) {
            set(
              { unassignedPool: unassigned, lastUpdated: Date.now() },
              false,
              'characterTierlist/initializeUnassignedPool'
            );
          }
        },

        // Utilities
        resetToDefaults: () => {
          set(
            {
              ...createInitialState<Character>(),
              lastUpdated: Date.now(),
            },
            false,
            'characterTierlist/resetToDefaults'
          );
        },

        getTierForItem: (itemName) => {
          const { tierAssignments } = get();
          for (const [tierId, items] of Object.entries(tierAssignments)) {
            if (items.includes(itemName)) {
              return tierId;
            }
          }
          return null;
        },
      }),
      {
        name: 'genshinql-tierlist-characters',
      }
    ),
    { name: 'CharacterTierListStore' }
  )
);

// Weapon Tierlist Store (similar structure)
export const useWeaponTierListStore = create<WeaponTierListStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState<Weapon>(),

        // Tier Management (identical to character store)
        addTier: (name, color) => {
          const { tiers } = get();

          if (tiers.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
            console.warn(`Tier with name "${name}" already exists`);
            return;
          }

          const newTier: TierConfig = {
            id: generateTierId(),
            name,
            color,
            order: tiers.length,
          };

          set(
            {
              tiers: [...tiers, newTier],
              tierAssignments: { ...get().tierAssignments, [newTier.id]: [] },
              lastUpdated: Date.now(),
            },
            false,
            'weaponTierlist/addTier'
          );
        },

        deleteTier: (tierId) => {
          const { tiers, tierAssignments, unassignedPool } = get();

          if (tiers.length <= 1) {
            console.warn('Cannot delete the last tier');
            return;
          }

          const itemsToUnassign = tierAssignments[tierId] || [];
          const updatedAssignments = { ...tierAssignments };
          delete updatedAssignments[tierId];

          const itemsToAdd = itemsToUnassign
            .map((name) => unassignedPool.find((w) => w.name === name))
            .filter((item): item is Weapon => item !== undefined);

          const updatedTiers = tiers
            .filter((t) => t.id !== tierId)
            .map((tier, index) => ({
              ...tier,
              order: index,
            }));

          set(
            {
              tiers: updatedTiers,
              tierAssignments: updatedAssignments,
              unassignedPool: [...unassignedPool, ...itemsToAdd],
              lastUpdated: Date.now(),
            },
            false,
            'weaponTierlist/deleteTier'
          );
        },

        updateTierName: (tierId, newName) => {
          const { tiers } = get();

          if (
            tiers.some(
              (t) =>
                t.id !== tierId &&
                t.name.toLowerCase() === newName.toLowerCase()
            )
          ) {
            console.warn(`Tier with name "${newName}" already exists`);
            return;
          }

          if (!newName.trim()) {
            console.warn('Tier name cannot be empty');
            return;
          }

          set(
            (state) => ({
              tiers: state.tiers.map((tier) =>
                tier.id === tierId ? { ...tier, name: newName.trim() } : tier
              ),
              lastUpdated: Date.now(),
            }),
            false,
            'weaponTierlist/updateTierName'
          );
        },

        updateTierColor: (tierId, newColor) => {
          if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
            console.warn(`Invalid hex color: ${newColor}`);
            return;
          }

          set(
            (state) => ({
              tiers: state.tiers.map((tier) =>
                tier.id === tierId ? { ...tier, color: newColor } : tier
              ),
              lastUpdated: Date.now(),
            }),
            false,
            'weaponTierlist/updateTierColor'
          );
        },

        reorderTiers: (fromIndex, toIndex) => {
          const { tiers } = get();

          if (
            fromIndex < 0 ||
            fromIndex >= tiers.length ||
            toIndex < 0 ||
            toIndex >= tiers.length
          ) {
            console.warn('Invalid tier reorder indices');
            return;
          }

          const updatedTiers = [...tiers];
          const [movedTier] = updatedTiers.splice(fromIndex, 1);
          updatedTiers.splice(toIndex, 0, movedTier);

          updatedTiers.forEach((tier, index) => {
            tier.order = index;
          });

          set(
            { tiers: updatedTiers, lastUpdated: Date.now() },
            false,
            'weaponTierlist/reorderTiers'
          );
        },

        // Item Management
        assignItem: (itemName, tierId) => {
          const { tierAssignments, unassignedPool, tiers } = get();

          if (!tiers.some((t) => t.id === tierId)) {
            console.warn(`Tier ${tierId} does not exist`);
            return;
          }

          const currentTierId = get().getTierForItem(itemName);
          if (currentTierId === tierId) return;

          const updatedAssignments = { ...tierAssignments };

          if (currentTierId) {
            updatedAssignments[currentTierId] = updatedAssignments[
              currentTierId
            ].filter((name) => name !== itemName);
          }

          if (!updatedAssignments[tierId]) {
            updatedAssignments[tierId] = [];
          }
          updatedAssignments[tierId] = [
            ...updatedAssignments[tierId],
            itemName,
          ];

          const updatedPool = unassignedPool.filter((w) => w.name !== itemName);

          set(
            {
              tierAssignments: updatedAssignments,
              unassignedPool: updatedPool,
              lastUpdated: Date.now(),
            },
            false,
            'weaponTierlist/assignItem'
          );
        },

        unassignItem: (itemName) => {
          const { tierAssignments } = get();

          const currentTierId = get().getTierForItem(itemName);
          if (!currentTierId) return;

          const updatedAssignments = { ...tierAssignments };
          updatedAssignments[currentTierId] = updatedAssignments[
            currentTierId
          ].filter((name) => name !== itemName);

          set(
            {
              tierAssignments: updatedAssignments,
              lastUpdated: Date.now(),
            },
            false,
            'weaponTierlist/unassignItem'
          );
        },

        moveItem: (itemName, _fromTierId, toTierId) => {
          get().assignItem(itemName, toTierId);
        },

        initializeUnassignedPool: (weapons) => {
          const { tierAssignments, unassignedPool } = get();

          if (unassignedPool.length > 0) return;

          const assignedNames = new Set(Object.values(tierAssignments).flat());

          const unassigned = weapons.filter(
            (weapon) => !assignedNames.has(weapon.name)
          );

          if (unassigned.length > 0) {
            set(
              { unassignedPool: unassigned, lastUpdated: Date.now() },
              false,
              'weaponTierlist/initializeUnassignedPool'
            );
          }
        },

        // Utilities
        resetToDefaults: () => {
          set(
            {
              ...createInitialState<Weapon>(),
              lastUpdated: Date.now(),
            },
            false,
            'weaponTierlist/resetToDefaults'
          );
        },

        getTierForItem: (itemName) => {
          const { tierAssignments } = get();
          for (const [tierId, items] of Object.entries(tierAssignments)) {
            if (items.includes(itemName)) {
              return tierId;
            }
          }
          return null;
        },
      }),
      {
        name: 'genshinql-tierlist-weapons',
      }
    ),
    { name: 'WeaponTierListStore' }
  )
);

// Selector hooks for fine-grained subscriptions
export const useCharacterTiers = () =>
  useCharacterTierListStore((state) => state.tiers);
export const useCharacterTierAssignments = () =>
  useCharacterTierListStore((state) => state.tierAssignments);
export const useCharacterUnassignedPool = () =>
  useCharacterTierListStore((state) => state.unassignedPool);

export const useWeaponTiers = () =>
  useWeaponTierListStore((state) => state.tiers);
export const useWeaponTierAssignments = () =>
  useWeaponTierListStore((state) => state.tierAssignments);
export const useWeaponUnassignedPool = () =>
  useWeaponTierListStore((state) => state.unassignedPool);
