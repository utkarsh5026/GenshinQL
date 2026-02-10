import React, { ReactNode } from 'react';

import type {
  CalendarColumnHeaders,
  CalendarEntry,
  CalendarTheme,
  ScheduleEntry,
} from '../types';

interface SundayBadgeProps {
  message: string;
  theme: CalendarTheme;
}

const SundayBadge: React.FC<SundayBadgeProps> = ({ message, theme }) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-2.5 text-sm md:text-sm ${theme.sunday.text} font-medium`}
    >
      <span
        className={`inline-flex px-2.5 py-1 ${theme.sunday.badgeBg} rounded text-[0.6875rem] font-semibold tracking-wider uppercase font-mono border ${theme.sunday.badgeBorder}`}
      >
        All Available
      </span>
      <span className="text-xs md:text-sm">{message}</span>
    </div>
  );
};

interface CalendarGridProps<T extends ScheduleEntry> {
  entries: CalendarEntry<T>[];
  columns: CalendarColumnHeaders;
  renderMiddle: (data: T) => ReactNode;
  renderRight: (data: T) => ReactNode;
  sundayMiddleMessage: string;
  sundayRightMessage: string;
  showTodayBadge?: boolean;
  theme: CalendarTheme;
}

export const CalendarGrid = <T extends ScheduleEntry>({
  entries,
  columns,
  renderMiddle,
  renderRight,
  sundayMiddleMessage,
  sundayRightMessage,
  showTodayBadge = false,
  theme,
}: CalendarGridProps<T>) => {
  return (
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div
        className={`grid gap-px ${theme.container.bg} rounded-xl overflow-hidden border ${theme.container.border}`}
      >
        {/* Column headers - hidden on mobile */}
        <div
          className={`hidden md:grid md:grid-cols-[200px_1fr_2fr] ${theme.header.bg} border-b ${theme.header.border}`}
        >
          <div
            className={`px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.first}
          </div>
          <div
            className={`px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.middle}
          </div>
          <div
            className={`px-4 md:px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.right}
          </div>
        </div>

        {/* Calendar rows */}
        {entries.map((entry, index) => (
          <div
            key={entry.date}
            className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] ${theme.row.bg} transition-colors duration-150 border-b ${theme.row.border} last:border-b-0 ${theme.row.hover} ${
              entry.isSunday
                ? `${theme.sunday.gradient} ${theme.sunday.borderLeft} ${theme.sunday.hoverGradient}`
                : ''
            }`}
          >
            {/* Date cell */}
            <div
              className={`px-4 py-4 md:px-6 md:py-7 flex flex-col gap-1.5 md:gap-2 md:border-r ${theme.dateCell.divider} ${theme.dateCell.cellBg} md:bg-transparent`}
            >
              <div
                className={`text-sm md:text-[0.9375rem] font-medium ${theme.dateCell.text} font-mono`}
              >
                {entry.date}
              </div>
              <div
                className={`text-xs md:text-xs ${theme.dateCell.subtext} font-normal tracking-wide`}
              >
                {entry.currDay}
              </div>
              {showTodayBadge && index === 0 && (
                <span
                  className={`inline-flex w-fit px-2.5 py-1 ${theme.today.bg} rounded text-[0.6875rem] font-semibold tracking-wider uppercase ${theme.today.text} font-mono border ${theme.today.border}`}
                >
                  Today
                </span>
              )}
            </div>

            {/* Middle column */}
            <div
              className={`px-4 py-4 md:px-6 md:py-7 md:border-r ${theme.middleDivider}`}
            >
              <div
                className={`md:hidden text-xs font-bold tracking-wider uppercase ${theme.mobileHeader} mb-2 font-mono`}
              >
                {columns.middle}
              </div>
              {entry.isSunday ? (
                <SundayBadge message={sundayMiddleMessage} theme={theme} />
              ) : (
                entry.data && renderMiddle(entry.data)
              )}
            </div>

            {/* Right column */}
            <div className="px-4 py-4 md:px-6 md:py-7">
              <div
                className={`md:hidden text-xs font-bold tracking-wider uppercase ${theme.mobileHeader} mb-2 font-mono`}
              >
                {columns.right}
              </div>
              {entry.isSunday ? (
                <SundayBadge message={sundayRightMessage} theme={theme} />
              ) : (
                entry.data && renderRight(entry.data)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
