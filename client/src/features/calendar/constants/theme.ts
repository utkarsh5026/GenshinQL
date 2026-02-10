import type { CalendarTheme } from '../types';

export const TALENT_CALENDAR_THEME: CalendarTheme = {
  container: { bg: 'bg-surface-200', border: 'border-border' },
  header: {
    bg: 'bg-surface-100',
    border: 'border-border',
    text: 'text-muted-foreground',
  },
  row: { bg: 'bg-card', border: 'border-border', hover: 'hover:bg-accent' },
  dateCell: {
    text: 'text-foreground',
    subtext: 'text-muted-foreground',
    divider: 'border-border',
    cellBg: 'bg-surface-100',
  },
  mobileHeader: 'text-muted-foreground',
  middleDivider: 'border-border',
  sunday: {
    gradient: 'bg-linear-to-r from-celestial-800/20 to-celestial-800/10',
    borderLeft: 'md:border-l-[3px] border-l-celestial-500',
    hoverGradient: 'hover:from-celestial-800/30 hover:to-celestial-800/15',
    badgeBg: 'bg-celestial-500/20',
    badgeBorder: 'border-celestial-500/30',
    text: 'text-celestial-300',
  },
  today: {
    bg: 'bg-celestial-500/20',
    border: 'border-celestial-500/30',
    text: 'text-celestial-300',
  },
  highlight: {
    gradient: 'bg-linear-to-r from-celestial-800/20 to-celestial-800/10',
    borderLeft: 'md:border-l-[3px] border-l-celestial-500',
    hoverGradient: 'hover:from-celestial-800/30 hover:to-celestial-800/15',
  },
};

export const WEAPON_CALENDAR_THEME: CalendarTheme = {
  container: { bg: 'bg-white/6', border: 'border-white/8' },
  header: {
    bg: 'bg-white/2',
    border: 'border-white/10',
    text: 'text-white/50',
  },
  row: {
    bg: 'bg-black/20',
    border: 'border-white/4',
    hover: 'hover:bg-white/3',
  },
  dateCell: {
    text: 'text-white/95',
    subtext: 'text-white/40',
    divider: 'border-white/6',
    cellBg: 'bg-white/2',
  },
  mobileHeader: 'text-white/50',
  middleDivider: 'border-white/6',
  sunday: {
    gradient: 'bg-linear-to-r from-warning-500/8 to-warning-500/4',
    borderLeft: 'md:border-l-[3px] border-l-warning-500/60',
    hoverGradient: 'hover:from-warning-500/12 hover:to-warning-500/6',
    badgeBg: 'bg-warning-500/15',
    badgeBorder: 'border-warning-500/25',
    text: 'text-warning-500',
  },
  today: {
    bg: 'bg-success-500/15',
    border: 'border-success-500/25',
    text: 'text-success-500',
  },
  highlight: {
    gradient: 'bg-linear-to-r from-success-500/8 to-success-500/4',
    borderLeft: 'md:border-l-[3px] border-l-success-500/60',
    hoverGradient: 'hover:from-success-500/12 hover:to-success-500/6',
  },
};
