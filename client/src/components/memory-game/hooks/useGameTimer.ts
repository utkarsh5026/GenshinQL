import { useCallback, useEffect, useState } from 'react';

export function useGameTimer(
  startTime: number | null,
  endTime: number | null,
  timeLimit: number | null = null
) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      return;
    }

    if (endTime) {
      return;
    }

    const updateElapsed = () => {
      setElapsed(Date.now() - startTime);
    };

    // Initialize immediately
    updateElapsed();

    const interval = setInterval(updateElapsed, 100);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  // Compute elapsed time based on startTime and endTime
  const computedElapsed = !startTime
    ? 0
    : endTime
      ? endTime - startTime
      : elapsed;

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate time remaining for countdown mode
  const timeRemaining = timeLimit
    ? Math.max(0, timeLimit - computedElapsed)
    : null;
  const isExpired = timeRemaining !== null && timeRemaining <= 0;

  return {
    elapsed: computedElapsed,
    formattedTime: formatTime(computedElapsed),
    timeRemaining,
    formattedTimeRemaining:
      timeRemaining !== null ? formatTime(timeRemaining) : null,
    isExpired,
  };
}
