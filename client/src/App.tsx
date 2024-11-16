import "./App.css";
import { useState } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { useLazyQuery } from "@apollo/client";
import { GET_CHARACTER } from "./graphql/queries";
import TalentCalender from "@/components/talents/TalentBookCalendar.tsx";
import CharacterDescription from "./components/character/description/CharacterDescription.tsx";
import { CharacterDetailed } from "./graphql/types";
import CharactersTable from "./components/character/table/CharacterTable.tsx";
import CharacterRoutine from "./components/character/routine/CharacterRoutine.tsx";

type CurrentView =
  | "character"
  | "talentCalender"
  | "charactersTable"
  | "characterRoutine"
  | "weaponCalender";

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

  return (
    <SidebarProvider>
      <AppSideBar
        onCharacterClick={handleCharacterClick}
        onTalentCalenderClick={() => setCurrentView("talentCalender")}
        onCharactersTableClick={() => setCurrentView("charactersTable")}
        onCharacterRoutineClick={() => setCurrentView("characterRoutine")}
        onWeaponCalenderClick={() => setCurrentView("weaponCalender")}
      />
      <main
        className="items-center justify-center  w-full
       h-full"
      >
        {currentView === "character" && (
          <CharacterDescription
            character={data?.character as CharacterDetailed}
          />
        )}
        {currentView === "talentCalender" && <TalentCalender />}
        {currentView === "charactersTable" && <CharactersTable />}
        {currentView === "characterRoutine" && <CharacterRoutine />}
      </main>
    </SidebarProvider>
  );
}

export default App;
