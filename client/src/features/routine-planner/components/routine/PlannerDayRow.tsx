import { CheckCircle2, Coins, Package, Sparkles, Swords } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import type { PlannerDailyRoutine } from '../../types/routine';
import { TalentGroup, WeaponGroup } from './PlannerMaterialGroup';

/**
 * Component displayed on days when there are no talent or weapon materials to farm.
 * Provides helpful suggestions for alternative farming activities.
 */
const EmptyDaySuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: Coins,
      title: 'Mora',
      color: 'text-amber-400/70',
      hoverColor: 'group-hover:text-amber-400',
    },
    {
      icon: Sparkles,
      title: 'Character EXP',
      color: 'text-purple-400/70',
      hoverColor: 'group-hover:text-purple-400',
    },
    {
      icon: Swords,
      title: 'Weekly Bosses',
      color: 'text-red-400/70',
      hoverColor: 'group-hover:text-red-400',
    },
    {
      icon: Package,
      title: 'Artifacts',
      color: 'text-blue-400/70',
      hoverColor: 'group-hover:text-blue-400',
    },
    {
      icon: CheckCircle2,
      title: 'Commissions',
      color: 'text-green-400/70',
      hoverColor: 'group-hover:text-green-400',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted-foreground/60">No farming •</span>
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;
        return (
          <div
            key={suggestion.title}
            className="group flex items-center gap-1.5 transition-all"
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                suggestion.color,
                suggestion.hoverColor,
                'transition-colors'
              )}
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {suggestion.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface PlannerDayRowProps {
  routine: PlannerDailyRoutine;
}

/**
 * Displays a single day row with materials to farm
 * - Day column: Day name + "Today" badge
 * - Materials column: Talent groups + Weapon groups
 */
const PlannerDayRow: React.FC<PlannerDayRowProps> = ({ routine }) => {
  const { day, isToday, talentGroups, weaponGroups, hasFarming } = routine;

  return (
    <div
      className={cn(
        'grid grid-cols-[150px_1fr] border-b border-border last:border-b-0 transition-colors',
        isToday
          ? 'bg-celestial-500/10 hover:bg-celestial-500/15'
          : 'hover:bg-midnight-700/30'
      )}
    >
      {/* Day Cell */}
      <div className="px-4 py-4 flex flex-col gap-2">
        <span className="font-medium text-foreground">{day}</span>
        {isToday && (
          <span className="text-xs bg-celestial-500/20 text-celestial-300 px-2 py-1 rounded w-fit border border-celestial-500/30">
            Today
          </span>
        )}
      </div>

      {/* Materials Cell */}
      <div className="px-4 py-4">
        {hasFarming ? (
          <div className="space-y-3">
            {/* Talent Material Groups */}
            {talentGroups.length > 0 && (
              <div className="space-y-2">
                {talentGroups.map((group, idx) => (
                  <TalentGroup
                    key={`${group.book.bookName}-${idx}`}
                    group={group}
                  />
                ))}
              </div>
            )}

            {/* Weapon Material Groups */}
            {weaponGroups.length > 0 && (
              <div className="space-y-2">
                {weaponGroups.map((group, idx) => (
                  <WeaponGroup
                    key={`${group.materialName}-${idx}`}
                    group={group}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyDaySuggestions />
        )}
      </div>
    </div>
  );
};

export default React.memo(PlannerDayRow);
