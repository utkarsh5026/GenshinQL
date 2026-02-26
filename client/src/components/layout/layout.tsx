import React, { useState } from 'react';

import { GlobalSearch } from '@/features/command-palette';

import { AppHeader } from './header';
import { Sidebar } from './sidebar';
import { useSidebarStore } from './useSidebarStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isPinned } = useSidebarStore();

  return (
    <div className="flex h-full w-full">
      <Sidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        showFloatingTrigger={false}
      />

      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isPinned ? 'md:ml-60' : 'md:ml-16'
        }`}
      >
        <AppHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
        <main className="flex-1 w-full h-full overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        <footer className="w-full py-2 text-center text-[11px] text-muted-foreground/30 border-t border-border/10">
          made with ♥ by{' '}
          <a
            href="https://github.com/utkarsh5026/GenshinQL"
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-muted-foreground/50 transition-colors"
          >
            Utkarsh Priyadarshi
          </a>
        </footer>
      </div>
    </div>
  );
};
