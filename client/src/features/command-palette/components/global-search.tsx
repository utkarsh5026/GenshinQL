import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

import GlobalSearchContent from './global-search-content';
import GlobalSearchTrigger from './global-search-trigger';

const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'k') ||
        (e.ctrlKey && e.key === '/')
      ) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Mobile trigger button */}
      <GlobalSearchTrigger onClick={() => setOpen(true)} />

      {/* Desktop: Dialog */}
      {!isMobile && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
            <GlobalSearchContent onSelect={handleClose} />
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile: Drawer */}
      {isMobile && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[92vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Search</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <GlobalSearchContent onSelect={handleClose} isMobile />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default GlobalSearch;
