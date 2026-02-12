import { useEffect, useRef, useState } from 'react';

type WallpaperManifest = Record<string, string[]>;

let manifestCache: WallpaperManifest | null = null;
let manifestPromise: Promise<WallpaperManifest> | null = null;

function fetchManifest(): Promise<WallpaperManifest> {
  if (manifestCache) return Promise.resolve(manifestCache);
  if (manifestPromise) return manifestPromise;

  manifestPromise = fetch('/images/wallpapers/manifest.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch wallpaper manifest`);
      return res.json() as Promise<WallpaperManifest>;
    })
    .then((data) => {
      manifestCache = data;
      return data;
    })
    .catch(() => {
      manifestPromise = null;
      return {} as WallpaperManifest;
    });

  return manifestPromise;
}

function pickRandom(images: string[]): string | undefined {
  if (images.length === 0) return undefined;
  return `/${images[Math.floor(Math.random() * images.length)]}`;
}

/**
 * Returns a random banner image URL from the given wallpaper category.
 * The image is picked once on mount and stays stable for the component's lifetime.
 * Returns `undefined` while loading or if the category has no images.
 */
export function useRandomBanner(
  category: string,
  fallback?: string
): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => {
    if (manifestCache) {
      return pickRandom(manifestCache[category] ?? []) ?? fallback;
    }
    return fallback;
  });

  const pickedRef = useRef(!!manifestCache);

  useEffect(() => {
    if (pickedRef.current) return;

    fetchManifest().then((manifest) => {
      if (!pickedRef.current) {
        pickedRef.current = true;
        const picked = pickRandom(manifest[category] ?? []);
        setUrl(picked ?? fallback);
      }
    });
  }, [category, fallback]);

  return url;
}
