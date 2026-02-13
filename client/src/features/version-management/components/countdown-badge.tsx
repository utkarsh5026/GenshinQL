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
      <div className="inline-flex items-center gap-2 rounded-lg border border-success-500/30 bg-success-900/50 px-3 py-1.5 text-sm font-semibold text-success-200 backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-success-400" />
        <span>{compact ? countdown : `Active · Ends in ${countdown}`}</span>
      </div>
    );
  }

  if (status === 'upcoming') {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-info-500/30 bg-info-900/50 px-3 py-1.5 text-sm font-semibold text-info-200 backdrop-blur-sm">
        <Clock className="h-3.5 w-3.5" />
        <span>{compact ? countdown : `Starts in ${countdown}`}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-midnight-600/30 bg-midnight-800/50 px-3 py-1.5 text-sm font-semibold text-midnight-300 backdrop-blur-sm">
      <span>Ended</span>
    </div>
  );
}
