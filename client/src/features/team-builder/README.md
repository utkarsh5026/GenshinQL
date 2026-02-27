# Team Builder Feature

## Overview

The Team Builder lets players assemble and save Genshin Impact team compositions. Each team holds up to **4 character slots**, with per-slot weapon, artifact, and role configuration. Teams are persisted in `localStorage` via Zustand's `persist` middleware and survive page refreshes.

A **Rotation Editor** accompanies each team. It records the ability sequence (Normal Attack, Elemental Skill, Elemental Burst, Charged Attack) for every character in order, serialized as a compact multi-line string and stored on the `Team` object.

---

## Structure

```text
team-builder/
├── components/
│   ├── TeamBuilderPage.tsx      # Root page: sidebar team list + editor area
│   ├── character-slot.tsx       # CharacterSlotCard — full slot editor card
│   ├── character-picker.tsx     # CharacterPickerDialog — searchable character grid
│   ├── weapon-picker.tsx        # WeaponPickerDialog — weapon list filtered by type
│   ├── artifact-picker.tsx      # ArtifactPickerPanel / ArtifactDisplay
│   ├── role-selector.tsx        # RoleBadges / RoleBadgeSelector
│   ├── rotation-editor.tsx      # RotationEditor — drag-and-drop segment UI
│   ├── TeamPreviewCard.tsx      # Read-only compact team card (used in dialog)
│   ├── TeamPreviewDialog.tsx    # Full-screen team preview modal
│   └── index.ts                 # Component barrel
├── hooks/
│   ├── useRotation.ts           # All rotation segment state and handlers
│   ├── useTalentIconsMap.ts     # Loads chrTalents.json → CharTalentsMap
│   └── index.ts
├── services/
│   ├── fetchCharTalents.ts      # fetchWithCache('chrTalents.json')
│   └── index.ts
├── stores/
│   ├── useTeamBuilderStore.ts   # Zustand store (devtools + persist)
│   └── index.ts
├── types/
│   └── index.ts                 # All types + factory functions
├── utils/
│   └── index.ts                 # serializeSteps / parseSteps
├── constants/
│   └── index.ts                 # ALL_ROLES, ROLE_COLORS
└── index.ts                     # Public barrel export
```

---

## Data Model

### `Team`

```ts
interface Team {
  id: string; // "team-<timestamp>-<random>"
  name: string; // editable team name
  slots: [
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
  ];
  rotation: string; // serialized rotation (see format below)
  createdAt: number;
  updatedAt: number;
}
```

### `TeamCharacterSlot`

```ts
interface TeamCharacterSlot {
  character: Character | null;
  weapon: WeaponSummary | null;
  artifacts: ArtifactConfig | null; // '4pc' | '2+2pc'
  roles: CharacterRole[];
}
```

### `ArtifactConfig`

```ts
type ArtifactConfig =
  | { mode: '4pc'; set: string; setIconUrl?: string }
  | {
      mode: '2+2pc';
      setA: string;
      setAIconUrl?: string;
      setB: string;
      setBIconUrl?: string;
    };
```

### `CharacterRole`

One of: `'DPS' | 'Sub DPS' | 'Support' | 'Healer' | 'Buffer' | 'Shielder' | 'Driver' | 'Enabler'`

### `RotationSegment`

```ts
interface RotationSegment {
  id: string; // stable UI key for Framer Motion Reorder (not persisted)
  characterName: string;
  characterIconUrl: string;
  abilities: RotationAbility[]; // ordered sequence: 'E' | 'Q' | 'NA' | 'CA'
  note: string;
}
```

---

## Rotation Serialization Format

Rotations are stored as a plain multi-line string on `Team.rotation`. Each line represents one character's turn:

```text
CharacterName ABILITY>ABILITY>ABILITY (optional note)
```

**Examples:**

```text
Hu Tao E>CA>CA>Q
Zhongli Q>E
Yelan Q>E
Xingqiu Q>E (burst before Hu Tao)
```

`serializeSteps` converts `RotationSegment[]` → string. `parseSteps` does the reverse, skipping lines with unknown character names.

---

## Store

`useTeamBuilderStore` is a Zustand store with `devtools` + `persist` (key: `genshinql-teams`).

### Team actions

| Action                         | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| `createTeam()`                 | Creates a new empty team and sets it active     |
| `deleteTeam(id)`               | Removes a team; activates the previous one      |
| `duplicateTeam(id)`            | Clones team with `(Copy)` suffix                |
| `setActiveTeam(id)`            | Switches the visible editor to a different team |
| `updateTeamName(teamId, name)` | Inline rename                                   |

### Slot actions

| Action                                           | Description                                                |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `setCharacterSlot(teamId, slotIndex, character)` | Assigns a character; resets weapon if character is cleared |
| `setWeaponSlot(teamId, slotIndex, weapon)`       | Assigns a weapon                                           |
| `setArtifactSlot(teamId, slotIndex, artifacts)`  | Sets 4pc or 2+2pc artifact config                          |
| `setRolesSlot(teamId, slotIndex, roles)`         | Sets the role badges for a slot                            |
| `clearSlot(teamId, slotIndex)`                   | Resets a slot to empty                                     |
| `setRotation(teamId, rotation)`                  | Saves serialized rotation string                           |

### Selector hooks

```ts
useTeams(); // Team[]
useActiveTeamId(); // string | null
useActiveTeam(); // Team | null
useTeamById(id); // Team | null
```

---

## Key Hooks

### `useRotation`

Drives the Rotation Editor. Accepts `{ value, onChange, slots }` and returns all segment state + handlers:

- `handleSelectChar(name)` — toggle character selection
- `handleAddAbility(ability)` — appends ability to last segment (or creates new segment)
- `handleAddAbilityToSegment(id, ability)` — inline append inside any card
- `handleRemoveAbilityFromSegment(id, index)` — remove individual ability; auto-removes empty segments
- `handleRemoveSegment(id)` — remove entire segment
- `handleNoteChange(id, note)` — edit per-segment note
- `handleReorderSegments(newSegments)` — drag-and-drop reorder
- `handleReset()` — clear all segments

Changes to `segments` are synced to the parent `onChange` via an effect (skipped on mount).

### `useTalentIconsMap`

Loads `chrTalents.json` once via `fetchWithCache` and returns a `CharTalentsMap`:

```ts
type CharTalentsMap = Record<
  string, // character name
  [TalentIconEntry, TalentIconEntry, TalentIconEntry] // [Normal Attack, Skill, Burst]
>;
```

---

## Route

The page is registered at `/teams` and lazy-loaded:

```ts
const TeamsPage = lazy(
  () => import(/* webpackChunkName: "team-builder" */ '@/features/team-builder')
);
```

---

## Usage

```typescript
import { TeamBuilderPage } from '@/features/team-builder';
```

Cross-feature imports must always go through the barrel `index.ts` — never import from internal paths.
