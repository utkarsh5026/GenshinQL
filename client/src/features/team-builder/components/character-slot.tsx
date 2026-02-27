import { Pencil, Plus, ShieldQuestion, Sword, X } from 'lucide-react';
import React, { useState } from 'react';

import { CachedImage } from '@/features/cache';
import { useFetchArtifactLinks } from '@/features/characters/stores';
import type { WeaponSummary } from '@/features/weapons';
import { getElementHexColor, getRarityEntry } from '@/lib/game-colors';
import type { Character } from '@/types';

import type {
  ArtifactConfig,
  CharacterRole,
  TeamCharacterSlot,
} from '../types';
import { ArtifactDisplay, ArtifactPickerPanel } from './artifact-picker';
import { CharacterPickerDialog } from './character-picker';
import { RoleBadges, RoleBadgeSelector } from './role-selector';
import { WeaponPickerDialog } from './weapon-picker';

interface CharacterSlotCardProps {
  slot: TeamCharacterSlot;
  slotIndex: number;
  teamId: string;
  allSlots: TeamCharacterSlot[];
  weapons: WeaponSummary[];
  onSetCharacter: (c: Character | null) => void;
  onSetWeapon: (w: WeaponSummary | null) => void;
  onSetArtifacts: (a: ArtifactConfig | null) => void;
  onSetRoles: (roles: CharacterRole[]) => void;
  onClearSlot: () => void;
}

type EditSection = 'weapon' | 'artifacts' | 'roles' | null;

export const CharacterSlotCard: React.FC<CharacterSlotCardProps> = ({
  slot,
  slotIndex,
  allSlots,
  weapons,
  onSetCharacter,
  onSetWeapon,
  onSetArtifacts,
  onSetRoles,
  onClearSlot,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const [editing, setEditing] = useState<EditSection>(null);
  const fetchArtifactLinks = useFetchArtifactLinks();

  const { character, weapon, artifacts, roles } = slot;
  const elementColor = character ? getElementHexColor(character.element) : null;

  const openArtifacts = () => {
    fetchArtifactLinks();
    setEditing('artifacts');
  };

  // Empty slot
  if (!character) {
    return (
      <>
        <button
          onClick={() => setPickerOpen(true)}
          className="
            group relative rounded-2xl border-2 border-dashed border-border/40
            bg-accent/10 hover:bg-accent/20 hover:border-primary/40
            transition-all duration-200 flex flex-col items-center justify-center gap-2
            aspect-3/4 min-h-50
          "
        >
          <div className="w-12 h-12 rounded-xl bg-accent/40 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Slot {slotIndex + 1}
          </span>
        </button>
        <CharacterPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          selectedCharacters={allSlots.map((s) => s.character)}
          onSelect={onSetCharacter}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden border border-border/40 flex flex-col"
        style={{ borderColor: `${elementColor}40` }}
      >
        {/* --- Character art header --- */}
        <div
          className={`relative bg-linear-to-b ${getRarityEntry(character.rarity).gradientFrom} flex items-end p-3 min-h-40`}
          style={{
            background: `linear-gradient(to bottom, ${elementColor}20, #0a0d14 80%)`,
          }}
        >
          <img
            src={character.iconUrl}
            alt={character.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top actions */}
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              onClick={() => setPickerOpen(true)}
              className="w-6 h-6 rounded-md bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all"
              title="Change character"
            >
              <Pencil className="w-3 h-3 text-white/80" />
            </button>
            <button
              onClick={onClearSlot}
              className="w-6 h-6 rounded-md bg-black/60 hover:bg-red-900/80 flex items-center justify-center transition-all"
              title="Clear slot"
            >
              <X className="w-3 h-3 text-white/80" />
            </button>
          </div>

          {/* Element badge */}
          <div className="absolute top-2 left-2 z-10">
            {character.elementUrl && (
              <CachedImage
                src={character.elementUrl}
                alt={character.element}
                width={20}
                height={20}
                className="w-5 h-5 object-contain drop-shadow-lg"
                skeletonShape="rounded"
                skeletonSize="sm"
              />
            )}
          </div>

          {/* Character name row */}
          <div className="relative z-10 w-full">
            <p
              className="font-bold text-sm text-white leading-tight"
              style={{ textShadow: `0 0 8px ${elementColor}80` }}
            >
              {character.name}
            </p>
            <RoleBadges roles={roles} size="sm" />
          </div>
        </div>

        <div className="flex-1 p-3 space-y-2 bg-background/95">
          <button
            onClick={() =>
              editing === 'weapon'
                ? setEditing(null)
                : setWeaponPickerOpen(true)
            }
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-accent/30 hover:bg-accent/50 border border-border/30 hover:border-border/60 transition-all text-left"
          >
            <Sword className="w-4 h-4 text-muted-foreground shrink-0" />
            {weapon ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <img
                  src={weapon.iconUrl}
                  alt={weapon.name}
                  className="w-8 h-8 object-contain shrink-0"
                />
                <span className="text-sm font-medium truncate">
                  {weapon.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Add weapon...
              </span>
            )}
          </button>

          {/* Artifacts row */}
          <button
            onClick={() =>
              editing === 'artifacts' ? setEditing(null) : openArtifacts()
            }
            className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg bg-accent/30 hover:bg-accent/50 border border-border/30 hover:border-border/60 transition-all text-left"
          >
            <ShieldQuestion className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            {artifacts ? (
              <ArtifactDisplay config={artifacts} className="flex-1 min-w-0" />
            ) : (
              <span className="text-sm text-muted-foreground">
                Add artifacts...
              </span>
            )}
          </button>

          {/* Roles row */}
          <button
            onClick={() =>
              editing === 'roles' ? setEditing(null) : setEditing('roles')
            }
            className="w-full text-left"
          >
            {roles.length > 0 ? (
              <RoleBadges roles={roles} size="sm" />
            ) : (
              <span className="text-xs text-muted-foreground px-2">
                Add roles...
              </span>
            )}
          </button>

          {/* ── Inline edit panels ── */}
          {editing === 'roles' && (
            <div className="pt-1 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Roles
                </span>
                <button
                  onClick={() => setEditing(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <RoleBadgeSelector selected={roles} onChange={onSetRoles} />
            </div>
          )}

          {editing === 'artifacts' && (
            <div className="pt-1 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Artifacts
                </span>
                <button
                  onClick={() => setEditing(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <ArtifactPickerPanel
                current={artifacts}
                onChange={(a) => {
                  onSetArtifacts(a);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pickers */}
      <CharacterPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedCharacters={allSlots.map((s) => s.character)}
        onSelect={onSetCharacter}
      />
      <WeaponPickerDialog
        open={weaponPickerOpen}
        onOpenChange={setWeaponPickerOpen}
        weaponTypeFilter={character.weaponType}
        currentWeapon={weapon}
        onSelect={onSetWeapon}
        weapons={weapons}
      />
    </>
  );
};
