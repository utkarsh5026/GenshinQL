import { useEffect, useRef, useState } from 'react';

interface Props {
  isPending: boolean;
}

type Phase = 'idle' | 'enter' | 'running' | 'done';

/**
 * Thin top progress bar that appears during lazy route transitions.
 *
 * Phase lifecycle:
 *  idle → enter (width 0, no transition) → running (crawls to 75% over 8s)
 *  → done (snaps to 100%, fades out) → idle
 *
 * Using a phase machine avoids reading computed CSS width when completing.
 */
export const NavigationProgress = ({ isPending }: Props) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isPending) {
      activeRef.current = true;
      /** Double-rAF: first frame sets width 0 (enter), second triggers the crawl transition */
      requestAnimationFrame(() => {
        setPhase('enter');
        requestAnimationFrame(() => setPhase('running'));
      });
    } else if (activeRef.current) {
      activeRef.current = false;
      requestAnimationFrame(() => {
        setPhase('done');
        timerRef.current = setTimeout(() => setPhase('idle'), 400);
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPending]);

  if (phase === 'idle') return null;

  const width = phase === 'enter' ? '0%' : phase === 'running' ? '75%' : '100%';

  const opacity = phase === 'done' ? 0 : 1;

  const transition =
    phase === 'running'
      ? 'width 8s cubic-bezier(0.04, 0.8, 0.15, 1)'
      : phase === 'done'
        ? 'width 0.15s ease-out, opacity 0.25s ease 0.15s'
        : 'none';

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-1 bg-celestial-600"
      style={{
        width,
        opacity,
        transition,
        willChange: 'width',
        boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)',
      }}
    />
  );
};
