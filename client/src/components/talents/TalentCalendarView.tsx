import React, { useMemo } from "react";
import type { TalentBookCalendar } from "@/types";
import TalentBooks from "@/components/talents/TalentBooks.tsx";
import CharacterGrid from "@/components/character/utils/CharacterGrid.tsx";

function getNextNDaysFromToday(n: number) {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < n; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    dates.push(nextDay);
  }
  return dates;
}

interface TalentCalendarViewProps {
  nDays: number;
  talent: TalentBookCalendar;
}

const TalentCalendarView: React.FC<TalentCalendarViewProps> = ({
  nDays,
  talent,
}) => {
  const dates = getNextNDaysFromToday(nDays);
  const data = useMemo(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dates.map((date) => {
      const currDay = days[date.getDay()];
      const filteredDay = talent.days.find((day) => day.day.includes(currDay));

      if (filteredDay === undefined)
        return {
          date: date.toDateString(),
          isSunday: true,
          currDay,
          books: [],
          characters: [],
        };

      return {
        date: date.toDateString(),
        isSunday: false,
        currDay,
        books: filteredDay.books,
        characters: filteredDay.characters,
      };
    });
  }, [dates, talent.days]);

  return (
    <div className="calendar-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .calendar-container {
          font-family: 'DM Sans', sans-serif;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .calendar-grid {
          display: grid;
          gap: 1px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .calendar-header {
          display: grid;
          grid-template-columns: 200px 1fr 2fr;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-cell {
          padding: 1.25rem 1.5rem;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          font-family: 'JetBrains Mono', monospace;
        }

        .calendar-row {
          display: grid;
          grid-template-columns: 200px 1fr 2fr;
          background: rgba(0, 0, 0, 0.2);
          transition: background 0.15s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .calendar-row:last-child {
          border-bottom: none;
        }

        .calendar-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .calendar-row.special-day {
          background: linear-gradient(90deg, rgba(168, 162, 158, 0.08) 0%, rgba(168, 162, 158, 0.04) 100%);
          border-left: 3px solid rgba(212, 175, 55, 0.6);
        }

        .calendar-row.special-day:hover {
          background: linear-gradient(90deg, rgba(168, 162, 158, 0.12) 0%, rgba(168, 162, 158, 0.06) 100%);
        }

        .date-cell {
          padding: 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .date-main {
          font-size: 0.9375rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          font-family: 'JetBrains Mono', monospace;
        }

        .date-day {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .books-cell {
          padding: 1.75rem 1.5rem;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .characters-cell {
          padding: 1.75rem 1.5rem;
        }

        .special-message {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 0.875rem;
          color: rgba(212, 175, 55, 0.9);
          font-weight: 500;
        }

        .special-badge {
          display: inline-flex;
          padding: 0.25rem 0.625rem;
          background: rgba(212, 175, 55, 0.15);
          border-radius: 4px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid rgba(212, 175, 55, 0.25);
        }
      `}</style>

      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="header-cell">Date</div>
          <div className="header-cell">Talent Books</div>
          <div className="header-cell">Characters</div>
        </div>

        {data.map((d) => (
          <div
            key={d.date}
            className={`calendar-row ${d.isSunday ? 'special-day' : ''}`}
          >
            <div className="date-cell">
              <div className="date-main">{d.date}</div>
              <div className="date-day">{d.currDay}</div>
            </div>

            <div className="books-cell">
              {d.isSunday ? (
                <div className="special-message">
                  <span className="special-badge">All Available</span>
                  <span>All books can be farmed</span>
                </div>
              ) : (
                <TalentBooks books={d.books} />
              )}
            </div>

            <div className="characters-cell">
              {d.isSunday ? (
                <div className="special-message">
                  <span className="special-badge">All Available</span>
                  <span>All characters can be farmed</span>
                </div>
              ) : (
                <CharacterGrid characters={d.characters} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentCalendarView;