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

const TalentTable: React.FC<TalentTableProps> = ({talent}) => {
    const cols = ["day", "books", "characters"];
    const days = useMemo(() => talent.days, [talent.days]);
    console.log(getTodayDayOfWeek());
    return <Table>
        <TableHeader>
            <TableRow>
                {cols.map((col) => <TableHead>{col.toUpperCase()}</TableHead>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {days.map((d) => {
                const {day, books, characters} = d;
                return <TableRow>
                    <TableCell>{day}</TableCell>
                    <TableCell>
                        {books.map((book) => {
                            return <div className="grid grid-cols-2 gap-0">
                                <img src={book.url} alt={book.name} className="h-12 w-12"/>
                                <span className={"text-xs font-extralight"}>{book.name}</span>
                            </div>
                        })}
                    </TableCell>
                    <TableCell>
                        <div className="grid grid-cols-3 gap-2">
                            {characters.map((char) => {
                                return <div className="gap-2">
                                    <Avatar className={"h-16 w-16 my-1"}>
                                        <AvatarImage src={char.url} alt={char.name}/>
                                    </Avatar>
                                    <span className={"text-center text-sm"}>{char.name}</span>
                                </div>
                            })}</div>
                    </TableCell>
                </TableRow>
            })}
        </TableBody>
    </Table>
}

export default TalentTable;