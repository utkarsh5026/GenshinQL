import "./App.css";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSideBar from "./components/utils/AppSideBar";
import { CharacterDetailed } from "./graphql/types";
import { useLazyQuery } from "@apollo/client";
import { GET_CHARACTER } from "./graphql/queries";
import CharacterDescription from "./components/character/CharacterDescription";

function App() {
  const [getCharacter, { data }] = useLazyQuery(GET_CHARACTER);

  const handleCharacterClick = (name: string) => {
    getCharacter({ variables: { name } });
  };
  return (
    <SidebarProvider>
      <AppSideBar onCharacterClick={handleCharacterClick} />
      <main className="flex flex-col items-center justify-center w-full">
        <CharacterDescription
          character={data?.character as CharacterDetailed}
        />
      </main>
    </SidebarProvider>
  );
}

export default App;
