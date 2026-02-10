/* Export all types from calendar feature */
import type { ReactNode } from 'react';

export type ScheduleEntry = {
  day: string;
};

export type CalendarEntry<T extends ScheduleEntry> = {
  date: string;
  isSunday: boolean;
  currDay: string;
  data: T | null;
};

export type CalendarColumnHeaders = {
  first: string;
  middle: string;
  right: string;
};

export type CalendarTheme = {
  container: { bg: string; border: string };
  header: { bg: string; border: string; text: string };
  row: { bg: string; border: string; hover: string };
  dateCell: {
    text: string;
    subtext: string;
    divider: string;
    cellBg: string;
  };
  mobileHeader: string;
  middleDivider: string;
  sunday: {
    gradient: string;
    borderLeft: string;
    hoverGradient: string;
    badgeBg: string;
    badgeBorder: string;
    text: string;
  };
  today: {
    bg: string;
    border: string;
    text: string;
  };
  highlight: {
    gradient: string;
    borderLeft: string;
    hoverGradient: string;
  };
};

export type CalendarGridProps<T extends ScheduleEntry> = {
  entries: CalendarEntry<T>[];
  columns: CalendarColumnHeaders;
  renderMiddle: (data: T) => ReactNode;
  renderRight: (data: T) => ReactNode;
  sundayMiddleMessage: string;
  sundayRightMessage: string;
  showTodayBadge?: boolean;
  theme: CalendarTheme;
};

export type ScheduleTableProps<T extends ScheduleEntry> = {
  days: T[];
  columns: CalendarColumnHeaders;
  renderDay: (entry: T) => string;
  renderMiddle: (entry: T) => ReactNode;
  renderRight: (entry: T) => ReactNode;
  sortTodayFirst?: boolean;
  theme: CalendarTheme;
};
