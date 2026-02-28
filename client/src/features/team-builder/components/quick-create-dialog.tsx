import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  Swords,
  Wand2,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { AppInput } from '@/components/ui/app-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ElementBadge } from '@/components/ui/genshin-game-icons';
import { ELEMENTS } from '@/constants';
import { CharacterAvatar } from '@/features/characters';
import { useCharacters } from '@/features/characters/stores';
import { cn } from '@/lib/utils';
import { useElements } from '@/stores';
import type { Character } from '@/types';

import type { CharacterRole } from '../types';

// ─── Step definitions ────────────────────────────────────────────────────────

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

const ELEMENT_FILTERS = ['All', ...ELEMENTS] as const;

// ─── Mini selected-character pill ────────────────────────────────────────────

const SelectedPill: React.FC<{
  step: StepDef;
  character: Character | null;
  isCurrent: boolean;
  isDone: boolean;
}> = ({ step, character, isCurrent, isDone }) => (
  <div
    className={cn(
      'flex flex-col items-center gap-1 flex-1 min-w-0 transition-all duration-300',
      isCurrent ? 'opacity-100 scale-105' : isDone ? 'opacity-80' : 'opacity-30'
    )}
  >
    <div
      className={cn(
        'relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
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

// ─── Character picker grid (inline, not a sub-dialog) ────────────────────────

interface InlinePickerProps {
  selectedCharacters: (Character | null)[];
  onSelect: (c: Character) => void;
}

const InlineCharacterPicker: React.FC<InlinePickerProps> = ({
  selectedCharacters,
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<string>('All');
  const characters = useCharacters();
  const elements = useElements();

  const elementUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    elements.forEach((el) => {
      map[el.name.toLowerCase()] = el.url;
    });
    return map;
  }, [elements]);

  const selectedNames = new Set(
    selectedCharacters.filter(Boolean).map((c) => c!.name)
  );

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      const matchSearch = c.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchElement =
        elementFilter === 'All' ||
        c.element.toLowerCase() === elementFilter.toLowerCase();
      return matchSearch && matchElement;
    });
  }, [characters, search, elementFilter]);

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {/* Search */}
      <AppInput
        placeholder="Search characters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        autoFocus
        className="bg-accent/40 border-border/50 rounded-lg py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/60"
      />

      {/* Element filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {ELEMENT_FILTERS.map((el) => {
          if (el === 'All') {
            return (
              <button
                key={el}
                onClick={() => setElementFilter(el)}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-muted/60 border border-border/40 text-muted-foreground transition-all duration-200 ring-1',
                  elementFilter === 'All'
                    ? 'ring-primary/30'
                    : 'ring-transparent opacity-50 hover:opacity-80'
                )}
              >
                All
              </button>
            );
          }
          const url = elementUrlMap[el.toLowerCase()];
          if (!url) return null;
          const isActive = elementFilter === el;
          return (
            <button
              key={el}
              onClick={() => setElementFilter(el)}
              className={cn(
                'rounded-full transition-all duration-200 ring-1',
                isActive
                  ? 'ring-primary/30'
                  : 'ring-transparent opacity-50 hover:opacity-80'
              )}
            >
              <ElementBadge name={el} url={url} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Character grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2 pb-2">
          {filtered.map((c) => {
            const isSelected = selectedNames.has(c.name);
            return (
              <div key={c.name} className="relative">
                <CharacterAvatar
                  characterName={c.name}
                  size="lg"
                  showElement
                  onClick={isSelected ? () => {} : () => onSelect(c)}
                  className={
                    isSelected ? 'opacity-40 cursor-not-allowed' : undefined
                  }
                />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-bold text-white/80 bg-black/50 px-1 rounded">
                      In Team
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <span className="text-sm">No characters found</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main dialog ─────────────────────────────────────────────────────────────

interface QuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user completes or skips the wizard. Receives the 4 selected characters (null = skipped). */
  onConfirm: (chars: (Character | null)[]) => void;
  /** Called when user clicks "Create Blank Team" */
  onCreateBlank: () => void;
}

export const QuickCreateDialog: React.FC<QuickCreateDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCreateBlank,
}) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<(Character | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const currentStep = STEPS[step];

  const handleSelect = (c: Character) => {
    const updated = [...selections];
    updated[step] = c;
    setSelections(updated);

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Last step — confirm
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
    // Reset state for next open
    setTimeout(() => {
      setStep(0);
      setSelections([null, null, null, null]);
    }, 300);
  };

  const handleBlank = () => {
    onOpenChange(false);
    onCreateBlank();
    setTimeout(() => {
      setStep(0);
      setSelections([null, null, null, null]);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0"
        onOpenAutoFocus={(e) => {
          if (navigator.maxTouchPoints > 0) e.preventDefault();
        }}
      >
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <span className="text-muted-foreground font-normal text-sm">
              Quick Create Team
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground/60">
              Step {step + 1} of {STEPS.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* ── Step progress pills ── */}
        <div className="flex items-end gap-3 px-5 pt-3 pb-0 shrink-0">
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

        {/* ── Progress bar ── */}
        <div className="h-px bg-border/30 mx-5 mt-3 mb-0 shrink-0 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* ── Current step header ── */}
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

        {/* ── Character picker ── */}
        <div className="flex-1 overflow-hidden px-5 pt-3 pb-0 min-h-0">
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
                selectedCharacters={selections}
                onSelect={handleSelect}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-background/50 shrink-0">
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
      </DialogContent>
    </Dialog>
  );
};
