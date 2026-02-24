import { Swords } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

import { type Character, useCharactersStore } from '@/features/characters';
import { cn } from '@/lib/utils';
import { useStickerStore } from '@/stores/useStickerStore';

import { useGenshinGuesserStore } from '../stores/useGenshinGuesserStore';
import GameOverDisplay from './game-over';
import styles from './genshin-guesser.module.css';
import GuessSearchTable from './guess-search-table';

const QUIRKY_TEXTS = [
  'Think you know them all?',
  'Not even the stars know...',
  'Who could it be this time?',
  'Test your Genshin knowledge!',
  "Hmm, let's see if you know...",
  'Name that character, Traveler!',
  'Your vision awaits, Traveler.',
];

// Guess heatmap grid for the banner background (deterministic, static)
type CellState = 'correct' | 'wrong' | 'empty';
const BANNER_COLS = 28;
const BANNER_ROWS = 8;
const BANNER_GRID: CellState[] = Array.from(
  { length: BANNER_ROWS * BANNER_COLS },
  (_, i) => {
    const row = Math.floor(i / BANNER_COLS);
    const col = i % BANNER_COLS;
    const h = Math.abs(((row * 7 + col * 13) * 2654435761) | 0) % 10;
    if (h < 3) return 'correct';
    if (h < 6) return 'wrong';
    return 'empty';
  }
);

// Deterministic hash — seeds both the sticker and subtitle per game
function seededIndex(seed: string, offset: number, max: number): number {
  let h = (offset + 1) * 2654435761;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2246822519);
  }
  return Math.abs(h) % max;
}

const GenshinGuesser: React.FC = () => {
  const { characters, characterMap } = useCharactersStore();
  const {
    addGuessedChar,
    resetGame,
    currentChar,
    gameWon,
    selectCurrentCharacter,
  } = useGenshinGuesserStore();

  const { stickers, fetchStickers: loadStickers } = useStickerStore();
  useEffect(() => {
    loadStickers();
  }, [loadStickers]);

  // One sticker + one subtitle line, both change with each new game
  const heroSticker = useMemo(() => {
    if (!stickers.length) return null;
    const seed = currentChar ?? 'init';
    return stickers[seededIndex(seed, 0, stickers.length)];
  }, [stickers, currentChar]);

  const quirkyText = useMemo(() => {
    const seed = currentChar ?? 'init';
    return QUIRKY_TEXTS[seededIndex(seed, 1, QUIRKY_TEXTS.length)];
  }, [currentChar]);

  const selectedCharacter = useMemo(() => {
    if (!currentChar) return null;
    return characterMap[currentChar];
  }, [currentChar, characterMap]);

  useEffect(() => {
    if (!currentChar && characters.length > 0)
      selectCurrentCharacter(characters);
  }, [currentChar, characters, selectCurrentCharacter]);

  const handleGuess = (character: Character) => {
    addGuessedChar(character.name);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (selectedCharacter?.partyJoin) {
      const video = document.createElement('video');
      video.src = selectedCharacter.partyJoin.videoUrl;
      video.preload = 'auto';
      video.style.display = 'none';
      videoRef.current = video;
      document.body.appendChild(video);

      return () => {
        if (videoRef.current) {
          document.body.removeChild(videoRef.current);
          videoRef.current = null;
        }
      };
    }
  }, [selectedCharacter]);

  const handleReset = () => {
    resetGame();
    selectCurrentCharacter(characters);
  };

  if (characters.length === 0 || !selectedCharacter) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl h-52 flex items-end justify-center pb-6">
        {/* Dark base */}
        <div className="absolute inset-0 bg-midnight-950" />
        {/* Guess heatmap grid */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BANNER_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${BANNER_ROWS}, 1fr)`,
            gap: '4px',
            padding: '10px',
            opacity: 0.45,
          }}
        >
          {BANNER_GRID.map((state, i) => (
            <div
              key={i}
              className={cn(
                'rounded-sm',
                state === 'correct' && 'bg-success-800',
                state === 'wrong' && 'bg-error-800',
                state === 'empty' && 'border border-white/8'
              )}
            />
          ))}
        </div>
        {/* Vignette — darkens edges, keeps centre bright */}
        <div className={styles.bannerVignette} />

        {/* Bottom fade into page background */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent" />

        {/* Sticker — floats above the title */}
        {heroSticker && (
          <img
            src={heroSticker.url}
            alt={heroSticker.characterName}
            draggable={false}
            width={88}
            height={88}
            className={`absolute top-4 left-1/2 -translate-x-1/2 ${styles.sticker}`}
            onLoad={(e) => e.currentTarget.classList.add(styles.stickerVisible)}
          />
        )}

        {/* Title + subtitle — centered at bottom */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div
            key={`title-${currentChar}`}
            className={`flex items-center gap-2 text-genshin-gold ${styles.heroTitle}`}
          >
            <Swords className={`w-5 h-5 ${styles.swordIcon}`} />
            <h1
              className={`text-3xl font-bold tracking-tight ${styles.heroTitleText}`}
            >
              Genshin Guesser
            </h1>
            <Swords className={`w-5 h-5 scale-x-[-1] ${styles.swordIcon}`} />
          </div>
          <p
            key={`subtitle-${currentChar}`}
            className={`text-white/55 text-xs tracking-widest uppercase ${styles.heroSubtitle}`}
          >
            {quirkyText}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-2/3">
          <GuessSearchTable
            selectedCharacter={selectedCharacter}
            onGuess={handleGuess}
            onReset={handleReset}
          />
        </div>
        <div className="w-full md:w-1/3">
          <GameOverDisplay
            selectedCharacter={selectedCharacter}
            gameWon={gameWon}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default GenshinGuesser;
