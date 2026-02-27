import {
  Brain,
  Castle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Flame,
  Gem,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Users2,
  Waypoints,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRecents } from '@/features/command-palette/stores/useRecentsStore';
import type { RecentItem } from '@/features/command-palette/types';
import { useIsMobile } from '@/hooks/use-mobile';

import styles from './sidebar.module.css';
import { useSidebarStore } from './useSidebarStore';

interface NavItem {
  route: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'navigate',
    label: 'Navigate',
    items: [
      {
        route: '/',
        label: 'Home',
        icon: Castle,
        iconColor: 'oklch(75% 0.15 85)',
      },
    ],
  },
  {
    id: 'characters',
    label: 'Characters',
    items: [
      {
        route: '/characters/table',
        label: 'Characters',
        icon: Shield,
        iconColor: 'oklch(58% 0.19 250)',
      },
      {
        route: '/characters/routine',
        label: 'Routine',
        icon: ScrollText,
        iconColor: 'oklch(60% 0.24 300)',
      },
      {
        route: '/teams',
        label: 'Teams',
        icon: Users2,
        iconColor: 'oklch(62% 0.18 165)',
      },
    ],
  },
  {
    id: 'weapons',
    label: 'Weapons',
    items: [
      {
        route: '/weapons/calendar',
        label: 'Materials',
        icon: Gem,
        iconColor: 'oklch(62% 0.18 80)',
      },
      {
        route: '/weapons/grid',
        label: 'Weapons',
        icon: Swords,
        iconColor: 'oklch(75% 0.16 85)',
      },
    ],
  },
  {
    id: 'explore',
    label: 'Explore',
    items: [
      {
        route: '/talents',
        label: 'Talents',
        icon: Flame,
        iconColor: 'oklch(60% 0.24 25)',
      },
      {
        route: '/tierlist',
        label: 'Tier List',
        icon: Crown,
        iconColor: 'oklch(58% 0.19 145)',
      },
      {
        route: '/guesser',
        label: 'Guesser',
        icon: Brain,
        iconColor: 'oklch(65% 0.17 195)',
      },
      {
        route: '/memory-game',
        label: 'Memory Game',
        icon: Eye,
        iconColor: 'oklch(65% 0.14 240)',
      },
      {
        route: '/linker-game',
        label: 'Linker Game',
        icon: Waypoints,
        iconColor: 'oklch(60% 0.24 290)',
      },
    ],
  },
];

const versionItem: NavItem = {
  route: '/version',
  label: 'LUNA IV',
  icon: Sparkles,
  iconColor: 'oklch(80% 0.18 70)',
};

const VERSION_IMAGE_URL =
  'https://static.wikia.nocookie.net/gensin-impact/images/8/86/Version_Luna_IV_Wallpaper_2.png';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isExpanded,
  onClick,
}) => {
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.route}
      onClick={onClick}
      className={`
        ${styles.navItem}
        relative flex items-center gap-3
        px-2.5 py-2 rounded-xl mx-2 my-0.5
        transition-all duration-200 group/navitem cursor-pointer
        ${isActive ? '' : 'hover:bg-white/3'}
      `}
      style={{
        backgroundColor: isActive ? `${item.iconColor}12` : undefined,
      }}
    >
      {/* Icon badge */}
      <div
        className={`
          w-9 h-9 rounded-lg flex items-center justify-center shrink-0
          transition-all duration-200 group-hover/navitem:scale-110
          ${isActive ? styles.activeBadge : ''}
        `}
        style={{
          background: isActive ? `${item.iconColor}28` : `${item.iconColor}14`,
          border: `1px solid ${item.iconColor}${isActive ? '45' : '22'}`,
          ...(isActive
            ? ({ '--icon-color': item.iconColor } as React.CSSProperties)
            : {}),
        }}
      >
        <Icon
          className={`transition-all duration-200 ${
            isActive ? styles.activeIcon : ''
          }`}
          style={{
            width: '1.05rem',
            height: '1.05rem',
            color: item.iconColor,
            opacity: isActive ? 1 : 0.75,
            filter: isActive
              ? `drop-shadow(0 0 4px ${item.iconColor}90)`
              : undefined,
            strokeWidth: isActive ? 2.2 : 1.8,
          }}
        />
      </div>

      {isExpanded && (
        <span
          className="text-sm font-medium whitespace-nowrap overflow-hidden transition-colors duration-200"
          style={{ color: isActive ? item.iconColor : undefined }}
        >
          {item.label}
        </span>
      )}

      {/* Active left accent bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: item.iconColor }}
        />
      )}
    </NavLink>
  );

  if (!isExpanded) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

interface SidebarVersionItemProps {
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

const SidebarVersionItem: React.FC<SidebarVersionItemProps> = ({
  isActive,
  isExpanded,
  onClick,
}) => {
  const goldColor = versionItem.iconColor;

  const link = (
    <NavLink
      to={versionItem.route}
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        px-3 py-2.5 rounded-lg mx-2 my-0.5
        transition-all duration-300
        cursor-pointer border
        ${isActive ? 'border-amber-500/40' : 'border-amber-500/20 hover:border-amber-500/40'}
      `}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${goldColor}25, ${goldColor}10)`
          : `linear-gradient(135deg, ${goldColor}0a, ${goldColor}05)`,
        color: isActive ? goldColor : undefined,
        boxShadow: isActive
          ? `0 0 12px ${goldColor}20, inset 0 1px 0 ${goldColor}15`
          : undefined,
      }}
    >
      <Avatar
        className={`w-7 h-7 shrink-0 transition-all duration-300 ${
          isActive ? 'ring-2 ring-amber-500/60' : 'ring-1 ring-amber-500/30'
        }`}
        style={{
          boxShadow: isActive ? `0 0 8px ${goldColor}40` : undefined,
        }}
      >
        <AvatarImage
          src={VERSION_IMAGE_URL}
          alt={versionItem.label}
          className="object-cover"
          style={{ filter: isActive ? 'brightness(1.1)' : 'brightness(0.95)' }}
        />
        <AvatarFallback className="text-xs bg-linear-to-br from-amber-500/20 to-amber-600/10">
          {versionItem.label.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      {isExpanded && (
        <span
          className="text-sm font-semibold tracking-wide whitespace-nowrap"
          style={{ color: goldColor }}
        >
          {versionItem.label}
        </span>
      )}
    </NavLink>
  );

  if (!isExpanded) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-semibold">
          <span style={{ color: goldColor }}>{versionItem.label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

// ─── Recent Item ─────────────────────────────────────────────────────────────

interface SidebarRecentItemProps {
  recent: RecentItem;
  isExpanded: boolean;
  onClick?: () => void;
}

const getRarityRingClass = (rarity: number): string => {
  const ringMap: Record<number, string> = {
    5: 'ring-2 ring-amber-500/60',
    4: 'ring-2 ring-violet-500/60',
    3: 'ring-1 ring-blue-500/50',
    2: 'ring-1 ring-green-500/50',
    1: 'ring-1 ring-gray-400/40',
  };
  return ringMap[rarity] ?? ringMap[3];
};

const SidebarRecentItem: React.FC<SidebarRecentItemProps> = ({
  recent,
  isExpanded,
  onClick,
}) => {
  const link = (
    <NavLink
      to={recent.route}
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        px-3 py-2 rounded-lg mx-2 my-0.5
        transition-all duration-200
        cursor-pointer
        hover:bg-accent/50 text-muted-foreground hover:text-foreground
      `}
    >
      <Avatar
        className={`w-7 h-7 shrink-0 ${getRarityRingClass(recent.rarity ?? 4)}`}
      >
        <AvatarImage src={recent.iconUrl} alt={recent.name} />
        <AvatarFallback className="text-xs">
          {recent.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      {isExpanded && (
        <span className="text-sm font-medium whitespace-nowrap truncate max-w-36">
          {recent.name}
        </span>
      )}
    </NavLink>
  );

  if (!isExpanded) {
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          <div className="flex flex-col">
            <span>{recent.name}</span>
            <span className="text-xs text-muted-foreground">
              {recent.rarity}★{' '}
              {recent.type === 'character' ? recent.element : recent.weaponType}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 px-4 pt-4 pb-1">
    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.18em]">
      ◆ {label}
    </span>
  </div>
);

// ─── Recents Section ──────────────────────────────────────────────────────────

interface SidebarRecentsSectionProps {
  recents: RecentItem[];
  isExpanded: boolean;
  onItemClick?: () => void;
}

const SidebarRecentsSection: React.FC<SidebarRecentsSectionProps> = ({
  recents,
  isExpanded,
  onItemClick,
}) => {
  const filteredRecents = useMemo(
    () =>
      recents
        .filter(
          (r): r is RecentItem & { iconUrl: string } =>
            (r.type === 'character' || r.type === 'weapon') && !!r.iconUrl
        )
        .slice(0, 5),
    [recents]
  );

  if (filteredRecents.length === 0) return null;

  return (
    <div className="mt-1">
      <Separator className="mx-3 my-2" />
      {isExpanded && (
        <div className="flex items-center gap-2 px-5 pb-1 pt-2">
          <Clock className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Recent
          </span>
        </div>
      )}
      {filteredRecents.map((recent) => (
        <SidebarRecentItem
          key={recent.route}
          recent={recent}
          isExpanded={isExpanded}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

// ─── Pin Toggle Button ────────────────────────────────────────────────────────

const PinToggle: React.FC<{ isPinned: boolean; onToggle: () => void }> = ({
  isPinned,
  onToggle,
}) => (
  <Tooltip delayDuration={150}>
    <TooltipTrigger asChild>
      <button
        onClick={onToggle}
        className="
          flex items-center justify-center w-7 h-7 rounded-md
          text-muted-foreground hover:text-foreground
          hover:bg-accent/60 transition-all duration-200 shrink-0
        "
        aria-label={isPinned ? 'Collapse sidebar' : 'Pin sidebar open'}
      >
        {isPinned ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" className="font-medium">
      {isPinned ? 'Collapse' : 'Pin open'}
    </TooltipContent>
  </Tooltip>
);

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

interface DesktopSidebarProps {
  isRouteActive: (route: string) => boolean;
  recents: RecentItem[];
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isRouteActive,
  recents,
}) => {
  const { isPinned, togglePin } = useSidebarStore();

  return (
    <div
      className={`
        hidden md:flex flex-col fixed left-0 top-0 h-screen
        bg-background/95 backdrop-blur-sm border-r border-border/50
        transition-all duration-300 ease-in-out z-40
        ${isPinned ? 'w-60' : 'w-16'}
      `}
    >
      {/* Subtle dot-grid background pattern */}
      <div className={styles.sidebarBg} aria-hidden="true" />

      {/* Top bar with pin toggle */}
      <div
        className={`flex items-center py-3 px-3 relative z-10 ${isPinned ? 'justify-end' : 'justify-center'}`}
      >
        <TooltipProvider>
          <PinToggle isPinned={isPinned} onToggle={togglePin} />
        </TooltipProvider>
      </div>

      <Separator className="mx-3 mb-1 relative z-10" />

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        <TooltipProvider>
          {/* Version item at top */}
          <SidebarVersionItem
            isActive={isRouteActive(versionItem.route)}
            isExpanded={isPinned}
            onClick={undefined}
          />

          {navSections.map((section) => (
            <div key={section.id}>
              {isPinned && <SectionHeader label={section.label} />}
              {!isPinned && section.id !== 'navigate' && (
                <div className="my-1 mx-3">
                  <Separator />
                </div>
              )}
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.route}
                  item={item}
                  isActive={isRouteActive(item.route)}
                  isExpanded={isPinned}
                />
              ))}
            </div>
          ))}

          <SidebarRecentsSection recents={recents} isExpanded={isPinned} />
        </TooltipProvider>
      </nav>
    </div>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRouteActive: (route: string) => boolean;
  recents: RecentItem[];
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onOpenChange,
  isRouteActive,
  recents,
}) => {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <div className="relative h-full">
          <div className={styles.sidebarBg} aria-hidden="true" />
          <nav className="py-4 overflow-y-auto h-full relative z-10">
            <SidebarVersionItem
              isActive={isRouteActive(versionItem.route)}
              isExpanded={true}
              onClick={close}
            />

            {navSections.map((section) => (
              <div key={section.id}>
                <SectionHeader label={section.label} />
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.route}
                    item={item}
                    isActive={isRouteActive(item.route)}
                    isExpanded={true}
                    onClick={close}
                  />
                ))}
              </div>
            ))}

            <SidebarRecentsSection
              recents={recents}
              isExpanded={true}
              onItemClick={close}
            />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const recents = useRecents();

  const isRouteActive = (route: string) => {
    if (route === '/') return location.pathname === '/';
    return location.pathname.startsWith(route);
  };

  return (
    <>
      {!isMobile && (
        <DesktopSidebar isRouteActive={isRouteActive} recents={recents} />
      )}
      {isMobile && (
        <MobileSidebar
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isRouteActive={isRouteActive}
          recents={recents}
        />
      )}
    </>
  );
};
