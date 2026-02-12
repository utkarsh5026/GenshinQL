import { Calendar, Filter, Users } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DAYS_OF_WEEK } from '@/constants';
import { cn } from '@/lib/utils';
import type { Day, TrackedTeam, TrackingReason } from '@/types';

import type { RoutineFilters } from '../../types/routine';

const REASON_COLORS: Record<TrackingReason, string> = {
  building:
    'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
  farming:
    'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30',
  wishlist:
    'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30',
};

const REASON_LABELS: Record<TrackingReason, string> = {
  building: 'Building',
  farming: 'Farming',
  wishlist: 'Wishlist',
};

interface PlannerRoutineToolbarProps {
  filters: RoutineFilters;
  onFiltersChange: (filters: RoutineFilters) => void;
  teams: TrackedTeam[];
}

/**
 * Toolbar with filters and controls for the routine table
 * - Day filter dropdown
 * - Tracking reason chips (multi-select)
 * - Team filter dropdown
 * - Sort options
 */
const PlannerRoutineToolbar: React.FC<PlannerRoutineToolbarProps> = ({
  filters,
  onFiltersChange,
  teams,
}) => {
  const handleDayChange = (value: string) => {
    onFiltersChange({
      ...filters,
      selectedDay: value as Day | 'all' | 'today',
    });
  };

  const handleReasonToggle = (reason: TrackingReason) => {
    const newReasons = new Set(filters.selectedReasons);
    if (newReasons.has(reason)) {
      newReasons.delete(reason);
    } else {
      newReasons.add(reason);
    }
    onFiltersChange({
      ...filters,
      selectedReasons: newReasons,
    });
  };

  const handleTeamChange = (value: string) => {
    onFiltersChange({
      ...filters,
      selectedTeam: value,
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as 'priority' | 'alphabetical',
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      selectedDay: 'all',
      selectedReasons: new Set(),
      selectedTeam: 'all',
      sortBy: 'priority',
    });
  };

  const hasActiveFilters =
    filters.selectedDay !== 'all' ||
    filters.selectedReasons.size > 0 ||
    filters.selectedTeam !== 'all' ||
    filters.sortBy !== 'priority';

  return (
    <div className="flex flex-col gap-3 p-4 bg-card/30 border border-border/50 rounded-lg">
      {/* Main Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Day Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={filters.selectedDay} onValueChange={handleDayChange}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team Filter */}
        {teams.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Select
              value={filters.selectedTeam}
              onValueChange={handleTeamChange}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority (Date Added)</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs ml-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tracking Reason Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter by:</span>
        {(['building', 'farming', 'wishlist'] as TrackingReason[]).map(
          (reason) => {
            const isSelected = filters.selectedReasons.has(reason);
            return (
              <button
                key={reason}
                onClick={() => handleReasonToggle(reason)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  isSelected
                    ? REASON_COLORS[reason]
                    : 'bg-transparent text-muted-foreground border-border hover:bg-accent'
                )}
              >
                {REASON_LABELS[reason]}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};

export default React.memo(PlannerRoutineToolbar);
