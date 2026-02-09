import { useCallback, useEffect, useRef, useState } from 'react';

export function useTurnTimer(
  turnStartTime: number | null,
  timeLimit: number,
  onExpire: () => void,
  isProcessing: boolean
) {
  const [timeRemaining, setTimeRemaining] = useState(() => timeLimit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isInactive = !turnStartTime || isProcessing;

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isInactive) {
      return;
    }

    const updateTime = () => {
      const elapsed = Date.now() - turnStartTime;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        onExpire();
      }
    };

    updateTime();
    intervalRef.current = setInterval(updateTime, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [turnStartTime, timeLimit, onExpire, isInactive]);
  const displayTime = isInactive ? timeLimit : timeRemaining;

  const progress = displayTime / timeLimit;
  const isUrgent = displayTime <= 3000 && displayTime > 1000;
  const isCritical = displayTime <= 1000;

  const formatSeconds = useCallback((ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return seconds.toString();
  }, []);

  return {
    timeRemaining: displayTime,
    formattedTime: formatSeconds(displayTime),
    progress,
    isUrgent,
    isCritical,
  };
}
