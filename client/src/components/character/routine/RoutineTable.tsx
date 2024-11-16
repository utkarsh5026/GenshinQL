import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { TalentBook } from "@/redux/slices/talent-books";
import React from "react";
import CharacterGrid from "../utils/CharacterGrid";
import TalentBooksShowCase from "./TalentBooksShowCase";
import { getCurrentDay } from "@/utils/day";
interface Routine {
  day: string;
  talentBooks: { book: TalentBook; url: string; name: string }[];
}

interface RoutineTableProps {
  routines: Routine[];
}

const RoutineTable: React.FC<RoutineTableProps> = ({ routines }) => {
  const currentDay = getCurrentDay();
  return (
    <div>
      <Table className="w-full">
        <TableHeader className="bg-slate-500">
          <TableRow>
            <TableHead className="py-2">Day</TableHead>
            <TableHead className="py-2">Character</TableHead>
            <TableHead className="py-2">Weapon</TableHead>
            <TableHead className="py-2">Talent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routines.map((routine) => {
            const rowUniqueBooks = Array.from(
              new Set(routine.talentBooks.map((book) => book.book.guideUrl))
            ).map(
              (url) =>
                routine.talentBooks.find((book) => book.book.guideUrl === url)!
                  .book
            );

            return (
              <TableRow
                key={routine.day}
                className={
                  routine.day === currentDay
                    ? "bg-green-500/20 hover:bg-green-500/20"
                    : ""
                }
              >
                <TableCell className="font-bold text-left py-2">
                  {routine.day === currentDay
                    ? `${routine.day} (Today)`
                    : routine.day}
                </TableCell>
                <TableCell className="py-2">
                  <CharacterGrid
                    characters={routine.talentBooks.map((book) => ({
                      name: book.name,
                      url: book.url,
                    }))}
                  />
                </TableCell>
                <TableCell className="py-2">Weapon</TableCell>
                <TableCell className="py-2">
                  <TalentBooksShowCase talentBooks={rowUniqueBooks} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoutineTable;
