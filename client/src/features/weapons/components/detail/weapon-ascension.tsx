import { ArrowUp, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/features/cache';
import { getRarityHexColor } from '@/features/weapons/utils/color-map';
import { parseSubstat } from '@/features/weapons/utils/substat-utils';

import { useWeaponAscension } from '../../hooks';
import type { AscensionPhase } from '../../types';
import {
  WeaponPhaseCardList,
  WeaponPhaseTable,
} from './weapon-ascension-phases';

interface WeaponAscensionProps {
  phases: AscensionPhase[];
  rarity: number;
  subStatType: string;
}

const WeaponAscension: React.FC<WeaponAscensionProps> = ({
  phases,
  rarity,
  subStatType,
}) => {
  const {
    prevPhase,
    selectedPhase,
    changePhase,
    atkComparison,
    substatComparison,
    phaseComparison,
    handlePhaseChange,
  } = useWeaponAscension(phases);
  const rarityHex = getRarityHexColor(rarity);
  const parsedSubstat = parseSubstat(subStatType);

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
            onValueChange={changePhase}
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
        <WeaponPhaseTable
          phases={phaseComparison}
          currentPhase={selectedPhase}
          rarity={rarityHex}
          substat={parsedSubstat}
          handlePhaseChange={handlePhaseChange}
        />
      </div>

      {/* Mobile: Phase Cards List */}
      <div className="md:hidden">
        <WeaponPhaseCardList
          phases={phaseComparison}
          currentPhase={selectedPhase}
          rarity={rarityHex}
          substat={parsedSubstat}
          handlePhaseChange={handlePhaseChange}
        />
      </div>
    </div>
  );
};

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
