import { Gem, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CachedImage } from '@/features/cache';
import {
  useArtifactLinks,
  useFetchArtifactLinks,
} from '@/features/characters/stores';
import type { ArtifactLink } from '@/features/characters/types';
import { cn } from '@/lib/utils';

import type { ArtifactConfig } from '../../types';

type ArtifactMode = '4pc' | '2+2pc';

/** ── ArtifactSelector ────────────────────────────────────────────────────────
 *  Self-contained popover for picking an artifact set (4pc or 2+2pc).
 *  Mirrors the WeaponSelector pattern: trigger shows current selection,
 *  popover contains search + list. Owns all transient UI state.
 */
export interface ArtifactSelectorProps {
  artifacts: ArtifactConfig | null;
  onSetArtifacts: (a: ArtifactConfig | null) => void;
}

export const ArtifactSelector: React.FC<ArtifactSelectorProps> = ({
  artifacts,
  onSetArtifacts,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ArtifactMode>(
    artifacts?.mode === '2+2pc' ? '2+2pc' : '4pc'
  );
  const [search, setSearch] = useState('');
  const [searchB, setSearchB] = useState('');

  const artifactLinks = useArtifactLinks();
  const fetchArtifactLinks = useFetchArtifactLinks();

  const filteredA = useMemo(
    () =>
      artifactLinks.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase().trim())
      ),
    [artifactLinks, search]
  );

  const filteredB = useMemo(
    () =>
      artifactLinks.filter((a) =>
        a.name.toLowerCase().includes(searchB.toLowerCase().trim())
      ),
    [artifactLinks, searchB]
  );

  const handleOpenChange = (o: boolean) => {
    if (o) fetchArtifactLinks();
    setOpen(o);
    if (!o) {
      setSearch('');
      setSearchB('');
    }
  };

  const handleModeSwitch = (m: ArtifactMode) => {
    setMode(m);
    onSetArtifacts(null);
    setSearch('');
    setSearchB('');
  };

  const handleSelect4pc = (a: ArtifactLink) => {
    onSetArtifacts({ mode: '4pc', set: a.name, setIconUrl: a.flowerIconUrl });
    setOpen(false);
    setSearch('');
  };

  const handleSelectA = (a: ArtifactLink) => {
    const prev = artifacts?.mode === '2+2pc' ? artifacts : null;
    onSetArtifacts({
      mode: '2+2pc',
      setA: a.name,
      setAIconUrl: a.flowerIconUrl,
      setB: prev?.setB ?? '',
      setBIconUrl: prev?.setBIconUrl,
    });
    setSearch('');
  };

  const handleSelectB = (a: ArtifactLink) => {
    const prev = artifacts?.mode === '2+2pc' ? artifacts : null;
    onSetArtifacts({
      mode: '2+2pc',
      setA: prev?.setA ?? '',
      setAIconUrl: prev?.setAIconUrl,
      setB: a.name,
      setBIconUrl: a.flowerIconUrl,
    });
    setSearchB('');
  };

  const selected4pc = artifacts?.mode === '4pc' ? artifacts.set : undefined;
  const selectedAName =
    artifacts?.mode === '2+2pc' ? artifacts.setA : undefined;
  const selectedBName =
    artifacts?.mode === '2+2pc' ? artifacts.setB : undefined;

  return (
    <div className="rounded-lg bg-midnight-800/80 hover:bg-surface-300/70 border border-midnight-700/50 hover:border-midnight-600/80 transition-all min-w-0">
      <Popover open={open} onOpenChange={handleOpenChange}>
        {artifacts ? (
          <PopoverTrigger asChild>
            <button className="flex items-start gap-2 px-2 py-1.5 w-full text-left min-w-0">
              <ArtifactDisplay config={artifacts} className="flex-1 min-w-0" />
            </button>
          </PopoverTrigger>
        ) : (
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left">
              <Gem className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-xs text-muted-foreground">
                Add artifacts...
              </span>
            </button>
          </PopoverTrigger>
        )}

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="w-[min(320px,calc(100vw-2rem))] p-0 flex flex-col overflow-hidden max-h-[60svh]"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const input = (e.currentTarget as HTMLElement).querySelector(
              'input'
            );
            input?.focus();
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border/30">
            <Gem className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex-1">
              Artifact Sets
            </span>
            <button
              onClick={() => handleOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-2 pb-1.5 border-b border-border/20">
            {(['4pc', '2+2pc'] as ArtifactMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200',
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground bg-accent/30 hover:bg-accent/50'
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === '4pc' ? (
            <>
              {/* Search */}
              <div className="relative px-3 pt-2 pb-1.5">
                <input
                  className="w-full bg-accent/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 pr-7"
                  placeholder="Search artifact sets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearch('')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Set list */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {filteredA.map((a) => {
                  const isSelected = selected4pc === a.name;
                  return (
                    <button
                      key={a.name}
                      onClick={() => handleSelect4pc(a)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-all duration-150 hover:scale-[1.01]',
                        isSelected
                          ? 'bg-primary/10 border-primary/30'
                          : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'
                      )}
                    >
                      {a.flowerIconUrl ? (
                        <CachedImage
                          src={a.flowerIconUrl}
                          alt=""
                          className="w-8 h-8 object-contain shrink-0"
                          lazy
                          skeletonShape="rounded"
                          skeletonSize="sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-accent/40 shrink-0" />
                      )}
                      <p className="flex-1 text-xs font-medium truncate">
                        {a.name}
                      </p>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-primary shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredA.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No sets found
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Set A search */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mb-1">
                  Set A
                  {selectedAName && (
                    <span className="ml-1 text-primary/70 normal-case">
                      — {selectedAName}
                    </span>
                  )}
                </p>
                <div className="relative">
                  <input
                    className="w-full bg-accent/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 pr-7"
                    placeholder="Search Set A..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearch('')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="mt-1 max-h-28 overflow-y-auto space-y-0.5">
                  {filteredA.map((a) => {
                    const isSelected = selectedAName === a.name;
                    return (
                      <button
                        key={a.name}
                        onClick={() => handleSelectA(a)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-left transition-all',
                          isSelected
                            ? 'bg-primary/10 border-primary/30'
                            : 'border-transparent bg-accent/20 hover:border-border/40 hover:bg-accent/40'
                        )}
                      >
                        {a.flowerIconUrl && (
                          <CachedImage
                            src={a.flowerIconUrl}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                            showSkeleton={false}
                          />
                        )}
                        <p className="flex-1 text-xs truncate">{a.name}</p>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-primary shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Set B search */}
              <div className="px-3 pt-2 pb-3 border-t border-border/20 flex-1 overflow-hidden flex flex-col">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mb-1">
                  Set B
                  {selectedBName && (
                    <span className="ml-1 text-primary/70 normal-case">
                      — {selectedBName}
                    </span>
                  )}
                </p>
                <div className="relative">
                  <input
                    className="w-full bg-accent/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60 pr-7"
                    placeholder="Search Set B..."
                    value={searchB}
                    onChange={(e) => setSearchB(e.target.value)}
                  />
                  {searchB && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchB('')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex-1 overflow-y-auto space-y-0.5">
                  {filteredB.map((a) => {
                    const isSelected = selectedBName === a.name;
                    return (
                      <button
                        key={a.name}
                        onClick={() => handleSelectB(a)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-left transition-all',
                          isSelected
                            ? 'bg-primary/10 border-primary/30'
                            : 'border-transparent bg-accent/20 hover:border-border/40 hover:bg-accent/40'
                        )}
                      >
                        {a.flowerIconUrl && (
                          <CachedImage
                            src={a.flowerIconUrl}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                            showSkeleton={false}
                          />
                        )}
                        <p className="flex-1 text-xs truncate">{a.name}</p>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-primary shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

/** ── ArtifactDisplay ─────────────────────────────────────────────────────────
 *  Read-only collapsed view of the selected artifact configuration.
 *  Used as the trigger content inside ArtifactSelector.
 */
export const ArtifactDisplay: React.FC<{
  config: ArtifactConfig;
  className?: string;
}> = ({ config, className = '' }) => {
  if (config.mode === '4pc') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {config.setIconUrl && (
          <CachedImage
            src={config.setIconUrl}
            alt=""
            className="w-6 h-6 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-xs wrap-break-word min-w-0 leading-tight">
          {config.set}
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
          4pc
        </span>
      </div>
    );
  }
  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        {config.setAIconUrl && (
          <CachedImage
            src={config.setAIconUrl}
            alt=""
            className="w-5 h-5 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-[11px] wrap-break-word min-w-0 leading-tight">
          {config.setA}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">2pc</span>
      </div>
      <div className="flex items-center gap-1.5">
        {config.setBIconUrl && (
          <CachedImage
            src={config.setBIconUrl}
            alt=""
            className="w-5 h-5 object-contain shrink-0"
            showSkeleton={false}
          />
        )}
        <span className="text-[11px] wrap-break-word min-w-0 leading-tight">
          {config.setB}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">2pc</span>
      </div>
    </div>
  );
};
