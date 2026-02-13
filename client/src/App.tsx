import { Suspense, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

import { usePrimitivesStore, useWeaponsStore } from '@/stores';

import ErrorBoundary from './components/ErrorBoundary';
import { Layout } from './components/layout';
import { RouteLoadingFallback } from './components/utils/RouteLoadingFallback';
import { useAutoClearOldCache } from './features/cache';
import {
  useTalentBooksStore,
  useWeaponMaterialStore,
} from './features/calendar';
import { useCharactersStore } from './features/characters';
import { routes } from './routes';

function App() {
  const { fetchPrimitives } = usePrimitivesStore();
  const { fetchWeaponMaterials } = useWeaponMaterialStore();
  const { fetchBooks } = useTalentBooksStore();
  const { fetchWeapons } = useWeaponsStore();
  const { fetchCharacters } = useCharactersStore();

  useAutoClearOldCache(7);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPrimitives(),
        fetchWeapons(),
        fetchBooks(),
        fetchCharacters(),
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
  ]);

  const routing = useRoutes(routes);

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Layout>{routing}</Layout>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
