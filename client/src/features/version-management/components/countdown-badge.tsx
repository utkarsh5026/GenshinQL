import { Clock } from 'lucide-react';

import type { EventStatus } from '../hooks/useEventCountdown';

interface CountdownBadgeProps {
  status: EventStatus;
  countdown: string | null;
  compact?: boolean;
}

export default function CountdownBadge({
  status,
  countdown,
  compact = false,
}: CountdownBadgeProps) {
  if (status === 'active') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-success-500/30 bg-success-900/50 px-2.5 py-1 text-xs font-semibold text-success-200 backdrop-blur-sm md:gap-2 md:px-3 md:py-1.5 md:text-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400 md:h-2 md:w-2" />
        <span>{compact ? countdown : `Active · Ends in ${countdown}`}</span>
      </div>
    );
  }

  if (status === 'upcoming') {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-info-500/30 bg-info-900/50 px-2.5 py-1 text-xs font-semibold text-info-200 backdrop-blur-sm md:gap-2 md:px-3 md:py-1.5 md:text-sm">
        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
        <span>{compact ? countdown : `Starts in ${countdown}`}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-midnight-600/30 bg-midnight-800/50 px-2.5 py-1 text-xs font-semibold text-midnight-300 backdrop-blur-sm md:gap-2 md:px-3 md:py-1.5 md:text-sm">
      <span>Ended</span>
    </div>
  );
}
