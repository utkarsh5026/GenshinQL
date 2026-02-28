import * as PopoverPrimitive from '@radix-ui/react-popover';
import { GripVertical, Pencil, X } from 'lucide-react';
import React from 'react';

import { Text } from '@/components/ui/text';
import { CachedImage } from '@/features/cache';
import CharacterAvatar from '@/features/characters/components/utils/character-avatar';
import { useCharacterMap } from '@/features/characters/stores';
import { cn } from '@/lib/utils';
import type { Character } from '@/types';

import { SlotPopover } from './slot-popover';

const LEVEL_PRESETS = [20, 40, 60, 70, 80, 90, 100];

const optionButtonClass = (isActive: boolean) =>
  cn(
    'w-7 py-1 text-xs rounded-md font-semibold transition-all',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-surface-300 hover:bg-midnight-700 text-muted-foreground'
  );

interface CharacterPortraitProps {
  character: Character;
  elementColor: string | null;
  constellation: number;
  level: number;
  onSetConstellation: (c: number) => void;
  onSetLevel: (l: number) => void;
  onPickerOpen: () => void;
  onClearSlot: () => void;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  character,
  elementColor,
  constellation,
  level,
  onSetConstellation,
  onSetLevel,
  onPickerOpen,
  onClearSlot,
}) => {
  const characterMap = useCharacterMap();
  const liveCharacter = characterMap[character.name] ?? character;
  const hasNamecard = !!liveCharacter.namecardURL;

  return (
    <div
      className="relative w-full h-24 shrink-0 overflow-hidden rounded-t-2xl"
      style={{
        background: hasNamecard
          ? undefined
          : `linear-gradient(135deg, ${elementColor}30 0%, #0a0d14 70%)`,
      }}
    >
      {/* Namecard background */}
      {hasNamecard && (
        <>
          <CachedImage
            src={liveCharacter.namecardURL}
            alt=""
            wrapperClassName="absolute inset-0 w-full h-full"
            className="w-full h-full object-cover"
            showSkeleton={false}
            onError={(e) => {
              const container = e.currentTarget.closest(
                '.rounded-t-2xl'
              ) as HTMLElement;
              if (container)
                container.style.background = `linear-gradient(135deg, ${elementColor}30 0%, #0a0d14 70%)`;
            }}
          />
          {/* Darken overlay for readability */}
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
        </>
      )}

      {/* Fallback gradient overlay when no namecard */}
      {!hasNamecard && (
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/30" />
      )}

      {/* ── Left side: Avatar + Character info ── */}
      <div className="absolute inset-0 flex items-center gap-3 px-3 z-10">
        {/* Character avatar with rarity & element */}
        <CharacterAvatar
          characterName={character.name}
          size="md"
          showName={false}
          showRarity
          showElement
          interactive={false}
        />

        {/* Name + badges */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Text
              as="span"
              size="sm"
              weight="bold"
              color="inherit"
              truncate
              className="text-white drop-shadow-md"
              style={{ textShadow: `0 0 10px ${elementColor}80` }}
            >
              {character.name}
            </Text>
          </div>

          {/* Constellation + Level badges */}
          <div className="flex gap-1.5">
            <SlotPopover
              label={`C${constellation}`}
              title="Constellation"
              contentClassName="w-auto"
              triggerClassName="w-fit"
            >
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                  <PopoverPrimitive.Close key={c} asChild>
                    <button
                      onClick={() => onSetConstellation(c)}
                      className={optionButtonClass(constellation === c)}
                    >
                      C{c}
                    </button>
                  </PopoverPrimitive.Close>
                ))}
              </div>
            </SlotPopover>

            <SlotPopover
              label={`Lv.${level}`}
              title="Level"
              contentClassName="w-48"
              triggerClassName="w-fit"
            >
              <div className="flex flex-wrap gap-1 mb-2">
                {LEVEL_PRESETS.map((l) => (
                  <button
                    key={l}
                    onClick={() => onSetLevel(l)}
                    className={cn(
                      optionButtonClass(level === l),
                      'px-2 py-1 text-[10px] w-auto'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={100}
                value={level}
                onChange={(e) =>
                  onSetLevel(Math.min(90, Math.max(1, Number(e.target.value))))
                }
                className="w-full px-2 py-1 text-xs bg-midnight-800/80 border border-midnight-700/60 rounded-md text-center focus:outline-none focus:border-primary/60"
              />
            </SlotPopover>
          </div>
        </div>
      </div>

      {/* ── Right side: Action buttons ── */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <div
          className="w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-3 h-3 text-white/70" />
        </div>
        <button
          onClick={onPickerOpen}
          className="w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-all"
          title="Change character"
        >
          <Pencil className="w-3 h-3 text-white/70" />
        </button>
        <button
          onClick={onClearSlot}
          className="w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm hover:bg-red-900/70 flex items-center justify-center transition-all"
          title="Clear slot"
        >
          <X className="w-3 h-3 text-white/70" />
        </button>
      </div>
    </div>
  );
};
