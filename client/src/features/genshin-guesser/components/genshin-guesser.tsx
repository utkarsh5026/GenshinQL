import { Swords } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';

import { CachedImage } from '@/features/cache/components/cached-asset';
import { type Character, useCharactersStore } from '@/features/characters';
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
      <div className="relative overflow-hidden rounded-xl h-36 flex items-center justify-center">
        {/* Background — blurred & slightly scaled to hide blur edges */}
        <CachedImage
          src="/images/wallpapers/wordle.png"
          alt=""
          aria-hidden
          lazy={false}
          showSkeleton={false}
          className="w-full h-full object-cover object-center scale-110 blur-sm"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
        {/* Base dark tint */}
        <div className="absolute inset-0 bg-black/90" />
        {/* Vignette — darkens edges, keeps centre bright */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        {/* Bottom fade into page background */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent" />

        {/* Frosted-glass pill — sticker + title + subtitle */}
        <div className="relative z-10 flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-sm bg-black/20 border border-white/10">
          {heroSticker && (
            <img
              src={heroSticker.url}
              alt={heroSticker.characterName}
              draggable={false}
              width={52}
              height={52}
              className={styles.sticker}
              onLoad={(e) =>
                e.currentTarget.classList.add(styles.stickerVisible)
              }
            />
          )}
          <div className="flex flex-col items-center gap-0.5">
            <div
              key={`title-${currentChar}`}
              className={`flex items-center gap-2 text-genshin-gold ${styles.heroTitle}`}
            >
              <Swords className="w-5 h-5 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{
                  textShadow:
                    '0 0 20px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                Genshin Guesser
              </h1>
              <Swords className="w-5 h-5 scale-x-[-1] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            </div>
            <p
              key={`subtitle-${currentChar}`}
              className={`text-white/55 text-xs tracking-wide ${styles.heroSubtitle}`}
            >
              {quirkyText}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
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
