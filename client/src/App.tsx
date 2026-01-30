import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { fetchCharacterDetailed } from "@/services/dataService";
import TalentCalender from "@/components/talents/TalentBookCalendar.tsx";
import CharacterDescription from "./components/character/description/CharacterDescription.tsx";
import { CharacterDetailed } from "@/types";
import CharactersTable from "./components/character/table/CharacterTable.tsx";
import CharacterRoutine from "./components/character/routine/CharacterRoutine.tsx";
import WeaponCalender from "./components/weapons/WeaponCalender.tsx";
import { useWeaponMaterialStore, useTalentBooksStore } from "@/stores";
import WeaponsDetailed from "./components/weapons/WeaponsDetailed.tsx";
import TierList from "./components/tierlist/TierList.tsx";
import GenshinGuesser from "./components/gdle/main/GenshinGuesser.tsx";
import { useAutoClearOldCache } from "@/hooks/useCacheManager";

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
  const [character, setCharacter] = useState<CharacterDetailed | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>("talentCalender");
  const { fetchWeaponMaterials } = useWeaponMaterialStore();
  const { fetchBooks } = useTalentBooksStore();

  // Auto-clear cached assets older than 7 days on app load
  useAutoClearOldCache(7);

  useEffect(() => {
    Promise.all([fetchWeaponMaterials(), fetchBooks()]);
  }, [fetchWeaponMaterials, fetchBooks]);

  console.dir(character, { depth: null });

  const handleCharacterClick = useCallback(async (name: string) => {
    setCurrentView("character");
    const charData = await fetchCharacterDetailed(name);
    setCharacter(charData);
  }, []);

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
            character={character as CharacterDetailed}
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
