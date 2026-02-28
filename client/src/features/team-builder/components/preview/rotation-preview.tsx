import React, { useMemo } from 'react';

import { CharacterAvatar } from '@/features/characters';

import { useTalentIconsMap } from '../../hooks/useTalentIconsMap';
import type { RotationAbility, Team } from '../../types';
import { parseSteps } from '../../utils';

/** Maps each RotationAbility to its talent index: [NA, E, Q] = [0, 1, 2]. CA shares the Normal Attack icon. */
const ABILITY_TO_TALENT_IDX: Record<RotationAbility, number> = {
  NA: 0,
  CA: 0,
  E: 1,
  Q: 2,
};

const ABILITY_COLOR: Record<RotationAbility, string> = {
  /** Elemental Skill — hydro blue palette */
  E: 'text-hydro-300 border-hydro-500/40 bg-hydro-500/10',
  /** Elemental Burst — legendary gold palette */
  Q: 'text-legendary-300 border-legendary-500/40 bg-legendary-500/10',
  /** Normal Attack — muted/common palette */
  NA: 'text-common-300 border-common-500/30 bg-common-500/10',
  /** Charged Attack — electro purple palette */
  CA: 'text-electro-300 border-electro-500/40 bg-electro-500/10',
};

export const RotationPreview: React.FC<{ team: Team }> = ({ team }) => {
  const talentMap = useTalentIconsMap();

  const validNames = useMemo(
    () =>
      team.slots.map((s) => s.character?.name).filter((n): n is string => !!n),
    [team.slots]
  );

  const iconUrlMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of team.slots) {
      if (s.character) m[s.character.name] = s.character.iconUrl;
    }
    return m;
  }, [team.slots]);

  const segments = useMemo(
    () => parseSteps(team.rotation, validNames, iconUrlMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [team.rotation]
  );

  if (segments.length === 0) return null;

  return (
    <div className="mx-8 mb-6 rounded-xl bg-accent/40 border border-border/40 px-5 py-4">
      {/* Section label */}
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
        Team Rotation
      </div>

      {/* Segment flow */}
      <div className="flex flex-wrap items-center gap-1.5">
        {segments.map((segment, segIdx) => {
          const icons = talentMap[segment.characterName];
          return (
            <React.Fragment key={segment.id}>
              {/* connector arrow between segments */}
              {segIdx > 0 && (
                <span className="text-muted-foreground/30 text-xs select-none">
                  ›
                </span>
              )}

              {/* Segment card */}
              <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-accent/30 pl-1.5 pr-2 py-1">
                {/* Character avatar (tiny) */}
                <CharacterAvatar
                  characterName={segment.characterName}
                  size="xs"
                  showName={false}
                  interactive={false}
                />

                {/* Ability chips */}
                <div className="flex items-center gap-0.5">
                  {segment.abilities.map((ability, i) => {
                    const icon = icons?.[ABILITY_TO_TALENT_IDX[ability]];
                    return (
                      <span
                        key={i}
                        title={ability}
                        className={`flex items-center gap-0.5 rounded border px-1 py-0.5 text-[10px] font-bold leading-none ${ABILITY_COLOR[ability]}`}
                      >
                        {icon?.iconUrl && (
                          <img
                            src={icon.iconUrl}
                            alt={icon.name}
                            className="h-2.75 w-2.75 object-contain"
                          />
                        )}
                        {ability}
                      </span>
                    );
                  })}
                </div>

                {/* Optional note */}
                {segment.note && (
                  <span className="text-[9px] text-muted-foreground/50 italic ml-1">
                    {segment.note}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
