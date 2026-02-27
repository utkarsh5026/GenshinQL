import { Suspense, useEffect, useState, useTransition } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';

import { usePrimitivesStore, useWeaponsStore } from '@/stores';

import ErrorBoundary from './components/ErrorBoundary';
import { Layout } from './components/layout';
import { NavigationProgress } from './components/layout/navigation-progress';
import { RouteLoadingFallback } from './components/utils/RouteLoadingFallback';
import { useAutoClearOldCache } from './features/cache';
import {
  useTalentBooksStore,
  useWeaponMaterialStore,
} from './features/calendar';
import { useCharactersStore } from './features/characters';
import { routes } from './routes';
import { useStickerStore } from './stores/useStickerStore';

function App() {
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [displayLocation, setDisplayLocation] = useState(location);

  const { fetchPrimitives } = usePrimitivesStore();
  const { fetchWeaponMaterials } = useWeaponMaterialStore();
  const { fetchBooks } = useTalentBooksStore();
  const { fetchWeapons } = useWeaponsStore();
  const { fetchCharacters } = useCharactersStore();
  const { fetchStickers } = useStickerStore();

  useAutoClearOldCache(7);

  useEffect(() => {
    const loadData = async () => {
      await Promise.allSettled([
        fetchPrimitives(),
        fetchWeapons(),
        fetchBooks(),
        fetchCharacters(),
        fetchStickers(),
      ]);
      await fetchWeaponMaterials();
    };

    loadData();
  }, [
    fetchPrimitives,
    fetchWeapons,
    fetchWeaponMaterials,
    fetchBooks,
    fetchCharacters,
    fetchStickers,
  ]);

  /**
   * Defer location updates inside startTransition so React keeps rendering
   * the current route until the new lazy chunk is fully ready — no blank flash.
   * isPending drives the NavigationProgress bar.
   */
  useEffect(() => {
    startTransition(() => {
      setDisplayLocation(location);
    });
  }, [location, startTransition]);

  const routing = useRoutes(routes, displayLocation);

  return (
    <ErrorBoundary>
      <Layout>
        <NavigationProgress isPending={isPending} />
        <Suspense fallback={<RouteLoadingFallback />}>{routing}</Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
