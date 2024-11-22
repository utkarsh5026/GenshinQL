import React from "react";
import CharacterTierList from "./characters/CharacterTierList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const TierList: React.FC = () => {
  return (
    <div>
      <Tabs defaultValue="characters" defaultChecked>
        <TabsList>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="weapons">Weapons</TabsTrigger>
        </TabsList>
        <TabsContent value="characters" key="characters">
          <CharacterTierList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TierList;
