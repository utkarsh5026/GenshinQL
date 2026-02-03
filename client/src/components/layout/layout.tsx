import React, { useState } from 'react';

import { AppHeader } from './header';
import { Sidebar } from './sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <Sidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      <div className="flex flex-col flex-1 md:ml-16">
        <AppHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
