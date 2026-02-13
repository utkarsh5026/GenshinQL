import { useMemo } from 'react';

import { DAYS } from '../../constants';
import type { ScheduleEntry, ScheduleTableProps } from '../../types';

const getTodayDayOfWeek = (): string => {
  const date = new Date();
  return DAYS[date.getDay()];
};

export function ScheduleTable<T extends ScheduleEntry>({
  days,
  columns,
  renderDay,
  renderMiddle,
  renderRight,
  sortTodayFirst = false,
  theme,
}: ScheduleTableProps<T>) {
  const todayDayOfWeek = getTodayDayOfWeek();

  const sortedDays = useMemo(() => {
    if (!sortTodayFirst) return days;
    return [...days].sort((a, b) => {
      const aIsToday =
        a.dayOne === todayDayOfWeek || a.dayTwo === todayDayOfWeek;
      const bIsToday =
        b.dayOne === todayDayOfWeek || b.dayTwo === todayDayOfWeek;
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      return 0;
    });
  }, [days, sortTodayFirst, todayDayOfWeek]);

  return (
    <div className="font-sans max-w-350 mx-auto p-4 md:p-8">
      <div
        className={`grid gap-px ${theme.container.bg} rounded-xl overflow-hidden border ${theme.container.border}`}
      >
        {/* Column headers */}
        <div
          className={`hidden md:grid md:grid-cols-[200px_1fr_2fr] ${theme.header.bg} border-b ${theme.header.border}`}
        >
          <div
            className={`px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.first}
          </div>
          <div
            className={`px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.middle}
          </div>
          <div
            className={`px-6 py-5 text-[0.6875rem] font-bold tracking-widest uppercase ${theme.header.text} font-mono`}
          >
            {columns.right}
          </div>
        </div>

        {/* Table rows */}
        {sortedDays.map((entry) => {
          const isToday =
            entry.dayOne === todayDayOfWeek || entry.dayTwo === todayDayOfWeek;

          return (
            <div
              key={`${entry.dayOne}-${entry.dayTwo}`}
              className={`flex flex-col md:grid md:grid-cols-[200px_1fr_2fr] ${theme.row.bg} transition-colors duration-150 border-b ${theme.row.border} last:border-b-0 ${theme.row.hover} ${
                isToday
                  ? `${theme.highlight.gradient} ${theme.highlight.borderLeft} ${theme.highlight.hoverGradient}`
                  : ''
              }`}
            >
              {/* Day name cell */}
              <div
                className={`px-4 py-4 md:px-6 md:py-7 flex flex-col gap-2 md:border-r ${theme.dateCell.divider} ${theme.dateCell.cellBg} md:bg-transparent`}
              >
                <div
                  className={`text-sm md:text-[0.9375rem] font-medium ${theme.dateCell.text}`}
                >
                  {renderDay(entry)}
                </div>
                {isToday && (
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
                {renderMiddle(entry)}
              </div>

              {/* Right column */}
              <div className="px-4 py-4 md:px-6 md:py-7">
                <div
                  className={`md:hidden text-xs font-bold tracking-wider uppercase ${theme.mobileHeader} mb-2 font-mono`}
                >
                  {columns.right}
                </div>
                {renderRight(entry)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScheduleTable;
