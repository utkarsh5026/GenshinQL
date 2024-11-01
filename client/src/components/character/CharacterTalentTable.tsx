import React from "react";
import type {Talent} from "@/graphql/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import CharacterTalentScaling from "@/components/character/CharacterTalentScaling.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";

interface CharacterTalentTableProps {
    talents: Talent[];
}

const CharacterTalentTable: React.FC<CharacterTalentTableProps> = ({
                                                                       talents,
                                                                   }) => {
    const tabsName = talents
        .map((talent) => {
            return {
                label: talent.talentType,
                value: talent.talentIcon,
            };
        })
        .slice(0, 3);

    console.log(talents);
    return (
        <Tabs>
            <TabsList defaultValue={"Normal Attack"}>
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
                        <CharacterTalentScaling talent={talent}/>
                        <Collapsible defaultChecked>
                            <CollapsibleTrigger> Animations </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className={"grid grid-cols-2 gap-4"}>
                                    {talent.figureUrls.map((figureUrl) => {
                                        const {url, caption} = figureUrl;
                                        return (<div>
                                            <figure>
                                                <img src={url} alt={caption} height={"240px"}
                                                     width={"240px"} loading={"lazy"}/>
                                                <figcaption
                                                    className={"text-xs font-thin mt-0.5"}>
                                                    {caption.trim().length > 0 ? caption : talent.talentName}
                                                </figcaption>
                                            </figure>
                                        </div>)
                                    })}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
};

export default CharacterTalentTable;