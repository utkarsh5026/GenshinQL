import "./App.css";
import { useState, useEffect } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { useLazyQuery } from "@apollo/client";
import { GET_CHARACTER } from "./graphql/queries";
import TalentCalender from "@/components/talents/TalentBookCalendar.tsx";
import CharacterDescription from "./components/character/description/CharacterDescription.tsx";
import { CharacterDetailed } from "./graphql/types";
import CharactersTable from "./components/character/table/CharacterTable.tsx";
import CharacterRoutine from "./components/character/routine/CharacterRoutine.tsx";
import WeaponCalender from "./components/weapons/WeaponCalender.tsx";
import { useWeaponMaterials } from "@/redux/hook/weapon-material";
import useTalentBooks from "./redux/hook/talent-book.ts";
import WeaponsDetailed from "./components/weapons/WeaponsDetailed.tsx";
import TierList from "./components/tierlist/TierList.tsx";
import GenshinGuesser from "./components/gdle/main/GenshinGuesser.tsx";

type CurrentView =
  | "character"
  | "talentCalender"
  | "charactersTable"
  | "characterRoutine"
  | "weaponCalender"
  | "weaponsDetailed"
  | "tierList"
  | "genshinGuesser";

function App() {
  const [getCharacter, { data }] = useLazyQuery(GET_CHARACTER);
  const [currentView, setCurrentView] = useState<CurrentView>("talentCalender");
  const { fetchWeaponMaterials } = useWeaponMaterials();
  const { fetchBooks } = useTalentBooks();

  useEffect(() => {
    Promise.all([fetchWeaponMaterials(), fetchBooks()]);
  }, [fetchWeaponMaterials, fetchBooks]);

  console.dir(data, { depth: null });

  const handleCharacterClick = async (name: string) => {
    setCurrentView("character");
    await getCharacter({ variables: { name } });
  };

  return (
    <SidebarProvider>
      <AppSideBar
        onCharacterClick={handleCharacterClick}
        onTalentCalenderClick={() => setCurrentView("talentCalender")}
        onCharactersTableClick={() => setCurrentView("charactersTable")}
        onCharacterRoutineClick={() => setCurrentView("characterRoutine")}
        onWeaponCalenderClick={() => setCurrentView("weaponCalender")}
        onWeaponsDetailedClick={() => setCurrentView("weaponsDetailed")}
        onTierListClick={() => setCurrentView("tierList")}
        onGenshinGuesserClick={() => setCurrentView("genshinGuesser")}
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
        {currentView === "weaponCalender" && <WeaponCalender />}
        {currentView === "weaponsDetailed" && <WeaponsDetailed />}
        {currentView === "tierList" && <TierList />}
        {currentView === "genshinGuesser" && <GenshinGuesser />}
      </main>
    </SidebarProvider>
  );
}

export default App;
