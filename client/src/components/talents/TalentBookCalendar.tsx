import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_TALENT_MATERIALS_CALENDAR } from "@/graphql/queries.ts";
import type { TalentBookCalendar } from "@/graphql/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import TalentTable from "@/components/talents/TalentTable.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Aperture, CalendarDays } from "lucide-react";
import TalentCalendarView from "@/components/talents/TalentCalendarView.tsx";

/**
 * TalentCalender component displays a calendar or table view of talent books.
 *
 * @returns {JSX.Element | null} The rendered component.
 */
const TalentCalender: React.FC = () => {
  const [isCalendar, setIsCalendar] = useState(false);
  const { data, loading } = useQuery(GET_TALENT_MATERIALS_CALENDAR);

  const locations = useMemo(() => {
    const books =
      data && data.talentBooks
        ? (data.talentBooks as TalentBookCalendar[])
        : [];
    return books.map(({ location }) => location);
  }, [data]);

  const talentBooks = useMemo(
    () =>
      data && data.talentBooks
        ? (data.talentBooks as TalentBookCalendar[])
        : [],
    [data],
  );

  if (loading) return null;
  if (data && talentBooks.length > 0)
    return (
      <div>
        <Tabs defaultValue={locations[0]}>
          <TabsList>
            {locations.map((loc) => {
              return (
                <TabsTrigger key={loc} value={loc}>
                  {loc}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {locations.map((loc) => {
            const books = talentBooks.find((book) => book.location === loc);
            return (
              <TabsContent key={loc} value={loc}>
                <div className="w-full flex justify-end my-5">
                  <Button
                    className="bg-green-200 text-green-950 border-2"
                    onClick={() => {
                      setIsCalendar(!isCalendar);
                    }}
                  >
                    <div className={"flex gap-2"}>
                      {isCalendar ? (
                        <CalendarDays size={20} />
                      ) : (
                        <Aperture size={20} />
                      )}

                      <div>
                        {isCalendar ? "Switch to Table" : "Switch to Calendar"}
                      </div>
                    </div>
                  </Button>
                </div>
                {books &&
                  (isCalendar ? (
                    <TalentTable talent={books} />
                  ) : (
                    <TalentCalendarView
                      nDays={7}
                      talent={books as TalentBookCalendar}
                    />
                  ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
};

export default TalentCalender;