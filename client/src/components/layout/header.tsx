import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

import { RandomStickerAvatar } from './random-avatar';

interface AppHeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuClick,
  onSearchClick,
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex gap-4 px-4 justify-between items-center h-14 w-full">
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-6" />
        )}{' '}
        {/* Placeholder to keep spacing consistent on desktop */}
        <Button
          variant="outline"
          onClick={onSearchClick}
          aria-label="Open search"
        >
          <span className="text-muted-foreground">Search</span>
        </Button>
        {/* Spacer to push sticker to the right */}
        {/* <div className="flex-1" /> */}
        {/* Random sticker - visible on all devices */}
        <RandomStickerAvatar size="xs" />
      </div>
    </header>
  );
};
