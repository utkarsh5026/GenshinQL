import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import React from 'react';
import Confetti from 'react-confetti';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type Character, useCharactersStore } from '@/features/characters';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import SearchBar from '@/features/genshin-guesser/components/search-bar';
import { cn } from '@/lib/utils';

import { useGenshinGuesserStore } from '../stores/useGenshinGuesserStore';
import GuessTable from './guess-table';

interface GuessSearchTableProps {
  selectedCharacter: Character;
  onGuess: (character: Character) => void;
  onReset: () => void;
}

const GuessSearchTable: React.FC<GuessSearchTableProps> = ({
  selectedCharacter,
  onGuess,
  onReset,
}) => {
  const { characters, characterMap } = useCharactersStore();
  const { guessedChars, gameWon, gameOver } = useGenshinGuesserStore();

  const guessedCharacters = guessedChars.map((char) => characterMap[char]);

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
              gameWon ? 'bg-success-500/10' : 'bg-error-500/5'
            )}
          >
            {/* Namecard background */}
            {selectedCharacter.namecardURL && (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: `url(${selectedCharacter.namecardURL})`,
                }}
              >
                <div
                  className={cn(
                    'absolute inset-0',
                    gameWon ? 'bg-background/75' : 'bg-background/85'
                  )}
                />
              </div>
            )}

            {/* Message */}
            <p
              className={cn(
                'relative z-10 text-xl font-bold tracking-wide bg-background/50 backdrop-blur-sm rounded-xl px-5 py-2 border border-border/20',
                gameWon ? 'text-success-500' : 'text-error-500'
              )}
            >
              {gameWon ? 'Perfect! You guessed it! 🎉' : 'Game Over! 🥺'}
            </p>

            {/* Character avatar — floats on win, dims on loss */}
            <motion.div
              className="relative z-10 drop-shadow-2xl"
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
                  gameWon ? 'text-success-500' : 'text-error-500'
                )}
              />
            </motion.div>

            {/* Restart button */}
            <Button
              variant="outline"
              onClick={onReset}
              className={cn(
                'relative z-10 flex items-center gap-2 transition-colors duration-200',
                gameWon
                  ? ' text-success-500 hover:bg-success-500/15 hover:border-success-500'
                  : ' text-error-500 hover:bg-error-500/15 hover:border-error-500'
              )}
            >
              <RefreshCcw className="w-4 h-4" />
              Play Again
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
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
