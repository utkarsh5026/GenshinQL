import './App.css';

import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

import { useAutoClearOldCache } from '@/hooks/useCacheManager';
import {
  usePrimitivesStore,
  useTalentBooksStore,
  useWeaponMaterialStore,
} from '@/stores';

import { Layout } from './components/layout';
import { routes } from './routes';

function App() {
  const { fetchPrimitives } = usePrimitivesStore();
  const { fetchWeaponMaterials } = useWeaponMaterialStore();
  const { fetchBooks } = useTalentBooksStore();

  useAutoClearOldCache(7);

  useEffect(() => {
    Promise.all([fetchPrimitives(), fetchWeaponMaterials(), fetchBooks()]);
  }, [fetchPrimitives, fetchWeaponMaterials, fetchBooks]);

  const routing = useRoutes(routes);

  return <Layout>{routing}</Layout>;
}

export default App;
