import { ArrowUp, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/components/utils';
import { getRarityHexColor } from '@/components/weapons/utils/color-map';
import { parseSubstat } from '@/components/weapons/utils/substat-utils';
import { AscensionPhase } from '@/types';

interface WeaponAscensionProps {
  phases: AscensionPhase[];
  rarity: number;
  subStatType: string;
}

interface StatComparison {
  currentMin: number;
  currentMax: number;
  fromPreviousPhase: number;
  fromPhaseZero: number;
  progressPercent: number;
}

function calculateStatComparison(
  phases: AscensionPhase[],
  currentPhaseIndex: number,
  statType: 'baseAttack' | 'subStat'
): StatComparison {
  const currentPhase = phases[currentPhaseIndex];
  const firstPhase = phases[0];
  const lastPhase = phases[phases.length - 1];
  const prevPhase =
    currentPhaseIndex > 0 ? phases[currentPhaseIndex - 1] : null;

  const currentMax = currentPhase[statType].max;
  const currentMin = currentPhase[statType].min;
  const firstMax = firstPhase[statType].max;
  const finalMax = lastPhase[statType].max;
  const prevMax = prevPhase ? prevPhase[statType].max : currentMax;

  const fromPreviousPhase =
    prevPhase && prevMax > 0 ? ((currentMax - prevMax) / prevMax) * 100 : 0;

  const fromPhaseZero =
    firstMax > 0 ? ((currentMax - firstMax) / firstMax) * 100 : 0;

  const totalGrowth = finalMax - firstMax;
  const currentGrowth = currentMax - firstMax;
  const progressPercent =
    totalGrowth > 0 ? (currentGrowth / totalGrowth) * 100 : 0;

  return {
    currentMin,
    currentMax,
    fromPreviousPhase: Math.round(fromPreviousPhase * 10) / 10,
    fromPhaseZero: Math.round(fromPhaseZero * 10) / 10,
    progressPercent: Math.round(progressPercent),
  };
}

const WeaponAscension: React.FC<WeaponAscensionProps> = ({
  phases,
  rarity,
  subStatType,
}) => {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [prevPhase, setPrevPhase] = useState(0);

  const rarityHex = getRarityHexColor(rarity);
  const parsedSubstat = parseSubstat(subStatType);

  const handlePhaseChange = (value: number[]) => {
    const newPhase = value[0];
    if (newPhase >= 0 && newPhase <= phases.length - 1) {
      setPrevPhase(selectedPhase);
      setSelectedPhase(newPhase);
    }
  };

  const atkComparison = useMemo(
    () => calculateStatComparison(phases, selectedPhase, 'baseAttack'),
    [phases, selectedPhase]
  );

  const substatComparison = useMemo(
    () => calculateStatComparison(phases, selectedPhase, 'subStat'),
    [phases, selectedPhase]
  );

  const hasPhaseChanged = selectedPhase !== prevPhase;
  const currentPhaseData = phases[selectedPhase];
  const isMaxPhase = selectedPhase === phases.length - 1;

  return (
    <div className="space-y-5">
      {/* Phase Slider */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground shrink-0 font-medium">
            Phase
          </span>
          <Slider
            step={1}
            max={phases.length - 1}
            min={0}
            onValueChange={handlePhaseChange}
            value={[selectedPhase]}
            className="flex-1"
          />
          <Badge
            variant="outline"
            className="min-w-10 justify-center text-sm font-semibold"
          >
            {selectedPhase}
          </Badge>
        </div>

        {/* Level Range Display */}
        <LevelRangeDisplay
          levelRange={currentPhaseData.levelRange}
          selectedPhase={selectedPhase}
          hasPhaseChanged={hasPhaseChanged}
          isMaxPhase={isMaxPhase}
        />

        {isMaxPhase && (
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
              Max Ascension
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>
        )}
      </div>

      {/* Stat Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Base ATK Card */}
        <Card className="border-border/30 bg-card/30">
          <CardContent className="pt-4 pb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Base ATK
            </h3>

            <p
              key={`atk-${selectedPhase}`}
              className={`text-2xl font-bold text-foreground ${
                hasPhaseChanged ? 'animate-value-change' : ''
              }`}
            >
              {atkComparison.currentMin} - {atkComparison.currentMax}
            </p>

            <div className="mt-3 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/30 transition-all duration-500 ease-out"
                style={{ width: `${atkComparison.progressPercent}%` }}
              />
            </div>

            {selectedPhase > 0 && (
              <div
                key={`atk-badges-${selectedPhase}`}
                className={`flex flex-wrap gap-3 mt-2 ${
                  hasPhaseChanged ? 'animate-badges-in' : ''
                }`}
              >
                {atkComparison.fromPreviousPhase > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUp className="w-3 h-3" />
                    <span>+{atkComparison.fromPreviousPhase.toFixed(1)}%</span>
                    <span className="text-muted-foreground/70">this phase</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{atkComparison.fromPhaseZero.toFixed(1)}%</span>
                  <span className="text-muted-foreground/70">total growth</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Substat Card */}
        <Card className="border-border/30 bg-card/30">
          <CardContent className="pt-4 pb-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {parsedSubstat.type}
            </h3>

            <p
              key={`sub-${selectedPhase}`}
              className={`text-2xl font-bold text-foreground ${
                hasPhaseChanged ? 'animate-value-change' : ''
              }`}
            >
              {substatComparison.currentMin.toFixed(1)} -{' '}
              {substatComparison.currentMax.toFixed(1)}
              {parsedSubstat.type !== 'Elemental Mastery' ? '%' : ''}
            </p>

            <div className="mt-3 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/30 transition-all duration-500 ease-out"
                style={{ width: `${substatComparison.progressPercent}%` }}
              />
            </div>

            {selectedPhase > 0 && (
              <div
                key={`sub-badges-${selectedPhase}`}
                className={`flex flex-wrap gap-3 mt-2 ${
                  hasPhaseChanged ? 'animate-badges-in' : ''
                }`}
              >
                {substatComparison.fromPreviousPhase > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUp className="w-3 h-3" />
                    <span>
                      +{substatComparison.fromPreviousPhase.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground/70">this phase</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{substatComparison.fromPhaseZero.toFixed(1)}%</span>
                  <span className="text-muted-foreground/70">total growth</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Materials Section */}
      {(currentPhaseData.mora || currentPhaseData.materials?.length) && (
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Ascension Cost
          </h3>

          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/20 border border-border/20">
            {/* Mora */}
            {currentPhaseData.mora && currentPhaseData.mora > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-2 rounded hover:bg-muted/30 transition-colors cursor-default">
                      <div className="w-10 h-10 flex items-center justify-center text-2xl opacity-70">
                        &#128176;
                      </div>
                      <span className="text-xs mt-1 text-muted-foreground">
                        {currentPhaseData.mora.toLocaleString()}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mora</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Materials */}
            {currentPhaseData.materials?.map((mat, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-2 rounded hover:bg-muted/30 transition-colors cursor-default">
                      <CachedImage
                        src={mat.url}
                        alt={mat.caption}
                        className="w-10 h-10"
                      />
                      <span className="text-xs mt-1 text-muted-foreground">
                        x{mat.count}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mat.caption}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: All Phases Table */}
      <div className="hidden md:block">
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-3 uppercase tracking-wider">
            <span className="group-open:rotate-90 transition-transform text-[10px]">
              &#9654;
            </span>
            All Phases
          </summary>

          <div className="rounded-lg border border-border/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="text-muted-foreground font-medium text-xs w-16">
                    Phase
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Level
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right">
                    Base ATK
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right">
                    ATK Growth
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right">
                    {parsedSubstat.type}
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right">
                    {parsedSubstat.type} Growth
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs text-right">
                    Mora
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phases.map((phase, idx) => {
                  const atkStats = calculateStatComparison(
                    phases,
                    idx,
                    'baseAttack'
                  );
                  const subStats = calculateStatComparison(
                    phases,
                    idx,
                    'subStat'
                  );

                  return (
                    <TableRow
                      key={phase.phase}
                      className={`transition-colors cursor-pointer ${
                        idx === selectedPhase
                          ? 'bg-muted/30'
                          : 'hover:bg-muted/10'
                      }`}
                      onClick={() => {
                        setPrevPhase(selectedPhase);
                        setSelectedPhase(idx);
                      }}
                      style={
                        idx === selectedPhase
                          ? { boxShadow: `inset 2px 0 0 ${rarityHex}50` }
                          : undefined
                      }
                    >
                      <TableCell className="font-medium text-foreground">
                        {phase.phase}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {phase.levelRange}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground">
                        {phase.baseAttack.min} - {phase.baseAttack.max}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {idx > 0 ? (
                          <div className="flex flex-col items-end gap-0.5">
                            {atkStats.fromPreviousPhase > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                                <ArrowUp className="w-3 h-3" />+
                                {atkStats.fromPreviousPhase.toFixed(1)}%
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />+
                              {atkStats.fromPhaseZero.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-foreground">
                        {phase.subStat.min.toFixed(1)} -{' '}
                        {phase.subStat.max.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {idx > 0 ? (
                          <div className="flex flex-col items-end gap-0.5">
                            {subStats.fromPreviousPhase > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                                <ArrowUp className="w-3 h-3" />+
                                {subStats.fromPreviousPhase.toFixed(1)}%
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />+
                              {subStats.fromPhaseZero.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {phase.mora?.toLocaleString() || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </details>
      </div>

      {/* Mobile: Phase Cards List */}
      <div className="md:hidden">
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-3 uppercase tracking-wider">
            <span className="group-open:rotate-90 transition-transform text-[10px]">
              &#9654;
            </span>
            All Phases
          </summary>

          <div className="space-y-2">
            {phases.map((phase, idx) => {
              const atkStats = calculateStatComparison(
                phases,
                idx,
                'baseAttack'
              );
              const subStats = calculateStatComparison(phases, idx, 'subStat');

              return (
                <div
                  key={phase.phase}
                  onClick={() => {
                    setPrevPhase(selectedPhase);
                    setSelectedPhase(idx);
                  }}
                  className={`border rounded-lg p-3 space-y-1.5 cursor-pointer transition-all ${
                    idx === selectedPhase
                      ? 'bg-muted/20 border-border/50'
                      : 'bg-transparent border-border/20 hover:border-border/40'
                  }`}
                  style={
                    idx === selectedPhase
                      ? { boxShadow: `inset 2px 0 0 ${rarityHex}50` }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Phase</span>
                    <span className="text-sm font-medium text-foreground">
                      {phase.phase}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Level</span>
                    <span className="text-sm text-muted-foreground">
                      {phase.levelRange}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Base ATK
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {phase.baseAttack.min} - {phase.baseAttack.max}
                      </span>
                      {idx > 0 && (
                        <div className="flex items-center gap-1.5">
                          {atkStats.fromPreviousPhase > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500">
                              <ArrowUp className="w-2.5 h-2.5" />+
                              {atkStats.fromPreviousPhase.toFixed(1)}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <TrendingUp className="w-2.5 h-2.5" />+
                            {atkStats.fromPhaseZero.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {parsedSubstat.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {phase.subStat.min.toFixed(1)} -{' '}
                        {phase.subStat.max.toFixed(1)}
                      </span>
                      {idx > 0 && (
                        <div className="flex items-center gap-1.5">
                          {subStats.fromPreviousPhase > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500">
                              <ArrowUp className="w-2.5 h-2.5" />+
                              {subStats.fromPreviousPhase.toFixed(1)}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <TrendingUp className="w-2.5 h-2.5" />+
                            {subStats.fromPhaseZero.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mora</span>
                    <span className="text-sm text-muted-foreground">
                      {phase.mora?.toLocaleString() || '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
};

/* ===================== Level Range Display ===================== */

interface LevelRangeDisplayProps {
  levelRange: string;
  selectedPhase: number;
  hasPhaseChanged: boolean;
  isMaxPhase: boolean;
}

const LevelRangeDisplay: React.FC<LevelRangeDisplayProps> = ({
  levelRange,
  selectedPhase,
  hasPhaseChanged,
  isMaxPhase,
}) => {
  // Parse level range format: "40/50/50" -> [minLevel, maxBeforeAscension, maxAfterAscension]
  // Or simpler format: "1-20" -> just show as range
  const parsed = useMemo(() => {
    if (levelRange.includes('/')) {
      const parts = levelRange.split('/').map((p) => parseInt(p.trim(), 10));
      if (parts.length >= 2) {
        return {
          min: parts[0],
          maxBefore: parts[1],
          maxAfter: parts[2] ?? parts[1],
        };
      }
    }
    // Fallback: try "min-max" format
    if (levelRange.includes('-')) {
      const parts = levelRange.split('-').map((p) => parseInt(p.trim(), 10));
      if (parts.length === 2) {
        return { min: parts[0], maxBefore: parts[1], maxAfter: parts[1] };
      }
    }
    return null;
  }, [levelRange]);

  if (!parsed) {
    return (
      <div className="text-center">
        <p
          key={`level-${selectedPhase}`}
          className={`text-lg font-semibold text-foreground ${hasPhaseChanged ? 'animate-value-change' : ''}`}
        >
          Lv. {levelRange}
        </p>
      </div>
    );
  }

  const canAscend = parsed.maxAfter > parsed.maxBefore;

  return (
    <div
      key={`level-${selectedPhase}`}
      className={`flex items-center justify-center gap-2 ${hasPhaseChanged ? 'animate-value-change' : ''}`}
    >
      <div className="text-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
          From
        </span>
        <span className="text-base font-semibold text-foreground">
          {parsed.min}
        </span>
      </div>

      <span className="text-muted-foreground/50">→</span>

      <div className="text-center">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
          {canAscend ? 'Cap' : 'To'}
        </span>
        <span className="text-base font-semibold text-foreground">
          {parsed.maxBefore}
        </span>
      </div>

      {canAscend && (
        <>
          <span className="text-muted-foreground/50 text-sm">→</span>
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              After
            </span>
            <span
              className={`text-base font-semibold ${isMaxPhase ? 'text-foreground' : 'text-foreground'}`}
            >
              {parsed.maxAfter}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default WeaponAscension;
