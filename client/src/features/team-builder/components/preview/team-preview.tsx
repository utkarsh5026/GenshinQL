import React from 'react';

import type { Team } from '../../types';
import { CharacterCard } from './character-preview';
import { RotationPreview } from './rotation-preview';

interface TeamPreviewCardProps {
  team: Team;
}

/**
 * This component is the visual target for html2canvas capture.
 * It is rendered with fixed dimensions suited for image export.
 */
export const TeamPreviewCard = React.forwardRef<
  HTMLDivElement,
  TeamPreviewCardProps
>(({ team }, ref) => {
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-background border border-border/40 text-foreground"
      style={{
        width: '960px',
        minHeight: '560px',
      }}
    >
      {/* Header */}
      <div className="flex items-end justify-between px-8 pt-6 pb-4">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            Team Composition
          </div>
          <h1 className="m-0 text-[30px] font-bold tracking-tight text-foreground">
            {team.name}
          </h1>
        </div>
        <div className="text-[11px] font-medium tracking-widest text-muted-foreground/20">
          GenshinQL
        </div>
      </div>

      <div className="mx-8 h-px bg-border/40" />
      <div className="grid grid-cols-4 gap-3 px-8 py-5">
        {team.slots.map((slot, i) => (
          <CharacterCard key={i} slot={slot} />
        ))}
      </div>

      {team.rotation && <RotationPreview team={team} />}
      <div className="h-px bg-border/20" />
    </div>
  );
});

TeamPreviewCard.displayName = 'TeamPreviewCard';
