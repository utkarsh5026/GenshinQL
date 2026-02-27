import React from 'react';

import { ROLE_COLORS } from '../../constants';
import type { Team } from '../../types';

const ELEMENT_COLORS: Record<string, string> = {
  pyro: '#ff6b35',
  hydro: '#4db8ff',
  anemo: '#74e8a4',
  electro: '#c882f5',
  cryo: '#a8d8f0',
  geo: '#f5c842',
  dendro: '#81c71f',
};

const RARITY_GRADIENT: Record<string, string> = {
  '5': 'linear-gradient(160deg, #3d2a0a 0%, #1a1008 100%)',
  '4': 'linear-gradient(160deg, #1e1133 0%, #0d0a1a 100%)',
};

const RARITY_BORDER: Record<string, string> = {
  '5': '#c97f0a',
  '4': '#8b5cf6',
};

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
  const dominantColors = team.slots
    .filter((s) => s.character)
    .map(
      (s) => ELEMENT_COLORS[s.character!.element.toLowerCase()] ?? '#9ca3af'
    );

  const accentColor = dominantColors[0] ?? '#8b5cf6';

  return (
    <div
      ref={ref}
      className="relative overflow-hidden text-slate-200"
      style={{
        width: '960px',
        minHeight: '580px',
        background:
          'linear-gradient(135deg, #08091a 0%, #0d0f24 50%, #0b0c1e 100%)',
        borderRadius: '20px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background orbs */}
      {dominantColors.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${c}18 0%, transparent 70%)`,
            left: `${i * 240 - 60}px`,
            top: '-80px',
          }}
        />
      ))}

      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div
        className="relative flex items-center justify-between px-9 pt-7 pb-4.5"
        style={{ borderBottom: `1px solid ${accentColor}30` }}
      >
        <div>
          <div
            className="text-[10px] tracking-[0.2em] font-bold uppercase mb-1 opacity-85"
            style={{ color: accentColor }}
          >
            ◆ Team Composition
          </div>
          <h1
            className="m-0 text-[28px] font-extrabold tracking-[-0.02em] bg-clip-text text-transparent"
            style={{
              background: `linear-gradient(90deg, #fff 0%, ${accentColor} 60%, #fff 100%)`,
            }}
          >
            {team.name}
          </h1>
        </div>
        {/* Watermark */}
        <div className="text-[11px] font-semibold tracking-widest text-white/20">
          GenshinQL
        </div>
      </div>

      {/* Character cards */}
      <div className="grid grid-cols-4 gap-4 px-9 py-5">
        {team.slots.map((slot, i) => {
          if (!slot.character) {
            return (
              <div
                key={i}
                className="flex items-center justify-center min-h-70 rounded-2xl border-2 border-dashed border-white/8 text-[13px] text-white/20"
              >
                Empty
              </div>
            );
          }

          const c = slot.character;
          const elColor = ELEMENT_COLORS[c.element.toLowerCase()] ?? '#9ca3af';
          const bg = RARITY_GRADIENT[c.rarity] ?? RARITY_GRADIENT['4'];
          const borderColor = RARITY_BORDER[c.rarity] ?? '#6b7280';

          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl"
              style={{
                border: `1px solid ${borderColor}50`,
                background: bg,
                boxShadow: `0 4px 24px ${elColor}15, inset 0 1px 0 ${borderColor}20`,
              }}
            >
              {/* Character image */}
              <div className="relative h-45 overflow-hidden">
                <img
                  src={c.iconUrl}
                  alt={c.name}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover object-top opacity-85 mix-blend-luminosity"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, ${elColor}10 0%, transparent 40%, rgba(0,0,0,0.7) 100%)`,
                  }}
                />
                {/* Element icon top-left */}
                {c.elementUrl && (
                  <img
                    src={c.elementUrl}
                    alt={c.element}
                    crossOrigin="anonymous"
                    className="absolute left-2 top-2 h-5.5 w-5.5 object-contain"
                    style={{ filter: `drop-shadow(0 0 6px ${elColor})` }}
                  />
                )}
                {/* Rarity stars top-right */}
                <div
                  className="absolute right-2 top-2 text-[9px] font-bold"
                  style={{ color: borderColor }}
                >
                  {'★'.repeat(Number(c.rarity))}
                </div>
                {/* Name at bottom */}
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <div
                    className="mb-1 text-[14px] font-bold text-white"
                    style={{ textShadow: `0 0 8px ${elColor}` }}
                  >
                    {c.name}
                  </div>
                  {/* Role badges */}
                  {slot.roles.length > 0 && (
                    <div className="flex flex-wrap gap-0.75">
                      {slot.roles.map((role) => {
                        const rc = ROLE_COLORS[role];
                        return (
                          <span
                            key={role}
                            className="rounded-lg px-1.25 py-px text-[8px] font-bold"
                            style={{
                              border: `1px solid ${rc}60`,
                              background: `${rc}25`,
                              color: rc,
                            }}
                          >
                            {role}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Info section */}
              <div className="px-3 py-2.5">
                {/* Weapon */}
                {slot.weapon && (
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-white/4 px-2 py-1.25">
                    <img
                      src={slot.weapon.iconUrl}
                      alt={slot.weapon.name}
                      crossOrigin="anonymous"
                      className="h-4.5 w-4.5 shrink-0 object-contain"
                    />
                    <span className="flex-1 truncate text-[10px] font-semibold">
                      {slot.weapon.name}
                    </span>
                  </div>
                )}

                {/* Artifacts */}
                {slot.artifacts && (
                  <div className="rounded-lg bg-white/4 px-2 py-1.25">
                    {slot.artifacts.mode === '4pc' ? (
                      <div className="flex items-center gap-1">
                        {slot.artifacts.setIconUrl && (
                          <img
                            src={slot.artifacts.setIconUrl}
                            crossOrigin="anonymous"
                            alt=""
                            className="h-3.5 w-3.5 object-contain"
                          />
                        )}
                        <span className="flex-1 truncate text-[9px]">
                          {slot.artifacts.set}
                        </span>
                        <span className="shrink-0 text-[8px] text-white/40">
                          (4pc)
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="mb-0.5 flex items-center gap-1">
                          {slot.artifacts.setAIconUrl && (
                            <img
                              src={slot.artifacts.setAIconUrl}
                              crossOrigin="anonymous"
                              alt=""
                              className="h-3 w-3 object-contain"
                            />
                          )}
                          <span className="flex-1 truncate text-[9px]">
                            {slot.artifacts.setA}
                          </span>
                          <span className="shrink-0 text-[8px] text-white/40">
                            (2pc)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {slot.artifacts.setBIconUrl && (
                            <img
                              src={slot.artifacts.setBIconUrl}
                              crossOrigin="anonymous"
                              alt=""
                              className="h-3 w-3 object-contain"
                            />
                          )}
                          <span className="flex-1 truncate text-[9px]">
                            {slot.artifacts.setB}
                          </span>
                          <span className="shrink-0 text-[8px] text-white/40">
                            (2pc)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotation section */}
      {team.rotation && (
        <div
          className="mx-9 mb-7 rounded-[14px] bg-white/3 px-5 py-4"
          style={{ border: `1px solid ${accentColor}20` }}
        >
          <div
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-80"
            style={{ color: accentColor }}
          >
            ⟳ Rotation Notes
          </div>
          <p className="m-0 whitespace-pre-wrap font-mono text-[11px] leading-[1.7] text-white/70">
            {team.rotation}
          </p>
        </div>
      )}

      {/* Bottom accent line */}
      <div
        className="h-[3px] opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 30%, ${dominantColors[1] ?? accentColor} 70%, transparent 100%)`,
        }}
      />
    </div>
  );
});

TeamPreviewCard.displayName = 'TeamPreviewCard';
