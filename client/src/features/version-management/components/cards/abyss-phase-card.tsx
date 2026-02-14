import { Shield, Sparkles, Swords } from 'lucide-react';

import type { SpiralAbyssPhase } from '../../types';

interface AbyssPhaseCardProps {
  phase: SpiralAbyssPhase;
}

export default function AbyssPhaseCard({ phase }: AbyssPhaseCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40 backdrop-blur-sm">
      {/* Phase Header */}
      <div className="border-b border-midnight-700/50 bg-midnight-800/40 px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Swords className="h-5 w-5 text-celestial-400" />
            Phase {phase.phase}
          </h3>
          <span className="text-sm text-muted-foreground">
            {phase.updateDate}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4 md:space-y-4 md:p-5">
        {/* Floor 11 */}
        <div className="rounded-lg border border-electro-500/20 bg-electro-900/15 p-3 md:p-4">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-electro-400" />
            <h4 className="text-sm font-semibold text-electro-300">
              Floor 11 — Ley Line Disorders
            </h4>
          </div>
          <ul className="space-y-1.5">
            {phase.floor11Disorders.map((disorder, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-electro-100/80"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electro-400" />
                {disorder}
              </li>
            ))}
          </ul>
        </div>

        {/* Floor 12 */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-3">
          <div className="rounded-lg border border-pyro-500/20 bg-pyro-900/15 p-3 md:p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-pyro-300">
              First Half
            </h4>
            <p className="text-sm text-pyro-100/80">
              {phase.floor12Disorders.firstHalf}
            </p>
          </div>
          <div className="rounded-lg border border-hydro-500/20 bg-hydro-900/15 p-3 md:p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-hydro-300">
              Second Half
            </h4>
            <p className="text-sm text-hydro-100/80">
              {phase.floor12Disorders.secondHalf}
            </p>
          </div>
        </div>

        {/* Blessing */}
        <div className="rounded-lg border border-celestial-500/20 bg-celestial-900/15 p-3 md:p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-celestial-400" />
            <h4 className="text-sm font-semibold text-celestial-300">
              {phase.blessing.name}
            </h4>
          </div>
          <p className="text-sm text-celestial-100/80">
            {phase.blessing.description}
          </p>
        </div>
      </div>
    </div>
  );
}
