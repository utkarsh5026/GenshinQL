# LinkerGame Feature

## Overview

Interactive character linking puzzle game for Genshin Impact. Players must identify characters based on shared attributes (element, weapon, region, rarity, or version range).

## Features

- **Three Difficulty Levels**: Easy (15s), Medium (10s), Hard (5s)
- **Selection Modes**: Single-select or multi-select
- **Dynamic Grid Sizes**: 6x6 or 9x9 character grids
- **Scoring System**: Base points + time bonus + combo multipliers
- **Lives System**: 3 lives, game over on depletion

## Structure

- `components/` - React components (LinkerGame, GameBoard, GameHeader, etc.)
- `stores/` - Zustand state management (useLinkerGameStore)
- `hooks/` - Custom React hooks (useTurnTimer)
- `services/` - Game logic services (grid generator)
- `types/` - TypeScript type definitions
- `constants/` - Game configuration (DIFFICULTY_CONFIG)

## Usage

```typescript
import { LinkerGame, useLinkerGameStore, DIFFICULTY_CONFIG } from '@/features/linker-game';

// Use in route
<Route path="/linker" element={<LinkerGame />} />

// Access game state
const { gameStatus, score, lives } = useLinkerGameStore();
```

## API

### Components

- **LinkerGame** - Main game component
- **GameBoard** - Game grid and target display
- **GameHeader** - Timer, lives, stats, and controls
- **GameSetup** - Difficulty and mode selection

### Store

- **useLinkerGameStore** - Main Zustand store with game state
- **Selectors**: useLinkerGameStatus, useLinkerGameDifficulty, useLinkerGameLives, etc.

### Constants

- **DIFFICULTY_CONFIG** - Difficulty level configurations (time, points, grid size)

### Types

- **LinkerDifficulty**: 'easy' | 'medium' | 'hard'
- **LinkType**: 'element' | 'weaponType' | 'region' | 'rarity' | 'versionBefore' | 'versionAfter'
- **SelectionMode**: 'single' | 'multi'
