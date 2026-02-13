# Tier List Feature

## Overview

The Tier List feature provides comprehensive functionality for creating, managing, and persisting custom tier rankings for Genshin Impact characters and weapons. Users can drag and drop items between tiers, customize tier names and colors, add or remove tiers, and have their rankings automatically saved via Zustand's persist middleware.

## Structure

### `components/`

React components for tier list UI:

- **TierList** - Main component with tabs for Characters and Weapons
- **base/** - Shared tier list components:
  - `DraggableComponent.tsx` - Generic draggable wrapper using @dnd-kit
  - `DroppableArea.tsx` - Generic droppable area for tier items
  - `TierLevel.tsx` - Base tier level component with customizable name/color
  - `AddTierButton.tsx` - Button with popover to add new tiers
  - `TierHeader.tsx` - Tier header with inline editing, color picker, reordering controls
  - `TierColorPicker.tsx` - Color picker with preset palette
  - `TierListToolbar.tsx` - Toolbar with reset and help functions
- **characters/** - Character-specific tier list components:
  - `CharacterTierList.tsx` - Character tier list with drag-drop
  - `DraggableCharacter.tsx` - Draggable character wrapper
  - `EnhancedCharacterCard.tsx` - Enhanced character card with rarity/element
  - `CharacterTierLevel.tsx` - Character-specific tier level
- **weapons/** - Weapon-specific tier list components:
  - `WeaponsTierList.tsx` - Weapon tier list with drag-drop
  - `WeaponTierLevel.tsx` - Weapon-specific tier level

### `stores/`

Zustand state management stores:

- **useCharacterTierListStore** - Character tier list state with persist
- **useWeaponTierListStore** - Weapon tier list state with persist

Both stores include:

- Tier management (add, delete, rename, recolor, reorder)
- Item management (assign, unassign, move between tiers)
- Unassigned item pool
- Persistence via localStorage

### `types/`

TypeScript type definitions:

- **TierConfig** - Tier configuration (id, name, color, order)
- **TierListState<T>** - Generic tier list state structure
- **CharacterTierListState** - Character-specific tier list state
- **WeaponTierListState** - Weapon-specific tier list state
- **DEFAULT_TIER_CONFIGS** - Default S, A, B, C, D tiers with colors
- **PRESET_TIER_COLORS** - Preset color palette for tier customization

## Usage

### Import from Feature Root

```typescript
import {
  TierList,
  useCharacterTierListStore,
  useWeaponTierListStore,
  useCharacterTiers,
  type TierConfig,
  type TierListState,
} from '@/features/tier-list';
```

### Example: Using Character Tier List Store

```typescript
import { useCharacterTierListStore } from '@/features/tier-list';

function MyComponent() {
  const {
    tiers,
    tierAssignments,
    unassignedPool,
    addTier,
    assignItem,
    updateTierColor,
    resetToDefaults
  } = useCharacterTierListStore();

  // Add a new tier
  const handleAddTier = () => {
    addTier('SS', '#ff0000');
  };

  // Assign character to tier
  const handleAssign = (characterName: string, tierId: string) => {
    assignItem(characterName, tierId);
  };

  // Update tier color
  const handleColorChange = (tierId: string, newColor: string) => {
    updateTierColor(tierId, newColor);
  };

  return (
    <div>
      {tiers.map(tier => (
        <div key={tier.id} style={{ backgroundColor: tier.color }}>
          {tier.name}: {tierAssignments[tier.id]?.length || 0} items
        </div>
      ))}
    </div>
  );
}
```

### Example: Using Selector Hooks

```typescript
import {
  useCharacterTiers,
  useCharacterTierAssignments,
  useCharacterUnassignedPool
} from '@/features/tier-list';

function TierStats() {
  const tiers = useCharacterTiers();
  const assignments = useCharacterTierAssignments();
  const unassigned = useCharacterUnassignedPool();

  return (
    <div>
      <p>Total Tiers: {tiers.length}</p>
      <p>Unassigned Characters: {unassigned.length}</p>
    </div>
  );
}
```

## Store APIs

### useCharacterTierListStore

```typescript
const {
  // State
  tiers, // TierConfig[] - Ordered array of tiers
  tierAssignments, // Record<string, string[]> - tier.id -> character names
  unassignedPool, // Character[] - Characters not in any tier
  version, // number - Schema version for migrations
  lastUpdated, // number - Timestamp of last update

  // Tier Management
  addTier, // (name: string, color: string) => void
  deleteTier, // (tierId: string) => void - Moves items to unassigned
  updateTierName, // (tierId: string, newName: string) => void
  updateTierColor, // (tierId: string, newColor: string) => void
  reorderTiers, // (fromIndex: number, toIndex: number) => void

  // Item Management
  assignItem, // (itemName: string, tierId: string) => void
  unassignItem, // (itemName: string) => void - Moves to unassigned
  moveItem, // (itemName: string, fromTierId: string, toTierId: string) => void
  initializeUnassignedPool, // (characters: Character[]) => void - Initial setup

  // Utilities
  resetToDefaults, // () => void - Reset to S/A/B/C/D defaults
  getTierForItem, // (itemName: string) => string | null - Find item's tier
} = useCharacterTierListStore();
```

### useWeaponTierListStore

Same API as `useCharacterTierListStore` but for weapons:

```typescript
const {
  tiers,
  tierAssignments,
  unassignedPool,
  addTier,
  deleteTier,
  // ... same methods as character store
} = useWeaponTierListStore();
```

### Selector Hooks

Fine-grained subscriptions for better performance:

```typescript
// Character selectors
const tiers = useCharacterTiers();
const assignments = useCharacterTierAssignments();
const unassigned = useCharacterUnassignedPool();

// Weapon selectors
const weaponTiers = useWeaponTiers();
const weaponAssignments = useWeaponTierAssignments();
const weaponUnassigned = useWeaponUnassignedPool();
```

## Features

- ✨ Drag-and-drop tier ranking for characters and weapons
- 🎨 Customizable tier colors with preset palette
- ✏️ Inline tier name editing
- ➕ Add unlimited custom tiers
- 🗑️ Delete tiers (items move to unassigned pool)
- ↕️ Reorder tiers with up/down arrows
- 💾 Auto-save with Zustand persist (localStorage)
- 🔄 Reset to defaults (S/A/B/C/D)
- 📱 Responsive design with tab interface
- ⚡ Optimized with fine-grained selectors
- 🎯 Type-safe with full TypeScript support

## Persistence

Both character and weapon tier lists are persisted to localStorage:

- **Character Store**: `genshinql-tierlist-characters`
- **Weapon Store**: `genshinql-tierlist-weapons`

Data persists across browser sessions. Users can:

- Close and reopen the app - rankings preserved
- Refresh the page - rankings preserved
- Clear browser data - rankings reset to defaults

## Component Architecture

### Drag-and-Drop

Uses `@dnd-kit/core` for drag-and-drop functionality:

```typescript
<DndContext onDragEnd={handleDragEnd}>
  <TierLevel tierId="tier-s">
    <DraggableComponent id="character-name">
      <CharacterCard />
    </DraggableComponent>
  </TierLevel>

  <DroppableArea id="unassigned-pool">
    {unassignedCharacters.map(char => (
      <DraggableComponent key={char.name} id={char.name}>
        <CharacterCard character={char} />
      </DraggableComponent>
    ))}
  </DroppableArea>
</DndContext>
```

### Base Components

Shared components provide consistent behavior:

- **DraggableComponent**: Wraps any content to make it draggable
- **DroppableArea**: Creates drop zones for draggable items
- **TierLevel**: Complete tier with header, items area, customization
- **TierHeader**: Tier name, color picker, reorder/delete controls
- **TierListToolbar**: Reset button and help tooltip

### Specialized Components

Character and weapon components extend base components:

- **CharacterTierList**: Uses base components + character data
- **WeaponsTierList**: Uses base components + weapon data
- Both maintain their own state via separate stores

## Default Configuration

Default tiers follow standard gaming tier list conventions:

```typescript
DEFAULT_TIER_CONFIGS = [
  { id: 'tier-s', name: 'S', color: '#ef4444', order: 0 }, // Red
  { id: 'tier-a', name: 'A', color: '#f97316', order: 1 }, // Orange
  { id: 'tier-b', name: 'B', color: '#eab308', order: 2 }, // Yellow
  { id: 'tier-c', name: 'C', color: '#22c55e', order: 3 }, // Green
  { id: 'tier-d', name: 'D', color: '#3b82f6', order: 4 }, // Blue
];
```

Users can modify, add, or remove tiers as needed.

## Performance Considerations

- **Selector Hooks**: Use fine-grained selectors to prevent unnecessary re-renders
- **Lazy Loading**: TierList route is lazy-loaded with code splitting
- **Memoization**: Base components use React.memo where appropriate
- **Minimal Re-renders**: Zustand's selector pattern ensures efficient updates

## Future Enhancements

Potential improvements:

- Export/import tier lists as JSON
- Share tier lists via URL
- Multiple tier list presets per user
- Tier list comparison view
- Community tier list aggregation
- Image export for social sharing
- Tier list templates (DPS, Support, etc.)
