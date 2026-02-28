import type { LucideIcon } from 'lucide-react';
import {
  Crosshair,
  Flame,
  HeartPulse,
  Shield,
  Sparkles,
  Sword,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React from 'react';

import { GenshinChip } from '@/components/ui/genshin-chip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { ALL_ROLES, ROLE_COLORS } from '../../constants';
import type { CharacterRole } from '../../types';

const ROLE_ICONS: Record<CharacterRole, LucideIcon> = {
  Buffer: TrendingUp,
  DPS: Sword,
  Driver: Zap,
  Enabler: Flame,
  Healer: HeartPulse,
  Shielder: Shield,
  'Sub DPS': Crosshair,
  Support: Sparkles,
};

interface RoleSelectorProps {
  roles: CharacterRole[];
  onChange: (roles: CharacterRole[]) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  onChange,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="w-full text-left">
        {roles.length > 0 ? (
          <RoleBadges roles={roles} size="sm" />
        ) : (
          <span className="text-xs text-muted-foreground/60 px-0.5">
            Add roles...
          </span>
        )}
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="bottom"
      align="start"
      sideOffset={4}
      className="w-auto p-2"
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Roles
      </p>
      <RoleBadgeSelector selected={roles} onChange={onChange} />
    </PopoverContent>
  </Popover>
);

interface RoleBadgeSelectorProps {
  selected: CharacterRole[];
  onChange: (roles: CharacterRole[]) => void;
}

export const RoleBadgeSelector: React.FC<RoleBadgeSelectorProps> = ({
  selected,
  onChange,
}) => {
  const toggle = (role: CharacterRole) => {
    if (selected.includes(role)) {
      onChange(selected.filter((r) => r !== role));
    } else {
      onChange([...selected, role]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {ALL_ROLES.map((role) => {
        const isSelected = selected.includes(role);
        const color = ROLE_COLORS[role];
        const Icon = ROLE_ICONS[role];
        return (
          <GenshinChip
            key={role}
            variant={isSelected ? 'solid' : 'ghost'}
            selected={isSelected}
            onClick={() => toggle(role)}
            leftIcon={
              <Icon
                style={{ height: '11px', width: '11px' }}
                className="shrink-0"
              />
            }
            style={
              isSelected
                ? { color, borderColor: `${color}90`, background: `${color}22` }
                : { color: undefined }
            }
          >
            {role}
          </GenshinChip>
        );
      })}
    </div>
  );
};

interface RoleBadgesProps {
  roles: CharacterRole[];
  size?: 'sm' | 'md';
}

export const RoleBadges: React.FC<RoleBadgesProps> = ({
  roles,
  size = 'sm',
}) => {
  if (roles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        const color = ROLE_COLORS[role];
        const Icon = ROLE_ICONS[role];
        const iconPx = size === 'sm' ? 8 : 11;
        return (
          <GenshinChip
            key={role}
            variant="solid"
            selected
            leftIcon={
              <Icon
                style={{ height: `${iconPx}px`, width: `${iconPx}px` }}
                className="shrink-0"
              />
            }
            className={size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : ''}
            style={{
              color,
              borderColor: `${color}60`,
              background: `${color}20`,
            }}
          >
            {role}
          </GenshinChip>
        );
      })}
    </div>
  );
};
