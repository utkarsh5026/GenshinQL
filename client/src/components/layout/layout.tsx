import React, { useState } from 'react';

import { GlobalSearch } from '@/features/command-palette';

import { AppHeader } from './header';
import { Sidebar } from './sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-full w-full">
      <Sidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        showFloatingTrigger={false}
      />

      <div className="flex flex-col flex-1 md:ml-16">
        <AppHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 m-4">{children}</main>
      </div>
    </div>
  );
};
