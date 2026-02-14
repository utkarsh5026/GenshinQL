import { ChevronRight, Shield, Sparkles, Swords } from 'lucide-react';
import { useState } from 'react';

import { GameModeCard } from '@/components/utils/game-mode-card';
import { TextProcessor } from '@/components/utils/text/text-processor';
import { cn } from '@/lib/utils';

import { useAbyssEnemies } from '../../hooks';
import { useEventCountdown } from '../../hooks/useEventCountdown';
import type { SpiralAbyssPhase } from '../../types';
import {
  getElementBgClass,
  getElementBorderClass,
  getElementTextClass,
} from '../../utils';
import CountdownBadge from '../countdown-badge';

interface AbyssPhaseCardProps {
  phase: SpiralAbyssPhase;
}

export default function AbyssPhaseCard({ phase }: AbyssPhaseCardProps) {
  const countdown = useEventCountdown(phase.duration);

  return (
    <GameModeCard
      bannerImage="/images/spiral-abyss-beautiful.jpg"
      icon={<Swords className="h-5 w-5 text-celestial-400" />}
      title={`Phase ${phase.phase}`}
      badges={
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80 drop-shadow-md">
            {phase.updateDate}
          </span>
          <CountdownBadge
            status={countdown.status}
            countdown={countdown.formattedTime}
            compact
          />
        </div>
      }
      bannerHeight="h-32"
    >
      {/* Floor 11 - Ley Line Disorders */}
      <div className="rounded-lg border border-border/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">
            Floor 11 — Ley Line Disorders
          </h4>
        </div>
        <ul className="space-y-2">
          {phase.floor11Disorders.map((disorder, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <TextProcessor
                text={disorder}
                className="text-sm text-muted-foreground"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Floor 12 - First and Second Half */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            First Half
          </h4>
          <TextProcessor
            text={phase.floor12Disorders.firstHalf}
            className="text-sm text-foreground"
          />
        </div>
        <div className="rounded-lg border border-border/50 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Second Half
          </h4>
          <TextProcessor
            text={phase.floor12Disorders.secondHalf}
            className="text-sm text-foreground"
          />
        </div>
      </div>

      {/* Blessing of the Abyssal Moon */}
      <div className="rounded-lg border-none p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-celestial-400" />
          <h4 className="text-sm font-semibold text-foreground">
            {phase.blessing.name}
          </h4>
        </div>
        <TextProcessor
          text={phase.blessing.description}
          className="text-sm text-muted-foreground"
        />
      </div>

      <AbyssData />
    </GameModeCard>
  );
}

const AbyssData = () => {
  const { data, loading } = useAbyssEnemies();
  const [expandedFloors, setExpandedFloors] = useState<Set<number>>(new Set());

  const toggleFloor = (floorNumber: number) => {
    setExpandedFloors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(floorNumber)) {
        newSet.delete(floorNumber);
      } else {
        newSet.add(floorNumber);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-celestial-500/30 border-t-celestial-400" />
          <span className="ml-2 text-xs text-muted-foreground">
            Loading enemy lineup…
          </span>
        </div>
      )}
      {data?.floors.map((floor) => (
        <div
          key={floor.floorNumber}
          className="overflow-hidden rounded-lg border border-border/40 bg-midnight-900/10"
        >
          {/* Floor header (collapsible) */}
          <button
            onClick={() => toggleFloor(floor.floorNumber)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-midnight-800/20"
          >
            <Swords className="h-3.5 w-3.5 text-celestial-400" />
            <span className="text-sm font-semibold text-foreground">
              Floor {floor.floorNumber}
            </span>
            <span className="text-[10px] text-muted-foreground">
              · {floor.chambers.length} chambers
            </span>
            <ChevronRight
              className={cn(
                'ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform',
                expandedFloors.has(floor.floorNumber) && 'rotate-90'
              )}
            />
          </button>

          {/* Chambers */}
          {expandedFloors.has(floor.floorNumber) && (
            <div className="space-y-3 border-t border-border/30 bg-midnight-900/5 p-3">
              {floor.chambers.map((chamber) => (
                <div
                  key={chamber.chamber}
                  className="rounded-md border border-border/30 bg-midnight-900/20 p-3"
                >
                  {/* Chamber header */}
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">
                      Chamber {chamber.chamber}
                    </span>
                    <span className="rounded-full border border-border/30 bg-midnight-900/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                      Lv.{chamber.level}
                    </span>
                  </div>

                  {/* Challenge */}
                  <div className="mb-3 flex items-start gap-1.5 rounded border border-border/20 bg-midnight-900/20 px-2 py-1.5">
                    <Shield className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      {chamber.challenge}
                    </p>
                  </div>

                  {/* First / Second Half */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* First Half */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        First Half
                      </h5>
                      <div className="space-y-1.5">
                        {chamber.firstHalf.waves.map((wave) => (
                          <div key={wave.waveNumber} className="space-y-1">
                            {chamber.firstHalf.waves.length > 1 && (
                              <p className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
                                <ChevronRight className="h-2.5 w-2.5" />
                                Wave {wave.waveNumber}
                              </p>
                            )}
                            {wave.enemies.map((enemy, eIdx) => (
                              <div
                                key={`${enemy.name}-${eIdx}`}
                                className={cn(
                                  'flex items-center gap-2 rounded border px-2 py-1.5',
                                  enemy.element
                                    ? getElementBorderClass(enemy.element)
                                    : 'border-border/40',
                                  enemy.element
                                    ? getElementBgClass(enemy.element)
                                    : 'bg-midnight-900/10'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                                    enemy.element
                                      ? getElementBorderClass(enemy.element)
                                      : 'border-border/30',
                                    'bg-midnight-900/30'
                                  )}
                                >
                                  <img
                                    src={enemy.iconUrl}
                                    alt={enemy.name}
                                    className="h-5 w-5 object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      'truncate text-[11px] font-medium leading-tight',
                                      enemy.element
                                        ? getElementTextClass(enemy.element)
                                        : 'text-foreground'
                                    )}
                                    title={enemy.name}
                                  >
                                    {enemy.name}
                                  </p>
                                  {enemy.count > 1 && (
                                    <p className="text-[9px] text-muted-foreground">
                                      ×{enemy.count}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Second Half */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Second Half
                      </h5>
                      <div className="space-y-1.5">
                        {chamber.secondHalf.waves.map((wave) => (
                          <div key={wave.waveNumber} className="space-y-1">
                            {chamber.secondHalf.waves.length > 1 && (
                              <p className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
                                <ChevronRight className="h-2.5 w-2.5" />
                                Wave {wave.waveNumber}
                              </p>
                            )}
                            {wave.enemies.map((enemy, eIdx) => (
                              <div
                                key={`${enemy.name}-${eIdx}`}
                                className={cn(
                                  'flex items-center gap-2 rounded border px-2 py-1.5',
                                  enemy.element
                                    ? getElementBorderClass(enemy.element)
                                    : 'border-border/40',
                                  enemy.element
                                    ? getElementBgClass(enemy.element)
                                    : 'bg-midnight-900/10'
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded border',
                                    enemy.element
                                      ? getElementBorderClass(enemy.element)
                                      : 'border-border/30',
                                    'bg-midnight-900/30'
                                  )}
                                >
                                  <img
                                    src={enemy.iconUrl}
                                    alt={enemy.name}
                                    className="h-5 w-5 object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      'truncate text-[11px] font-medium leading-tight',
                                      enemy.element
                                        ? getElementTextClass(enemy.element)
                                        : 'text-foreground'
                                    )}
                                    title={enemy.name}
                                  >
                                    {enemy.name}
                                  </p>
                                  {enemy.count > 1 && (
                                    <p className="text-[9px] text-muted-foreground">
                                      ×{enemy.count}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
