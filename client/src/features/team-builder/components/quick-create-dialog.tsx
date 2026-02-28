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

const ELEMENT_ORDER = [
  'Pyro',
  'Hydro',
  'Anemo',
  'Electro',
  'Cryo',
  'Geo',
  'Dendro',
];

import { AppInput } from '@/components/ui/app-input';
import { Card } from '@/components/ui/card';
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

import { ELEMENTAL_RESONANCES } from '../constants';
import type { CharacterRole } from '../types';
import type { CharacterGroup } from '../utils/computeCharacterGroups';
import { computeCharacterGroups } from '../utils/computeCharacterGroups';

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

/** ─── Card wrapper for a character group section ────────────────────────── */

const SectionCard: React.FC<{
  label: string;
  element?: string;
  elementUrl?: string;
  count: number;
  children: React.ReactNode;
}> = ({ label, element, elementUrl, count, children }) => (
  <Card className="border-border/30 bg-accent/20 overflow-hidden">
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
      {element && elementUrl && (
        <ElementBadge
          name={element}
          url={elementUrl}
          size="xs"
          showLabel={false}
        />
      )}
      <span
        className={cn(
          'text-xs font-semibold',
          element ? getElementTextClass(element) : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground/50">({count})</span>
    </div>
    <div className="p-2">{children}</div>
  </Card>
);

/** ─── Element-subdivided character grid ────────────────────────────────── */

const ElementGroupedGrid: React.FC<{
  characters: Character[];
  elementUrlMap: Record<string, string>;
  selectedNames: Set<string>;
  onSelect: (c: Character) => void;
}> = ({ characters, elementUrlMap, selectedNames, onSelect }) => {
  const subgroups = useMemo(() => {
    const map = new Map<string, Character[]>();
    for (const c of characters) {
      if (!map.has(c.element)) map.set(c.element, []);
      map.get(c.element)!.push(c);
    }
    return [...map.keys()]
      .sort((a, b) => {
        const ia = ELEMENT_ORDER.indexOf(a);
        const ib = ELEMENT_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map((el) => ({ element: el, chars: map.get(el)! }));
  }, [characters]);

  return (
    <div className="flex flex-col gap-2">
      {subgroups.map(({ element, chars }) => (
        <div key={element}>
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <ElementBadge
              name={element}
              url={elementUrlMap[element.toLowerCase()] ?? ''}
              size="xs"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
            {chars.map((c) => {
              const isSelected = selectedNames.has(c.name);
              return (
                <div key={c.name} className="relative flex justify-center">
                  <CharacterAvatar
                    characterName={c.name}
                    size="md"
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
        </div>
      ))}
    </div>
  );
};

/** ─── Character picker grid with sections ───────────────────────────────── */

interface InlinePickerProps {
  groups: CharacterGroup[];
  elementUrlMap: Record<string, string>;
  selectedCharacters: (Character | null)[];
  onSelect: (c: Character) => void;
}

const InlineCharacterPicker: React.FC<InlinePickerProps> = ({
  groups,
  elementUrlMap,
  selectedCharacters,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const selectedNames = useMemo(
    () => new Set(selectedCharacters.filter(Boolean).map((c) => c!.name)),
    [selectedCharacters]
  );

  /** Apply search filter to each group */
  const filteredGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        characters: group.characters.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase().trim())
        ),
      }))
      .filter((group) => group.characters.length > 0);
  }, [groups, search]);

  const totalCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.characters.length, 0),
    [filteredGroups]
  );

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {/** Search */}
      <AppInput
        placeholder="Search characters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        autoFocus
        className="bg-accent/40 border-border/50 rounded-lg py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-muted-foreground/60"
      />

      {/** Sectioned character cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filteredGroups.map((group) => (
          <SectionCard
            key={group.id}
            label={group.label}
            element={group.element}
            elementUrl={
              group.element
                ? elementUrlMap[group.element.toLowerCase()]
                : undefined
            }
            count={group.characters.length}
          >
            {group.id === 'recommended' || group.id === 'other' ? (
              <ElementGroupedGrid
                characters={group.characters}
                elementUrlMap={elementUrlMap}
                selectedNames={selectedNames}
                onSelect={onSelect}
              />
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
                {group.characters.map((c) => {
                  const isSelected = selectedNames.has(c.name);
                  return (
                    <div key={c.name} className="relative flex justify-center">
                      <CharacterAvatar
                        characterName={c.name}
                        size="md"
                        showElement
                        onClick={isSelected ? () => {} : () => onSelect(c)}
                        className={
                          isSelected
                            ? 'opacity-40 cursor-not-allowed'
                            : undefined
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
            )}
          </SectionCard>
        ))}
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <span className="text-sm">No characters found</span>
          </div>
        )}
      </div>
    </div>
  );
};

/** ─── Main inline panel ─────────────────────────────────────────────────── */

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

      {/** ── Footer actions ── */}
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
    </div>
  );
};
