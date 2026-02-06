import { memo, useEffect, useState } from 'react';

import styles from './MemoryGame.module.css';

interface Particle {
  id: number;
  tx: number;
  ty: number;
  delay: number;
  size: number;
}

function generateParticles(type: 'exact' | 'character' | 'bomb'): Particle[] {
  const count = type === 'bomb' ? 12 : 10;
  return Array.from({ length: count }, (_, i) => {
    const angle = ((360 / count) * i + Math.random() * 30) * (Math.PI / 180);
    const distance = 25 + Math.random() * 25;
    return {
      id: i,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      delay: Math.random() * 50,
      size: type === 'bomb' ? 6 + Math.random() * 4 : 6 + Math.random() * 3,
    };
  });
}

interface MatchParticlesProps {
  position: { x: number; y: number };
  type: 'exact' | 'character' | 'bomb';
  onComplete: () => void;
}

export const MatchParticles = memo(function MatchParticles({
  position,
  type,
  onComplete,
}: MatchParticlesProps) {
  const [particles] = useState(() => generateParticles(type));

  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getTypeClass = () => {
    switch (type) {
      case 'exact':
        return styles.particleExact;
      case 'character':
        return styles.particleCharacter;
      case 'bomb':
        return styles.particleBomb;
    }
  };

  return (
    <div
      className={`${styles.particleContainer} ${getTypeClass()}`}
      style={{ left: position.x, top: position.y }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={
            {
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              animationDelay: `${p.delay}ms`,
              width: p.size,
              height: p.size,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
});
