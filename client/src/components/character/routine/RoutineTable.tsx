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

interface Routine {
  day: string;
  talentBooks: { book: TalentBook; url: string; name: string }[];
}

interface RoutineTableProps {
  routines: Routine[];
}

const RoutineTable: React.FC<RoutineTableProps> = ({ routines }) => {
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
          {routines.map((routine) => (
            <TableRow key={routine.day}>
              <TableCell className="font-bold text-left py-2">
                {routine.day}
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
              <TableCell className="py-2">Talent</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoutineTable;
