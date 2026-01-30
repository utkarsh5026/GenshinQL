import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem as SidebarItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import {
  CalendarClock,
  CalendarHeart,
  ChevronDown,
  LucideSwords,
  AxeIcon,
  Table2,
  ChartBarDecreasing,
  Gamepad2,
} from 'lucide-react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useCharactersStore } from '@/stores';

const AppSideBar: React.FC = () => {
  const { characters, fetchCharacters } = useCharactersStore();

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return (
    <Sidebar side="left" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-6 py-5 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <div className="flex items-center gap-3">
          <img
            src="/favicon-32x32.png"
            alt="Genshin Impact"
            className="w-8 h-8"
          />
          <h1 className="text-lg font-semibold tracking-tight">
            Genshin Impact
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          <NavLink
            to="/talents"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-pink-500/20' : 'hover:bg-pink-500/10'
              }`
            }
          >
            <CalendarHeart className="w-4 h-4 text-pink-500 group-hover:text-pink-600" />
            <span className="text-sm font-medium">Talents Calendar</span>
          </NavLink>

          <NavLink
            to="/characters/table"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'
              }`
            }
          >
            <Table2 className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
            <span className="text-sm font-medium">Characters Table</span>
          </NavLink>

          <NavLink
            to="/characters/routine"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-purple-500/20' : 'hover:bg-purple-500/10'
              }`
            }
          >
            <CalendarClock className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
            <span className="text-sm font-medium">Characters Routine</span>
          </NavLink>

          <NavLink
            to="/weapons/calendar"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-amber-500/20' : 'hover:bg-amber-500/10'
              }`
            }
          >
            <LucideSwords className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
            <span className="text-sm font-medium">Weapons Calendar</span>
          </NavLink>

          <NavLink
            to="/weapons"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-orange-500/20' : 'hover:bg-orange-500/10'
              }`
            }
          >
            <AxeIcon className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
            <span className="text-sm font-medium">Weapons Detailed</span>
          </NavLink>

          <NavLink
            to="/tierlist"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-emerald-500/20' : 'hover:bg-emerald-500/10'
              }`
            }
          >
            <ChartBarDecreasing className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
            <span className="text-sm font-medium">Tier List</span>
          </NavLink>

          <NavLink
            to="/guesser"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive ? 'bg-violet-500/20' : 'hover:bg-violet-500/10'
              }`
            }
          >
            <Gamepad2 className="w-4 h-4 text-violet-500 group-hover:text-violet-600" />
            <span className="text-sm font-medium">Genshin Guesser</span>
          </NavLink>

          <div className="pt-2">
            <Collapsible defaultOpen={false} className="group/collapsible">
              <SidebarItem>
                <CollapsibleTrigger className="w-full">
                  <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-500/10 transition-colors group">
                    <span className="text-sm font-medium">Characters</span>
                    <ChevronDown className="ml-auto w-4 h-4 text-indigo-500 group-hover:text-indigo-600 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-1">
                  <SidebarMenuSub className="ml-3 border-l border-indigo-500/20 pl-3 space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {characters.map((character) => (
                      <SidebarMenuSubItem key={character.name}>
                        <Link
                          to={`/characters/${character.name}`}
                          className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-indigo-500/10 transition-colors group"
                        >
                          <Avatar className="h-7 w-7 ring-1 ring-border/50 group-hover:ring-indigo-500/30">
                            <AvatarImage src={character.iconUrl} />
                          </Avatar>
                          <span className="text-sm">{character.name}</span>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarItem>
            </Collapsible>
          </div>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
