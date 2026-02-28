import { Reorder } from 'framer-motion';
import { Crown, GripVertical, Timer, Wine } from 'lucide-react';
import React from 'react';

import { GenshinChip } from '@/components/ui/genshin-chip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import { useDetailedArtifactsMap } from '@/features/characters';

import {
  CIRCLET_MAIN_STATS,
  GOBLET_MAIN_STATS,
  SANDS_MAIN_STATS,
  SUBSTAT_OPTIONS,
  SUBSTAT_PRIORITY,
} from '../../constants';
import type { ArtifactConfig, TeamCharacterSlot } from '../../types';
import { StatIcon } from './stat-icon';

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
    <div className="space-y-4">
      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
        Main Stats
      </p>
      <div className="flex flex-col gap-2">
        {PIECE_POPOVERS.map(({ key, label, Icon, options }) => {
          const selected = mainStats[key];
          const hasSelection = selected.length > 0;
          return (
            <div key={key} className="flex items-center gap-2">
              {/* Label */}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70 w-14 shrink-0">
                <Icon className="w-3 h-3 shrink-0" />
                {label}
              </span>

              {/* Trigger */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    title={`Set ${label} main stat`}
                    className="flex flex-wrap gap-1 cursor-pointer min-w-0"
                  >
                    {hasSelection ? (
                      selected.map((stat) => (
                        <GenshinChip
                          key={stat}
                          variant="outline"
                          selected
                          leftIcon={<StatIcon stat={stat} />}
                          className="pointer-events-none"
                        >
                          {stat}
                        </GenshinChip>
                      ))
                    ) : (
                      <GenshinChip
                        variant="ghost"
                        selected={false}
                        leftIcon={
                          <PieceIcon
                            artifacts={artifacts}
                            pieceKey={key}
                            FallbackIcon={Icon}
                          />
                        }
                        className="pointer-events-none text-muted-foreground border-border"
                      >
                        Any
                      </GenshinChip>
                    )}
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
                  <div className="flex flex-col flex-wrap gap-1.5 max-w-50">
                    {options.map((opt) => {
                      const isActive = selected.includes(opt);
                      return (
                        <GenshinChip
                          key={opt}
                          rarity={isActive ? 5 : undefined}
                          variant={isActive ? 'solid' : 'ghost'}
                          selected={isActive}
                          onClick={() => toggleMainStat(key, opt)}
                          leftIcon={<StatIcon stat={opt} />}
                        >
                          {opt}
                        </GenshinChip>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
        Substats
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SUBSTAT_OPTIONS.map((opt) => {
          const isSelected = substats.includes(opt);
          return (
            <GenshinChip
              key={opt}
              variant={isSelected ? 'outline' : 'ghost'}
              selected={isSelected}
              onClick={() => toggleSubstat(opt)}
              leftIcon={
                <StatIcon stat={opt} className="w-3 h-3 shrink-0 opacity-70" />
              }
            >
              {opt}
            </GenshinChip>
          );
        })}
      </div>

      {/* Draggable substat priority chips */}
      {substats.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Priority — drag to reorder
          </p>
          <Reorder.Group
            axis="x"
            values={substats}
            onReorder={onSetSubstats}
            className="flex flex-wrap items-center gap-1"
          >
            {substats.map((s, i) => (
              <Reorder.Item
                key={s}
                value={s}
                className="flex items-center cursor-grab active:cursor-grabbing touch-none"
              >
                <GenshinChip
                  variant="outline"
                  selected
                  leftIcon={
                    <>
                      <GripVertical className="w-2.5 h-2.5 opacity-40 shrink-0" />
                      <StatIcon
                        stat={s}
                        className="w-3 h-3 shrink-0 opacity-70"
                      />
                    </>
                  }
                >
                  {s}
                </GenshinChip>
                {i < substats.length - 1 && (
                  <span className="text-[8px] text-muted-foreground/40 font-semibold mx-1 pointer-events-none">
                    &gt;&gt;
                  </span>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
};
