import {
  Calendar,
  Gamepad2,
  Grid3x3,
  Sparkles,
  Star,
  Swords,
  Target,
  Users,
} from 'lucide-react';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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
    route: '/talents',
    label: 'Talents Calendar',
    icon: Calendar,
    color: 'pink',
    iconColor: '#ec4899', // pink-500
  },
  {
    route: '/characters/table',
    label: 'Characters',
    icon: Users,
    color: 'blue',
    iconColor: '#3b82f6', // blue-500
  },
  {
    route: '/characters/routine',
    label: 'Characters Routine',
    icon: Target,
    color: 'purple',
    iconColor: '#a855f7', // purple-500
  },
  {
    route: '/weapons/calendar',
    label: 'Weapons Calendar',
    icon: Calendar,
    color: 'amber',
    iconColor: '#f59e0b', // amber-500
  },
  {
    route: '/weapons/grid',
    label: 'Weapons Detailed',
    icon: Swords,
    color: 'orange',
    iconColor: '#f97316', // orange-500
  },
  {
    route: '/tierlist',
    label: 'Tier List',
    icon: Star,
    color: 'emerald',
    iconColor: '#10b981', // emerald-500
  },
  {
    route: '/guesser',
    label: 'Genshin Guesser',
    icon: Gamepad2,
    color: 'violet',
    iconColor: '#8b5cf6', // violet-500
  },
  {
    route: '/memory-game',
    label: 'Memory Game',
    icon: Grid3x3,
    color: 'cyan',
    iconColor: '#06b6d4', // cyan-500
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

interface DesktopSidebarProps {
  isRouteActive: (route: string) => boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isRouteActive }) => {
  return (
    <div
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen
                 bg-background/95 backdrop-blur-sm border-r border-border/50
                 w-16 hover:w-60 transition-all duration-300 ease-in-out z-40 group"
    >
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border/50">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-genshin-gold" />
        </div>
        <span className="font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          GenshinQL
        </span>
      </div>

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
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onOpenChange,
  isRouteActive,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
          <Sparkles className="w-6 h-6 text-genshin-gold" />
          <span className="font-bold text-lg">GenshinQL</span>
        </div>

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

  const isRouteActive = (route: string) => {
    if (route === '/talents') {
      return location.pathname === '/' || location.pathname === '/talents';
    }
    return location.pathname.startsWith(route);
  };

  return (
    <>
      {!isMobile && <DesktopSidebar isRouteActive={isRouteActive} />}
      {isMobile && (
        <MobileSidebar
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isRouteActive={isRouteActive}
        />
      )}
    </>
  );
};
