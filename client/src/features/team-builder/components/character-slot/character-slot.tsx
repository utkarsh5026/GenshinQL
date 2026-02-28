import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useFetchDetailedArtifacts } from '@/features/characters';
import type { WeaponSummary } from '@/features/weapons';
import { getElementHexColor } from '@/lib/game-colors';
import type { Character } from '@/types';

import type {
  ArtifactConfig,
  CharacterRole,
  TeamCharacterSlot,
} from '../../types';
import { CharacterPickerDialog } from '../character-picker';
import { ArtifactStats } from './artifact-stats';
import { ArtifactSelector } from './artifacts-selector';
import { CharacterPortrait } from './character-portrait';
import { RoleSelector } from './role-selector';
import { WeaponSelector } from './weapon-selector';

interface CharacterSlotCardProps {
  slot: TeamCharacterSlot;
  slotIndex: number;
  teamId: string;
  allSlots: TeamCharacterSlot[];
  weapons: WeaponSummary[];
  onSetCharacter: (c: Character | null) => void;
  onSetWeapon: (w: WeaponSummary | null) => void;
  onSetRefinement: (r: number) => void;
  onSetArtifacts: (a: ArtifactConfig | null) => void;
  onSetRoles: (roles: CharacterRole[]) => void;
  onSetConstellation: (c: number) => void;
  onSetLevel: (l: number) => void;
  onSetNotes: (n: string) => void;
  onSetMainStats: (ms: TeamCharacterSlot['mainStats']) => void;
  onSetSubstats: (ss: string[]) => void;
  onClearSlot: () => void;
}

type EditSection = 'notes' | null;

/** ── InlinePanelHeader ────────────────────────────────────────────────────
 *  Header row used by inline edit panels (Notes, …).
 */
interface InlinePanelHeaderProps {
  label: string;
  onClose: () => void;
}

const InlinePanelHeader: React.FC<InlinePanelHeaderProps> = ({
  label,
  onClose,
}) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </span>
    <button
      onClick={onClose}
      className="text-muted-foreground hover:text-foreground"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

export const CharacterSlotCard: React.FC<CharacterSlotCardProps> = ({
  slot,
  slotIndex,
  allSlots,
  weapons,
  onSetCharacter,
  onSetWeapon,
  onSetRefinement,
  onSetArtifacts,
  onSetRoles,
  onSetConstellation,
  onSetLevel,
  onSetNotes,
  onSetMainStats,
  onSetSubstats,
  onClearSlot,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<EditSection>(null);
  const controls = useDragControls();

  const { character, weapon, artifacts, roles } = slot;
  const elementColor = character ? getElementHexColor(character.element) : null;

  const constellation = slot.constellation ?? 0;
  const level = slot.level ?? 90;
  const weaponRefinement = slot.weaponRefinement ?? 1;
  const notes = slot.notes ?? '';
  const mainStats = slot.mainStats ?? { sands: [], goblet: [], circlet: [] };
  const substats = slot.substats ?? [];

  const fetchDetailed = useFetchDetailedArtifacts();
  useEffect(() => {
    fetchDetailed();
  }, [fetchDetailed]);

  const toggleEditing = (section: EditSection) =>
    setEditing((prev) => (prev === section ? null : section));

  return (
    <Reorder.Item
      value={slot}
      dragListener={false}
      dragControls={controls}
      className="w-full"
    >
      {!character ? (
        <EmptySlot
          slotIndex={slotIndex}
          controls={controls}
          onPickerOpen={() => setPickerOpen(true)}
        />
      ) : (
        <div
          className="relative rounded-2xl overflow-hidden border-none border-border/40 flex flex-col"
          style={{ borderColor: `${elementColor}40` }}
        >
          {/* ── TOP: Namecard banner with avatar ── */}
          <CharacterPortrait
            character={character}
            elementColor={elementColor}
            constellation={constellation}
            level={level}
            onSetConstellation={onSetConstellation}
            onSetLevel={onSetLevel}
            onPickerOpen={() => setPickerOpen(true)}
            onClearSlot={onClearSlot}
            dragControls={controls}
          />

          {/* ── BOTTOM: Settings panel (full width) ── */}
          <div className="p-3 bg-surface-200 space-y-1.5">
            {/* Roles */}
            <RoleSelector roles={roles} onChange={onSetRoles} />

            {/* Weapon | Artifacts (two-column grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <WeaponSelector
                weapon={weapon}
                weaponTypeFilter={character.weaponType}
                weapons={weapons}
                weaponRefinement={weaponRefinement}
                onSetWeapon={onSetWeapon}
                onSetRefinement={onSetRefinement}
              />
              <ArtifactSelector
                artifacts={artifacts}
                onSetArtifacts={onSetArtifacts}
              />
            </div>

            {/* Main-stat selectors + substat toggles + priority chips */}
            {artifacts && (
              <ArtifactStats
                mainStats={mainStats}
                artifacts={artifacts}
                substats={substats}
                onSetMainStats={onSetMainStats}
                onSetSubstats={onSetSubstats}
              />
            )}

            {/* Notes row */}
            <button
              onClick={() => toggleEditing('notes')}
              className="w-full flex items-start px-2 py-1.5 rounded-lg bg-midnight-900/60 hover:bg-midnight-800/60 transition-all text-left border border-dashed border-midnight-800/50 hover:border-midnight-700/70"
            >
              {notes ? (
                <span className="text-xs text-foreground/60 wrap-break-word min-w-0 w-full">
                  {notes}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/50">
                  Add notes...
                </span>
              )}
            </button>

            {/* Notes panel */}
            {editing === 'notes' && (
              <div className="pt-1 border-t border-border/30">
                <InlinePanelHeader
                  label="Notes"
                  onClose={() => setEditing(null)}
                />
                <textarea
                  className="w-full px-2 py-1.5 text-xs bg-midnight-800/80 border border-midnight-700/60 rounded-md resize-none focus:outline-none focus:border-primary/60"
                  rows={3}
                  maxLength={120}
                  value={notes}
                  onChange={(e) => onSetNotes(e.target.value)}
                  placeholder="e.g. On-field DPS, use Q first..."
                />
                <p className="text-[9px] text-muted-foreground/50 text-right">
                  {notes.length}/120
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickers (Radix portals to document.body) */}
      <CharacterPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedCharacters={allSlots.map((s) => s.character)}
        onSelect={onSetCharacter}
      />
    </Reorder.Item>
  );
};

interface EmptySlotProps {
  slotIndex: number;
  controls: ReturnType<typeof useDragControls>;
  onPickerOpen: () => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({
  slotIndex,
  controls,
  onPickerOpen,
}) => (
  <div
    className="relative h-20"
    onPointerDown={(e) => {
      e.stopPropagation();
      controls.start(e);
    }}
  >
    {/* Drag handle */}
    <div
      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md bg-midnight-800/50 hover:bg-midnight-700/70 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all"
      title="Drag to reorder"
    >
      <GripVertical className="w-3 h-3 text-muted-foreground/50" />
    </div>
    <button
      onClick={onPickerOpen}
      className="
              group w-full h-full rounded-2xl border-2 border-dashed border-midnight-700/50
              bg-midnight-900/60 hover:bg-midnight-800/60 hover:border-primary/40
              transition-all duration-200 flex flex-row items-center justify-center gap-3
            "
    >
      <div className="w-10 h-10 rounded-xl bg-surface-300 flex items-center justify-center group-hover:bg-celestial-900/60 transition-all duration-200">
        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Slot {slotIndex + 1}
      </span>
    </button>
  </div>
);
