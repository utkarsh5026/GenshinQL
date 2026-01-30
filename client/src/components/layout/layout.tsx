import React from 'react';

import { AppHeader } from './header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      <AppHeader />
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
};
