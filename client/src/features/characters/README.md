# Characters Feature

## Overview

The Characters feature provides comprehensive functionality for managing and displaying Genshin Impact character data. It includes character profiles, abilities, talents, constellations, galleries, build guides, and artifact recommendations. This feature handles character browsing, filtering, detailed views, and animation displays.

## Structure

### `components/`

React components for character UI:

- **CharacterDetail** - Main character profile page component
- **cards/** - Character card components
  - `character-card.tsx` - Individual character card display
  - `characters-grid.tsx` - Grid layout for character cards
  - `character-card-filters.tsx` - Filter controls for character list
  - `character-media-avatar.tsx` - Character avatar with animations
  - `CharacterCard.module.css` - Card styling

### `stores/`

Zustand state management stores:

- **useCharacterStore** - Main character list and map management
- **useCharacterProfileStore** - Individual character profile data with caching
- **useCharacterAbilitiesStore** - Character abilities, talents, and element colors
- **useArtifactStore** - Artifact links and recommendations

### `hooks/`

Custom React hooks:

- **useCharacterTalents** - Extract and organize character talents with animations
- **useCharacterFilters** - Filter characters by element, rarity, region, and search query

### `services/`

API and data fetching services:

- **fetchCharacters** - Fetch all characters list
- **fetchCharacterProfile** - Fetch detailed character profile data

### `types/`

TypeScript type definitions:

- **Character** - Basic character data type
- **CharacterDetailed** - Extended character with full profile data
- **CharacterRaw** - Raw character data from JSON
- **Talent, TalentRaw** - Talent/ability types
- **Constellation** - Constellation types
- **GalleryRaw** - Gallery and animation data
- **CharacterBuild** - Build guide types
- **AttackAnimation, ScreenAnimation** - Animation types

### `utils/`

Utility functions:

- **ability-tags.ts** - Extract constellation and ability tags
- **constellation-utils.ts** - Constellation styling and element classes
- **passive-utils.ts** - Passive talent sorting and styling
- **artifact-utils.ts** - Artifact-related utilities

## Usage

### Import from Feature Root

```typescript
import {
  CharacterDetail,
  useCharacterStore,
  useCharacterProfileStore,
  useCharacterFilters,
  useCharacterTalents,
  type Character,
  type CharacterDetailed,
} from '@/features/characters';
```

### Example: Character List with Filters

```typescript
import { useCharacterFilters } from '@/features/characters';

function CharacterList() {
  const {
    filteredCharacters,
    searchQuery,
    setSearchQuery,
    toggleElement,
    toggleRarity,
    filters
  } = useCharacterFilters();

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredCharacters.map(char => (
        <div key={char.name}>{char.name}</div>
      ))}
    </div>
  );
}
```

### Example: Character Profile

```typescript
import { useCharacterProfileStore } from '@/features/characters';

function CharacterProfile({ characterName }: { characterName: string }) {
  const {
    profile,
    loading,
    error,
    fetchCharacterProfile
  } = useCharacterProfileStore();

  useEffect(() => {
    fetchCharacterProfile(characterName);
  }, [characterName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{profile?.name}</div>;
}
```

### Example: Character Talents with Animations

```typescript
import { useCharacterTalents } from '@/features/characters';

function CharacterTalents({ character }: { character: CharacterDetailed }) {
  const { mainTalents, elementalBurst } = useCharacterTalents(character);

  return (
    <div>
      {mainTalents.map(({ talent, animations, energyCost, cooldown }) => (
        <div key={talent.talentName}>
          <h3>{talent.talentName}</h3>
          {energyCost && <span>Energy: {energyCost}</span>}
          {cooldown && <span>CD: {cooldown}</span>}
          {animations.map((anim, idx) => (
            <video key={idx} src={anim.url} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Store APIs

### useCharacterStore

```typescript
const {
  characters, // Character[] - All characters
  characterMap, // Record<string, Character> - Quick lookup
  loading, // boolean
  error, // Error | null
  fetchCharacters, // () => Promise<void>
} = useCharactersStore();
```

### useCharacterProfileStore

```typescript
const {
  profile, // CharacterDetailed | null
  loading, // boolean
  error, // Error | null
  fetchCharacterProfile, // (name: string) => Promise<void>
  clearProfileCache, // () => void
  removeProfile, // (name: string) => void
} = useCharacterProfileStore();
```

### useCharacterAbilitiesStore

```typescript
const {
  abilityMap, // Map of character abilities
  characterAbilityData, // Ability data for specific character
  elementColor, // Get color for element
  clearAbilitiesCache, // () => void
} = useCharacterAbilitiesStore();
```

## Features

- ✨ Character browsing with grid and card layouts
- 🔍 Advanced filtering by element, rarity, region, and search
- 📊 Detailed character profiles with talents, constellations, and builds
- 🎬 Animation galleries for attacks and idle animations
- 🛡️ Artifact recommendations and build guides
- ⚡ Optimized caching for profiles and abilities
- 🎨 Element-based theming and styling
- 📱 Responsive design for all screen sizes
