import "./App.css";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { useLazyQuery } from "@apollo/client";
import { GET_CHARACTER } from "./graphql/queries";
import TalentCalender from "@/components/talents/TalentBookCalendar.tsx";

function App() {
  const [getCharacter, { data }] = useLazyQuery(GET_CHARACTER);

  const handleCharacterClick = (name: string) => {
    getCharacter({ variables: { name } });
  };
  return (
    <SidebarProvider>
      <AppSideBar onCharacterClick={handleCharacterClick} />
      <main className="flex flex-col items-center justify-center w-full">
        {/*<CharacterDescription*/}
        {/*  character={data?.character as CharacterDetailed}*/}
        {/*/>*/}
        <TalentCalender />
      </main>
    </SidebarProvider>
  );
}

export default App;