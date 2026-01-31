import { Navigate, RouteObject } from 'react-router-dom';

import CharacterCardsWithFilters from '@/components/character/cards/character-card-filters';
import CharacterDetail from '@/components/character/description/character-detail';
import CharacterRoutine from '@/components/character/routine/CharacterRoutine';
import GenshinGuesser from '@/components/gdle/main/GenshinGuesser';
import TalentCalendar from '@/components/talents/TalentBookCalendar';
import TierList from '@/components/tierlist/TierList';
import WeaponCalendar from '@/components/weapons/WeaponCalender';
import WeaponsDetailed from '@/components/weapons/WeaponsDetailed';

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
    path: '/weapons',
    element: <WeaponsDetailed />,
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
    path: '*',
    element: <Navigate to="/talents" replace />,
  },
];
