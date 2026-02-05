import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

import { useAutoClearOldCache } from '@/hooks/useCacheManager';
import {
  useCharactersStore,
  usePrimitivesStore,
  useTalentBooksStore,
  useWeaponMaterialStore,
  useWeaponsStore,
} from '@/stores';

import ErrorBoundary from './components/ErrorBoundary';
import { Layout } from './components/layout';
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
      <Layout>{routing}</Layout>
    </ErrorBoundary>
  );
}

export default App;
