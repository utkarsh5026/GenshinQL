# Development Guide

This document provides detailed information about the GenshinQL architecture, tech stack, and development patterns.

## Architecture Overview

GenshinQL is a **frontend-only React application** that serves as a comprehensive information hub for Genshin Impact. The application uses static JSON data generated from web scraping and stores assets on Cloudflare R2.

### High-Level Architecture

```
┌─────────────────┐
│  Web Scraping   │ (Selenium WebDriver)
│    Scripts      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Static JSON    │ (/client/public/)
│    Data Files   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Stores  │ (State Management)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Components│ (UI Layer)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Vercel      │ (Deployment)
└─────────────────┘

External:
┌─────────────────┐
│ Cloudflare R2   │ (Asset Storage)
└─────────────────┘
```

## Tech Stack

### Core Technologies

- **React 18.3.1** - UI library with hooks and functional components
- **TypeScript 5.6.3** - Static typing and improved developer experience
- **Vite 5.4.8** - Fast build tool and development server
- **React Router v7.13.0** - Client-side routing

### State Management

- **Zustand 5.0.10** - Lightweight state management library
  - No boilerplate
  - Simple API
  - Built-in TypeScript support
  - DevTools integration

### Styling

- **Tailwind CSS 3.4.14** - Utility-first CSS framework
  - Custom Genshin-themed colors
  - Custom animations (woosh, shimmer, float, glow)
  - Dark mode support
- **Radix UI** - Accessible component primitives
  - Avatar, Dialog, Popover, Tabs, Tooltip, etc.
- **shadcn/ui** - Pre-built accessible components
  - Built on Radix UI
  - Fully customizable
- **Framer Motion 11.11.11** - Animation library

### Build & Development Tools

- **ESLint 9.11.1** - Code linting
- **Prettier 3.3.3** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files
- **commitlint** - Enforce conventional commits

### External Services

- **Cloudflare R2** - S3-compatible object storage for images/videos
- **Vercel** - Serverless deployment platform

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── characters/      # Character-specific components
│   │   ├── gdle/            # Guesser game components
│   │   ├── tierlist/        # Tier list builder
│   │   ├── ui/              # shadcn/ui components
│   │   └── weapons/         # Weapon components
│   ├── stores/              # Zustand state stores
│   │   ├── useCharactersStore.ts
│   │   ├── useWeaponsStore.ts
│   │   ├── useTalentBooksStore.ts
│   │   ├── useWeaponMaterialStore.ts
│   │   ├── useGenshinGuesserStore.ts
│   │   └── usePrimitivesStore.ts
│   ├── services/            # Data fetching services
│   ├── routes/              # Page components
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Library utilities
│   └── assets/              # Static assets
├── scripts/                 # Data scraping scripts
│   ├── scrape/              # Individual scrapers
│   │   ├── characters.ts
│   │   ├── weapons.ts
│   │   ├── talents.ts
│   │   ├── gallery.ts
│   │   └── primitives.ts
│   ├── r2/                  # Cloudflare R2 utilities
│   └── consolidate.ts       # Data consolidation
├── public/                  # Served static files
│   ├── characters/          # Individual character JSON
│   ├── characters.json      # All characters
│   ├── weapons.json         # All weapons
│   ├── dailyTalents.json    # Talent schedules
│   └── primitives.json      # Game constants
└── Dockerfile              # Container configuration
```

## State Management with Zustand

### Store Pattern

Each Zustand store follows this pattern:

```typescript
import { create } from 'zustand';

interface StoreState {
  // State
  data: DataType[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchData: (useCache?: boolean) => Promise<void>;
  reset: () => void;
}

export const useDataStore = create<StoreState>((set, get) => ({
  // Initial state
  data: [],
  loading: false,
  error: null,

  // Actions
  fetchData: async (useCache = true) => {
    if (useCache && get().data.length > 0) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch('/data/endpoint.json');
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  reset: () => set({ data: [], loading: false, error: null }),
}));
```

### Available Stores

1. **useCharactersStore** - Character data with caching
2. **useWeaponsStore** - Weapon data and filtering
3. **useTalentBooksStore** - Daily talent material schedules
4. **useWeaponMaterialStore** - Weapon ascension schedules
5. **useGenshinGuesserStore** - Game logic for guessing game
6. **usePrimitivesStore** - Game constants (elements, regions, weapon types)

## Data Flow

### 1. Data Scraping

```
Selenium WebDriver → Parse HTML → Extract Data → Validate → Save JSON
```

Scripts use Selenium to:
- Navigate to Genshin wikis
- Extract character/weapon/talent data
- Download media assets
- Generate structured JSON

### 2. Asset Management

```
Download Image → Hash URL → Check R2 → Upload if New → Return Public URL
```

Cloudflare R2 features:
- Deduplication via URL hashing
- Public CDN URLs
- Free tier: 10GB storage, unlimited bandwidth

### 3. Application Data Flow

```
User Opens App → Store Checks Cache → Fetch JSON → Update State → Render UI
```

Data is:
- Fetched from `/public` directory
- Cached in Zustand stores
- Persisted in localStorage (where applicable)
- Validated with Zod schemas

## Styling Guidelines

### Tailwind CSS

**Utility-First Approach:**
```tsx
<div className="flex items-center gap-4 rounded-lg bg-primary p-4">
  <Avatar className="h-12 w-12" />
  <h2 className="text-xl font-bold">Character Name</h2>
</div>
```

**Custom Theme:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gold: { /* Genshin gold palette */ },
        purple: { /* Genshin purple palette */ },
        // ...
      },
      keyframes: {
        woosh: { /* custom animation */ },
        shimmer: { /* custom animation */ },
      },
    },
  },
};
```

**Responsive Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Component Composition

Use shadcn/ui components as building blocks:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export function CharacterCard({ character }) {
  return (
    <Card>
      <CardHeader>
        <Avatar>
          <AvatarImage src={character.icon} />
        </Avatar>
        <CardTitle>{character.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

## Common Development Tasks

### Adding a New Route

1. **Create route component:**
   ```tsx
   // src/routes/NewFeature.tsx
   export function NewFeature() {
     return <div>New Feature</div>;
   }
   ```

2. **Add to router:**
   ```tsx
   // src/routes/index.tsx
   import { NewFeature } from './NewFeature';

   export const routes = [
     // ...
     { path: '/new-feature', element: <NewFeature /> },
   ];
   ```

3. **Update navigation** (if needed)

### Creating a New Component

1. **Create component file:**
   ```tsx
   // src/components/feature/MyComponent.tsx
   interface MyComponentProps {
     title: string;
     description?: string;
   }

   export function MyComponent({ title, description }: MyComponentProps) {
     return (
       <div className="rounded-lg border p-4">
         <h3 className="text-lg font-semibold">{title}</h3>
         {description && <p className="text-sm text-muted-foreground">{description}</p>}
       </div>
     );
   }
   ```

2. **Export from index:**
   ```tsx
   // src/components/feature/index.ts
   export * from './MyComponent';
   ```

### Adding a Zustand Store

1. **Create store file:**
   ```tsx
   // src/stores/useMyStore.ts
   import { create } from 'zustand';

   interface MyStoreState {
     items: Item[];
     fetchItems: () => Promise<void>;
   }

   export const useMyStore = create<MyStoreState>((set) => ({
     items: [],
     fetchItems: async () => {
       const response = await fetch('/data/items.json');
       const items = await response.json();
       set({ items });
     },
   }));
   ```

2. **Use in component:**
   ```tsx
   import { useMyStore } from '@/stores/useMyStore';

   function MyComponent() {
     const { items, fetchItems } = useMyStore();

     useEffect(() => {
       fetchItems();
     }, [fetchItems]);

     return <div>{/* Render items */}</div>;
   }
   ```

### Scraping New Data

1. **Create scraper:**
   ```tsx
   // client/scripts/scrape/newData.ts
   import { Builder, By } from 'selenium-webdriver';
   import chrome from 'selenium-webdriver/chrome';

   async function scrapeNewData() {
     const driver = await new Builder()
       .forBrowser('chrome')
       .setChromeOptions(new chrome.Options().headless())
       .build();

     try {
       await driver.get('https://source-url.com');
       // Scrape logic
       const data = await extractData(driver);
       return data;
     } finally {
       await driver.quit();
     }
   }
   ```

2. **Add to package.json:**
   ```json
   "scripts": {
     "scrape:new": "npx tsx scripts/scrape/newData.ts"
   }
   ```

## Performance Optimization

### Code Splitting

Vite automatically code-splits with manual chunks defined in [vite.config.ts](client/vite.config.ts:414-430):

- `react-vendor`: React, React DOM, React Router
- `ui-vendor`: All Radix UI components
- `framer`: Framer Motion
- `utils`: Utility libraries (clsx, tailwind-merge, CVA)

### Image Optimization

- Use Cloudflare R2 CDN for images
- Lazy load images with `loading="lazy"`
- Use appropriate image sizes

### Data Caching

- Zustand stores cache fetched data
- LocalStorage for user preferences
- Auto-cleanup of stale cache entries

## Debugging

### React DevTools

Install [React DevTools](https://react.dev/learn/react-developer-tools) browser extension to inspect:
- Component hierarchy
- Props and state
- Performance profiling

### Zustand DevTools

Enable Zustand devtools in development:

```tsx
import { devtools } from 'zustand/middleware';

export const useMyStore = create(
  devtools((set) => ({
    // store implementation
  }), { name: 'MyStore' })
);
```

### Vite Dev Server

- **Hot Module Replacement** - Changes reflect instantly
- **Error Overlay** - Build errors shown in browser
- **Source Maps** - Debug original TypeScript

## Useful Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Production build
npm run preview              # Preview production build

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run format               # Format with Prettier
npm run format:check         # Check formatting
npm run validate             # Run all checks
npm run ci:check             # Full CI validation

# Analysis
npm run build:analyze        # Bundle size analysis

# Scraping
npm run scrape:all           # Scrape all data
npm run scrape:characters    # Scrape characters only
npm run scrape:weapons       # Scrape weapons only
npm run scrape:talents       # Scrape talents only
npm run scrape:gallery       # Scrape gallery media
```

## Additional Resources

- [Contributing Guide](./CONTRIBUTING.md)
- [CI/CD Documentation](./CI_CD.md)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

---

Happy coding! 🚀
