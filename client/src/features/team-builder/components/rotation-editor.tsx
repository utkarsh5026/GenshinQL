import { Reorder, useDragControls } from 'framer-motion';
import { BookText, GripVertical, Plus, RotateCcw, X } from 'lucide-react';
import React, { useState } from 'react';

import { CachedImage } from '@/features/cache';
import { CharacterAvatar } from '@/features/characters';
import { cn } from '@/lib/utils';

import { useRotation } from '../hooks/useRotation';
import { useTalentIconsMap } from '../hooks/useTalentIconsMap';
import type {
  RotationAbility,
  RotationSegment,
  TalentIconEntry,
  TeamCharacterSlot,
} from '../types';

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
    title: 'Skill',
    className: 'text-blue-300  hover:bg-blue-500/35',
  },
  Q: {
    label: 'Q',
    title: 'Burst',
    className: 'text-amber-300 hover:bg-amber-500/35',
  },
  NA: {
    label: 'NA',
    title: 'Normal Attack',
    className: 'text-slate-300 hover:bg-slate-500/35',
  },
  CA: {
    label: 'CA',
    title: 'Charged Attack',
    className: 'text-purple-300 hover:bg-purple-500/35',
  },
};

const ABILITIES: RotationAbility[] = ['E', 'Q', 'NA', 'CA'];

/** Maps each RotationAbility to its talent index: [NA, E, Q] = [0, 1, 2]. CA shares the Normal Attack icon. */
const ABILITY_TO_TALENT_IDX: Record<RotationAbility, number> = {
  NA: 0,
  CA: 0,
  E: 1,
  Q: 2,
};

interface SegmentCardProps {
  segment: RotationSegment;
  talentIcons?: [TalentIconEntry, TalentIconEntry, TalentIconEntry];
  onRemoveSegment: (id: string) => void;
  onRemoveAbility: (id: string, abilityIndex: number) => void;
  onAddAbility: (id: string, ability: RotationAbility) => void;
  onNoteChange: (id: string, note: string) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  talentIcons,
  onRemoveSegment,
  onRemoveAbility,
  onAddAbility,
  onNoteChange,
}) => {
  const controls = useDragControls();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <Reorder.Item
      value={segment}
      dragListener={false}
      dragControls={controls}
      className="flex min-w-32 shrink-0 select-none flex-col gap-2 rounded-xl border border-border/30 bg-accent/20 p-2.5"
    >
      {/* Drag handle */}
      <div
        onPointerDown={(e) => controls.start(e)}
        className="flex cursor-grab items-center justify-center active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground/40" />
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-0.5">
        <CharacterAvatar
          characterName={segment.characterName}
          interactive={false}
          showName={false}
          size="xs"
        />
        <p className="max-w-full truncate text-center text-[9px] leading-none text-muted-foreground/70">
          {segment.characterName}
        </p>
      </div>

      {/* Ability sequence */}
      <div className="flex flex-wrap items-center gap-1">
        {segment.abilities.map((ability, i) => {
          const icon = talentIcons?.[ABILITY_TO_TALENT_IDX[ability]];
          return (
            <button
              key={i}
              onClick={() => onRemoveAbility(segment.id, i)}
              title={`${ABILITY_META[ability].title} — click to remove`}
              className={cn(
                'flex items-center gap-0.5 rounded border px-1 py-0.5 text-[10px] font-bold transition-all',
                'ring-offset-background hover:opacity-70 hover:ring-1 hover:ring-destructive/50'
              )}
            >
              {icon?.iconUrl && (
                <CachedImage
                  src={icon.iconUrl}
                  alt={icon.name}
                  className="h-3 w-3 shrink-0 object-contain"
                />
              )}
              {ability}
            </button>
          );
        })}

        {/* Add-ability toggle */}
        <button
          onClick={() => setIsPickerOpen((o) => !o)}
          title="Add ability"
          className={cn(
            'rounded border px-1 py-0.5 text-[10px] transition-all',
            isPickerOpen
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border/40 text-muted-foreground/50 hover:border-border/70 hover:text-muted-foreground'
          )}
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Inline ability picker */}
      {isPickerOpen && (
        <div className="flex flex-wrap gap-1">
          {ABILITIES.map((ability) => {
            const icon = talentIcons?.[ABILITY_TO_TALENT_IDX[ability]];
            return (
              <button
                key={ability}
                onClick={() => onAddAbility(segment.id, ability)}
                title={ABILITY_META[ability].title}
                className={cn(
                  'flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-bold transition-all',
                  ABILITY_META[ability].className
                )}
              >
                {icon?.iconUrl && (
                  <CachedImage
                    src={icon.iconUrl}
                    alt={icon.name}
                    className="h-3 w-3 shrink-0 object-contain"
                  />
                )}
                {ability}
              </button>
            );
          })}
        </div>
      )}

      {/* Note + remove */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={segment.note}
          onChange={(e) =>
            onNoteChange(segment.id, e.target.value.slice(0, 60))
          }
          onClick={(e) => e.stopPropagation()}
          placeholder="note…"
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[9px] text-muted-foreground placeholder:text-muted-foreground/30',
            'border-b border-transparent transition-colors focus:border-border/40 focus:outline-none'
          )}
        />
        <button
          onClick={() => onRemoveSegment(segment.id)}
          title="Remove"
          className="shrink-0 text-muted-foreground/40 transition-colors hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </Reorder.Item>
  );
};

export const RotationEditor: React.FC<RotationEditorProps> = ({
  value,
  onChange,
  slots,
}) => {
  const {
    segments,
    selectedCharName,
    filledSlots,
    handleSelectChar,
    handleAddAbility,
    handleAddAbilityToSegment,
    handleRemoveAbilityFromSegment,
    handleRemoveSegment,
    handleNoteChange,
    handleReorderSegments,
    handleReset,
  } = useRotation({ value, onChange, slots });

  const talentMap = useTalentIconsMap();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">Team Rotation</span>
        </div>
        {segments.length > 0 && (
          <button
            onClick={handleReset}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Clear rotation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Character selector */}
      {filledSlots.length === 0 ? (
        <p className="px-1 text-xs italic text-muted-foreground/60">
          Add characters to your team first
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          {filledSlots.map((slot) => {
            const name = slot.character.name;
            const isSelected = selectedCharName === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectChar(name)}
                className={cn(
                  'rounded-xl border p-1.5 transition-all',
                  isSelected
                    ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/40'
                    : 'border-border/40 bg-accent/20 hover:border-border/70 hover:bg-accent/40'
                )}
                title={name}
              >
                <CharacterAvatar
                  characterName={name}
                  interactive={false}
                  showName
                  size="sm"
                  nameClassName="max-w-11 truncate"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Ability buttons — visible when a character is selected */}
      {selectedCharName && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">
            {selectedCharName}:
          </span>
          {ABILITIES.map((ability) => {
            const meta = ABILITY_META[ability];
            const icon =
              talentMap[selectedCharName]?.[ABILITY_TO_TALENT_IDX[ability]];
            return (
              <button
                key={ability}
                onClick={() => handleAddAbility(ability)}
                title={meta.title}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                  meta.className
                )}
              >
                {icon?.iconUrl && (
                  <CachedImage
                    src={icon.iconUrl}
                    alt={icon.name}
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                )}
                {meta.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Horizontal segment cards */}
      {segments.length > 0 ? (
        <Reorder.Group
          axis="x"
          values={segments}
          onReorder={handleReorderSegments}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {segments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              talentIcons={talentMap[segment.characterName]}
              onRemoveSegment={handleRemoveSegment}
              onRemoveAbility={handleRemoveAbilityFromSegment}
              onAddAbility={handleAddAbilityToSegment}
              onNoteChange={handleNoteChange}
            />
          ))}
        </Reorder.Group>
      ) : (
        filledSlots.length > 0 && (
          <p className="px-1 text-xs italic text-muted-foreground/50">
            No steps yet — select a character above
          </p>
        )
      )}
    </div>
  );
};
