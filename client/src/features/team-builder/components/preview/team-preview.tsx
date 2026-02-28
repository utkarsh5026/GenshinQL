import React from 'react';

import { ROLE_COLORS } from '../../constants';
import type { ArtifactConfig, Team, TeamCharacterSlot } from '../../types';

/**
 * Element hex colors are needed for inline styles (dynamic border/glow per character).
 * These match the --color-{element}-500 values from index.css but as hex for html2canvas.
 */
const ELEMENT_HEX: Record<string, string> = {
  pyro: '#e74c3c',
  hydro: '#3498db',
  anemo: '#1abc9c',
  electro: '#9b59b6',
  cryo: '#a8d8f0',
  geo: '#f1c40f',
  dendro: '#2ecc71',
};

interface TeamPreviewCardProps {
  team: Team;
}

/* ── Helpers ────────────────────────────────────────────────── */

const Divider = () => (
  <div
    style={{
      height: '1px',
      background: 'rgba(255,255,255,0.06)',
      margin: '0 -14px',
    }}
  />
);

const ArtifactRow: React.FC<{ artifacts: ArtifactConfig }> = ({
  artifacts,
}) => {
  if (artifacts.mode === '4pc') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {artifacts.setIconUrl && (
          <img
            src={artifacts.setIconUrl}
            crossOrigin="anonymous"
            alt=""
            style={{
              height: '16px',
              width: '16px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        )}
        <span
          style={{
            flex: 1,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {artifacts.set}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}
        >
          4pc
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {artifacts.setAIconUrl && (
          <img
            src={artifacts.setAIconUrl}
            crossOrigin="anonymous"
            alt=""
            style={{
              height: '14px',
              width: '14px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        )}
        <span
          style={{
            flex: 1,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {artifacts.setA}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}
        >
          2pc
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {artifacts.setBIconUrl && (
          <img
            src={artifacts.setBIconUrl}
            crossOrigin="anonymous"
            alt=""
            style={{
              height: '14px',
              width: '14px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        )}
        <span
          style={{
            flex: 1,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.55)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {artifacts.setB}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}
        >
          2pc
        </span>
      </div>
    </div>
  );
};

/* ── Character Card ─────────────────────────────────────────── */

const STAT_LABEL: Record<string, string> = {
  sands: 'SDS',
  goblet: 'GBL',
  circlet: 'CRC',
};

const CharacterCard: React.FC<{ slot: TeamCharacterSlot }> = ({ slot }) => {
  const c = slot.character;

  if (!c) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '320px',
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.02)',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.05em',
        }}
      >
        Empty
      </div>
    );
  }

  const elColor = ELEMENT_HEX[c.element.toLowerCase()] ?? '#9ca3af';
  const constellation = slot.constellation ?? 0;
  const level = slot.level ?? 90;
  const refinement = slot.weaponRefinement ?? 1;
  const mainStats = slot.mainStats ?? { sands: [], goblet: [], circlet: [] };
  const substats = slot.substats ?? [];
  const notes = slot.notes ?? '';

  const hasMainStats =
    (Array.isArray(mainStats.sands)
      ? mainStats.sands.length > 0
      : !!mainStats.sands) ||
    (Array.isArray(mainStats.goblet)
      ? mainStats.goblet.length > 0
      : !!mainStats.goblet) ||
    (Array.isArray(mainStats.circlet)
      ? mainStats.circlet.length > 0
      : !!mainStats.circlet);

  const sandsVal = Array.isArray(mainStats.sands)
    ? mainStats.sands.join(', ')
    : mainStats.sands;
  const gobletVal = Array.isArray(mainStats.goblet)
    ? mainStats.goblet.join(', ')
    : mainStats.goblet;
  const circletVal = Array.isArray(mainStats.circlet)
    ? mainStats.circlet.join(', ')
    : mainStats.circlet;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#111520',
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 0 0 1px ${elColor}20, 0 2px 8px rgba(0,0,0,0.2)`,
        position: 'relative',
      }}
    >
      {/* ── Namecard / Portrait Banner ───────────────── */}
      <div
        style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${elColor}18 0%, #0a0d14 80%)`,
        }}
      >
        {/* Namecard background */}
        {c.namecardURL && (
          <img
            src={c.namecardURL}
            crossOrigin="anonymous"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.35,
            }}
          />
        )}

        {/* Character art */}
        <img
          src={c.iconUrl}
          alt={c.name}
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            right: '-12px',
            bottom: '-4px',
            height: '180px',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: `drop-shadow(0 4px 20px ${elColor}55)`,
          }}
        />

        {/* Gradient overlays */}
        {/* top vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(10,13,20,0.5) 0%, transparent 40%, rgba(10,13,20,0.85) 100%)',
          }}
        />
        {/* left‑to‑right fade so text area is always readable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(10,13,20,0.85) 45%, transparent 100%)',
          }}
        />

        {/* Element pill — top left */}
        {c.elementUrl && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: `${elColor}22`,
              border: `1px solid ${elColor}55`,
              borderRadius: '20px',
              padding: '3px 8px 3px 4px',
            }}
          >
            <img
              src={c.elementUrl}
              alt={c.element}
              crossOrigin="anonymous"
              style={{
                height: '16px',
                width: '16px',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 4px ${elColor}80)`,
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'capitalize',
                color: elColor,
                letterSpacing: '0.04em',
              }}
            >
              {c.element}
            </span>
          </div>
        )}

        {/* Lv + Constellation — top right */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '6px',
              padding: '2px 7px',
              letterSpacing: '0.03em',
            }}
          >
            Lv.{level}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: elColor,
              background: `${elColor}22`,
              border: `1px solid ${elColor}44`,
              borderRadius: '6px',
              padding: '2px 7px',
              letterSpacing: '0.03em',
            }}
          >
            C{constellation}
          </span>
        </div>

        {/* Name + roles — bottom left of banner */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '60px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 20px ${elColor}40`,
              marginBottom: '5px',
            }}
          >
            {c.name}
          </div>
          {slot.roles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {slot.roles.map((role) => {
                const rc = ROLE_COLORS[role];
                return (
                  <span
                    key={role}
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: rc,
                      background: `${rc}20`,
                      border: `1px solid ${rc}45`,
                      borderRadius: '4px',
                      padding: '2px 6px',
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

      {/* ── Info Section ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px',
        }}
      >
        {/* Weapon */}
        {slot.weapon && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: `${elColor}15`,
                  border: `1px solid ${elColor}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img
                  src={slot.weapon.iconUrl}
                  alt={slot.weapon.name}
                  crossOrigin="anonymous"
                  style={{
                    height: '24px',
                    width: '24px',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.85)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {slot.weapon.name}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: '2px',
                  }}
                >
                  Refinement {refinement}
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: elColor,
                  background: `${elColor}18`,
                  border: `1px solid ${elColor}35`,
                  borderRadius: '5px',
                  padding: '2px 7px',
                  flexShrink: 0,
                }}
              >
                R{refinement}
              </span>
            </div>
            <Divider />
          </>
        )}

        {/* Artifacts */}
        {slot.artifacts && (
          <>
            <ArtifactRow artifacts={slot.artifacts} />
            <Divider />
          </>
        )}

        {/* Main Stats */}
        {hasMainStats && (
          <>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {sandsVal && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '4px 7px',
                    gap: '1px',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255,255,255,0.3)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {STAT_LABEL.sands}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.75)',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {sandsVal}
                  </span>
                </div>
              )}
              {gobletVal && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '4px 7px',
                    gap: '1px',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255,255,255,0.3)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {STAT_LABEL.goblet}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.75)',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {gobletVal}
                  </span>
                </div>
              )}
              {circletVal && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '4px 7px',
                    gap: '1px',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '8px',
                      color: 'rgba(255,255,255,0.3)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {STAT_LABEL.circlet}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.75)',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {circletVal}
                  </span>
                </div>
              )}
            </div>
            {substats.length > 0 && <Divider />}
          </>
        )}

        {/* Substats */}
        {substats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {substats.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: elColor,
                  background: `${elColor}14`,
                  border: `1px solid ${elColor}28`,
                  borderRadius: '4px',
                  padding: '2px 7px',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <p
            style={{
              margin: 0,
              fontSize: '10px',
              lineHeight: 1.6,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.3)',
              borderLeft: `2px solid ${elColor}40`,
              paddingLeft: '8px',
            }}
          >
            {notes}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main Preview Card ──────────────────────────────────────── */

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

      {/* Separator */}
      <div className="mx-8 h-px bg-border/40" />

      {/* Character cards */}
      <div className="grid grid-cols-4 gap-3 px-8 py-5">
        {team.slots.map((slot, i) => (
          <CharacterCard key={i} slot={slot} />
        ))}
      </div>

      {/* Rotation section */}
      {team.rotation && (
        <div className="mx-8 mb-6 rounded-lg bg-accent/40 border border-border/40 px-4 py-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            Rotation Notes
          </div>
          <p className="m-0 whitespace-pre-wrap font-mono text-[12px] leading-[1.7] text-muted-foreground">
            {team.rotation}
          </p>
        </div>
      )}

      {/* Bottom bar */}
      <div className="h-px bg-border/20" />
    </div>
  );
});

TeamPreviewCard.displayName = 'TeamPreviewCard';
