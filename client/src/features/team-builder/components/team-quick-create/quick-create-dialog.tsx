import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  Swords,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { ElementBadge } from '@/components/ui/genshin-game-icons';
import { CharacterAvatar } from '@/features/characters';
import { useCharacters } from '@/features/characters/stores';
import {
  getElementBgClass,
  getElementBorderClass,
  getElementTextClass,
} from '@/lib/game-colors';
import { cn } from '@/lib/utils';
import { useElements } from '@/stores';
import type { Character } from '@/types';

import { ELEMENTAL_RESONANCES } from '../../constants';
import type { CharacterRole } from '../../types';
import { computeCharacterGroups } from '../../utils/computeCharacterGroups';
import { InlineCharacterPicker } from './character-picker';

/** ─── Step definitions ──────────────────────────────────────────────────── */

interface StepDef {
  role: CharacterRole;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const STEPS: StepDef[] = [
  {
    role: 'DPS',
    label: 'Main DPS',
    subtitle: 'Your primary damage dealer',
    icon: <Swords className="w-5 h-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
  },
  {
    role: 'Sub DPS',
    label: 'Sub DPS',
    subtitle: 'Off-field or burst damage',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    role: 'Support',
    label: 'Support 1',
    subtitle: 'Healer, shielder, or buffer',
    icon: <Wand2 className="w-5 h-5" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    role: 'Support',
    label: 'Support 2',
    subtitle: 'Flex slot — buff, shield, or utility',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
  },
];

/** ─── Mini selected-character pill ──────────────────────────────────────── */

const SelectedPill: React.FC<{
  step: StepDef;
  character: Character | null;
  isCurrent: boolean;
  isDone: boolean;
}> = ({ step, character, isCurrent, isDone }) => (
  <div
    className={cn(
      'flex flex-col items-center gap-1.5 flex-1 min-w-0 transition-all duration-300',
      isCurrent ? 'opacity-100 scale-105' : isDone ? 'opacity-80' : 'opacity-30'
    )}
  >
    <div
      className={cn(
        'relative w-11 h-11 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
        isCurrent
          ? `border-primary ${step.bgColor}`
          : isDone
            ? 'border-primary/50 bg-primary/10'
            : 'border-border/40 bg-accent/20'
      )}
    >
      {character ? (
        <CharacterAvatar
          characterName={character.name}
          size="xs"
          showName={false}
          interactive={false}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className={cn('transition-colors', step.color)}>{step.icon}</span>
      )}
      {isDone && character && (
        <CheckCircle2 className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-primary fill-background" />
      )}
    </div>
    <span
      className={cn(
        'text-[10px] font-medium truncate w-full text-center',
        step.color
      )}
    >
      {character ? character.name.split(' ')[0] : step.label}
    </span>
  </div>
);

/** ─── Resonance badge ───────────────────────────────────────────────────── */

const ResonanceBadge: React.FC<{
  element: string;
  elementUrl: string;
  description: string;
}> = ({ element, elementUrl, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className={cn(
      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border',
      getElementBgClass(element),
      getElementBorderClass(element),
      getElementTextClass(element)
    )}
  >
    <ElementBadge name={element} url={elementUrl} size="xs" showLabel={false} />
    <span>
      {element} Resonance: {description}
    </span>
  </motion.div>
);

interface QuickCreatePanelProps {
  /** Called when user completes or skips the wizard. Receives the 4 selected characters (null = skipped). */
  onConfirm: (chars: (Character | null)[]) => void;
  /** Called when user clicks "Create Blank Team" */
  onCreateBlank: () => void;
  /** Called when user clicks the cancel (×) button */
  onCancel: () => void;
}

export const QuickCreatePanel: React.FC<QuickCreatePanelProps> = ({
  onConfirm,
  onCreateBlank,
  onCancel,
}) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<(Character | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const characters = useCharacters();
  const elements = useElements();
  const currentStep = STEPS[step];

  /** Build element → URL lookup */
  const elementUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    elements.forEach((el) => {
      map[el.name.toLowerCase()] = el.url;
    });
    return map;
  }, [elements]);

  /** Compute smart character groups based on current step and selections */
  const groups = useMemo(
    () => computeCharacterGroups(step, selections, characters),
    [step, selections, characters]
  );

  /** Detect active elemental resonances from current selections */
  const activeResonances = useMemo(() => {
    const elementCounts: Record<string, number> = {};
    selections.filter(Boolean).forEach((c) => {
      const el = c!.element;
      elementCounts[el] = (elementCounts[el] || 0) + 1;
    });
    return Object.entries(elementCounts)
      .filter(([, count]) => count >= 2)
      .map(([element]) => ({
        element,
        resonance: ELEMENTAL_RESONANCES[element],
      }))
      .filter(
        (
          r
        ): r is {
          element: string;
          resonance: (typeof ELEMENTAL_RESONANCES)[string];
        } => r.resonance !== undefined
      );
  }, [selections]);

  const handleSelect = (c: Character) => {
    const updated = [...selections];
    updated[step] = c;
    setSelections(updated);

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishCreate(updated);
    }
  };

  const handleSkip = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishCreate(selections);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const finishCreate = (chars: (Character | null)[]) => {
    onConfirm(chars);
    setTimeout(() => {
      setStep(0);
      setSelections([null, null, null, null]);
    }, 300);
  };

  const handleBlank = () => {
    onCreateBlank();
    setTimeout(() => {
      setStep(0);
      setSelections([null, null, null, null]);
    }, 300);
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-background flex flex-col overflow-hidden min-h-140">
      {/** ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
        <div className="text-base font-bold flex items-center gap-2">
          <span className="text-muted-foreground font-normal text-sm">
            Quick Create Team
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground/60">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/** ── Navigation actions (Back / Skip / Finish) ── */}
      <div className="flex items-center justify-between px-5 pt-2 pb-0 shrink-0">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBlank}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            Create Blank Team
          </button>
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-primary/70 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
          >
            {step < STEPS.length - 1 ? 'Skip →' : 'Finish →'}
          </button>
        </div>
      </div>

      {/** ── Step progress pills ── */}
      <div className="flex items-end gap-2 sm:gap-3 px-5 pt-4 pb-0 shrink-0">
        {STEPS.map((s, i) => (
          <SelectedPill
            key={i}
            step={s}
            character={selections[i]}
            isCurrent={i === step}
            isDone={i < step}
          />
        ))}
      </div>

      {/** ── Resonance badges ── */}
      <AnimatePresence>
        {activeResonances.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 px-5 pt-2 shrink-0"
          >
            {activeResonances.map(({ element, resonance }) => (
              <ResonanceBadge
                key={element}
                element={element}
                elementUrl={elementUrlMap[element.toLowerCase()] ?? ''}
                description={resonance.description}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/** ── Progress bar ── */}
      <div className="h-px bg-border/30 mx-5 mt-3 mb-0 shrink-0 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={false}
          animate={{ width: `${(step / STEPS.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/** ── Current step header ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="px-5 pt-4 pb-0 shrink-0"
        >
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border',
              currentStep.bgColor
            )}
          >
            <span className={currentStep.color}>{currentStep.icon}</span>
            <div>
              <p
                className={cn(
                  'text-sm font-bold leading-none',
                  currentStep.color
                )}
              >
                {currentStep.label}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/** ── Character picker ── */}
      <div className="flex-1 overflow-hidden px-4 sm:px-5 pt-3 pb-0 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="h-full flex flex-col min-h-0"
          >
            <InlineCharacterPicker
              groups={groups}
              elementUrlMap={elementUrlMap}
              selectedCharacters={selections}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
