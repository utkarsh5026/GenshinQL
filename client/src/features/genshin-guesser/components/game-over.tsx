import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Heart, RefreshCcw, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import AnimatedCover from '@/components/utils/AnimatedCover';
import AvatarWithSkeleton from '@/components/utils/AvatarWithSkeleton';
import { useCharactersStore } from '@/features/characters';
import { useIsMobile } from '@/hooks/use-mobile';
import { getElementColor } from '@/lib/elementColors';
import { getRarityStarColor } from '@/lib/rarityColors';
import { cn } from '@/lib/utils';
import { Character } from '@/types';

import { useGenshinGuesserStore } from '../stores/useGenshinGuesserStore';

const MAX_GUESSES = 5;

// ── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 14,
      stiffness: 120,
      staggerChildren: 0.12,
    },
  },
};

const avatarVariants = {
  hidden: { rotate: -180, scale: 0, opacity: 0 },
  visible: {
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 10, stiffness: 100 },
  },
};

const fadeUpVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

const resultTextVariants = {
  hidden: { y: 16, opacity: 0, x: 0 },
  visible: {
    y: 0,
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
  shake: {
    x: [-6, 6, -5, 5, -3, 3, 0],
    transition: { duration: 0.5, delay: 0.65, ease: 'easeInOut' as const },
  },
};

const glowRingVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: [0, 0.85, 0.55],
    scale: [0.9, 1.12, 1.04],
    transition: {
      duration: 1.4,
      times: [0, 0.4, 1],
      ease: 'easeOut' as const,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      repeatDelay: 0.2,
    },
  },
};

// ── Hint reveal panel ─────────────────────────────────────────────────────────

const HINT_SCHEDULE = [
  { label: 'Rarity', afterGuess: 1 },
  { label: 'Element', afterGuess: 2 },
  { label: 'Weapon', afterGuess: 3 },
  { label: 'Model', afterGuess: 4 },
] as const;

type HintLabel = (typeof HINT_SCHEDULE)[number]['label'];

interface HintContentProps {
  type: HintLabel;
  character: Character;
}

const HintContent: React.FC<HintContentProps> = ({ type, character }) => {
  if (type === 'Rarity') {
    const stars = parseInt(character.rarity, 10);
    return (
      <span
        className={cn(
          'text-base font-bold tracking-widest',
          getRarityStarColor(stars)
        )}
      >
        {'★'.repeat(stars)}
      </span>
    );
  }
  if (type === 'Element') {
    const color = getElementColor(character.element);
    return (
      <div className="flex flex-col items-center gap-1">
        <AvatarWithSkeleton
          name={character.element}
          url={character.elementUrl}
          avatarClassName="w-6 h-6"
        />
        <span
          className={cn(
            'text-[10px] font-semibold capitalize',
            `text-${color}`
          )}
        >
          {character.element}
        </span>
      </div>
    );
  }
  if (type === 'Weapon') {
    return (
      <div className="flex flex-col items-center gap-1">
        <AvatarWithSkeleton
          name={character.weaponType}
          url={character.weaponUrl}
          avatarClassName="w-6 h-6"
        />
        <span className="text-[10px] font-semibold capitalize text-muted-foreground">
          {character.weaponType}
        </span>
      </div>
    );
  }
  // Model
  return (
    <span className="text-[10px] font-semibold text-center text-foreground leading-tight">
      {character.modelType}
    </span>
  );
};

interface HintRevealPanelProps {
  character: Character;
  guessCount: number;
}

const HintRevealPanel: React.FC<HintRevealPanelProps> = ({
  character,
  guessCount,
}) => {
  const [revealedHints, setRevealedHints] = useState<Set<HintLabel>>(new Set());

  if (guessCount === 0) return null;

  const toggleReveal = (label: HintLabel) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Clues Revealed
      </p>
      <div className="grid grid-cols-2 gap-2">
        {HINT_SCHEDULE.map((hint) => {
          const isAvailable = guessCount >= hint.afterGuess;
          const isRevealed = isAvailable && revealedHints.has(hint.label);

          return (
            <motion.div
              key={hint.label}
              animate={isRevealed ? { scale: [0.85, 1.1, 1] } : {}}
              transition={{ duration: 0.4, type: 'spring' }}
              onClick={() => isAvailable && toggleReveal(hint.label)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs min-h-14 justify-center transition-colors duration-200',
                isRevealed
                  ? 'border-border bg-card/80'
                  : isAvailable
                    ? 'border-border/60 bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-border'
                    : 'border-border/30 bg-muted/20'
              )}
            >
              <span className="text-muted-foreground uppercase tracking-wide text-[9px]">
                {hint.label}
              </span>
              {isRevealed ? (
                <HintContent type={hint.label} character={character} />
              ) : isAvailable ? (
                <span className="text-[9px] text-muted-foreground/60 italic">
                  tap to reveal
                </span>
              ) : (
                <span className="text-lg text-muted-foreground/40">?</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ── Lives display ─────────────────────────────────────────────────────────────

interface GuesserLivesDisplayProps {
  guessCount: number;
}

const GuesserLivesDisplay: React.FC<GuesserLivesDisplayProps> = ({
  guessCount,
}) => {
  const remaining = MAX_GUESSES - guessCount;
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: MAX_GUESSES }).map((_, i) => {
        const isFilled = i < remaining;
        const isLastOne = remaining === 1 && i === 0;
        return (
          <motion.div
            key={i}
            animate={
              !isFilled ? { scale: [1, 0.5, 0.75], opacity: [1, 0.2, 0.4] } : {}
            }
            transition={{ duration: 0.4 }}
          >
            <Heart
              className={cn(
                'w-6 h-6 transition-colors duration-300',
                isFilled
                  ? isLastOne
                    ? 'text-game-wrong animate-pulse'
                    : 'text-game-wrong'
                  : 'text-muted-foreground/30'
              )}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

// ── Streak display ────────────────────────────────────────────────────────────

interface StreakDisplayProps {
  streak: number;
  bestStreak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  bestStreak,
}) => (
  <div className="flex items-center justify-between text-sm py-1 border-b border-border/40 pb-2">
    <motion.div
      className="flex items-center gap-1.5"
      animate={streak >= 2 ? { scale: [0.8, 1.15, 1] } : {}}
      transition={{ duration: 0.4, type: 'spring' }}
    >
      <Zap
        className={cn(
          'w-4 h-4',
          streak >= 2 ? 'text-genshin-gold' : 'text-muted-foreground'
        )}
        fill={streak >= 2 ? 'currentColor' : 'none'}
      />
      <span
        className={
          streak >= 2 ? 'text-genshin-gold font-bold' : 'text-muted-foreground'
        }
      >
        {streak >= 2 ? `${streak}× Streak!` : `Streak: ${streak}`}
      </span>
    </motion.div>
    <span className="text-xs text-muted-foreground">Best: {bestStreak}</span>
  </div>
);

// ── Share results ─────────────────────────────────────────────────────────────

function buildShareText(
  guessedChars: string[],
  characterMap: Record<string, Character>,
  correctChar: Character,
  won: boolean
): string {
  const header = won
    ? `Genshin Guesser — Got it in ${guessedChars.length}/${MAX_GUESSES}! 🎉`
    : `Genshin Guesser — Could not guess in ${MAX_GUESSES} tries 😢`;

  const compareVersion = (correct: string, guess: string): number => {
    if (correct === guess) return 0;
    const [cp, cv] = correct.split('.');
    const [gp, gv] = guess.split('.');
    if (cp === gp) return cv < gv ? 1 : -1;
    return cp < gp ? 2 : -2;
  };

  const rows = guessedChars.map((name) => {
    const g = characterMap[name];
    if (!g) return '❓❓❓❓';
    const region = g.region === correctChar.region ? '🟢' : '🔴';
    const weapon = g.weaponType === correctChar.weaponType ? '🟢' : '🔴';
    const element = g.element === correctChar.element ? '🟢' : '🔴';
    const vd = compareVersion(g.version ?? '1.0', correctChar.version ?? '1.0');
    const version = vd === 0 ? '🟢' : Math.abs(vd) === 1 ? '🟡' : '🔴';
    return `${region}${weapon}${element}${version}`;
  });

  return [header, '', ...rows].join('\n');
}

// ── Shared GameOverContent ────────────────────────────────────────────────────

interface GameOverContentProps {
  selectedCharacter: Character;
  gameWon: boolean;
  onReset: () => void;
}

const GameOverContent: React.FC<GameOverContentProps> = ({
  selectedCharacter,
  gameWon,
  onReset,
}) => {
  const { guessedChars } = useGenshinGuesserStore();
  const { characterMap } = useCharactersStore();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleShare = () => {
    const text = buildShareText(
      guessedChars,
      characterMap,
      selectedCharacter,
      gameWon
    );
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 pb-2"
    >
      {/* Avatar with glow ring + sparkles */}
      <motion.div variants={avatarVariants} className="relative">
        {gameWon && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-genshin-gold/70 pointer-events-none"
            style={{ boxShadow: '0 0 20px 4px rgba(251,191,36,0.45)' }}
            variants={glowRingVariants}
            initial="hidden"
            animate="visible"
          />
        )}
        <Avatar className="w-36 h-36 relative z-10">
          <AnimatedCover
            animation={selectedCharacter.partyJoin}
            fallbackUrl={selectedCharacter.iconUrl}
          />
        </Avatar>
      </motion.div>

      {/* Result text with lose shake */}
      <motion.div
        variants={resultTextVariants}
        animate={!gameWon ? ['visible', 'shake'] : 'visible'}
        className="text-center space-y-2"
      >
        <div
          className={cn(
            'text-xl font-bold tracking-tight',
            gameWon ? 'text-game-correct' : 'text-game-wrong'
          )}
        >
          {gameWon ? 'Congratulations!' : 'Better luck next time!'}
        </div>
        <div className="text-base text-muted-foreground flex items-center gap-2 justify-center">
          <span>{gameWon ? 'You guessed' : 'The answer was'}</span>
          <span className="font-semibold text-foreground">
            {selectedCharacter.name}
          </span>
          <img
            src={selectedCharacter.iconUrl}
            alt={selectedCharacter.name}
            className="w-6 h-6 rounded-full border border-border"
          />
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={fadeUpVariants} className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onReset}
          className={cn(
            'flex items-center gap-2 transition-colors duration-200',
            gameWon
              ? 'hover:bg-genshin-gold/20 hover:border-genshin-gold hover:text-genshin-gold'
              : 'hover:bg-accent/50'
          )}
        >
          <RefreshCcw className="w-4 h-4" />
          <span className="font-medium">Play again</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-1.5 text-game-correct"
              >
                <Check className="w-3.5 h-3.5" />
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Share
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.div>
  );
};

interface GameOverDrawerProps {
  selectedCharacter: Character;
  gameWon: boolean;
  gameOver: boolean;
  onReset: () => void;
}

const GameOverDrawer: React.FC<GameOverDrawerProps> = ({
  selectedCharacter,
  gameWon,
  gameOver,
  onReset,
}) => {
  return (
    <Drawer
      open={gameOver}
      dismissible={false}
      shouldScaleBackground={false}
      onOpenChange={() => {}}
    >
      <DrawerContent
        className={cn(
          '[&>div:first-child]:hidden',
          'bg-card/98',
          gameWon
            ? 'border-t-2 border-genshin-gold/60'
            : 'border-t-2 border-game-wrong/40'
        )}
      >
        <DrawerHeader className="pb-0">
          <DrawerTitle
            className={cn(
              'text-center text-lg font-bold tracking-wide',
              gameWon ? 'text-genshin-gold' : 'text-game-wrong'
            )}
          >
            {gameWon ? '✦ Victory! ✦' : 'Game Over'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 py-4">
          <GameOverContent
            selectedCharacter={selectedCharacter}
            gameWon={gameWon}
            onReset={onReset}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface GameOverDisplayProps {
  selectedCharacter: Character;
  gameWon: boolean;
  onReset: () => void;
}

const GameOverDisplay: React.FC<GameOverDisplayProps> = ({
  selectedCharacter,
  gameWon,
  onReset,
}) => {
  const { guessedChars, gameOver, streak, bestStreak } =
    useGenshinGuesserStore();
  const isMobile = useIsMobile();

  const guessCount = guessedChars.length;

  return (
    <>
      <Card className="border-none md:mt-16 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4 md:p-8 flex flex-col space-y-4">
          {/* Lives — always visible */}
          <GuesserLivesDisplay
            guessCount={gameOver ? MAX_GUESSES : guessCount}
          />

          {/* Streak — always visible */}
          <StreakDisplay streak={streak} bestStreak={bestStreak} />

          {/* Hint panel — visible only during active gameplay */}
          {!gameOver && (
            <HintRevealPanel
              character={selectedCharacter}
              guessCount={guessCount}
            />
          )}

          {/* Desktop inline game-over content */}
          {gameOver && !isMobile && (
            <GameOverContent
              selectedCharacter={selectedCharacter}
              gameWon={gameWon}
              onReset={onReset}
            />
          )}
        </CardContent>
      </Card>

      {/* Mobile bottom drawer — portaled to document.body */}
      {isMobile && (
        <GameOverDrawer
          selectedCharacter={selectedCharacter}
          gameWon={gameWon}
          gameOver={gameOver}
          onReset={onReset}
        />
      )}
    </>
  );
};

export default GameOverDisplay;
