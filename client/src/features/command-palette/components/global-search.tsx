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

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFloatingTrigger?: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showFloatingTrigger = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use controlled state if provided, fallback to internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

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
  }, [setOpen]);

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Mobile trigger button - only show if not controlled or explicitly requested */}
      {showFloatingTrigger && (
        <GlobalSearchTrigger onClick={() => setOpen(true)} />
      )}

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
