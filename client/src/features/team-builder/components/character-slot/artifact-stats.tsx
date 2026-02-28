import { Reorder } from 'framer-motion';
import { Crown, GripVertical, Timer, Wine } from 'lucide-react';
import React from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import { useDetailedArtifactsMap } from '@/features/characters';
import { cn } from '@/lib/utils';

import {
  CIRCLET_MAIN_STATS,
  GOBLET_MAIN_STATS,
  SANDS_MAIN_STATS,
  SUBSTAT_OPTIONS,
  SUBSTAT_PRIORITY,
} from '../../constants';
import type { ArtifactConfig, TeamCharacterSlot } from '../../types';

/**
 * Piece-type popover definitions for Sands / Goblet / Circlet main stat selection.
 */
const PIECE_POPOVERS: Array<{
  key: 'sands' | 'goblet' | 'circlet';
  label: string;
  Icon: React.FC<{ className?: string }>;
  options: string[];
}> = [
  { key: 'sands', label: 'Sands', Icon: Timer, options: SANDS_MAIN_STATS },
  { key: 'goblet', label: 'Goblet', Icon: Wine, options: GOBLET_MAIN_STATS },
  {
    key: 'circlet',
    label: 'Circlet',
    Icon: Crown,
    options: CIRCLET_MAIN_STATS,
  },
];

interface PieceIconProps {
  artifacts: ArtifactConfig;
  pieceKey: 'sands' | 'goblet' | 'circlet';
  FallbackIcon: React.FC<{ className?: string }>;
}

const PieceIcon: React.FC<PieceIconProps> = ({
  artifacts,
  pieceKey,
  FallbackIcon,
}) => {
  const detailedMap = useDetailedArtifactsMap();

  if (artifacts.mode === '4pc') {
    const iconUrl = detailedMap.get(artifacts.set)?.[pieceKey]?.iconUrl;
    if (iconUrl)
      return (
        <CachedImage
          src={iconUrl}
          alt=""
          className="w-4 h-4 object-contain shrink-0"
          showSkeleton={false}
        />
      );
  } else {
    const urlA = detailedMap.get(artifacts.setA)?.[pieceKey]?.iconUrl;
    const urlB = detailedMap.get(artifacts.setB)?.[pieceKey]?.iconUrl;
    if (urlA || urlB)
      return (
        <span className="flex items-center gap-0.5 shrink-0">
          {urlA && (
            <CachedImage
              src={urlA}
              alt=""
              className="w-3.5 h-3.5 object-contain"
              showSkeleton={false}
            />
          )}
          {urlA && urlB && (
            <span className="text-[8px] text-muted-foreground/50 leading-none">
              /
            </span>
          )}
          {urlB && (
            <CachedImage
              src={urlB}
              alt=""
              className="w-3.5 h-3.5 object-contain"
              showSkeleton={false}
            />
          )}
        </span>
      );
  }

  return <FallbackIcon className="w-3 h-3 shrink-0" />;
};

interface ArtifactStatsProps {
  mainStats: TeamCharacterSlot['mainStats'];
  artifacts: ArtifactConfig;
  substats: string[];
  onSetMainStats: (ms: TeamCharacterSlot['mainStats']) => void;
  onSetSubstats: (ss: string[]) => void;
}

export const ArtifactStats: React.FC<ArtifactStatsProps> = ({
  mainStats,
  artifacts,
  substats,
  onSetMainStats,
  onSetSubstats,
}) => {
  const toggleMainStat = (
    key: 'sands' | 'goblet' | 'circlet',
    value: string
  ) => {
    const cur = mainStats[key];
    onSetMainStats({
      ...mainStats,
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    });
  };

  const toggleSubstat = (stat: string) => {
    if (substats.includes(stat)) {
      onSetSubstats(substats.filter((s) => s !== stat));
    } else {
      onSetSubstats(
        [...substats, stat].sort(
          (a, b) => (SUBSTAT_PRIORITY[a] ?? 99) - (SUBSTAT_PRIORITY[b] ?? 99)
        )
      );
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Main stat selectors (Sands / Goblet / Circlet) */}
      <div className="flex gap-1.5">
        {PIECE_POPOVERS.map(({ key, label, Icon, options }) => {
          const selected = mainStats[key];
          const hasSelection = selected.length > 0;
          const triggerLabel = hasSelection
            ? selected.slice(0, 2).join(' · ') +
              (selected.length > 2 ? ` +${selected.length - 2}` : '')
            : label;
          return (
            <Popover key={key}>
              <PopoverTrigger asChild>
                <button
                  title={`Set ${label} main stat`}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border transition-all',
                    'bg-accent/30 border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <PieceIcon
                    artifacts={artifacts}
                    pieceKey={key}
                    FallbackIcon={Icon}
                  />
                  <span>{triggerLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                sideOffset={4}
                className="w-auto p-2"
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {label} Main Stat
                </p>
                <div className="flex flex-wrap gap-1">
                  {options.map((opt) => {
                    const isActive = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleMainStat(key, opt)}
                        className={cn(
                          'px-2 py-1 text-[10px] rounded-md font-medium transition-all border',
                          isActive
                            ? 'bg-primary/20 border-primary/60 text-primary'
                            : 'bg-accent/40 border-border/30 hover:bg-accent/70 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Substat toggle buttons */}
      <div className="flex flex-wrap gap-1">
        {SUBSTAT_OPTIONS.map((opt) => {
          const isSelected = substats.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggleSubstat(opt)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] rounded font-medium transition-all border',
                isSelected
                  ? 'bg-primary/20 border-primary/60 text-primary'
                  : 'bg-accent/40 border-border/30 hover:bg-accent/70 text-muted-foreground'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Draggable substat priority chips */}
      {substats.length > 0 && (
        <Reorder.Group
          axis="x"
          values={substats}
          onReorder={onSetSubstats}
          className="flex flex-wrap items-center gap-0.5"
        >
          {substats.map((s, i) => (
            <Reorder.Item
              key={s}
              value={s}
              className="flex items-center cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary/80 flex items-center gap-0.5">
                <GripVertical className="w-2.5 h-2.5 text-primary/30 shrink-0" />
                {s}
              </span>
              {i < substats.length - 1 && (
                <span className="text-[8px] text-muted-foreground/40 font-semibold mx-1 pointer-events-none">
                  &gt;&gt;
                </span>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};
