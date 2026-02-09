# Talent Calendar Feature

## Overview

The **Talent Calendar** feature provides a daily schedule for farming talent books and character materials in Genshin Impact. It displays which talent books are available on specific days of the week and which characters require those books for leveling up their talents.

### Key Features

- **Daily Calendar View**: Shows talent book availability for the next N days
- **Character Mapping**: Maps characters to their required talent books
- **Regional Organization**: Groups talent books by in-game region (Mondstadt, Liyue, Inazuma, Sumeru, Fontaine)
- **Sunday Handling**: Special display for Sundays when all books are available
- **Responsive UI**: Mobile-first design with desktop enhancements
- **Data Caching**: Client-side caching for improved performance

## Architecture

```text
talent-calender/
├── components/           # React components
│   ├── talent-calendar-view.tsx    # Main calendar grid display
│   ├── talent-book-calendar.tsx    # Top-level calendar component
│   ├── talent-books.tsx            # Book display component
│   └── talents-table.tsx           # Alternative table view
├── hooks/                # Custom React hooks
│   └── useTalentCalendar.ts        # Calendar logic hook
├── stores/               # Zustand state management
│   └── useTalentBooksStore.ts      # Global talent books state
├── services/             # Data fetching
│   └── talentsFetch.ts             # Loads talent data from JSON
├── types/                # TypeScript definitions
│   └── index.ts                    # TalentBook, TalentBookCalendar types
├── constants/            # Constants
│   └── index.ts                    # Day names array
└── utils/                # Utility functions
```

## Core Concepts

### Data Model

**TalentBook**: Represents a character's talent book requirements

```typescript
type TalentBook = {
  name: string; // Character name
  bookName: string; // Book series name (e.g., "Freedom")
  philosophyUrl: string; // URL to Philosophy-tier book image
  teachingUrl: string; // URL to Teaching-tier book image
  guideUrl: string; // URL to Guide-tier book image
  dayOne: string; // First available day (e.g., "Monday")
  dayTwo: string; // Second available day (e.g., "Thursday")
};
```

**TalentBookCalendar**: Represents regional talent book schedule

```typescript
type TalentBookCalendar = {
  location: string; // Region name
  days: {
    day: string; // "Monday Tuesday" or "Wednesday Saturday"
    books: {
      // Available books on these days
      name: string;
      url: string;
    }[];
    characters: {
      // Characters farmable on these days
      name: string;
      url: string;
    }[];
  }[];
};
```

### State Management

The feature uses Zustand for global state:

```typescript
// Store structure
{
  calendar: TalentBookCalendar[] | null;      // All regional calendars
  talentCharMap: Record<string, TalentBook>;  // Character -> TalentBook mapping
  loading: boolean;                           // Fetch state
  error: string | null;                       // Error message
}
```

**Store Selectors** (prevent Zustand infinite loops):

```typescript
const calendar = useTalentCalendar(); // Get all calendars
const charMap = useTalentCharMap(); // Get character map
const loading = useTalentBooksLoading(); // Get loading state
const error = useTalentBooksError(); // Get error state
```

**Store Actions**:

```typescript
fetchBooks(checkCache?: boolean)  // Fetch talent data (cached by default)
setCalendar(calendar)             // Update calendar data
reset()                           // Reset to initial state
```

### Data Flow

1. **Initial Load**: Component calls `fetchBooks()` on mount
2. **Cache Check**: If data exists and `checkCache=true`, skip fetch
3. **Fetch Data**: Load from `dailyTalents.json` via `loadTalentsData()`
4. **Transform**: Convert to `TalentBookCalendar[]` format
5. **Map Creation**: Generate `talentCharMap` from calendar data
6. **Store Update**: Set calendar + charMap in Zustand store
7. **Render**: Components consume selectors and display UI

## Component Usage

### TalentBookCalendar (Primary)

Main component that displays the talent calendar for a specific region.

```typescript
import { TalentBookCalendar } from '@/features/talent-calender';

// In your component
<TalentBookCalendar
  nDays={7}           // Show next 7 days
  talent={calendar[0]} // Pass regional calendar data
/>
```

**Props**:

- `nDays`: Number of days to display (default: 7)
- `talent`: TalentBookCalendar object for a specific region

### TalentCalendarView

Low-level calendar grid component with custom styling.

```typescript
import { TalentCalendarView } from '@/features/talent-calender';

<TalentCalendarView
  nDays={14}
  talent={mondstadtCalendar}
/>
```

### TalentBooks

Displays a list of talent books with images.

```typescript
import { TalentBooks } from '@/features/talent-calender';

<TalentBooks
  books={[
    { name: "Teachings of Freedom", url: "/books/freedom-teaching.png" },
    { name: "Guide to Freedom", url: "/books/freedom-guide.png" }
  ]}
/>
```

## Hook Usage

### useTalentCalendar

Generates calendar data for the next N days based on regional schedule.

```typescript
import { useTalentCalendar } from '@/features/talent-calender';

function MyComponent({ talent }: { talent: TalentBookCalendar }) {
  const { calendar } = useTalentCalendar(7, talent);

  // calendar: Array of daily entries
  // [
  //   {
  //     date: "Mon Feb 10 2026",
  //     isSunday: false,
  //     currDay: "Monday",
  //     books: [...],
  //     characters: [...]
  //   },
  //   ...
  // ]
}
```

**Returns**:

- `calendar`: Array of daily schedule objects with:
  - `date`: Formatted date string
  - `isSunday`: Boolean flag for Sunday (all books available)
  - `currDay`: Day name (Monday, Tuesday, etc.)
  - `books`: Available books on this day
  - `characters`: Farmable characters on this day

## Data Source

Talent book data is loaded from `public/dailyTalents.json`:

```json
{
  "Mondstadt": [
    {
      "day": "Monday Thursday",
      "books": [...],
      "characters": [...]
    },
    ...
  ],
  "Liyue": [...],
  ...
}
```

**Service Layer**:

```typescript
import { loadTalentsData } from '@/features/talent-calender/services';

const { talentBooks } = await loadTalentsData(); // Cached after first call
```

## Character Talent Book Lookup

The `talentCharMap` provides O(1) lookup for character talent requirements:

```typescript
import { useTalentCharMap } from '@/features/talent-calender';

function CharacterTalentInfo({ characterName }: { characterName: string }) {
  const charMap = useTalentCharMap();
  const talentBook = charMap[characterName];

  if (!talentBook) return <div>No talent book data</div>;

  return (
    <div>
      <h3>{talentBook.name}</h3>
      <p>Book: {talentBook.bookName}</p>
      <p>Available: {talentBook.dayOne} and {talentBook.dayTwo}</p>
      <img src={talentBook.philosophyUrl} alt="Philosophy" />
    </div>
  );
}
```

## Best Practices

### Performance

- **Shared Data**: Use store selectors to avoid prop drilling
- **Memoization**: `useTalentCalendar` hook memoizes calendar calculation
- **Caching**: Talent data cached after first fetch (use `fetchBooks(false)` to force refresh)

### Zustand Selectors

**❌ BAD**: Inline fallback creates infinite loops

```typescript
const calendar = useTalentBooksStore((state) => state.calendar || []);
```

**✅ GOOD**: Use stable constants or selectors

```typescript
const calendar = useTalentCalendar(); // Pre-defined selector
```

### Sunday Handling

Sundays require special UI treatment since all books are available:

```typescript
{day.isSunday ? (
  <div>All books available</div>
) : (
  <TalentBooks books={day.books} />
)}
```

## Common Patterns

### Loading State

```typescript
import { useTalentBooksLoading, useTalentBooksError } from '@/features/talent-calender';

const loading = useTalentBooksLoading();
const error = useTalentBooksError();

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
```

### Multi-Region Display

```typescript
import { useTalentCalendar, TalentCalendarView } from '@/features/talent-calender';

function AllRegionCalendars() {
  const calendars = useTalentCalendar();

  if (!calendars) return null;

  return (
    <>
      {calendars.map(regional => (
        <div key={regional.location}>
          <h2>{regional.location}</h2>
          <TalentCalendarView nDays={7} talent={regional} />
        </div>
      ))}
    </>
  );
}
```

## Integration Example

```typescript
import { useEffect } from 'react';
import {
  useTalentBooksStore,
  useTalentCalendar,
  TalentBookCalendar
} from '@/features/talent-calender';

function TalentSchedulePage() {
  const fetchBooks = useTalentBooksStore(state => state.fetchBooks);
  const calendars = useTalentCalendar();

  useEffect(() => {
    fetchBooks(); // Load data on mount (cached automatically)
  }, [fetchBooks]);

  if (!calendars) return <div>Loading...</div>;

  return (
    <div>
      <h1>Talent Book Schedule</h1>
      {calendars.map(regional => (
        <TalentBookCalendar
          key={regional.location}
          nDays={7}
          talent={regional}
        />
      ))}
    </div>
  );
}
```

## Future Enhancements

- [ ] Notification system for daily talent book reminders
- [ ] Filter by character or book series
- [ ] Export calendar to iCal/Google Calendar
- [ ] Character talent priority tracking
- [ ] Material requirement calculator
