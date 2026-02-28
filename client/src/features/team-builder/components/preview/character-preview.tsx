import React, { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { GenshinChip } from '@/components/ui/genshin-chip';
import { ElementBadge } from '@/components/ui/genshin-game-icons';
import { GenshinImage } from '@/components/ui/genshin-image';
import { useStickerStore } from '@/stores/useStickerStore';

import { ROLE_COLORS } from '../../constants';
import type { ArtifactConfig, TeamCharacterSlot } from '../../types';

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

const STAT_LABEL: Record<string, string> = {
  sands: 'Sands',
  goblet: 'Goblet',
  circlet: 'Circlet',
};

const Divider = () => <div className="h-px -mx-3.5 bg-white/6" />;

const MainStatRow: React.FC<{ label: string; values: string[] }> = ({
  label,
  values,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[9px] text-white/30 font-bold tracking-[0.06em] uppercase w-12 shrink-0">
      {label}
    </span>
    <div className="flex flex-wrap gap-1">
      {values.map((s) => (
        <GenshinChip
          key={s}
          variant="outline"
          className="text-[10px] py-0.5 px-2"
        >
          {s}
        </GenshinChip>
      ))}
    </div>
  </div>
);

interface StickerSelectorProps {
  charStickers: string[];
  elColor: string;
  selectedSticker: string | null;
  onSelect: (url: string | null) => void;
}

const StickerSelector: React.FC<StickerSelectorProps> = ({
  charStickers,
  elColor,
  selectedSticker,
  onSelect,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  if (charStickers.length === 0) return null;

  return (
    <div
      ref={pickerRef}
      data-html2canvas-ignore="true"
      className="absolute bottom-2.5 right-2.5 flex flex-col items-end gap-1 z-20"
    >
      {/* Reset button — only shown when a sticker is active */}
      {selectedSticker && (
        <button
          title="Back to original"
          onClick={() => onSelect(null)}
          className="flex items-center gap-0.75 text-[9px] font-bold text-white/70 bg-black/55 border border-white/18 rounded-[5px] px-1.75 py-0.75 cursor-pointer tracking-[0.04em] backdrop-blur-sm"
        >
          ✕ Reset
        </button>
      )}

      {/* Sticker picker toggle */}
      <button
        title="Choose sticker"
        onClick={() => setPickerOpen((v) => !v)}
        className="flex items-center gap-0.75 text-[9px] font-bold rounded-[5px] px-1.75 py-0.75 cursor-pointer tracking-[0.04em] backdrop-blur-sm"
        style={{
          color: elColor,
          background: `${elColor}18`,
          border: `1px solid ${elColor}45`,
        }}
      >
        🎴 Sticker
      </button>

      {/* Sticker grid dropdown */}
      {pickerOpen && (
        <div
          className="absolute bottom-[calc(100%+6px)] right-0 w-45 max-h-50 overflow-y-auto rounded-[10px] p-2 grid grid-cols-3 gap-1.5 backdrop-blur-xl z-30"
          style={{
            background: 'rgba(10,13,20,0.95)',
            border: `1px solid ${elColor}44`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${elColor}22`,
          }}
        >
          {charStickers.map((url, idx) => (
            <button
              key={idx}
              title={`Sticker ${idx + 1}`}
              onClick={() => {
                onSelect(url);
                setPickerOpen(false);
              }}
              className="rounded-[7px] p-1 flex items-center justify-center cursor-pointer transition-[border-color,background] duration-150"
              style={{
                background:
                  selectedSticker === url
                    ? `${elColor}30`
                    : 'rgba(255,255,255,0.04)',
                border:
                  selectedSticker === url
                    ? `1.5px solid ${elColor}`
                    : '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <GenshinImage
                src={url}
                alt={`sticker-${idx}`}
                shape="square"
                wrapperClassName="w-10.5 h-10.5"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CharacterCard: React.FC<{ slot: TeamCharacterSlot }> = ({
  slot,
}) => {
  const c = slot.character;
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const { stickersByCharacter, fetchStickers } = useStickerStore();

  useEffect(() => {
    fetchStickers();
  }, [fetchStickers]);

  if (!c) {
    return (
      <div className="flex items-center justify-center min-h-80 rounded-xl border border-dashed border-white/10 bg-white/2 text-[13px] text-white/15 tracking-[0.05em]">
        Empty
      </div>
    );
  }

  // Find stickers for this character (case-insensitive key match)
  const charKey = Object.keys(stickersByCharacter).find(
    (k) => k.toLowerCase() === c.name.toLowerCase()
  );
  const charStickers: string[] = charKey ? stickersByCharacter[charKey] : [];

  const elColor = ELEMENT_HEX[c.element.toLowerCase()] ?? '#9ca3af';
  const constellation = slot.constellation ?? 0;
  const level = slot.level ?? 90;
  const refinement = slot.weaponRefinement ?? 1;
  const mainStats = slot.mainStats ?? { sands: [], goblet: [], circlet: [] };
  const substats = slot.substats ?? [];
  const notes = slot.notes ?? '';

  const hasMainStats =
    mainStats.sands.length > 0 ||
    mainStats.goblet.length > 0 ||
    mainStats.circlet.length > 0;

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden relative"
      style={{
        background: '#111520',
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 0 0 1px ${elColor}20, 0 2px 8px rgba(0,0,0,0.2)`,
      }}
    >
      {/* ── Namecard / Portrait Banner ───────────────── */}
      <div
        className="relative h-50 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${elColor}18 0%, #0a0d14 80%)`,
        }}
      >
        {/* Namecard background */}
        {c.namecardURL && (
          <img
            src={c.namecardURL}
            crossOrigin="anonymous"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
          />
        )}

        {/* Character art / sticker */}
        {selectedSticker ? (
          <img
            src={selectedSticker}
            alt="sticker"
            crossOrigin="anonymous"
            className="absolute right-2 bottom-2 h-41 w-41 object-contain"
            style={{ filter: `drop-shadow(0 4px 20px ${elColor}55)` }}
          />
        ) : (
          <img
            src={c.iconUrl}
            alt={c.name}
            crossOrigin="anonymous"
            className="absolute -right-3 -bottom-1 h-45 w-auto object-contain object-bottom"
            style={{ filter: `drop-shadow(0 4px 20px ${elColor}55)` }}
          />
        )}

        {/* Gradient overlays */}
        {/* top vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(10,13,20,0.5)] via-transparent to-[rgba(10,13,20,0.85)]" />
        {/* left‑to‑right fade so text area is always readable */}
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(10,13,20,0.85)] to-transparent" />

        {/* Element pill — top left */}
        {c.elementUrl && (
          <ElementBadge
            name={c.element}
            url={c.elementUrl}
            size="xs"
            className="absolute top-2.5 left-2.5"
          />
        )}

        {/* Lv + Constellation — top right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className="text-[11px] font-extrabold text-white/85 bg-black/50 rounded-md px-1.75 py-0.5 tracking-[0.03em] border-transparent"
          >
            Lv.{level}
          </Badge>
          <Badge
            variant="outline"
            className="text-[11px] font-extrabold rounded-md px-1.75 py-0.5 tracking-[0.03em]"
            style={{
              color: elColor,
              background: `${elColor}22`,
              border: `1px solid ${elColor}44`,
            }}
          >
            C{constellation}
          </Badge>
        </div>

        {/* Name + roles — bottom left of banner */}
        <div className="absolute bottom-3 left-3 right-15">
          <div
            className="text-[18px] font-extrabold text-white leading-[1.1] tracking-[-0.01em] mb-1.25"
            style={{
              textShadow: `0 2px 12px rgba(0,0,0,0.8), 0 0 20px ${elColor}40`,
            }}
          >
            {c.name}
          </div>
          {slot.roles.length > 0 && (
            <div className="flex flex-wrap gap-0.75">
              {slot.roles.map((role) => {
                const rc = ROLE_COLORS[role];
                return (
                  <Badge
                    key={role}
                    variant="outline"
                    className="text-[9px] font-bold uppercase tracking-[0.06em] rounded-sm px-1.5 py-0.5"
                    style={{
                      color: rc,
                      background: `${rc}20`,
                      border: `1px solid ${rc}45`,
                    }}
                  >
                    {role}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticker picker button + reset — bottom right of banner */}
        <StickerSelector
          charStickers={charStickers}
          elColor={elColor}
          selectedSticker={selectedSticker}
          onSelect={setSelectedSticker}
        />
      </div>

      {/* ── Info Section ──────────────────────────────── */}
      <div className="flex flex-col gap-2.5 p-3.5">
        {/* Weapon */}
        {slot.weapon && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: `${elColor}15`,
                  border: `1px solid ${elColor}30`,
                }}
              >
                <img
                  src={slot.weapon.iconUrl}
                  alt={slot.weapon.name}
                  crossOrigin="anonymous"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-white/85 overflow-hidden text-ellipsis whitespace-nowrap leading-[1.2]">
                  {slot.weapon.name}
                </div>
                <div className="text-[10px] text-white/35 mt-0.5">
                  Refinement {refinement}
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[11px] font-extrabold rounded-[5px] px-1.75 py-0.5 shrink-0"
                style={{
                  color: elColor,
                  background: `${elColor}18`,
                  border: `1px solid ${elColor}35`,
                }}
              >
                R{refinement}
              </Badge>
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
            <div className="flex flex-col gap-1.5">
              {mainStats.sands.length > 0 && (
                <MainStatRow
                  label={STAT_LABEL.sands}
                  values={mainStats.sands}
                />
              )}
              {mainStats.goblet.length > 0 && (
                <MainStatRow
                  label={STAT_LABEL.goblet}
                  values={mainStats.goblet}
                />
              )}
              {mainStats.circlet.length > 0 && (
                <MainStatRow
                  label={STAT_LABEL.circlet}
                  values={mainStats.circlet}
                />
              )}
            </div>
            {substats.length > 0 && <Divider />}
          </>
        )}

        {/* Substats */}
        {substats.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {substats.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-[10px] font-semibold rounded-sm px-1.75 py-0.5"
                style={{
                  color: elColor,
                  background: `${elColor}14`,
                  border: `1px solid ${elColor}28`,
                }}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <p
            className="m-0 text-[10px] leading-[1.6] italic text-white/30 pl-2"
            style={{ borderLeft: `2px solid ${elColor}40` }}
          >
            {notes}
          </p>
        )}
      </div>
    </div>
  );
};

const ArtifactSetRow: React.FC<{ iconUrl?: string; name: string }> = ({
  iconUrl,
  name,
}) => (
  <div className="flex items-center gap-1.5">
    {iconUrl && (
      <img
        src={iconUrl}
        crossOrigin="anonymous"
        alt=""
        className="h-3.5 w-3.5 object-contain shrink-0"
      />
    )}
    <span className="flex-1 text-[11px] text-white/55 overflow-hidden text-ellipsis whitespace-nowrap">
      {name}
    </span>
    <span className="text-[10px] text-white/25 shrink-0">2pc</span>
  </div>
);

const ArtifactRow: React.FC<{ artifacts: ArtifactConfig }> = ({
  artifacts,
}) => {
  if (artifacts.mode === '4pc') {
    return (
      <div className="flex items-center gap-1.5">
        {artifacts.setIconUrl && (
          <img
            src={artifacts.setIconUrl}
            crossOrigin="anonymous"
            alt=""
            className="h-4 w-4 object-contain shrink-0"
          />
        )}
        <span className="flex-1 text-[11px] text-white/55 overflow-hidden text-ellipsis whitespace-nowrap">
          {artifacts.set}
        </span>
        <span className="text-[10px] text-white/25 shrink-0">4pc</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.75">
      <ArtifactSetRow iconUrl={artifacts.setAIconUrl} name={artifacts.setA} />
      <ArtifactSetRow iconUrl={artifacts.setBIconUrl} name={artifacts.setB} />
    </div>
  );
};
