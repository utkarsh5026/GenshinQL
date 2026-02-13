import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { parseDurationString } from '../utils/date-parser';

export type EventStatus = 'active' | 'upcoming' | 'ended';

export interface EventCountdownResult {
  status: EventStatus;
  timeRemaining: number | null; // milliseconds
  formattedTime: string; // "2d 5h", "5h 30m", or "30m"
  isUrgent: boolean; // < 24 hours remaining
}

/**
 * Hook for tracking event countdown with status calculation.
 * Derives all state during render from current time - no cascading updates.
 *
 * @param duration - Event duration with start and end date strings
 * @returns Countdown state with status, time remaining, and formatted display
 */
export function useEventCountdown(duration: {
  start: string;
  end: string;
}): EventCountdownResult {
  // Store only current time - derive everything else during render
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parse dates once and memoize
  const startDate = useMemo(
    () => parseDurationString(duration.start),
    [duration.start]
  );
  const endDate = useMemo(
    () => parseDurationString(duration.end),
    [duration.end]
  );

  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    if (totalDays > 0) {
      const hours = totalHours % 24;
      return `${totalDays}d ${hours}h`;
    }

    if (totalHours > 0) {
      const minutes = totalMinutes % 60;
      return `${totalHours}h ${minutes}m`;
    }
    return `${totalMinutes}m`;
  }, []);

  // Effect ONLY manages interval - no state updates
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startDate && endDate && Date.now() < endDate.getTime()) {
      intervalRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startDate, endDate]);

  if (!startDate || !endDate) {
    return {
      status: 'ended',
      timeRemaining: null,
      formattedTime: '',
      isUrgent: false,
    };
  }

  const start = startDate.getTime();
  const end = endDate.getTime();

  let status: EventStatus;
  let timeRemaining: number | null;

  if (now < start) {
    // Event hasn't started yet - upcoming
    status = 'upcoming';
    timeRemaining = start - now;
  } else if (now >= start && now < end) {
    // Event is active
    status = 'active';
    timeRemaining = end - now;
  } else {
    // Event has ended
    status = 'ended';
    timeRemaining = null;
  }

  const formattedTime = timeRemaining !== null ? formatTime(timeRemaining) : '';
  const isUrgent =
    timeRemaining !== null && timeRemaining < 24 * 60 * 60 * 1000;

  return {
    status,
    timeRemaining,
    formattedTime,
    isUrgent,
  };
}
