import './App.css';
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSideBar } from './components/layout';
import { useWeaponMaterialStore, useTalentBooksStore } from '@/stores';
import { useAutoClearOldCache } from '@/hooks/useCacheManager';
import { routes } from './routes';

function App() {
  const { fetchWeaponMaterials } = useWeaponMaterialStore();
  const { fetchBooks } = useTalentBooksStore();

  useAutoClearOldCache(7);

  useEffect(() => {
    Promise.all([fetchWeaponMaterials(), fetchBooks()]);
  }, [fetchWeaponMaterials, fetchBooks]);

  const routing = useRoutes(routes);

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="items-center justify-center w-full h-full">
        {routing}
      </main>
    </SidebarProvider>
  );
}

export default App;
