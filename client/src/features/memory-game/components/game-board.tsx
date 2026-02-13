import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { GameDifficulty } from '@/types';

import {
  useMemoryGameCombo,
  useMemoryGameDifficulty,
  useMemoryGameIsPeeking,
  useMemoryGameScoreEvents,
  useMemoryGameStore,
  useMemoryGameTiles,
} from '../stores';
import { ComboIndicator } from './combo-indicator';
import { MatchParticles } from './match-particles';
import { MemoryTile } from './memory-tile';
import styles from './MemoryGame.module.css';
import { ScorePopup } from './score-popup';

const GRID_CONFIG: Record<GameDifficulty, { cols: number; rows: number }> = {
  easy: { cols: 3, rows: 4 },
  medium: { cols: 4, rows: 4 },
  hard: { cols: 6, rows: 4 },
  expert_wide: { cols: 8, rows: 4 },
  expert_square: { cols: 6, rows: 6 },
};

interface ParticleEffect {
  id: string;
  position: { x: number; y: number };
  type: 'exact' | 'character' | 'bomb';
}

export const GameBoard = memo(function GameBoard() {
  const tiles = useMemoryGameTiles();
  const difficulty = useMemoryGameDifficulty();
  const isPeeking = useMemoryGameIsPeeking();
  const currentCombo = useMemoryGameCombo();
  const scoreEvents = useMemoryGameScoreEvents();
  const flipTile = useMemoryGameStore((state) => state.flipTile);
  const removeScoreEvent = useMemoryGameStore(
    (state) => state.removeScoreEvent
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(80);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  // Track previous matches to trigger particles
  const prevMatchCountRef = useRef(0);

  useEffect(() => {
    const calculateTileSize = () => {
      const config = GRID_CONFIG[difficulty];
      const availableHeight = window.innerHeight - 220;
      const padding = 32;
      const gaps = (config.rows - 1) * 8;
      const maxTileHeight = (availableHeight - padding - gaps) / config.rows;

      const baseWidth = difficulty.startsWith('expert') ? 900 : 800;
      const availableWidth = Math.min(baseWidth, window.innerWidth - 350);
      const widthGaps = (config.cols - 1) * 8;
      const maxTileWidth = (availableWidth - padding - widthGaps) / config.cols;

      const maxSize = difficulty.startsWith('expert') ? 90 : 120;
      const minSize = difficulty.startsWith('expert') ? 50 : 60;

      const newTileSize = Math.floor(
        Math.min(maxTileHeight, maxTileWidth, maxSize)
      );
      setTileSize(Math.max(newTileSize, minSize));
    };

    calculateTileSize();
    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [difficulty]);

  // Trigger particles on new matches
  useEffect(() => {
    const currentMatchCount = tiles.filter((t) => t.isMatched).length;
    if (currentMatchCount > prevMatchCountRef.current && boardRef.current) {
      // Find newly matched tiles
      const matchedTiles = tiles.filter((t) => t.isMatched);
      if (matchedTiles.length >= 2) {
        const lastTwo = matchedTiles.slice(-2);
        const tile = lastTwo[0];

        // Get tile position
        const tileElements = boardRef.current.querySelectorAll(
          `.${styles.tile}`
        );
        const tileElement = tileElements[tile.id] as HTMLElement;
        if (tileElement) {
          const rect = tileElement.getBoundingClientRect();
          const boardRect = boardRef.current.getBoundingClientRect();

          const type: 'exact' | 'character' | 'bomb' = tile.bombTriggered
            ? 'bomb'
            : lastTwo[0].sticker.url === lastTwo[1].sticker.url
              ? 'exact'
              : 'character';

          const newParticle: ParticleEffect = {
            id: `particle-${Date.now()}`,
            position: {
              x: rect.left - boardRect.left + rect.width / 2,
              y: rect.top - boardRect.top + rect.height / 2,
            },
            type,
          };

          setParticles((prev) => [...prev, newParticle]);
        }
      }
    }
    prevMatchCountRef.current = currentMatchCount;
  }, [tiles]);

  const handleTileClick = useCallback(
    (index: number) => {
      flipTile(index);
    },
    [flipTile]
  );

  const handleRemoveParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleScoreEventComplete = useCallback(
    (id: string) => {
      removeScoreEvent(id);
    },
    [removeScoreEvent]
  );

  const progress = useMemo(() => {
    const matched = tiles.filter((t) => t.isMatched).length / 2;
    const total = tiles.length / 2;
    return { matched, total };
  }, [tiles]);

  const gridClass = useMemo(() => {
    const classes: Record<GameDifficulty, string> = {
      easy: styles.gameBoardEasy,
      medium: styles.gameBoardMedium,
      hard: styles.gameBoardHard,
      expert_wide: styles.gameBoardExpertWide,
      expert_square: styles.gameBoardExpertSquare,
    };
    return classes[difficulty];
  }, [difficulty]);

  // Position score events relative to matched tiles using useLayoutEffect
  // to read DOM measurements before browser paint
  const [positionedScoreEvents, setPositionedScoreEvents] =
    useState(scoreEvents);

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const positioned = scoreEvents.map((event) => {
      // Find the tile that triggered this event
      const matchedTiles = tiles.filter((t) => t.isMatched);
      if (matchedTiles.length > 0) {
        const lastTile = matchedTiles[matchedTiles.length - 1];
        const tileElements = board.querySelectorAll(`.${styles.tile}`);
        const tileElement = tileElements?.[lastTile.id] as HTMLElement;

        if (tileElement) {
          const rect = tileElement.getBoundingClientRect();
          const boardRect = board.getBoundingClientRect();

          return {
            ...event,
            position: {
              x: rect.left - boardRect.left + rect.width / 2,
              y: rect.top - boardRect.top,
            },
          };
        }
      }
      return event;
    });

    setPositionedScoreEvents(positioned);
  }, [scoreEvents, tiles]);

  return (
    <div ref={containerRef} className={styles.gameBoardArea}>
      <div className="text-center mb-3">
        <span className="text-muted-foreground">Matched: </span>
        <span className="text-success-500 font-bold">{progress.matched}</span>
        <span className="text-muted-foreground">/{progress.total} pairs</span>
      </div>
      <div
        ref={boardRef}
        className={`${styles.gameBoard} ${gridClass} ${isPeeking ? styles.gameBoardPeeking : ''}`}
        style={
          {
            '--tile-size': `${tileSize}px`,
            position: 'relative',
          } as React.CSSProperties
        }
      >
        {tiles.map((tile, index) => (
          <MemoryTile
            key={tile.id}
            tile={tile}
            onClick={() => handleTileClick(index)}
            isPeeking={isPeeking}
            matchType={
              tile.isMatched
                ? tiles.some(
                    (t) =>
                      t.id !== tile.id &&
                      t.isMatched &&
                      t.sticker.url === tile.sticker.url
                  )
                  ? 'exact'
                  : 'character'
                : null
            }
          />
        ))}

        {/* Combo Indicator */}
        <ComboIndicator comboLevel={currentCombo} />

        {/* Score Pop-ups */}
        {positionedScoreEvents.map((event) => (
          <ScorePopup
            key={event.id}
            event={event}
            onComplete={() => handleScoreEventComplete(event.id)}
          />
        ))}

        {/* Match Particles */}
        {particles.map((particle) => (
          <MatchParticles
            key={particle.id}
            position={particle.position}
            type={particle.type}
            onComplete={() => handleRemoveParticle(particle.id)}
          />
        ))}
      </div>
    </div>
  );
});
