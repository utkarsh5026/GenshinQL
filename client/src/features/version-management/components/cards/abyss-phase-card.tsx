import { ChevronRight, Shield, Sparkles, Swords } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { TextProcessor } from '@/components/utils/text/text-processor';
import { CachedImage } from '@/features/cache';
import { usePrimitives } from '@/stores/usePrimitivesStore';
import type { Primitives } from '@/types';

import { useAbyssEnemies } from '../../hooks';
import { useEventCountdown } from '../../hooks/useEventCountdown';
import type {
  AbyssChamber,
  AbyssEnemy,
  AbyssWave,
  SpiralAbyssPhase,
} from '../../types';
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

interface EnemyBadgeProps {
  enemy: AbyssEnemy;
  elementUrl?: string;
}

const EnemyBadge: React.FC<EnemyBadgeProps> = ({ enemy, elementUrl }) => (
  <div className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-midnight-800/30 hover:bg-midnight-700/50 transition-all duration-200">
    {/* Avatar */}
    <div className="relative">
      <div className="h-12 w-12 rounded-full bg-linear-to-br from-midnight-600/80 to-midnight-800/80 ring-2 ring-white/10 group-hover:ring-celestial-400/50 overflow-hidden flex items-center justify-center shadow-lg transition-all duration-200">
        <img
          src={enemy.iconUrl}
          alt={enemy.name}
          className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Element badge */}
      {elementUrl && (
        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-midnight-900 ring-2 ring-midnight-700 flex items-center justify-center shadow-md">
          <CachedImage
            src={elementUrl}
            alt={enemy.element || ''}
            className="h-3.5 w-3.5 object-contain"
          />
        </div>
      )}

      {/* Count badge */}
      {enemy.count > 1 && (
        <div className="absolute -bottom-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-celestial-500 ring-2 ring-midnight-800 flex items-center justify-center shadow-md">
          <span className="text-[10px] font-bold text-white">
            ×{enemy.count}
          </span>
        </div>
      )}
    </div>

    {/* Name */}
    <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight max-w-16 line-clamp-2 group-hover:text-foreground transition-colors duration-200">
      {enemy.name}
    </span>
  </div>
);

interface WavesListProps {
  waves: AbyssWave[];
  getElementUrl: (elementName?: string) => string | undefined;
}

const WavesList: React.FC<WavesListProps> = ({ waves, getElementUrl }) => (
  <div className="flex gap-4">
    {waves.map((wave) => (
      <div
        key={wave.waveNumber}
        className="space-y-1.5 border-none rounded-2xl p-3"
      >
        {/* Wave Header (only if multiple waves) */}
        {waves.length > 1 && (
          <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
            <ChevronRight className="h-2.5 w-2.5" />
            Wave {wave.waveNumber}
          </div>
        )}

        {/* Enemy Badges - Wrap on mobile */}
        <div className="flex flex-wrap gap-1.5">
          {wave.enemies.map((enemy, idx) => (
            <EnemyBadge
              key={`${enemy.name}-${idx}`}
              enemy={enemy}
              elementUrl={getElementUrl(enemy.element)}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

interface EnemiesCellProps {
  chamber: AbyssChamber;
  primitives: Primitives | null;
}

const EnemiesCell: React.FC<EnemiesCellProps> = ({ chamber, primitives }) => {
  const getElementUrl = (elementName?: string): string | undefined => {
    if (!elementName || !primitives) return undefined;
    return primitives.elements.find(
      (e) => e.name.toLowerCase() === elementName.toLowerCase()
    )?.url;
  };

  return (
    <div className="px-4 py-4">
      {/* Mobile Label - Hidden on Desktop */}
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground md:hidden">
        Enemies
      </div>

      {/* Two-column layout for First/Second Half with clear separation */}
      <div className="grid grid-cols-1 gap-3 ">
        {/* First Half */}
        <div className="rounded-lg border  p-3">
          <h5 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
            First Half
          </h5>
          <WavesList
            waves={chamber.firstHalf.waves}
            getElementUrl={getElementUrl}
          />
        </div>

        {/* Second Half */}
        <div className="rounded-lg border  p-3">
          <h5 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            Second Half
          </h5>
          <WavesList
            waves={chamber.secondHalf.waves}
            getElementUrl={getElementUrl}
          />
        </div>
      </div>
    </div>
  );
};

interface ChamberInfoCellProps {
  floor: number;
  chamber: AbyssChamber;
}

const ChamberInfoCell: React.FC<ChamberInfoCellProps> = ({
  floor,
  chamber,
}) => (
  <div className="space-y-3 bg-midnight-900/10 px-4 py-4 md:border-r md:border-border/30 md:bg-transparent">
    {/* Chamber Title */}
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-foreground">
        Floor {floor} - Chamber {chamber.chamber}
      </span>
      {/* Highlighted Level Badge */}
      <Badge className="border-celestial-500/50 bg-celestial-500/20 px-2 py-0.5 text-xs font-bold text-celestial-300 border-2 rounded-lg">
        Lv. {chamber.level}
      </Badge>
    </div>

    {/* Challenge Text */}
    <div className="flex items-start gap-1.5 rounded border border-border/20 bg-midnight-900/20 px-2 py-1.5">
      <Shield className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {chamber.challenge}
      </p>
    </div>
  </div>
);

interface ChamberRowProps {
  floor: number;
  chamber: AbyssChamber;
  primitives: Primitives | null;
}

const ChamberRow: React.FC<ChamberRowProps> = ({
  floor,
  chamber,
  primitives,
}) => (
  <div className="flex flex-col border-b border-border/30 transition-colors last:border-b-0 hover:bg-midnight-700/20 md:grid md:grid-cols-[200px_1fr]">
    <ChamberInfoCell floor={floor} chamber={chamber} />
    <EnemiesCell chamber={chamber} primitives={primitives} />
  </div>
);

const AbyssData = () => {
  const { data, loading } = useAbyssEnemies();
  const primitives = usePrimitives();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-celestial-500/30 border-t-celestial-400" />
        <span className="ml-2 text-xs text-muted-foreground">
          Loading enemy lineup…
        </span>
      </div>
    );
  }

  if (!data?.floors) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border-none border-border/40">
        <div className="hidden border-b border-border bg-midnight-700/50 md:grid md:grid-cols-[200px_1fr]">
          <div className="px-4 py-3 text-sm font-semibold text-starlight-200">
            Chamber Info
          </div>
          <div className="px-4 py-3 text-sm font-semibold text-starlight-200">
            Enemies
          </div>
        </div>

        {/* Flatten all floors and chambers into table rows */}
        {data.floors.flatMap((floor) =>
          floor.chambers.map((chamber) => (
            <ChamberRow
              key={`${floor.floorNumber}-${chamber.chamber}`}
              floor={floor.floorNumber}
              chamber={chamber}
              primitives={primitives}
            />
          ))
        )}
      </div>
    </div>
  );
};
