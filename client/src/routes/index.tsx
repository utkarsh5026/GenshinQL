import { Navigate, RouteObject } from 'react-router-dom';

import CharacterCardsWithFilters from '@/components/character/cards/character-card-filters';
import CharacterDetail from '@/components/character/description/character-detail';
import CharacterRoutine from '@/components/character/routine/CharacterRoutine';
import GenshinGuesser from '@/components/gdle/main/GenshinGuesser';
import { LinkerGame } from '@/components/linker-game';
import { MemoryGame } from '@/components/memory-game';
import TalentCalendar from '@/components/talents/talent-book-calendar';
import TierList from '@/components/tierlist/TierList';
import WeaponCalendar from '@/components/weapons/components/calendar/weapons-calendar';
import WeaponDetail from '@/components/weapons/components/detail/weapon-detail';
import WeaponsDetailed from '@/components/weapons/components/detailed/weapons-detailed';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/talents" replace />,
  },
  {
    path: '/talents',
    element: <TalentCalendar />,
  },
  {
    path: '/characters/table',
    element: <CharacterCardsWithFilters />,
  },
  {
    path: '/characters/routine',
    element: <CharacterRoutine />,
  },
  {
    path: '/characters/:characterName',
    element: <CharacterDetail />,
  },
  {
    path: '/weapons/calendar',
    element: <WeaponCalendar />,
  },
  {
    path: '/weapons/grid',
    element: <WeaponsDetailed />,
  },
  {
    path: '/weapons/:weaponName',
    element: <WeaponDetail />,
  },
  {
    path: '/tierlist',
    element: <TierList />,
  },
  {
    path: '/guesser',
    element: <GenshinGuesser />,
  },
  {
    path: '/memory-game',
    element: <MemoryGame />,
  },
  {
    path: '/linker-game',
    element: <LinkerGame />,
  },
  {
    path: '*',
    element: <Navigate to="/talents" replace />,
  },
];
