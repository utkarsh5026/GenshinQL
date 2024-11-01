import React, {useMemo} from "react";
import type {TalentBookCalendar} from "@/graphql/types";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";

interface TalentTableProps {
    talent: TalentBookCalendar;
}

const getTodayDayOfWeek = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date();
    return days[date.getDay()];
}

/**
 * TalentTable component displays a table of talent books and characters.
 *
 * @param {TalentTableProps} props - The props for the component.
 * @param {TalentBookCalendar} props.talent - The talent book calendar data.
 * @returns {JSX.Element} The rendered table component.
 */
const TalentTable: React.FC<TalentTableProps> = ({talent}) => {
    const cols = ["day", "books", "characters"];
    const days = useMemo(() => talent.days, [talent.days]);
    console.log(getTodayDayOfWeek());

    return (
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
                    const {day, books, characters} = d;
                    const isToday = day.includes(getTodayDayOfWeek());

                    return (
                        <TableRow key={day} className={isToday ? "bg-green-950 hover:bg-green-950" : ""}>
                            <TableCell>
                                <div>
                                    <div className="my-2">{day}</div>
                                    {isToday &&
                                        <span
                                            className="text-xs font-extralight bg-green-700 p-2 rounded-xl">Today</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                {books.map((book) => (
                                    <div key={book.name} className="grid grid-cols-2 gap-0">
                                        <img src={book.url} alt={book.name} className="h-12 w-12"/>
                                        <span className="text-xs font-extralight">{book.name}</span>
                                    </div>
                                ))}
                            </TableCell>
                            <TableCell>
                                <div className="grid grid-cols-3 gap-2">
                                    {characters.map((char) => (
                                        <div key={char.name} className="flex flex-col justify-start align-start gap-1">
                                            <Avatar className="h-16 w-16 my-1">
                                                <AvatarImage src={char.url} alt={char.name}/>
                                            </Avatar>
                                            <span className="text-xs">{char.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default TalentTable;