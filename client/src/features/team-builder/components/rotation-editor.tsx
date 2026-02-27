import { BookText, RotateCcw, X } from 'lucide-react';
import React from 'react';

import { CachedImage } from '@/features/cache';
import { cn } from '@/lib/utils';

import { useRotation } from '../hooks/useRotation';
import type { RotationAbility, TeamCharacterSlot } from '../types';

interface RotationEditorProps {
  value: string;
  onChange: (value: string) => void;
  slots: [
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
    TeamCharacterSlot,
  ];
}

const ABILITY_META: Record<
  RotationAbility,
  { label: string; title: string; className: string }
> = {
  E: {
    label: 'E',
    title: 'Elemental Skill',
    className:
      'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/35',
  },
  Q: {
    label: 'Q',
    title: 'Elemental Burst',
    className:
      'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/35',
  },
  NA: {
    label: 'NA',
    title: 'Normal Attack',
    className:
      'bg-slate-500/20 text-slate-300 border-slate-500/40 hover:bg-slate-500/35',
  },
  CA: {
    label: 'CA',
    title: 'Charged Attack',
    className:
      'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/35',
  },
};

const ABILITIES: RotationAbility[] = ['E', 'Q', 'NA', 'CA'];

export const RotationEditor: React.FC<RotationEditorProps> = ({
  value,
  onChange,
  slots,
}) => {
  const {
    steps,
    selectedCharName,
    filledSlots,
    serializedLength,
    handleSelectChar,
    handleAddStep,
    handleRemoveStep,
    handleNoteChange,
    handleReset,
  } = useRotation({ value, onChange, slots });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">Team Rotation</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${serializedLength > 500 ? 'text-amber-400' : 'text-muted-foreground'}`}
          >
            {serializedLength}/600
          </span>
          {steps.length > 0 && (
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Clear rotation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Character selector */}
      {filledSlots.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic px-1">
          Add characters to your team first
        </p>
      ) : (
        <div className="flex items-end gap-3 flex-wrap">
          {filledSlots.map((slot) => {
            const name = slot.character.name;
            const isSelected = selectedCharName === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectChar(name)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-1.5 border transition-all',
                  isSelected
                    ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/40'
                    : 'border-border/40 bg-accent/20 hover:bg-accent/40 hover:border-border/70'
                )}
                title={name}
              >
                <CachedImage
                  src={slot.character.iconUrl}
                  alt={name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="text-[10px] text-muted-foreground leading-none max-w-11 truncate">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Ability buttons — only when a character is selected */}
      {selectedCharName && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">
            {selectedCharName}:
          </span>
          {ABILITIES.map((ability) => {
            const meta = ABILITY_META[ability];
            return (
              <button
                key={ability}
                onClick={() => handleAddStep(ability)}
                title={meta.title}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                  meta.className
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Step list */}
      {steps.length > 0 ? (
        <ol className="space-y-1.5">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-center gap-2 bg-accent/20 rounded-lg px-2.5 py-1.5 border border-border/30"
            >
              <span className="text-[10px] text-muted-foreground/60 w-4 shrink-0 text-right">
                {index + 1}.
              </span>
              {step.characterIconUrl ? (
                <CachedImage
                  src={step.characterIconUrl}
                  alt={step.characterName}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-accent shrink-0" />
              )}
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-md border shrink-0',
                  ABILITY_META[step.ability].className
                )}
              >
                {step.ability}
              </span>
              <span className="text-xs text-foreground/80 shrink-0">
                {step.characterName}
              </span>
              <input
                type="text"
                value={step.note}
                onChange={(e) =>
                  handleNoteChange(index, e.target.value.slice(0, 60))
                }
                placeholder="add note…"
                className="flex-1 min-w-0 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/40
                  focus:outline-none border-b border-transparent focus:border-border/50 transition-colors"
              />
              <button
                onClick={() => handleRemoveStep(index)}
                className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
                title="Remove step"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        filledSlots.length > 0 && (
          <p className="text-xs text-muted-foreground/50 italic px-1">
            No steps yet — select a character above
          </p>
        )
      )}
    </div>
  );
};
