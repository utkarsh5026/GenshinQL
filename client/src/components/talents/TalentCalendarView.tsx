import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type { TalentBookCalendar } from "@/graphql/types";
import TalentBooks from "@/components/talents/TalentBooks.tsx";
import CharacterGrid from "@/components/character/CharacterGrid.tsx";
import AnimatedTable from "@/components/utils/AnimatedTable.tsx";

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
    <AnimatedTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Book</TableHead>
            <TableHead>Characters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => {
            return (
              <TableRow
                key={d.date}
                className={d.isSunday ? "bg-green-950 hover:bg-green-950" : ""}
              >
                <TableCell>
                  <div>
                    <div>{d.date}</div>
                    <div>{d.currDay}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {" "}
                  {d.isSunday ? (
                    <div>All books can farmed today</div>
                  ) : (
                    <TalentBooks books={d.books} />
                  )}
                </TableCell>
                <TableCell>
                  {d.isSunday ? (
                    <div>All characters can be farmed today 😊</div>
                  ) : (
                    <CharacterGrid characters={d.characters} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </AnimatedTable>
  );
};

export default TalentCalendarView;