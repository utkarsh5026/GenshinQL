import { ChevronsUpDown, X } from 'lucide-react';
import React, { useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import { useArtifactLinks } from '@/features/characters/stores';
import type { ArtifactLink } from '@/features/characters/types';
import { cn } from '@/lib/utils';

import {
  CIRCLET_MAIN_STATS,
  GOBLET_MAIN_STATS,
  SANDS_MAIN_STATS,
  SUBSTAT_OPTIONS,
} from '../../constants';
import type { ArtifactConfig } from '../../types';

interface ArtifactPickerPanelProps {
  current: ArtifactConfig | null;
  onChange: (config: ArtifactConfig | null) => void;
}

type ArtifactMode = '4pc' | '2+2pc';

const ArtifactSetSelector: React.FC<{
  label: string;
  value: string;
  onChange: (name: string, iconUrl?: string) => void;
  artifactLinks: readonly ArtifactLink[];
}> = ({ label, value, onChange, artifactLinks }) => {
  const [open, setOpen] = useState(false);

  const selected = artifactLinks.find((a) => a.name === value);

  return (
    <div className="flex-1 min-w-0">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors',
              'bg-accent/40 border-border/50 hover:bg-accent/60 hover:border-border',
              open && 'ring-1 ring-primary/50 border-primary/40'
            )}
          >
            {selected?.flowerIconUrl && (
              <CachedImage
                src={selected.flowerIconUrl}
                alt=""
                className="w-5 h-5 object-contain shrink-0"
                showSkeleton={false}
              />
            )}
            <span
              className={cn(
                'flex-1 text-left truncate',
                !value && 'text-muted-foreground/60'
              )}
            >
              {value || 'Search artifact sets…'}
            </span>
            {value ? (
              <X
                className="w-3.5 h-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('', undefined);
                }}
              />
            ) : (
              <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search artifact sets…"
              className="h-8 text-xs"
            />
            <CommandList>
              <CommandEmpty className="py-3 text-xs">
                No sets found
              </CommandEmpty>
              <CommandGroup>
                {artifactLinks.map((a) => (
                  <CommandItem
                    key={a.name}
                    value={a.name}
                    onSelect={() => {
                      onChange(a.name, a.flowerIconUrl);
                      setOpen(false);
                    }}
                    className="text-xs gap-2 cursor-pointer"
                  >
                    {a.flowerIconUrl && (
                      <CachedImage
                        src={a.flowerIconUrl}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0 opacity-90"
                        showSkeleton={false}
                      />
                    )}
                    <span className="truncate">{a.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const ArtifactPickerPanel: React.FC<ArtifactPickerPanelProps> = ({
  current,
  onChange,
}) => {
  const artifactLinks = useArtifactLinks();
  const [mode, setMode] = useState<ArtifactMode>(
    current?.mode === '2+2pc' ? '2+2pc' : '4pc'
  );

  const handleModeSwitch = (m: ArtifactMode) => {
    setMode(m);
    onChange(null);
  };

  const handle4pcChange = (set: string, iconUrl?: string) => {
    onChange({ mode: '4pc', set, setIconUrl: iconUrl });
  };

  const handle2pc2pcChangeA = (setA: string, iconUrl?: string) => {
    const prev = current?.mode === '2+2pc' ? current : null;
    onChange({
      mode: '2+2pc',
      setA,
      setAIconUrl: iconUrl,
      setB: prev?.setB ?? '',
      setBIconUrl: prev?.setBIconUrl,
    });
  };

  const handle2pc2pcChangeB = (setB: string, iconUrl?: string) => {
    const prev = current?.mode === '2+2pc' ? current : null;
    onChange({
      mode: '2+2pc',
      setA: prev?.setA ?? '',
      setAIconUrl: prev?.setAIconUrl,
      setB,
      setBIconUrl: iconUrl,
    });
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-accent/30 rounded-lg w-fit">
        {(['4pc', '2+2pc'] as ArtifactMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
              mode === m
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Selectors */}
      {mode === '4pc' ? (
        <ArtifactSetSelector
          label="4-Piece Set"
          value={current?.mode === '4pc' ? current.set : ''}
          onChange={handle4pcChange}
          artifactLinks={artifactLinks}
        />
      ) : (
        <div className="flex gap-3">
          <ArtifactSetSelector
            label="2-Piece Set A"
            value={current?.mode === '2+2pc' ? current.setA : ''}
            onChange={handle2pc2pcChangeA}
            artifactLinks={artifactLinks}
          />
          <ArtifactSetSelector
            label="2-Piece Set B"
            value={current?.mode === '2+2pc' ? current.setB : ''}
            onChange={handle2pc2pcChangeB}
            artifactLinks={artifactLinks}
          />
        </div>
      )}
    </div>
  );
};

/** Piece definitions for iterating main stat selectors */
const MAIN_STAT_PIECES: Array<{
  label: string;
  key: 'sands' | 'goblet' | 'circlet';
  options: string[];
}> = [
  { label: 'Sands', key: 'sands', options: SANDS_MAIN_STATS },
  { label: 'Goblet', key: 'goblet', options: GOBLET_MAIN_STATS },
  { label: 'Circlet', key: 'circlet', options: CIRCLET_MAIN_STATS },
];

interface ArtifactsPanelProps {
  artifacts: ArtifactConfig | null;
  mainStats: { sands: string; goblet: string; circlet: string };
  substats: string[];
  onSetArtifacts: (a: ArtifactConfig | null) => void;
  onToggleMainStat: (
    key: 'sands' | 'goblet' | 'circlet',
    value: string
  ) => void;
  onToggleSubstat: (stat: string) => void;
  onClose: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  artifacts,
  mainStats,
  substats,
  onSetArtifacts,
  onToggleMainStat,
  onToggleSubstat,
  onClose,
}) => (
  <div className="pt-1 border-t border-border/30">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        Artifacts
      </span>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
    <ArtifactPickerPanel current={artifacts} onChange={onSetArtifacts} />

    {/* Main stats */}
    <div className="mt-3 space-y-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        Main Stats
      </span>
      {MAIN_STAT_PIECES.map(({ label, key, options }) => (
        <div key={key}>
          <p className="text-[9px] text-muted-foreground/60 mb-1">{label}</p>
          <div className="flex flex-wrap gap-1">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onToggleMainStat(key, opt)}
                className={`px-1.5 py-0.5 text-[9px] rounded font-medium transition-all ${
                  mainStats[key] === opt
                    ? 'bg-primary/80 text-primary-foreground'
                    : 'bg-accent/40 hover:bg-accent/70 text-muted-foreground'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Substats */}
    <div className="mt-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        Substats
      </p>
      <div className="flex flex-wrap gap-1">
        {SUBSTAT_OPTIONS.map((opt) => {
          const selected = substats.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggleSubstat(opt)}
              className={`px-1.5 py-0.5 text-[9px] rounded font-medium transition-all border ${
                selected
                  ? 'bg-primary/20 border-primary/60 text-primary'
                  : 'bg-accent/40 border-border/30 hover:bg-accent/70 text-muted-foreground'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export const ArtifactDisplay: React.FC<{
  config: ArtifactConfig;
  className?: string;
}> = ({ config, className = '' }) => {
  if (config.mode === '4pc') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {config.setIconUrl && (
          <CachedImage
            src={config.setIconUrl}
            alt=""
            className="w-7 h-7 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-sm wrap-break-word min-w-0">{config.set}</span>
        <span className="text-[11px] text-muted-foreground font-semibold shrink-0">
          (4pc)
        </span>
      </div>
    );
  }
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        {config.setAIconUrl && (
          <CachedImage
            src={config.setAIconUrl}
            alt=""
            className="w-6 h-6 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-xs wrap-break-word min-w-0">{config.setA}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          (2pc)
        </span>
      </div>
      <div className="flex items-center gap-2">
        {config.setBIconUrl && (
          <CachedImage
            src={config.setBIconUrl}
            alt=""
            className="w-6 h-6 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-xs wrap-break-word min-w-0">{config.setB}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          (2pc)
        </span>
      </div>
    </div>
  );
};
