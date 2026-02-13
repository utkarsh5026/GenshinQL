import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { VersionEvent } from '../../types';
import { stripSoftHyphens } from '../../utils';

interface EventCardProps {
  event: VersionEvent;
}

const INITIAL_REWARDS_SHOWN = 8;

export default function EventCard({ event }: EventCardProps) {
  const name = useMemo(() => stripSoftHyphens(event.name), [event.name]);
  const [showAllRewards, setShowAllRewards] = useState(false);

  const visibleRewards = showAllRewards
    ? event.rewards
    : event.rewards.slice(0, INITIAL_REWARDS_SHOWN);
  const hasMore = event.rewards.length > INITIAL_REWARDS_SHOWN;

  return (
    <div className="overflow-hidden rounded-xl border border-midnight-700/50 bg-midnight-900/40 backdrop-blur-sm transition-all duration-300 hover:border-celestial-500/30">
      {/* Event Image */}
      {event.images[0] && (
        <div className="relative overflow-hidden">
          <img
            src={event.images[0]}
            alt={name}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-4 p-5">
        {/* Event Name + Link */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-hydro-300 transition-colors hover:text-hydro-200"
            title="View on Wiki"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Rewards */}
        {event.rewards.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rewards
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {visibleRewards.map((reward, i) => (
                <div
                  key={i}
                  className="group/reward flex flex-col items-center gap-1 rounded-lg bg-midnight-800/60 p-2 transition-colors hover:bg-midnight-700/60"
                  title={stripSoftHyphens(reward.caption)}
                >
                  <div className="relative h-10 w-10">
                    <img
                      src={reward.url}
                      alt={reward.caption}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                    {reward.count > 1 && (
                      <span className="absolute -bottom-1 -right-1 rounded-md bg-midnight-950/90 px-1 text-[10px] font-bold text-celestial-300">
                        {reward.count >= 1000
                          ? `${Math.round(reward.count / 1000)}k`
                          : reward.count}
                      </span>
                    )}
                  </div>
                  <span className="line-clamp-1 text-center text-[10px] leading-tight text-muted-foreground">
                    {stripSoftHyphens(reward.caption)}
                  </span>
                </div>
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => setShowAllRewards(!showAllRewards)}
                className="text-xs font-medium text-hydro-300 transition-colors hover:text-hydro-200"
              >
                {showAllRewards
                  ? 'Show less'
                  : `+${event.rewards.length - INITIAL_REWARDS_SHOWN} more rewards`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
