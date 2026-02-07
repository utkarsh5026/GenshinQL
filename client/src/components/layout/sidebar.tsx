import {
  Calendar,
  Clock,
  Gamepad2,
  Grid3x3,
  Home,
  Link2,
  Star,
  Swords,
  Target,
  Users,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import type { RecentItem } from '@/components/global-search/hooks/types';
import { useRecents } from '@/components/global-search/hooks/use-recents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  route: string;
  label: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
}

const navItems: NavItem[] = [
  {
    route: '/',
    label: 'Home',
    icon: Home,
    color: 'celestial',
    iconColor: 'oklch(75% 0.15 85)', // celestial-500
  },
  {
    route: '/talents',
    label: 'Talents Calendar',
    icon: Calendar,
    color: 'pyro',
    iconColor: 'oklch(60% 0.24 25)', // pyro-500
  },
  {
    route: '/characters/table',
    label: 'Characters',
    icon: Users,
    color: 'hydro',
    iconColor: 'oklch(58% 0.19 250)', // hydro-500
  },
  {
    route: '/characters/routine',
    label: 'Characters Routine',
    icon: Target,
    color: 'electro',
    iconColor: 'oklch(60% 0.24 300)', // electro-500
  },
  {
    route: '/weapons/calendar',
    label: 'Weapons Calendar',
    icon: Calendar,
    color: 'geo',
    iconColor: 'oklch(62% 0.18 80)', // geo-500
  },
  {
    route: '/weapons/grid',
    label: 'Weapons Detailed',
    icon: Swords,
    color: 'legendary',
    iconColor: 'oklch(75% 0.16 85)', // legendary-500
  },
  {
    route: '/tierlist',
    label: 'Tier List',
    icon: Star,
    color: 'dendro',
    iconColor: 'oklch(58% 0.19 145)', // dendro-500
  },
  {
    route: '/guesser',
    label: 'Genshin Guesser',
    icon: Gamepad2,
    color: 'anemo',
    iconColor: 'oklch(65% 0.17 195)', // anemo-500
  },
  {
    route: '/memory-game',
    label: 'Memory Game',
    icon: Grid3x3,
    color: 'cryo',
    iconColor: 'oklch(65% 0.14 240)', // cryo-500
  },
  {
    route: '/linker-game',
    label: 'Linker Game',
    icon: Link2,
    color: 'epic',
    iconColor: 'oklch(60% 0.24 290)', // epic-500
  },
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  showLabel: boolean;
  showLabelOnHover?: boolean;
  showTooltip: boolean;
  onClick?: () => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
  item,
  isActive,
  showLabel,
  showLabelOnHover = false,
  showTooltip,
  onClick,
}) => {
  const Icon = item.icon;

  const navContent = (
    <NavLink
      to={item.route}
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        px-3 py-2.5 rounded-lg mx-2 my-1
        transition-all duration-200
        group cursor-pointer
        ${isActive ? '' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}
      `}
      style={{
        backgroundColor: isActive ? `${item.iconColor}33` : undefined,
        color: isActive ? item.iconColor : undefined,
      }}
    >
      <Icon
        className="w-5 h-5 shrink-0 transition-colors"
        style={{ color: isActive ? item.iconColor : undefined }}
      />
      {(showLabel || showLabelOnHover) && (
        <span
          className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
            showLabelOnHover ? 'opacity-0' : ''
          }`}
        >
          {item.label}
        </span>
      )}
    </NavLink>
  );

  if (showTooltip && !showLabel) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{navContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return navContent;
};

interface RecentItemComponentProps {
  recent: RecentItem;
  showLabel: boolean;
  showLabelOnHover?: boolean;
  showTooltip: boolean;
  onClick?: () => void;
}

const RecentItemComponent: React.FC<RecentItemComponentProps> = ({
  recent,
  showLabel,
  showLabelOnHover = false,
  showTooltip,
  onClick,
}) => {
  const getRarityRingClass = (rarity: number): string => {
    const ringMap: Record<number, string> = {
      5: 'ring-2 ring-amber-500/60',
      4: 'ring-2 ring-violet-500/60',
      3: 'ring-1 ring-blue-500/50',
      2: 'ring-1 ring-green-500/50',
      1: 'ring-1 ring-gray-400/40',
    };
    return ringMap[rarity] || ringMap[3];
  };

  const content = (
    <NavLink
      to={recent.route}
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        px-3 py-2 rounded-lg mx-2 my-0.5
        transition-all duration-200
        group/recent cursor-pointer
        hover:bg-accent/50 text-muted-foreground hover:text-foreground
      `}
    >
      <Avatar
        className={`w-7 h-7 shrink-0 ${getRarityRingClass(recent.rarity || 4)}`}
      >
        <AvatarImage src={recent.iconUrl} alt={recent.name} />
        <AvatarFallback className="text-xs">
          {recent.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      {(showLabel || showLabelOnHover) && (
        <span
          className={`text-sm font-medium whitespace-nowrap truncate max-w-[140px] transition-opacity duration-300 ${
            showLabelOnHover ? 'opacity-0' : ''
          }`}
        >
          {recent.name}
        </span>
      )}
    </NavLink>
  );

  if (showTooltip && !showLabel) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
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

  return content;
};

interface RecentSearchesSectionProps {
  recents: RecentItem[];
  showLabel: boolean;
  showLabelOnHover?: boolean;
  showTooltip: boolean;
  onItemClick?: () => void;
}

const RecentSearchesSection: React.FC<RecentSearchesSectionProps> = ({
  recents,
  showLabel,
  showLabelOnHover = false,
  showTooltip,
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

  if (filteredRecents.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <Separator className="mx-3 my-2" />

      {showLabel && (
        <div className="flex items-center gap-2 px-5 py-1 text-xs text-muted-foreground uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          <span>Recent</span>
        </div>
      )}
      {showLabelOnHover && (
        <div className="flex items-center gap-2 px-5 py-1 text-xs text-muted-foreground uppercase tracking-wider opacity-0 transition-opacity duration-300">
          <Clock className="w-3 h-3" />
          <span>Recent</span>
        </div>
      )}

      {filteredRecents.map((recent) => (
        <RecentItemComponent
          key={recent.route}
          recent={recent}
          showLabel={showLabel}
          showLabelOnHover={showLabelOnHover}
          showTooltip={showTooltip}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

interface DesktopSidebarProps {
  isRouteActive: (route: string) => boolean;
  recents: RecentItem[];
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isRouteActive,
  recents,
}) => {
  return (
    <div
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen
                 bg-background/95 backdrop-blur-sm border-r border-border/50
                 w-16 hover:w-60 transition-all duration-300 ease-in-out z-40 group"
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <TooltipProvider>
          {navItems.map((item) => (
            <NavItemComponent
              key={item.route}
              item={item}
              isActive={isRouteActive(item.route)}
              showLabel={false}
              showLabelOnHover={true}
              showTooltip={true}
            />
          ))}

          <RecentSearchesSection
            recents={recents}
            showLabel={false}
            showLabelOnHover={true}
            showTooltip={true}
          />
        </TooltipProvider>
      </nav>

      {/* Labels shown on hover */}
      <style>{`
        .group:hover .opacity-0 {
          opacity: 1 !important;
        }
      `}</style>
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
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        {/* Navigation Items */}
        <nav className="py-4">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.route}
              item={item}
              isActive={isRouteActive(item.route)}
              showLabel={true}
              showTooltip={false}
              onClick={() => onOpenChange(false)}
            />
          ))}

          <RecentSearchesSection
            recents={recents}
            showLabel={true}
            showTooltip={false}
            onItemClick={() => onOpenChange(false)}
          />
        </nav>
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
  const { recents } = useRecents();

  const isRouteActive = (route: string) => {
    if (route === '/') {
      return location.pathname === '/';
    }
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
