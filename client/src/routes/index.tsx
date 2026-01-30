import { RouteObject, Navigate } from 'react-router-dom';
import TalentCalendar from '@/components/talents/TalentBookCalendar';
import CharacterTableWithFilters from '@/components/character/table/CharacterTableWithFilters';
import CharacterRoutine from '@/components/character/routine/CharacterRoutine';
import WeaponCalendar from '@/components/weapons/WeaponCalender';
import WeaponsDetailed from '@/components/weapons/WeaponsDetailed';
import TierList from '@/components/tierlist/TierList';
import GenshinGuesser from '@/components/gdle/main/GenshinGuesser';
import CharacterDetail from '@/components/character/description/CharacterDetail';

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
    element: <CharacterTableWithFilters />,
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
