# Cache Feature

## Overview

Comprehensive caching system providing persistent browser storage for assets and data using IndexedDB.

**Two Caching Strategies:**

1. **Asset Caching** - Images/videos with blob storage
2. **Data Caching** - JSON data with stale-while-revalidate pattern

**Features:** Persistent storage, lazy loading, automatic cache management, memory-safe blob URLs, TypeScript support

## Installation

```typescript
import {
  // Components
  CachedImage,
  CachedVideo,
  // Hooks
  useCachedAsset,
  useCachedAssets,
  useLazyCachedAsset,
  usePreloadAssets,
  useCacheManager,
  useAutoClearOldCache,
  // Services & Utils
  fetchWithCache,
  assetCache,
  fetchAndCacheAsset,
  preloadAssets,
} from '@/features/cache';
```

---

## Components

### CachedImage

Image component with automatic IndexedDB caching, lazy loading, and skeleton states.

```tsx
<CachedImage
  src={character.icon}
  alt={character.name}
  lazy={true} // Enable lazy loading
  rootMargin="200px" // Load trigger distance
  showSkeleton={true} // Show loading skeleton
  skeletonShape="circle" // circle | rounded | square
  skeletonSize="md" // sm | md | lg
  fallback="/placeholder.png" // Fallback image
  className="w-20 h-20"
/>
```

### CachedVideo

Video component with automatic caching.

```tsx
<CachedVideo src={character.burstAnimation} autoPlay loop muted lazy={true} />
```

---

## Hooks

### useCachedAsset

```typescript
const cachedUrl = useCachedAsset(url: string | null): string
```

Returns blob URL for single cached asset.

### useCachedAssets

```typescript
const [icon, art, burst] = useCachedAssets([url1, url2, url3]): string[]
```

Batch cache multiple assets.

### useLazyCachedAsset

```typescript
const { url, isLoading, isError } = useLazyCachedAsset(url, shouldLoad: boolean)
```

Lazy loading with loading/error states.

### usePreloadAssets

```typescript
usePreloadAssets([url1, url2, url3], enabled?: boolean): void
```

Preload assets in background without displaying.

### useCacheManager

```typescript
const {
  stats: { count, sizeInMB },
  isLoading,
  refreshStats,
  clearCache,
  clearOldAssets,
  deleteAsset,
} = useCacheManager();
```

Manage cache with statistics and cleanup functions.

### useAutoClearOldCache

```typescript
useAutoClearOldCache(maxAgeInDays?: number): void
```

Auto-clear old assets on mount (default: 7 days).

---

## Services

### fetchWithCache - Stale-While-Revalidate

```typescript
const result = await fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  onUpdate?: (newData: T) => void
): Promise<{ data: T; fromCache: boolean; backgroundUpdate?: Promise<boolean> }>
```

**Flow:** Returns cached data instantly → Revalidates in background → Calls `onUpdate` if changed

**Example:**

```typescript
const result = await fetchWithCache(
  'characters-v1',
  () => fetch('/api/characters').then((r) => r.json()),
  (freshData) => setCharacters(freshData)
);
```

### Other Data Cache Methods

```typescript
getCached<T>(key: string): Promise<CacheEntry<T> | null>
setCached<T>(key: string, data: T): Promise<void>
clearAllCache(): Promise<void>
```

---

## Utils

### assetCache - Asset Management

```typescript
assetCache.get(url: string): Promise<string | null>
assetCache.set(url: string, blob: Blob, type: string): Promise<void>
assetCache.has(url: string): Promise<boolean>
assetCache.delete(url: string): Promise<void>
assetCache.clear(): Promise<void>
assetCache.getCacheStats(): Promise<{ count, size, sizeInMB }>
```

### Utility Functions

```typescript
// Fetch and cache single asset
const blobUrl = await fetchAndCacheAsset(url: string): Promise<string>

// Preload multiple assets
await preloadAssets(urls: string[]): Promise<void>

// Clear assets older than maxAge (default: 7 days)
await clearOldCache(maxAge?: number): Promise<void>
```

---

## Best Practices

**1. Lazy Load Off-Screen Assets**

```tsx
<CachedImage src={character.icon} lazy={true} rootMargin="200px" />
```

**2. Preload on Hover**

```tsx
<div onMouseEnter={() => preloadAssets([character.gachaArt, ...talents])}>
  <CharacterCard />
</div>
```

**3. Batch Requests**

```tsx
// ✅ Good - Batch
const [icon, art, burst] = useCachedAssets([url1, url2, url3]);

// ❌ Bad - Individual
const icon = useCachedAsset(url1);
const art = useCachedAsset(url2);
```

**4. Auto-Cleanup on Startup**

```tsx
function App() {
  useAutoClearOldCache(7); // Clear 7+ day old assets
  return <AppContent />;
}
```

**5. Stale-While-Revalidate for Data**

```typescript
fetchWithCache('data-v1', fetchFn, (fresh) => updateState(fresh));
```

**6. Provide Fallbacks**

```tsx
<CachedImage src={url} fallback="/placeholder.png" />
```

---

## Performance Notes

**IndexedDB:** 50-80% of available disk space, all operations async

**Memory Management:** Blob URLs auto-revoked on unmount, video cleanup includes pause/reset

**Cache Size:** Monitor with `useCacheManager`, auto-clear old assets to prevent bloat

**Network:** Stale-while-revalidate returns cached instantly, only triggers re-render on actual data changes

---

## Architecture

**Asset Cache DB:** `GenshinAssetCache` → Store: `assets` → Key: `url` → Value: `{url, blob, timestamp, type}`

**Data Cache DB:** `genshin-cache` → Store: `data-cache` → Key: `key` → Value: `{key, data, timestamp, hash}`

---

## Troubleshooting

**Cache not working?** Check DevTools → Application → IndexedDB for `GenshinAssetCache` and `genshin-cache`

**Cache too large?** `useCacheManager().clearOldAssets(7)` or auto-cleanup with `useAutoClearOldCache(7)`

**Stale data?** Ensure `onUpdate` callback is provided to `fetchWithCache`

**Memory leaks?** Components handle cleanup automatically; manual usage requires `URL.revokeObjectURL(blobUrl)`

---

## Related Documentation

- [ASSET_CACHING_GUIDE.md](../../../../ASSET_CACHING_GUIDE.md) - Implementation guide
- [MEMORY.md](../../../../../memory/MEMORY.md) - Performance lessons
