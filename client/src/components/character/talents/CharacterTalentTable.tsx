import React from "react";
import type { Talent } from "@/graphql/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import CharacterTalentScaling from "@/components/character/talents/CharacterTalentScaling";
import ListSplitter from "@/components/utils/ListSplitter";

interface CharacterTalentTableProps {
  talents: Talent[];
}

type AttackType = "Normal Attack" | "Elemental Skill" | "Elemental Burst";

const CharacterTalentTable: React.FC<CharacterTalentTableProps> = ({
  talents,
}) => {
  const attackOrder: AttackType[] = [
    "Normal Attack",
    "Elemental Skill",
    "Elemental Burst",
  ];

  const tabsName = talents
    .filter((talent) => attackOrder.includes(talent.talentType as AttackType))
    .sort((a, b) => {
      return (
        attackOrder.indexOf(a.talentType as AttackType) -
        attackOrder.indexOf(b.talentType as AttackType)
      );
    })
    .map((talent) => ({
      label: talent.talentType,
      value: talent.talentIcon,
    }));

  console.log(talents);
  return (
    <Tabs defaultValue={"Normal Attack"} defaultChecked>
      <TabsList>
        {tabsName.map((tabName) => {
          return (
            <TabsTrigger key={tabName.label} value={tabName.label}>
              <img
                src={tabName.value}
                alt={tabName.label}
                className="w-5 h-5 mr-2"
              />
              <span>{tabName.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {talents.map((talent) => {
        return (
          <TabsContent key={talent.talentType} value={talent.talentType}>
            <div className="p-4 flex flex-row gap-4">
              <div className="w-1/2 text-sm font-thin overflow-auto h-[500px] scrollbar-hide">
                <ListSplitter text={talent.description} />
              </div>
              <div className="w-1/2">
                <CharacterTalentScaling talent={talent} />
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default CharacterTalentTable;
