import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem as SidebarItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { CalendarHeart, ChevronDown } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_CHARACTER_FOR_SIDEBAR } from "@/graphql/queries";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { Character } from "@/graphql/types";

interface AppSideBarProps {
  onCharacterClick: (name: string) => void;
  onTalentCalenderClick: () => void;
}

const AppSideBar: React.FC<AppSideBarProps> = ({
  onCharacterClick,
  onTalentCalenderClick,
}) => {
  const { data } = useQuery(GET_CHARACTER_FOR_SIDEBAR);
  return (
    <Sidebar side="left">
      <SidebarHeader>Genshin Impact</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton onClick={onTalentCalenderClick}>
            <CalendarHeart /> Talents Calendar
          </SidebarMenuButton>
          <Collapsible defaultOpen={false} className="group/collapsible">
            <SidebarItem>
              <CollapsibleTrigger className="w-full">
                <SidebarMenuButton className="w-full justify-start pl-2">
                  Characters
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {data?.characters.map((character: Character) => (
                    <SidebarMenuSubItem
                      key={character.name}
                      className="py-1 min-h-0 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onCharacterClick(character.name)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={character.iconUrl} />
                        </Avatar>
                        <span className="text-sm">{character.name}</span>
                      </div>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
