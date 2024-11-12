import "./App.css";
import { useState } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { useLazyQuery } from "@apollo/client";
import { GET_CHARACTER } from "./graphql/queries";
import TalentCalender from "@/components/talents/TalentBookCalendar.tsx";
import CharacterDescription from "./components/character/CharacterDescription";
import { CharacterDetailed } from "./graphql/types";

type CurrentView = "character" | "talentCalender";

function App() {
  const [getCharacter, { data }] = useLazyQuery(GET_CHARACTER);
  const [currentView, setCurrentView] = useState<CurrentView>("talentCalender");

  console.dir(data, { depth: null });

  const handleCharacterClick = async (name: string) => {
    console.log(name);
    setCurrentView("character");
    const res = await getCharacter({ variables: { name } });
    console.log(res);
  };
  const handleTalentCalenderClick = () => {
    setCurrentView("talentCalender");
  };
  return (
    <SidebarProvider>
      <AppSideBar
        onCharacterClick={handleCharacterClick}
        onTalentCalenderClick={handleTalentCalenderClick}
      />
      <main className="flex flex-col items-center justify-center w-full">
        {currentView === "character" && (
          <CharacterDescription
            character={data?.character as CharacterDetailed}
          />
        )}
        {currentView === "talentCalender" && <TalentCalender />}
      </main>
    </SidebarProvider>
  );
}

export default App;
