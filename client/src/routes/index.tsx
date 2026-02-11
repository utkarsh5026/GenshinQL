import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

// Lazy load all route components for optimal bundle splitting
const Home = lazy(() =>
  import(
    /* webpackChunkName: "route-home" */
    '@/features/home'
  ).then((module) => ({ default: module.Home }))
);

const TalentCalendar = lazy(
  () =>
    import(
      /* webpackChunkName: "route-talent-calendar" */
      '@/features/calendar/components/talents/talent-book-calendar'
    )
);

const CharacterCardsWithFilters = lazy(
  () =>
    import(
      /* webpackChunkName: "route-characters-table" */
      '@/features/characters/components/cards/character-card-filters'
    )
);

const RoutinePlanner = lazy(() =>
  import(
    /* webpackChunkName: "route-routine-planner" */
    '@/features/routine-planner'
  ).then((module) => ({ default: module.RoutinePlanner }))
);

const CharacterDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "route-character-detail" */
      '@/features/characters/components/description/character-detail'
    )
);

const WeaponCalendar = lazy(
  () =>
    import(
      /* webpackChunkName: "route-weapon-calendar" */
      '@/features/calendar/components/weapons/weapons-calendar'
    )
);

const WeaponsDetailed = lazy(
  () =>
    import(
      /* webpackChunkName: "route-weapons-grid" */
      '@/features/weapons/components/catalog/catalog'
    )
);

const WeaponDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "route-weapon-detail" */
      '@/features/weapons/components/detail/weapon-detail'
    )
);

const TierList = lazy(() =>
  import(
    /* webpackChunkName: "route-tierlist" */
    '@/features/tier-list'
  ).then((module) => ({ default: module.TierList }))
);

const GenshinGuesser = lazy(
  () =>
    import(
      /* webpackChunkName: "route-guesser" */
      '@/features/genshin-guesser'
    )
);

// Special handling for named exports
const MemoryGame = lazy(() =>
  import(
    /* webpackChunkName: "route-memory-game" */
    '@/features/memory-game'
  ).then((module) => ({ default: module.MemoryGame }))
);

const LinkerGame = lazy(() =>
  import(
    /* webpackChunkName: "route-linker-game" */
    '@/features/linker-game'
  ).then((module) => ({ default: module.LinkerGame }))
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
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
    element: <RoutinePlanner />,
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
