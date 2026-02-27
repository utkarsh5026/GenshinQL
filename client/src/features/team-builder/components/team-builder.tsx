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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GenshinButton } from '@/components/ui/genshin-button';
import { Separator } from '@/components/ui/separator';
import { useCharactersStore } from '@/features/characters/stores';
import { useWeapons, useWeaponsStore } from '@/features/weapons';
import type { Character } from '@/types';

import {
  useActiveTeam,
  useActiveTeamId,
  useTeamBuilderStore,
  useTeams,
} from '../stores';
import type { Team } from '../types';
import { CharacterSlotCard } from './character-slot';
import { RotationEditor } from './rotation-editor';
import { TeamPreviewDialog } from './TeamPreviewDialog';

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
        ${isActive ? 'border-primary/50 bg-primary/8' : 'border-border/30 bg-accent/20 hover:border-border/60 hover:bg-accent/40'}
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
                <Avatar key={i} className="w-7 h-7 ring-1 ring-border/40">
                  <AvatarImage
                    src={slot.character.iconUrl}
                    alt={slot.character.name}
                  />
                  <AvatarFallback className="text-[9px]">
                    {slot.character.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
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
      Create Team
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
    setArtifactSlot,
    setRolesSlot,
    clearSlot,
    setRotation,
  } = useTeamBuilderStore();

  const [previewOpen, setPreviewOpen] = useState(false);
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
            onClick={createTeam}
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
          <EmptyTeamsState onCreate={createTeam} />
        ) : (
          <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
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
                  onClick={createTeam}
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
                  Preview Team
                </GenshinButton>
              </div>
            </div>

            <Separator />

            {/* Mobile team selector */}
            <div className="md:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTeam(t.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      t.id === activeTeamId
                        ? 'border-primary/60 bg-primary/20 text-primary'
                        : 'border-border/40 bg-accent/20 text-muted-foreground'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
                <button
                  onClick={createTeam}
                  className="shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border border-dashed border-border/40 text-muted-foreground hover:text-foreground"
                >
                  + New
                </button>
              </div>
            </div>

            {/* Character slots grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sword className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Characters</span>
                <span className="text-xs text-muted-foreground/60">
                  Click a slot to assign a character
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activeTeam.slots.map((slot, slotIndex) => (
                  <CharacterSlotCard
                    key={slotIndex}
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
                    onSetArtifacts={(a) =>
                      setArtifactSlot(activeTeam.id, slotIndex, a)
                    }
                    onSetRoles={(roles) =>
                      setRolesSlot(activeTeam.id, slotIndex, roles)
                    }
                    onClearSlot={() => clearSlot(activeTeam.id, slotIndex)}
                  />
                ))}
              </div>
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
    </div>
  );
};
