import { Search } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface GlobalSearchTriggerProps {
  onClick: () => void;
}

const GlobalSearchTrigger: React.FC<GlobalSearchTriggerProps> = ({
  onClick,
}) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
      aria-label="Open search"
    >
      <Search className="h-6 w-6" />
    </Button>
  );
};

export default GlobalSearchTrigger;
