import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import React from 'react';
import Confetti from 'react-confetti';

import { Card, CardContent } from '@/components/ui/card';
import { type Character, useCharactersStore } from '@/features/characters';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import SearchBar from '@/features/genshin-guesser/components/search-bar';
import { cn } from '@/lib/utils';

import { useGenshinGuesserStore } from '../stores/useGenshinGuesserStore';
import GuessTable from './guess-table';

// ── Splash screen shown before first guess ────────────────────────────────────

interface GameSplashScreenProps {
  namecardURL?: string;
}

const LOCKED_ATTRS = ['Region', 'Weapon', 'Element', 'Version'] as const;

const GameSplashScreen: React.FC<GameSplashScreenProps> = ({ namecardURL }) => (
  <motion.div
    key="splash"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="relative overflow-hidden rounded-xl border border-border/50 bg-card/60 py-6 px-6 flex flex-col items-center gap-3"
  >
    {/* Blurred namecard background */}
    {namecardURL && (
      <div
        className="absolute inset-0 opacity-10 blur-md bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${namecardURL})` }}
      />
    )}

    {/* Shimmer sweep */}
    <div
      className="absolute inset-0 pointer-events-none animate-shimmer"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.05) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
    />

    {/* Floating question mark */}
    <span className="relative z-10 text-5xl text-genshin-gold animate-float select-none">
      ?
    </span>

    <p className="relative z-10 text-sm text-muted-foreground text-center">
      Guess the Genshin character in 5 tries!
    </p>

    {/* Locked attribute pills */}
    <div className="relative z-10 flex flex-wrap gap-2 justify-center">
      {LOCKED_ATTRS.map((attr) => (
        <span
          key={attr}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground"
        >
          <Lock className="w-3 h-3" />
          {attr}
        </span>
      ))}
    </div>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface GuessSearchTableProps {
  selectedCharacter: Character;
  onGuess: (character: Character) => void;
}

/**
 * GuessSearchTable component displays the main game interface for the Genshin character guessing game.
 * It includes a search bar for making guesses, a table showing previous guesses, and win/lose states.
 *
 * @param selectedCharacter - The target character that players need to guess
 * @param onGuess - Callback function triggered when a player makes a guess
 * @returns A card containing the game interface with search functionality and guess history
 */
const GuessSearchTable: React.FC<GuessSearchTableProps> = ({
  selectedCharacter,
  onGuess,
}) => {
  const { characters, characterMap } = useCharactersStore();
  const { guessedChars, gameWon, gameOver } = useGenshinGuesserStore();

  const guessedCharacters = guessedChars.map((char) => characterMap[char]);
  const showSplash = guessedChars.length === 0 && !gameOver;

  return (
    <Card className="border-none bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4 md:p-8 space-y-6">
        {gameWon && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={300}
            recycle={false}
            gravity={0.3}
            colors={['#fbbf24', '#a855f7', '#22c55e']}
          />
        )}

        {gameOver || gameWon ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={
              gameWon
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, x: [0, -7, 7, -5, 5, -2, 2, 0] }
            }
            transition={
              gameWon
                ? { duration: 0.5, ease: 'easeOut' }
                : {
                    duration: 0.4,
                    ease: 'easeOut',
                    x: { duration: 0.5, delay: 0.35 },
                  }
            }
            className={cn(
              'relative overflow-hidden flex flex-col items-center gap-4 py-6 px-6 rounded-xl border-2',
              gameWon
                ? 'border-game-correct bg-game-correct/10'
                : 'border-game-wrong bg-game-wrong/5'
            )}
            style={{
              boxShadow: gameWon
                ? '0 0 30px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.2)'
                : '0 0 20px rgba(239,68,68,0.15), inset 0 1px 0 rgba(239,68,68,0.1)',
            }}
          >
            {/* Shimmer sweep — win only */}
            {gameWon && (
              <div
                className="absolute inset-0 pointer-events-none animate-shimmer"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            )}

            {/* Message */}
            <p
              className={cn(
                'relative z-10 text-xl font-bold tracking-wide',
                gameWon ? 'text-game-correct' : 'text-game-wrong'
              )}
            >
              {gameWon ? 'Perfect! You guessed it! 🎉' : 'Game Over! 🥺'}
            </p>

            {/* Character avatar — floats on win, dims on loss */}
            <motion.div
              className="relative z-10"
              animate={gameWon ? { y: [0, -5, 0] } : { opacity: [1, 0.75, 1] }}
              transition={
                gameWon
                  ? { duration: 3, ease: 'easeInOut', repeat: Infinity }
                  : { duration: 4, ease: 'easeInOut', repeat: Infinity }
              }
            >
              <CharacterAvatar
                characterName={selectedCharacter.name}
                size="lg"
                showElement
                showRarity
                avatarClassName={
                  !gameWon ? 'saturate-50 opacity-80' : undefined
                }
                nameClassName={cn(
                  'font-semibold',
                  gameWon ? 'text-game-correct' : 'text-game-wrong'
                )}
              />
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Splash screen — only before first guess */}
            <AnimatePresence>
              {showSplash && (
                <GameSplashScreen namecardURL={selectedCharacter.namecardURL} />
              )}
            </AnimatePresence>

            <SearchBar
              items={characters
                .filter((character) => !guessedChars.includes(character.name))
                .map((character) => ({
                  name: character.name,
                  iconUrl: character.iconUrl,
                }))}
              onItemSelect={(item) => {
                onGuess(characterMap[item.name]);
              }}
            />
          </div>
        )}

        <GuessTable
          characters={guessedCharacters}
          correctCharacter={selectedCharacter}
        />
      </CardContent>
    </Card>
  );
};

export default GuessSearchTable;
