# Home Feature

## Overview

The Home feature provides the main dashboard/landing page for the GenshinQL application. It displays the most important daily information including farmable materials, user-tracked items, and current game mode recommendations (Spiral Abyss & Imaginarium Theater).

## Structure

### `components/`

- **home.tsx** - Main dashboard page with header, date display, and section orchestration
- **daily-farming-guide.tsx** - Today's farmable talent books and weapon materials by region
- **tracker-section.tsx** - User's tracked characters/weapons with add/remove functionality
- **game-modes-section.tsx** - Current Spiral Abyss and Imaginarium Theater recommendations

### `constants/`

- Date/day name mappings (`DAY_NAMES`, `MONTH_NAMES`, `DAY_SCHEDULE`)
- Tracking reason colors and labels (`REASON_COLORS`, `REASON_LABELS`)
- Character priority colors (`PRIORITY_COLORS`)
- Element color mappings (`ELEMENT_COLORS`)

### `utils/`

- **getDayType()** - Determines which materials are available today (0 for Mon/Thu, 1 for Tue/Fri, 2 for Wed/Sat, 'all' for Sunday)
- **getCurrentDayName()** - Gets the current day name
- **getFormattedDate()** - Formats the current date as "Day, Month Date" (e.g., "Monday, February 11")

## Usage

### Import from Feature Root

```typescript
import {
  Home,
  DailyFarmingGuide,
  TrackerSection,
  GameModesSection,
} from '@/features/home';
```

### Example: Using Home Component in Routes

```typescript
import { Home } from '@/features/home';

export const routes = [
  { path: '/', element: <Home /> }
];
```

### Example: Using Individual Components

```typescript
import { DailyFarmingGuide, TrackerSection } from '@/features/home';

function CustomDashboard() {
  return (
    <div>
      <h1>My Custom Dashboard</h1>
      <DailyFarmingGuide />
      <TrackerSection />
    </div>
  );
}
```

### Example: Using Utilities

```typescript
import { getDayType, getFormattedDate, DAY_NAMES } from '@/features/home';

function MyComponent() {
  const dayType = getDayType(); // 0 | 1 | 2 | 'all'
  const formattedDate = getFormattedDate(); // "Monday, February 11"
  const today = DAY_NAMES[new Date().getDay()]; // "Monday"

  return <div>{formattedDate}</div>;
}
```

## Features

- 📅 **Daily Dashboard** - Current date and personalized greeting
- 📚 **Daily Farming Guide** - Today's available talent books and weapon materials
- 🔖 **Item Tracker** - Track characters/weapons you're building or farming for
- ⚔️ **Game Modes** - Current Spiral Abyss and Imaginarium Theater meta recommendations
- 🎯 **Smart Highlighting** - Tracked items highlighted in farming guide
- 📱 **Responsive Design** - Optimized for mobile and desktop
- 🎨 **Consistent Styling** - Uses centralized constants for colors and labels

## Dependencies

- `@/features/calendar` - Talent and weapon material schedules
- `@/features/characters` - Character data
- `@/features/weapons` - Weapon data
- `@/features/cache` - Image caching
- `@/stores` - Tracker, primitives, and game content stores

## Component Details

### DailyFarmingGuide

Displays today's farmable materials:

- Talent books organized by region (Mondstadt, Liyue, Inazuma, etc.)
- Weapon materials organized by nation
- Adapts to day of week (Sunday shows all materials)
- Highlights tracked characters/weapons with amber ring

### TrackerSection

Allows users to track items they're building or farming:

- Add/remove characters and weapons
- Categorize with reasons: Building, Farming, Wishlist
- Click to navigate to detail pages
- Shows tracked count badges

### GameModesSection

Shows current game mode meta recommendations:

- **Spiral Abyss**: Version, phase, blessing, recommended characters, teams
- **Imaginarium Theater**: Season, allowed elements, special guests, recommendations
- Character priorities (S/A/B/C tiers)
- Collapsible sections for additional details
