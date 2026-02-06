import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CachedImage } from '@/components/utils/CachedImage';
import { getRarityHexColor } from '@/components/weapons/utils/color-map';
import { useWeapons } from '@/stores/useWeaponsStore';

interface WeaponNavigationProps {
  currentWeaponName: string;
}

/**
 * Navigation component for switching between weapons with Prev/Next buttons
 * Supports keyboard navigation with Arrow Left/Right keys
 */
const WeaponNavigation: React.FC<WeaponNavigationProps> = ({
  currentWeaponName,
}) => {
  const navigate = useNavigate();
  const weapons = useWeapons();

  const sortedWeapons = useMemo(() => {
    return [...weapons].sort((a, b) => a.name.localeCompare(b.name));
  }, [weapons]);

  const currentIndex = useMemo(() => {
    return sortedWeapons.findIndex(
      (w) => w.name.toLowerCase() === currentWeaponName.toLowerCase()
    );
  }, [sortedWeapons, currentWeaponName]);

  const prevWeapon = currentIndex > 0 ? sortedWeapons[currentIndex - 1] : null;
  const nextWeapon =
    currentIndex < sortedWeapons.length - 1
      ? sortedWeapons[currentIndex + 1]
      : null;

  const navigateToWeapon = useCallback(
    (weaponName: string) => {
      navigate(`/weapons/${weaponName}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevWeapon) {
        e.preventDefault();
        navigateToWeapon(prevWeapon.name);
      } else if (e.key === 'ArrowRight' && nextWeapon) {
        e.preventDefault();
        navigateToWeapon(nextWeapon.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevWeapon, nextWeapon, navigateToWeapon]);

  if (sortedWeapons.length === 0) return null;

  const prevRarityColor = prevWeapon
    ? getRarityHexColor(prevWeapon.rarity)
    : undefined;
  const nextRarityColor = nextWeapon
    ? getRarityHexColor(nextWeapon.rarity)
    : undefined;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-4 w-full mb-4">
        {/* Previous Weapon Button */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => prevWeapon && navigateToWeapon(prevWeapon.name)}
              disabled={!prevWeapon}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${
                  prevWeapon
                    ? 'bg-midnight-800/50 hover:bg-midnight-700/60 border border-midnight-600/40 hover:border-opacity-60 cursor-pointer'
                    : 'bg-midnight-800/20 border border-midnight-700/20 cursor-not-allowed opacity-40'
                }
              `}
              style={
                prevWeapon ? { borderColor: `${prevRarityColor}30` } : undefined
              }
            >
              <ChevronLeft className="w-4 h-4 text-starlight-400" />
              {prevWeapon && (
                <>
                  <Avatar className="w-6 h-6 border border-midnight-600/40">
                    <CachedImage
                      lazy
                      src={prevWeapon.iconUrl}
                      alt={prevWeapon.name}
                      className="w-full h-full object-cover rounded-full"
                      skeletonSize="sm"
                      skeletonShape="circle"
                    />
                  </Avatar>
                  <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                    {prevWeapon.name}
                  </span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {prevWeapon ? (
              <div className="flex items-center gap-2">
                <span>Previous: {prevWeapon.name}</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-midnight-700 rounded">
                  ←
                </kbd>
              </div>
            ) : (
              'No previous weapon'
            )}
          </TooltipContent>
        </Tooltip>

        {/* Weapon Counter */}
        <div className="text-xs text-starlight-500 font-medium">
          {currentIndex + 1} / {sortedWeapons.length}
        </div>

        {/* Next Weapon Button */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => nextWeapon && navigateToWeapon(nextWeapon.name)}
              disabled={!nextWeapon}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200
                ${
                  nextWeapon
                    ? 'bg-midnight-800/50 hover:bg-midnight-700/60 border border-midnight-600/40 hover:border-opacity-60 cursor-pointer'
                    : 'bg-midnight-800/20 border border-midnight-700/20 cursor-not-allowed opacity-40'
                }
              `}
              style={
                nextWeapon ? { borderColor: `${nextRarityColor}30` } : undefined
              }
            >
              {nextWeapon && (
                <>
                  <span className="text-sm text-starlight-300 hidden sm:inline max-w-[100px] truncate">
                    {nextWeapon.name}
                  </span>
                  <Avatar className="w-6 h-6 border border-midnight-600/40">
                    <CachedImage
                      lazy
                      src={nextWeapon.iconUrl}
                      alt={nextWeapon.name}
                      className="w-full h-full object-cover rounded-full"
                      skeletonSize="sm"
                      skeletonShape="circle"
                    />
                  </Avatar>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-starlight-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {nextWeapon ? (
              <div className="flex items-center gap-2">
                <span>Next: {nextWeapon.name}</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-midnight-700 rounded">
                  →
                </kbd>
              </div>
            ) : (
              'No next weapon'
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default WeaponNavigation;
