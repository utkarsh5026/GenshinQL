import { Aperture, CalendarDays } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  isCalendar: boolean;
  onToggle: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  isCalendar,
  onToggle,
}) => {
  return (
    <div className="w-full flex justify-end my-3 md:my-5">
      <Button
        className="bg-success-200 text-success-900 border-2 text-xs md:text-sm h-9 md:h-10"
        onClick={onToggle}
      >
        <div className="flex gap-1.5 md:gap-2">
          {isCalendar ? (
            <CalendarDays size={16} className="md:w-5 md:h-5" />
          ) : (
            <Aperture size={16} className="md:w-5 md:h-5" />
          )}
          <div className="hidden sm:block">
            {isCalendar ? 'Switch to Table' : 'Switch to Calendar'}
          </div>
          <div className="sm:hidden">{isCalendar ? 'Table' : 'Calendar'}</div>
        </div>
      </Button>
    </div>
  );
};
