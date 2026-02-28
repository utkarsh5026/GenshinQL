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
    <div className="flex flex-col flex-wrap gap-1.5">
      {ALL_ROLES.map((role) => {
        const isSelected = selected.includes(role);
        const color = ROLE_COLORS[role];
        const Icon = ROLE_ICONS[role];
        return (
          <button
            key={role}
            onClick={() => toggle(role)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95"
            style={
              isSelected
                ? {
                    color,
                    borderColor: `${color}90`,
                    background: `${color}22`,
                    boxShadow: `0 0 10px ${color}40, 0 0 20px ${color}20, inset 0 0 8px ${color}10`,
                  }
                : {
                    color: 'var(--muted-foreground)',
                    borderColor: 'var(--border)',
                    background: 'transparent',
                  }
            }
          >
            <Icon
              className="shrink-0"
              style={{ height: '11px', width: '11px' }}
            />
            {role}
          </button>
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
  const px = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2.5 py-1';
  const text = size === 'sm' ? 'text-[9px]' : 'text-xs';
  const iconPx = size === 'sm' ? 8 : 11;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        const color = ROLE_COLORS[role];
        const Icon = ROLE_ICONS[role];
        return (
          <span
            key={role}
            className={`inline-flex items-center gap-1 ${px} ${text} font-semibold rounded-full border`}
            style={{
              color,
              borderColor: `${color}60`,
              background: `${color}20`,
            }}
          >
            <Icon
              className="shrink-0"
              style={{ height: `${iconPx}px`, width: `${iconPx}px` }}
            />
            {role}
          </span>
        );
      })}
    </div>
  );
};
