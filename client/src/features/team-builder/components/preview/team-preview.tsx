import React from 'react';

import { ELEMENT_COLORS, getElementHexColor } from '@/lib/game-colors';
import { useElements } from '@/stores/usePrimitivesStore';

import {
  ELEMENTAL_REACTIONS,
  ELEMENTAL_RESONANCES,
} from '../../constants/elemental-reactions';
import type { Team } from '../../types';
import { CharacterCard } from './character-preview';
import { RotationPreview } from './rotation-preview';

/* ─── Reaction colour map (no design-system equivalent) ──────── */
const REACTION_HEX: Record<string, string> = {
  Vaporize: '#ff6b35',
  Melt: '#ff9966',
  Overloaded: '#ff4488',
  Burning: '#ff5500',
  Freeze: '#88ddff',
  'Electro-Charged': '#cc88ff',
  Superconduct: '#aabbff',
  Quicken: '#88ffaa',
  Bloom: '#44ffcc',
  Swirl: '#55ffee',
  Crystallize: '#ffdd44',
};

/* ─── ElementalPanel ───────────────────────────────────────────── */
interface ElementalPanelProps {
  slots: Team['slots'];
}

const ElementalPanel: React.FC<ElementalPanelProps> = ({ slots }) => {
  const elements = useElements();

  /* Build element name → iconUrl map from primitives */
  const elementIconMap: Record<string, string> = {};
  elements.forEach((el) => {
    elementIconMap[el.name.toLowerCase()] = el.url;
  });

  /* Collect elements for all filled slots */
  const filledSlots = slots.filter((s) => s.character !== null);
  if (filledSlots.length === 0) return null;

  /* ── Resonances: count occurrences of each element ─── */
  const elementCounts: Record<string, number> = {};
  filledSlots.forEach((slot) => {
    const el = slot.character!.element; // e.g. "Pyro"
    elementCounts[el] = (elementCounts[el] ?? 0) + 1;
  });

  const activeResonances = Object.entries(elementCounts)
    .filter(([, count]) => count >= 2)
    .map(([el]) => ({ element: el, resonance: ELEMENTAL_RESONANCES[el] }))
    .filter((r) => r.resonance);

  /* ── Reactions: DPS element vs every other element ─── */
  const dpsSlot =
    filledSlots.find((s) => s.roles.includes('DPS')) ?? filledSlots[0];
  const dpsElement = dpsSlot.character!.element; // e.g. "Pyro"

  interface ReactionEntry {
    reactionName: string;
    dpsElement: string;
    partnerElement: string;
    hex: string;
  }

  const reactions: ReactionEntry[] = [];
  const seenReactions = new Set<string>();

  filledSlots.forEach((slot) => {
    const partnerEl = slot.character!.element;
    if (partnerEl === dpsElement) return;

    const possible = ELEMENTAL_REACTIONS[dpsElement] ?? [];
    possible
      .filter((r) => r.partnerElement === partnerEl)
      .forEach((r) => {
        const key = `${r.reactionName}-${partnerEl}`;
        if (!seenReactions.has(key)) {
          seenReactions.add(key);
          reactions.push({
            reactionName: r.reactionName,
            dpsElement,
            partnerElement: partnerEl,
            hex: REACTION_HEX[r.reactionName] ?? '#ffffff',
          });
        }
      });
  });

  if (activeResonances.length === 0 && reactions.length === 0) return null;

  return (
    <div className="mx-8 mt-4 mb-1">
      {/* ── Single row: label + resonances + divider + reactions ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Label */}
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/40 shrink-0">
          Elemental
        </span>

        <div className="h-3 w-px bg-border/40 shrink-0" />

        {/* Resonance chips */}
        {activeResonances.map(({ element, resonance }) => {
          const elKey = element.toLowerCase();
          const elColors = ELEMENT_COLORS[elKey as keyof typeof ELEMENT_COLORS];
          const hex = getElementHexColor(elKey);
          const iconUrl = elementIconMap[elKey];
          return (
            <div
              key={element}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0 ${elColors?.badgeContainer ?? 'bg-muted/40 border border-border/30'}`}
            >
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={element}
                  crossOrigin="anonymous"
                  className="w-3.5 h-3.5 object-contain shrink-0"
                  style={{ filter: `drop-shadow(0 0 3px ${hex}66)` }}
                />
              )}
              <span
                className={`text-[10px] font-bold leading-none ${elColors?.text ?? 'text-muted-foreground'}`}
              >
                {resonance.name}
              </span>
              <span className="text-[9px] text-muted-foreground/60 leading-none">
                {resonance.description}
              </span>
            </div>
          );
        })}

        {/* Divider between resonances and reactions */}
        {activeResonances.length > 0 && reactions.length > 0 && (
          <div className="h-3 w-px bg-border/40 shrink-0" />
        )}

        {/* Reaction chips — inline, always visible */}
        {reactions.map((r, i) => {
          const dpsIcon = elementIconMap[r.dpsElement.toLowerCase()];
          const partnerIcon = elementIconMap[r.partnerElement.toLowerCase()];
          const dpsHex = getElementHexColor(r.dpsElement);
          const partnerHex = getElementHexColor(r.partnerElement);
          return (
            <div
              key={i}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0"
              style={{
                background: `${r.hex}10`,
                border: `1px solid ${r.hex}28`,
              }}
            >
              {dpsIcon && (
                <img
                  src={dpsIcon}
                  alt={r.dpsElement}
                  crossOrigin="anonymous"
                  className="w-3 h-3 object-contain shrink-0"
                  style={{ filter: `drop-shadow(0 0 2px ${dpsHex}88)` }}
                />
              )}
              <span className="text-muted-foreground/40 text-[9px]">+</span>
              {partnerIcon && (
                <img
                  src={partnerIcon}
                  alt={r.partnerElement}
                  crossOrigin="anonymous"
                  className="w-3 h-3 object-contain shrink-0"
                  style={{ filter: `drop-shadow(0 0 2px ${partnerHex}88)` }}
                />
              )}
              <span className="text-muted-foreground/30 text-[9px] mx-0.5">
                =
              </span>
              <span
                className="text-[10px] font-bold leading-none"
                style={{ color: r.hex }}
              >
                {r.reactionName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── TeamPreviewCard ──────────────────────────────────────────── */
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

      {/* Elemental Resonance + Reactions panel */}
      <ElementalPanel slots={team.slots} />

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
