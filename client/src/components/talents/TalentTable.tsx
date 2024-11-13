import React, { useMemo } from "react";
import type { TalentBookCalendar } from "@/graphql/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import CharacterGrid from "@/components/character/utils/CharacterGrid.tsx";
import TalentBooks from "@/components/talents/TalentBooks.tsx";
import AnimatedTable from "@/components/utils/AnimatedTable.tsx";

interface TalentTableProps {
  talent: TalentBookCalendar;
}

const getTodayDayOfWeek = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date();
  return days[date.getDay()];
};

/**
 * TalentTable component displays a table of talent books and characters.
 *
 * @param {TalentTableProps} props - The props for the component.
 * @param {TalentBookCalendar} props.talent - The talent book calendar data.
 * @returns {JSX.Element} The rendered table component.
 */
const TalentTable: React.FC<TalentTableProps> = ({ talent }) => {
  const cols = ["day", "books", "characters"];
  const days = useMemo(() => talent.days, [talent.days]);
  console.log(getTodayDayOfWeek());

  return (
    <AnimatedTable>
      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((col) => (
              <TableHead key={col}>{col.toUpperCase()}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((d) => {
            const { day, books, characters } = d;
            const isToday = day.includes(getTodayDayOfWeek());
            return (
              <TableRow
                key={day}
                className={isToday ? "bg-green-950 hover:bg-green-950" : ""}
              >
                <TableCell>
                  <div>
                    <div className="my-2">{day}</div>
                    {isToday && (
                      <span className="text-xs font-extralight bg-green-700 p-2 rounded-xl">
                        Today
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TalentBooks books={books} />
                </TableCell>
                <TableCell>
                  <CharacterGrid characters={characters} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </AnimatedTable>
  );
};

export default TalentTable;