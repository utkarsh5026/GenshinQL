import './App.css';
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSideBar, Layout } from './components/layout';
import {
  useWeaponMaterialStore,
  useTalentBooksStore,
  usePrimitivesStore,
} from '@/stores';
import { useAutoClearOldCache } from '@/hooks/useCacheManager';
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

  return (
    <SidebarProvider>
      <AppSideBar />
      <Layout>{routing}</Layout>
    </SidebarProvider>
  );
}

export default App;
