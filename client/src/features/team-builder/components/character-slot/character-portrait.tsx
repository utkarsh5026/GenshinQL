import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';

import { ElementBadge } from '@/components/ui/genshin-game-icons';
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
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  character,
  elementColor,
  constellation,
  level,
  onSetConstellation,
  onSetLevel,
}) => (
  <div
    className="relative w-28 shrink-0"
    style={{
      background: `linear-gradient(to bottom right, ${elementColor}30, #0a0d14)`,
    }}
  >
    <img
      src={character.iconUrl}
      alt={character.name}
      className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity"
    />

    {/* Gradient overlays */}
    <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/50" />
    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

    {/* Element icon */}
    <div className="absolute top-2 left-2 z-10">
      {character.elementUrl && (
        <ElementBadge name={character.element} url={character.elementUrl} />
      )}
    </div>

    {/* Constellation + Level badges at bottom of portrait */}
    <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
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
);
