import React, {useMemo} from "react";
import {useQuery} from "@apollo/client";
import {GET_TALENT_MATERIALS_CALENDAR} from "@/graphql/queries.ts";
import type {TalentBookCalendar} from "@/graphql/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import TalentTable from "@/components/talents/TalentTable.tsx";

const TalentBookCalendar: React.FC = () => {
    const {data, loading} = useQuery(GET_TALENT_MATERIALS_CALENDAR);
    const locations = useMemo(() => {
        const books = data && data.talentBooks ? data.talentBooks as TalentBookCalendar[] : [];
        return books.map(({location}) => location);
    }, [data]);

    const talentBooks = useMemo(() =>
            data && data.talentBooks ? data.talentBooks as TalentBookCalendar[] : []
        , [data]);

    if (loading) return null;
    if (data && talentBooks.length > 0) return (
        <div>
            <Tabs defaultValue={locations[0]}>
                <TabsList>
                    {locations.map((loc) => {
                        return <TabsTrigger value={loc}>{loc}</TabsTrigger>
                    })}
                </TabsList>
                {locations.map((loc) => {
                    const books = talentBooks.find((book) => book.location === loc);
                    return <TabsContent value={loc}>
                        {books && <TalentTable talent={books}/>}
                    </TabsContent>
                })}
            </Tabs>
        </div>
    )
}

export default TalentBookCalendar;