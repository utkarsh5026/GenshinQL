import React, { useEffect } from "react";
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
import {
  CalendarHeart,
  ChevronDown,
  Table2,
  CalendarClock,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useCharacters } from "@/redux/hook/characters";

interface AppSideBarProps {
  onCharacterClick: (name: string) => void;
  onTalentCalenderClick: () => void;
  onCharactersTableClick: () => void;
  onCharacterRoutineClick: () => void;
}

const AppSideBar: React.FC<AppSideBarProps> = ({
  onCharacterClick,
  onTalentCalenderClick,
  onCharactersTableClick,
  onCharacterRoutineClick,
}) => {
  const { characters, fetchCharacters } = useCharacters();

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return (
    <Sidebar side="left">
      <SidebarHeader>Genshin Impact</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton onClick={onTalentCalenderClick}>
            <CalendarHeart /> Talents Calendar
          </SidebarMenuButton>
          <SidebarMenuButton onClick={onCharactersTableClick}>
            <Table2 /> Characters Table
          </SidebarMenuButton>
          <SidebarMenuButton onClick={onCharacterRoutineClick}>
            <CalendarClock /> Characters Routine
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
                  {characters.map((character) => (
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
