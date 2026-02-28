import { Reorder } from 'framer-motion';
import {
  Copy,
  Eye,
  MoreHorizontal,
  Plus,
  Sword,
  Trash2,
  Users2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { GenshinButton } from '@/components/ui/genshin-button';
import { GenshinChip } from '@/components/ui/genshin-chip';
import { Separator } from '@/components/ui/separator';
import { CharacterAvatar } from '@/features/characters';
import { useCharactersStore } from '@/features/characters/stores';
import { useWeapons, useWeaponsStore } from '@/features/weapons';
import type { Character } from '@/types';

import {
  useActiveTeam,
  useActiveTeamId,
  useTeamBuilderStore,
  useTeams,
} from '../stores';
import type { Team, TeamCharacterSlot } from '../types';
import { CharacterSlotCard } from './character-slot/character-slot';
import { TeamPreviewDialog } from './preview/preview-dialog';
import { QuickCreateDialog } from './quick-create-dialog';
import { RotationEditor } from './rotation-editor';

const TeamNameInput: React.FC<{
  name: string;
  onSave: (name: string) => void;
}> = ({ name, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    else setDraft(name);
    setEditing(false);
  };

  return editing ? (
    <input
      autoFocus
      className="text-2xl font-bold bg-transparent border-b border-primary/60 outline-none w-full max-w-sm pb-0.5"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setDraft(name);
          setEditing(false);
        }
      }}
      maxLength={40}
    />
  ) : (
    <button
      className="text-2xl font-bold hover:text-primary transition-colors cursor-text text-left flex items-center gap-2 group"
      onClick={() => {
        setDraft(name);
        setEditing(true);
      }}
      title="Click to rename"
    >
      {name}
      <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground font-normal">
        ✎
      </span>
    </button>
  );
};

const TeamCard: React.FC<{
  team: Team;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ team, isActive, onSelect, onDelete, onDuplicate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const chars = team.slots
    .map((s) => s.character)
    .filter(Boolean) as Character[];

  return (
    <div
      className={`
        group relative rounded-xl border p-3 cursor-pointer transition-all duration-200
        ${isActive ? 'border-primary/50' : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : ''}`}
          >
            {team.name}
          </p>
          <div className="flex gap-1 mt-1.5">
            {team.slots.map((slot, i) =>
              slot.character ? (
                <CharacterAvatar
                  key={i}
                  characterName={slot.character.name}
                  size="xs"
                  showName={false}
                  interactive={false}
                />
              ) : (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border border-dashed border-border/40 bg-accent/30"
                />
              )
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {chars.length}/4 characters
          </p>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-50 bg-popover border border-border/60 rounded-lg shadow-xl py-1 min-w-32.5"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent/60 transition-colors text-left"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-red-900/30 text-red-400 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyTeamsState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24 text-center">
    <div className="w-20 h-20 rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-center">
      <Users2 className="w-10 h-10 text-muted-foreground/40" />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">No Teams Yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Create your first team composition to get started.
      </p>
    </div>
    <GenshinButton onClick={onCreate} leftIcon={<Plus className="w-4 h-4" />}>
      Quick Create Team
    </GenshinButton>
  </div>
);

export const TeamBuilderPage: React.FC = () => {
  const teams = useTeams();
  const activeTeam = useActiveTeam();
  const activeTeamId = useActiveTeamId();
  const weapons = useWeapons();

  const {
    createTeam,
    deleteTeam,
    duplicateTeam,
    setActiveTeam,
    updateTeamName,
    setCharacterSlot,
    setWeaponSlot,
    setRefinementSlot,
    setArtifactSlot,
    setRolesSlot,
    setConstellationSlot,
    setLevelSlot,
    setNotesSlot,
    setMainStatsSlot,
    setSubstatsSlot,
    reorderSlots,
    clearSlot,
    setRotation,
  } = useTeamBuilderStore();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const handleQuickCreate = (chars: (import('@/types').Character | null)[]) => {
    // Create the blank team first
    createTeam();
    // After createTeam, the new team becomes active — use a microtask to let state settle
    setTimeout(() => {
      const { activeTeamId, setCharacterSlot, setRolesSlot } =
        useTeamBuilderStore.getState();
      const newTeamId = activeTeamId;
      if (!newTeamId) return;
      const roleMap: Array<import('../types').CharacterRole> = [
        'DPS',
        'Sub DPS',
        'Support',
        'Support',
      ];
      chars.forEach((char, idx) => {
        if (char) {
          setCharacterSlot(newTeamId, idx, char);
          setRolesSlot(newTeamId, idx, [roleMap[idx]]);
        }
      });
    }, 0);
  };
  const { fetchCharacters } = useCharactersStore();
  const { fetchWeapons } = useWeaponsStore();

  useEffect(() => {
    fetchCharacters?.();
    fetchWeapons?.();
  }, [fetchCharacters, fetchWeapons]);

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* ── Left sidebar: team list ── */}
      <div className="hidden md:flex flex-col w-72 shrink-0 border-r border-border/40 bg-background/95 h-screen sticky top-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-sm">My Teams</span>
            <span className="text-xs text-muted-foreground/60 bg-accent/40 px-1.5 py-0.5 rounded-full">
              {teams.length}
            </span>
          </div>
          <GenshinButton
            onClick={() => setQuickCreateOpen(true)}
            size="icon"
            variant="outline"
            title="Create new team"
          >
            <Plus className="w-4 h-4" />
          </GenshinButton>
        </div>

        {/* Team list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {teams.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground/60">
                No teams yet. Create one!
              </p>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isActive={team.id === activeTeamId}
                onSelect={() => setActiveTeam(team.id)}
                onDelete={() => deleteTeam(team.id)}
                onDuplicate={() => duplicateTeam(team.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main editor area ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {!activeTeam ? (
          <EmptyTeamsState onCreate={() => setQuickCreateOpen(true)} />
        ) : (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
            {/* Page header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  ◆ Team Builder
                </p>
                <TeamNameInput
                  name={activeTeam.name}
                  onSave={(name) => updateTeamName(activeTeam.id, name)}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile: create team */}
                <GenshinButton
                  onClick={() => setQuickCreateOpen(true)}
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="md:hidden"
                >
                  New
                </GenshinButton>
                <GenshinButton
                  onClick={() => setPreviewOpen(true)}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Preview Team</span>
                  <span className="sm:hidden">Preview</span>
                </GenshinButton>
              </div>
            </div>

            <Separator />

            {/* Mobile team selector */}
            <div className="md:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {teams.map((t) => (
                  <GenshinChip
                    key={t.id}
                    onClick={() => setActiveTeam(t.id)}
                    variant={t.id === activeTeamId ? 'solid' : 'outline'}
                    selected={t.id === activeTeamId}
                    className="shrink-0 rounded-full px-3 py-1 text-sm"
                  >
                    {t.name}
                  </GenshinChip>
                ))}
                <GenshinChip
                  onClick={() => setQuickCreateOpen(true)}
                  variant="ghost"
                  leftIcon={<Plus className="w-3 h-3" />}
                  className="shrink-0 rounded-full px-3 py-1 text-sm border border-dashed border-border/40"
                >
                  New
                </GenshinChip>
              </div>
            </div>

            {/* Character slots grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sword className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Characters</span>
                <span className="hidden sm:inline text-xs text-muted-foreground/60">
                  Drag ≡ to reorder · click a slot to assign
                </span>
              </div>
              <Reorder.Group
                axis="y"
                values={[...activeTeam.slots]}
                onReorder={(newOrder) =>
                  reorderSlots(activeTeam.id, newOrder as Team['slots'])
                }
                className="flex flex-col gap-3"
              >
                {activeTeam.slots.map((slot, slotIndex) => (
                  <CharacterSlotCard
                    key={slot.id ?? slotIndex}
                    slot={slot}
                    slotIndex={slotIndex}
                    teamId={activeTeam.id}
                    allSlots={activeTeam.slots}
                    weapons={weapons}
                    onSetCharacter={(c) =>
                      setCharacterSlot(activeTeam.id, slotIndex, c)
                    }
                    onSetWeapon={(w) =>
                      setWeaponSlot(activeTeam.id, slotIndex, w)
                    }
                    onSetRefinement={(r) =>
                      setRefinementSlot(activeTeam.id, slotIndex, r)
                    }
                    onSetArtifacts={(a) =>
                      setArtifactSlot(activeTeam.id, slotIndex, a)
                    }
                    onSetRoles={(roles) =>
                      setRolesSlot(activeTeam.id, slotIndex, roles)
                    }
                    onSetConstellation={(c) =>
                      setConstellationSlot(activeTeam.id, slotIndex, c)
                    }
                    onSetLevel={(l) =>
                      setLevelSlot(activeTeam.id, slotIndex, l)
                    }
                    onSetNotes={(n) =>
                      setNotesSlot(activeTeam.id, slotIndex, n)
                    }
                    onSetMainStats={(ms: TeamCharacterSlot['mainStats']) =>
                      setMainStatsSlot(activeTeam.id, slotIndex, ms)
                    }
                    onSetSubstats={(ss) =>
                      setSubstatsSlot(activeTeam.id, slotIndex, ss)
                    }
                    onClearSlot={() => clearSlot(activeTeam.id, slotIndex)}
                  />
                ))}
              </Reorder.Group>
            </div>

            <Separator />

            {/* Rotation */}
            <RotationEditor
              value={activeTeam.rotation}
              onChange={(r) => setRotation(activeTeam.id, r)}
              slots={activeTeam.slots}
            />
          </div>
        )}
      </div>

      {/* Preview dialog */}
      {activeTeam && (
        <TeamPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          team={activeTeam}
        />
      )}

      {/* Quick-create dialog */}
      <QuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onConfirm={(chars) => {
          setQuickCreateOpen(false);
          handleQuickCreate(chars);
        }}
        onCreateBlank={createTeam}
      />
    </div>
  );
};
