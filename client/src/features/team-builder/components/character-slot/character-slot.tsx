import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Pencil, Plus, X } from 'lucide-react';
import React, { useState } from 'react';

import { CachedImage } from '@/features/cache';
import { useFetchArtifactLinks } from '@/features/characters/stores';
import type { WeaponSummary } from '@/features/weapons';
import { getElementHexColor } from '@/lib/game-colors';
import { cn } from '@/lib/utils';
import type { Character } from '@/types';

import type {
  ArtifactConfig,
  CharacterRole,
  TeamCharacterSlot,
} from '../../types';
import { ArtifactDisplay, ArtifactsPanel } from '../artifact-picker';
import { CharacterPickerDialog } from '../character-picker';
import { RoleBadges, RoleBadgeSelector } from '../role-selector';
import { WeaponPickerDialog } from '../weapon-picker';
import { SlotPopover } from './slot-popover';

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

type EditSection = 'weapon' | 'artifacts' | 'roles' | 'notes' | null;

/** Quick-select level presets */
const LEVEL_PRESETS = [20, 40, 60, 70, 80, 90];

/** Ordered main-stat chip definitions for the collapsed artifact summary. */
const MAIN_STAT_CHIPS: Array<{
  prefix: string;
  key: 'sands' | 'goblet' | 'circlet';
}> = [
  { prefix: 'S', key: 'sands' },
  { prefix: 'G', key: 'goblet' },
  { prefix: 'C', key: 'circlet' },
];

/** Class names for a quick-select option button based on active state. */
const optionButtonClass = (isActive: boolean) =>
  cn(
    'w-7 py-1 text-xs rounded-md font-semibold transition-all',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-accent/40 hover:bg-accent/70 text-muted-foreground'
  );

/** ── InlinePanelHeader ────────────────────────────────────────────────────
 *  Shared header row used by every inline edit panel (Roles, Notes, …).
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

interface RolesRowProps {
  roles: CharacterRole[];
  onClick: () => void;
}

const RolesRow: React.FC<RolesRowProps> = ({ roles, onClick }) => (
  <button onClick={onClick} className="w-full text-left">
    {roles.length > 0 ? (
      <RoleBadges roles={roles} size="sm" />
    ) : (
      <span className="text-xs text-muted-foreground/60 px-0.5">
        Add roles...
      </span>
    )}
  </button>
);

interface RolesPanelProps {
  roles: CharacterRole[];
  onSetRoles: (roles: CharacterRole[]) => void;
  onClose: () => void;
}

const RolesPanel: React.FC<RolesPanelProps> = ({
  roles,
  onSetRoles,
  onClose,
}) => (
  <div className="pt-1 border-t border-border/30">
    <InlinePanelHeader label="Roles" onClose={onClose} />
    <RoleBadgeSelector selected={roles} onChange={onSetRoles} />
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
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const [editing, setEditing] = useState<EditSection>(null);
  const fetchArtifactLinks = useFetchArtifactLinks();
  const controls = useDragControls();

  const { character, weapon, artifacts, roles } = slot;
  const elementColor = character ? getElementHexColor(character.element) : null;

  const constellation = slot.constellation ?? 0;
  const level = slot.level ?? 90;
  const weaponRefinement = slot.weaponRefinement ?? 1;
  const notes = slot.notes ?? '';
  const mainStats = slot.mainStats ?? { sands: '', goblet: '', circlet: '' };
  const substats = slot.substats ?? [];

  const toggleEditing = (section: EditSection) =>
    setEditing((prev) => (prev === section ? null : section));

  const openArtifacts = () => {
    fetchArtifactLinks();
    setEditing('artifacts');
  };

  const toggleMainStat = (
    key: 'sands' | 'goblet' | 'circlet',
    value: string
  ) => {
    onSetMainStats({
      ...mainStats,
      [key]: mainStats[key] === value ? '' : value,
    });
  };

  const toggleSubstat = (stat: string) => {
    onSetSubstats(
      substats.includes(stat)
        ? substats.filter((s) => s !== stat)
        : [...substats, stat]
    );
  };

  const hasMainStats = mainStats.sands || mainStats.goblet || mainStats.circlet;

  return (
    <Reorder.Item
      value={slot}
      dragListener={false}
      dragControls={controls}
      className="w-full"
    >
      {!character ? (
        /** ── Empty slot ─────────────────────────────────────── */
        <div
          className="relative h-20"
          onPointerDown={(e) => {
            e.stopPropagation();
            controls.start(e);
          }}
        >
          {/* Drag handle */}
          <div
            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md bg-border/20 hover:bg-border/40 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all"
            title="Drag to reorder"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground/50" />
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="
              group w-full h-full rounded-2xl border-2 border-dashed border-border/40
              bg-accent/10 hover:bg-accent/20 hover:border-primary/40
              transition-all duration-200 flex flex-row items-center justify-center gap-3
            "
          >
            <div className="w-10 h-10 rounded-xl bg-accent/40 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Slot {slotIndex + 1}
            </span>
          </button>
        </div>
      ) : (
        /** ── Filled slot — horizontal layout ────────────────── */
        <div
          className="relative rounded-2xl overflow-hidden border border-border/40 flex flex-row"
          style={{ borderColor: `${elementColor}40` }}
        >
          {/* ── LEFT: Portrait ──────────────────────────────────── */}
          <div
            className="relative w-28 shrink-0"
            style={{
              background: `linear-gradient(to bottom right, ${elementColor}30, #0a0d14)`,
            }}
          >
            <img
              src={character.iconUrl}
              alt={character.name}
              className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/50" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

            {/* Element icon */}
            <div className="absolute top-2 left-2 z-10">
              {character.elementUrl && (
                <CachedImage
                  src={character.elementUrl}
                  alt={character.element}
                  width={18}
                  height={18}
                  className="w-4.5 h-4.5 object-contain drop-shadow-lg"
                  skeletonShape="rounded"
                  skeletonSize="sm"
                />
              )}
            </div>

            {/* Constellation + Level badges at bottom of portrait */}
            <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
              <SlotPopover
                label={`C${constellation}`}
                title="Constellation"
                contentClassName="w-auto"
                triggerClassName="w-fit"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                    <PopoverPrimitive.Close key={c} asChild>
                      <button
                        onClick={() => onSetConstellation(c)}
                        className={optionButtonClass(constellation === c)}
                      >
                        C{c}
                      </button>
                    </PopoverPrimitive.Close>
                  ))}
                </div>
              </SlotPopover>
              <SlotPopover
                label={`Lv.${level}`}
                title="Level"
                contentClassName="w-48"
                triggerClassName="w-fit"
              >
                <div className="flex flex-wrap gap-1 mb-2">
                  {LEVEL_PRESETS.map((l) => (
                    <button
                      key={l}
                      onClick={() => onSetLevel(l)}
                      className={cn(
                        optionButtonClass(level === l),
                        'px-2 py-1 text-[10px] w-auto'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={level}
                  onChange={(e) =>
                    onSetLevel(
                      Math.min(90, Math.max(1, Number(e.target.value)))
                    )
                  }
                  className="w-full px-2 py-1 text-xs bg-accent/40 border border-border/40 rounded-md text-center focus:outline-none focus:border-primary/60"
                />
              </SlotPopover>
            </div>
          </div>

          {/* ── RIGHT: Content ──────────────────────────────────── */}
          <div className="flex-1 p-3 min-w-0 bg-background/95 space-y-1.5">
            {/* Row 1: Name + action buttons */}
            <div className="flex items-start justify-between gap-2">
              <p
                className="font-bold text-sm wrap-break-word min-w-0 flex-1 leading-tight"
                style={{ textShadow: `0 0 8px ${elementColor}80` }}
              >
                {character.name}
              </p>
              <div className="flex gap-1 shrink-0">
                <div
                  onPointerDown={(e) => controls.start(e)}
                  className="w-6 h-6 rounded-md bg-accent/40 hover:bg-accent/70 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="w-6 h-6 rounded-md bg-accent/40 hover:bg-accent/70 flex items-center justify-center transition-all"
                  title="Change character"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  onClick={onClearSlot}
                  className="w-6 h-6 rounded-md bg-accent/40 hover:bg-red-900/60 flex items-center justify-center transition-all"
                  title="Clear slot"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Row 2: Roles */}
            <RolesRow roles={roles} onClick={() => toggleEditing('roles')} />

            {/* Row 3: Weapon | Artifacts (two-column grid) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Weapon */}
              <div className="rounded-lg bg-accent/30 hover:bg-accent/50 border border-border/30 hover:border-border/60 transition-all min-w-0">
                {weapon ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 min-w-0">
                    <button
                      onClick={() => setWeaponPickerOpen(true)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <img
                        src={weapon.iconUrl}
                        alt={weapon.name}
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span className="text-xs font-medium wrap-break-word min-w-0">
                        {weapon.name}
                      </span>
                    </button>
                    <SlotPopover
                      label={`R${weaponRefinement}`}
                      title="Refinement"
                      side="top"
                      contentClassName="w-auto"
                      triggerClassName="shrink-0"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <PopoverPrimitive.Close key={r} asChild>
                            <button
                              onClick={() => onSetRefinement(r)}
                              className={optionButtonClass(
                                weaponRefinement === r
                              )}
                            >
                              R{r}
                            </button>
                          </PopoverPrimitive.Close>
                        ))}
                      </div>
                    </SlotPopover>
                  </div>
                ) : (
                  <button
                    onClick={() => setWeaponPickerOpen(true)}
                    className="flex w-full items-center px-2 py-1.5 text-left"
                  >
                    <span className="text-xs text-muted-foreground">
                      Add weapon...
                    </span>
                  </button>
                )}
              </div>

              {/* Artifacts */}
              <button
                onClick={() =>
                  editing === 'artifacts' ? setEditing(null) : openArtifacts()
                }
                className="flex items-start px-2 py-1.5 rounded-lg bg-accent/30 hover:bg-accent/50 border border-border/30 hover:border-border/60 transition-all text-left min-w-0"
              >
                {artifacts ? (
                  <ArtifactDisplay
                    config={artifacts}
                    className="min-w-0 flex-1"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Add artifacts...
                  </span>
                )}
              </button>
            </div>

            {/* Main stat chips (collapsed view) */}
            {artifacts && hasMainStats && editing !== 'artifacts' && (
              <div className="flex flex-wrap gap-1">
                {MAIN_STAT_CHIPS.map(({ prefix, key }) =>
                  mainStats[key] ? (
                    <span
                      key={key}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-accent/60 text-muted-foreground"
                    >
                      {prefix}: {mainStats[key]}
                    </span>
                  ) : null
                )}
              </div>
            )}

            {/* Substat chips (collapsed view) */}
            {artifacts && substats.length > 0 && editing !== 'artifacts' && (
              <div className="flex flex-wrap gap-1">
                {substats.map((s) => (
                  <span
                    key={s}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Notes row */}
            <button
              onClick={() => toggleEditing('notes')}
              className="w-full flex items-start px-2 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/40 transition-all text-left border border-dashed border-border/20 hover:border-border/40"
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

            {/* ── Inline edit panels ───────────────────────────── */}

            {/* Roles panel */}
            {editing === 'roles' && (
              <RolesPanel
                roles={roles}
                onSetRoles={onSetRoles}
                onClose={() => setEditing(null)}
              />
            )}

            {/* Notes panel */}
            {editing === 'notes' && (
              <div className="pt-1 border-t border-border/30">
                <InlinePanelHeader
                  label="Notes"
                  onClose={() => setEditing(null)}
                />
                <textarea
                  className="w-full px-2 py-1.5 text-xs bg-accent/40 border border-border/40 rounded-md resize-none focus:outline-none focus:border-primary/60"
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

            {/* Artifacts panel (set picker + main stats + substats) */}
            {editing === 'artifacts' && (
              <ArtifactsPanel
                artifacts={artifacts}
                mainStats={mainStats}
                substats={substats}
                onSetArtifacts={onSetArtifacts}
                onToggleMainStat={toggleMainStat}
                onToggleSubstat={toggleSubstat}
                onClose={() => setEditing(null)}
              />
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
      {character && (
        <WeaponPickerDialog
          open={weaponPickerOpen}
          onOpenChange={setWeaponPickerOpen}
          weaponTypeFilter={character.weaponType}
          currentWeapon={weapon}
          onSelect={onSetWeapon}
          weapons={weapons}
        />
      )}
    </Reorder.Item>
  );
};
