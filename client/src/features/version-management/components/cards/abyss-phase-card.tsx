import { Shield, Sparkles, Swords } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { GameModeCard } from '@/components/utils/game-mode-card';
import { ListSplitter } from '@/components/utils/text';
import { TextProcessor } from '@/components/utils/text/text-processor';
import { CachedImage } from '@/features/cache';
import { usePrimitives } from '@/stores/usePrimitivesStore';
import type { Primitives } from '@/types';

import { useAbyssEnemies } from '../../hooks';
import { useEventCountdown } from '../../hooks/useEventCountdown';
import type {
  AbyssChamber,
  AbyssEnemy,
  AbyssFloor,
  AbyssWave,
  SpiralAbyssPhase,
} from '../../types';
import CountdownBadge from '../countdown-badge';

interface AbyssPhaseCardProps {
  phase: SpiralAbyssPhase;
}

export default function AbyssPhaseCard({ phase }: AbyssPhaseCardProps) {
  const countdown = useEventCountdown(phase.duration);
  const { data, loading } = useAbyssEnemies();
  const primitives = usePrimitives();

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
      {/* Blessing of the Abyssal Moon - Applies to all floors */}
      <div className="rounded-lg border border-celestial-500/20 bg-celestial-950/20 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-celestial-400" />
          <h4 className="text-sm font-semibold text-celestial-200">
            {phase.blessing.name}
          </h4>
        </div>
        <TextProcessor
          text={phase.blessing.description}
          className="text-sm text-muted-foreground"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-celestial-500/30 border-t-celestial-400" />
          <span className="ml-2 text-xs text-muted-foreground">
            Loading enemy lineup…
          </span>
        </div>
      ) : (
        <>
          {/* Floor 11 Section */}
          <FloorSection
            floorNumber={11}
            disorders={phase.floor11Disorders}
            floorData={data?.floors.find((f) => f.floorNumber === 11)}
            primitives={primitives}
          />

          {/* Floor 12 Section */}
          <FloorSection
            floorNumber={12}
            disorders={phase.floor12Disorders}
            floorData={data?.floors.find((f) => f.floorNumber === 12)}
            primitives={primitives}
          />
        </>
      )}
    </GameModeCard>
  );
}

interface FloorSectionProps {
  floorNumber: number;
  disorders: string[] | { firstHalf: string; secondHalf: string };
  floorData?: AbyssFloor;
  primitives: Primitives | null;
}

const FloorSection: React.FC<FloorSectionProps> = ({
  floorNumber,
  disorders,
  floorData,
  primitives,
}) => {
  return (
    <div className="space-y-4 rounded-xl border-none border-border/40 bg-midnight-900/20 p-4 md:p-5">
      {/* Floor Header */}
      <div className="flex items-center gap-2 border-b border-border/30 pb-3">
        <Shield className="h-5 w-5 text-celestial-400" />
        <h3 className="text-lg font-bold text-foreground">
          Floor {floorNumber}
        </h3>
      </div>

      {/* Ley Line Disorders */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Ley Line Disorders
        </h4>
        {Array.isArray(disorders) ? (
          // Floor 11: Multiple disorders as bullet list
          <ListSplitter text={disorders.join('. ')} />
        ) : (
          // Floor 12: First/Second Half split
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 rounded-lg border border-border/30 bg-midnight-800/30 p-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-celestial-300/70">
                First Half
              </h5>
              <TextProcessor
                text={disorders.firstHalf}
                className="text-sm text-foreground/90"
              />
            </div>
            <div className="space-y-1.5 rounded-lg border border-border/30 bg-midnight-800/30 p-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-celestial-300/70">
                Second Half
              </h5>
              <TextProcessor
                text={disorders.secondHalf}
                className="text-sm text-foreground/90"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chambers */}
      {floorData && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Chambers
          </h4>
          <div className="space-y-3">
            {floorData.chambers.map((chamber) => (
              <ChamberCard
                key={chamber.chamber}
                chamber={chamber}
                primitives={primitives}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ChamberCardProps {
  chamber: AbyssChamber;
  primitives: Primitives | null;
}

const ChamberCard: React.FC<ChamberCardProps> = ({ chamber, primitives }) => {
  const getElementUrl = (elementName?: string): string | undefined => {
    if (!elementName || !primitives) return undefined;
    return primitives.elements.find(
      (e) => e.name.toLowerCase() === elementName.toLowerCase()
    )?.url;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/40 bg-midnight-800/20 transition-colors hover:border-celestial-500/30">
      {/* Chamber Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 bg-midnight-900/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Chamber {chamber.chamber}
          </span>
          <Badge className="border-2 border-celestial-500/50 bg-celestial-500/20 px-2 py-0.5 text-xs font-bold text-celestial-300">
            Lv. {chamber.level}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>{chamber.challenge}</span>
        </div>
      </div>

      {/* Enemies - First/Second Half */}
      <div className="grid grid-cols-1 gap-4 p-4">
        {/* First Half */}
        <div className="space-y-2">
          <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-celestial-300/60">
            <span className="inline-block h-1 w-1 rounded-full bg-celestial-400/60" />
            First Half
          </h5>
          <WavesList
            waves={chamber.firstHalf.waves}
            getElementUrl={getElementUrl}
          />
        </div>

        <div className="border border-border/30 rounded-full" />

        {/* Second Half */}
        <div className="space-y-2">
          <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-celestial-300/60">
            <span className="inline-block h-1 w-1 rounded-full bg-celestial-400/60" />
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

interface EnemyBadgeProps {
  enemy: AbyssEnemy;
  elementUrl?: string;
}

const EnemyBadge: React.FC<EnemyBadgeProps> = ({ enemy, elementUrl }) => (
  <div className="group relative flex flex-col items-center gap-1.5 rounded-xl bg-midnight-800/40 p-2 transition-all duration-200 hover:bg-midnight-700/60">
    {/* Avatar */}
    <div className="relative">
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-midnight-600/80 to-midnight-800/80 shadow-lg ring-2 ring-white/10 transition-all duration-200 group-hover:ring-celestial-400/50">
        <img
          src={enemy.iconUrl}
          alt={enemy.name}
          className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Element badge */}
      {elementUrl && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-midnight-900 shadow-md ring-2 ring-midnight-700">
          <CachedImage
            src={elementUrl}
            alt={enemy.element || ''}
            className="h-3.5 w-3.5 object-contain"
          />
        </div>
      )}

      {/* Count badge */}
      {enemy.count > 1 && (
        <div className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-celestial-500 px-1 shadow-md ring-2 ring-midnight-800">
          <span className="text-[10px] font-bold text-white">
            ×{enemy.count}
          </span>
        </div>
      )}
    </div>

    {/* Name */}
    <span className="line-clamp-2 max-w-16 text-center text-[10px] font-medium leading-tight text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
      {enemy.name}
    </span>
  </div>
);

interface WavesListProps {
  waves: AbyssWave[];
  getElementUrl: (elementName?: string) => string | undefined;
}

const WavesList: React.FC<WavesListProps> = ({ waves, getElementUrl }) => (
  <div className="flex flex-wrap gap-3">
    {waves.map((wave) => (
      <div key={wave.waveNumber} className="space-y-1.5">
        {/* Wave Header (only if multiple waves) */}
        {waves.length > 1 && (
          <div className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
            Wave {wave.waveNumber}
          </div>
        )}

        {/* Enemy Badges */}
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
