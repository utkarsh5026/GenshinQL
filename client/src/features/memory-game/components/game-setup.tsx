import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { GameMode } from '@/types';

import { useMemoryGameMode, useMemoryGameStore } from '../stores';
import { DifficultySelector } from './difficulty-selector';
import { GameModeSelector } from './game-mode-selector';
import styles from './MemoryGame.module.css';

interface GameSetupProps {
  onStart: () => void;
  isLoading?: boolean;
  loadingProgress?: { loaded: number; total: number };
}

const STEPS = [
  { id: 1, title: 'Game Mode', description: 'Choose how to play' },
  { id: 2, title: 'Grid Size', description: 'Select your challenge' },
] as const;

const MODE_DESCRIPTIONS: Record<
  GameMode,
  { title: string; description: string; color: string }
> = {
  classic: {
    title: 'Classic Mode',
    description: 'Take your time and match all pairs. No time pressure!',
    color: 'text-celestial-400',
  },
  time_attack: {
    title: 'Time Attack',
    description: 'Race against the clock! Faster matches = more points.',
    color: 'text-cryo-400',
  },
  bomb_mode: {
    title: 'Bomb Mode',
    description: 'Watch out for bombs! Match them last or lose points.',
    color: 'text-pyro-400',
  },
};

export const GameSetup = memo(function GameSetup({
  onStart,
  isLoading = false,
  loadingProgress,
}: GameSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const gameMode = useMemoryGameMode();
  const setGameMode = useMemoryGameStore((state) => state.setGameMode);

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      setGameMode(mode);
    },
    [setGameMode]
  );

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const modeInfo = MODE_DESCRIPTIONS[gameMode];

  return (
    <div className={styles.setupContainer}>
      {/* Step Indicators */}
      <div className={styles.stepIndicators}>
        {STEPS.map((step, index) => (
          <div key={step.id} className={styles.stepIndicatorWrapper}>
            <button
              className={`${styles.stepIndicator} ${
                currentStep === step.id
                  ? styles.stepIndicatorActive
                  : currentStep > step.id
                    ? styles.stepIndicatorCompleted
                    : styles.stepIndicatorInactive
              }`}
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              disabled={currentStep < step.id}
            >
              {currentStep > step.id ? '✓' : step.id}
            </button>
            <span
              className={`${styles.stepLabel} ${
                currentStep === step.id ? styles.stepLabelActive : ''
              }`}
            >
              {step.title}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`${styles.stepConnector} ${
                  currentStep > step.id ? styles.stepConnectorCompleted : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={styles.setupContent}>
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Choose Your Game Mode</h2>
            <p className={styles.stepDescription}>
              Each mode offers a unique challenge!
            </p>

            <div className={styles.modeCards}>
              <GameModeSelector
                mode={gameMode}
                onModeChange={handleModeChange}
              />
            </div>

            {/* Mode Description */}
            <div className={styles.modeDescription}>
              <h3 className={`${styles.modeTitle} ${modeInfo.color}`}>
                {modeInfo.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {modeInfo.description}
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Select Grid Size</h2>
            <p className={styles.stepDescription}>
              Larger grids = more pairs to match!
            </p>

            <div className={styles.difficultyWrapper}>
              <DifficultySelector variant="vertical" />
            </div>

            {/* Scoring Info */}
            <div className={styles.scoringInfo}>
              <div className="text-center text-sm">
                <p className="text-muted-foreground mb-2">
                  Match stickers to score points:
                </p>
                <div className="flex justify-center gap-6">
                  <span>
                    Exact match:{' '}
                    <strong className="text-success-500">5 points</strong>
                  </span>
                  <span>
                    Same character:{' '}
                    <strong className="text-hydro-500">3 points</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.setupNavigation}>
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className={styles.navButton}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        <div className="flex-1" />

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} className={styles.navButtonPrimary}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onStart}
            disabled={isLoading}
            className={styles.startButton}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
                {loadingProgress && (
                  <span className="text-xs">
                    ({loadingProgress.loaded}/{loadingProgress.total})
                  </span>
                )}
              </span>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
});
