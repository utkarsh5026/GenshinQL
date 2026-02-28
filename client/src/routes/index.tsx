import { ComponentType, lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreloadableComponent<T extends ComponentType<any>> =
  React.LazyExoticComponent<T> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preload: () => Promise<any>;
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory;
  return Component;
}

const Home = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-home" */
    '@/features/home'
  ).then((module) => ({ default: module.Home }))
);

const TalentCalendar = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-talent-calendar" */
      '@/features/calendar/components/talents'
    )
);

const CharacterCardsWithFilters = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-characters-table" */
      '@/features/characters/components/cards/characters-catalog'
    )
);

const RoutinePlanner = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-routine-planner" */
    '@/features/routine-planner'
  ).then((module) => ({ default: module.RoutinePlanner }))
);

const CharacterDetail = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-character-detail" */
      '@/features/characters/components/description/character-detail'
    )
);

const WeaponCalendar = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-weapon-calendar" */
      '@/features/calendar/components/weapons'
    )
);

const WeaponsDetailed = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-weapons-grid" */
      '@/features/weapons/components/catalog/catalog'
    )
);

const WeaponDetail = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-weapon-detail" */
      '@/features/weapons/components/detail/weapon-detail'
    )
);

const TierList = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-tierlist" */
    '@/features/tier-list'
  ).then((module) => ({ default: module.TierList }))
);

const GenshinGuesser = lazyWithPreload(
  () =>
    import(
      /* webpackChunkName: "route-guesser" */
      '@/features/genshin-guesser'
    )
);

// Special handling for named exports
const MemoryGame = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-memory-game" */
    '@/features/memory-game'
  ).then((module) => ({ default: module.MemoryGame }))
);

const LinkerGame = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-linker-game" */
    '@/features/linker-game'
  ).then((module) => ({ default: module.LinkerGame }))
);

const VersionPage = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-version" */
    '@/features/version-management'
  ).then((module) => ({ default: module.VersionPage }))
);

const TeamBuilder = lazyWithPreload(() =>
  import(
    /* webpackChunkName: "route-team-builder" */
    '@/features/team-builder'
  ).then((module) => ({ default: module.TeamBuilderPage }))
);

/**
 * Preload all routes in the background
 * You can call this explicitly or let it run automatically
 */
export const preloadAllRoutes = () => {
  const preloads = [
    Home.preload,
    TalentCalendar.preload,
    CharacterCardsWithFilters.preload,
    RoutinePlanner.preload,
    CharacterDetail.preload,
    WeaponCalendar.preload,
    WeaponsDetailed.preload,
    WeaponDetail.preload,
    TierList.preload,
    GenshinGuesser.preload,
    MemoryGame.preload,
    LinkerGame.preload,
    VersionPage.preload,
    TeamBuilder.preload,
  ];

  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        preloads.forEach((preload) => preload());
      });
    } else {
      setTimeout(() => {
        preloads.forEach((preload) => preload());
      }, 2000);
    }
  }
};

preloadAllRoutes();

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
    path: '/version',
    element: <VersionPage />,
  },
  {
    path: '/teams',
    element: <TeamBuilder />,
  },
  {
    path: '*',
    element: <Navigate to="/talents" replace />,
  },
];
