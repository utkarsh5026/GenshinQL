import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { TalentBook } from "@/redux/slices/talent-books";
import React, { useEffect, useMemo } from "react";
import CharacterGrid from "../utils/CharacterGrid";
import TalentBooksShowCase from "./TalentBooksShowCase";
import { getCurrentDay } from "@/utils/day";
import type { Character, Day, Weapon } from "@/graphql/types";
import useTalentBooks from "@/redux/hook/talent-book";
import WeaponShowCase from "@/components/weapons/WeaponShowCase";

interface RoutineTableProps {
  characters: Character[];
  weapons: Weapon[];
}

/**
 * RoutineTable component displays a weekly schedule of talent book farming days for selected characters.
 *
 * The component organizes character talent book farming days into a table format, showing:
 * - Which days each character can farm their talent books
 * - The characters that need to farm on each day
 * - The specific talent books needed
 * - Highlights the current day
 *
 * @component
 * @param {Object} props - Component props
 * @param {Character[]} props.characters - Array of selected characters to display in the routine
 * @returns {JSX.Element} Table displaying the weekly talent book farming schedule
 */
const RoutineTable: React.FC<RoutineTableProps> = ({ characters, weapons }) => {
  const currentDay = getCurrentDay();
  const { talentCharMap, fetchBooks } = useTalentBooks();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const routines = useMemo(() => {
    const books = characters.map((char) => ({
      character: char,
      talentBooks: talentCharMap?.[char.name],
    }));

    const dayMap: Record<Day, { character: Character; book: TalentBook }[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    for (const { character, talentBooks } of books) {
      const { dayOne, dayTwo } = talentBooks;
      dayMap[dayOne as Day].push({ character, book: talentBooks });
      dayMap[dayTwo as Day].push({ character, book: talentBooks });
    }

    return Object.entries(dayMap).map(([day, books]) => ({
      day: day as Day,
      characters: books.map((book) => book.character),
      talentBooks: books.map((book) => book.book),
    }));
  }, [characters, talentCharMap]);

  return (
    <div>
      <Table className="w-full">
        <TableHeader className="bg-slate-500">
          <TableRow>
            <TableHead className="py-2">Day</TableHead>
            <TableHead className="py-2">Character</TableHead>
            <TableHead className="py-2">Weapon</TableHead>
            <TableHead className="py-2">Talent</TableHead>
            <TableHead className="py-2">Weapon Material</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routines.map((rout) => {
            const rowUniqueBooks = Array.from(
              new Set(rout.talentBooks.map((book) => book.guideUrl))
            ).map(
              (url) => rout.talentBooks.find((book) => book.guideUrl === url)!
            );

            return (
              <TableRow
                key={rout.day}
                className={
                  rout.day === currentDay
                    ? "bg-green-500/20 hover:bg-green-500/20"
                    : ""
                }
              >
                <TableCell className="font-bold text-left py-2">
                  {rout.day === currentDay ? `${rout.day} (Today)` : rout.day}
                </TableCell>
                <TableCell className="py-2">
                  <CharacterGrid
                    characters={rout.characters.map((char) => ({
                      name: char.name,
                      url: char.iconUrl,
                    }))}
                  />
                </TableCell>
                <TableCell className="py-2">
                  <WeaponShowCase weapons={weapons} />
                </TableCell>
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
