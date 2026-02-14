import { Shield, Sparkles, Swords } from 'lucide-react';

import { GameModeCard } from '@/components/utils/game-mode-card';
import { TextProcessor } from '@/components/utils/text/text-processor';

import { useEventCountdown } from '../../hooks/useEventCountdown';
import type { SpiralAbyssPhase } from '../../types';
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
    </GameModeCard>
  );
}
