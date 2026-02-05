import React, { useState } from 'react';

import { GlobalSearch } from '../global-search';
import { Sidebar } from './sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full w-full">
      <Sidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <GlobalSearch />

      <div className="flex flex-col flex-1 md:ml-16">
        <main className="flex-1 overflow-auto p-4 md:p-6 m-4">{children}</main>
      </div>
    </div>
  );
};
