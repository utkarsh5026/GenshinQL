import { Aperture, CalendarDays } from 'lucide-react';
import React from 'react';

import { GenshinButton } from '@/components/ui/genshin-button';

interface ViewToggleProps {
  isCalendar: boolean;
  onToggle: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  isCalendar,
  onToggle,
}) => {
  const icon = isCalendar ? (
    <CalendarDays size={16} className="md:w-5 md:h-5" />
  ) : (
    <Aperture size={16} className="md:w-5 md:h-5" />
  );

  return (
    <div className="w-full flex justify-end my-3 md:my-5">
      <GenshinButton
        leftIcon={icon}
        size="sm"
        variant="secondary"
        onClick={onToggle}
      >
        <span className="hidden sm:inline">
          {isCalendar ? 'Switch to Table' : 'Switch to Calendar'}
        </span>
        <span className="sm:hidden">{isCalendar ? 'Table' : 'Calendar'}</span>
      </GenshinButton>
    </div>
  );
};
