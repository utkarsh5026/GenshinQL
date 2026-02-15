import { Frown, Search, X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ListSplitter } from '@/components/utils';
import { CachedImage } from '@/features/cache';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';

import type { WeaponSummary } from '../../types';
import { getRarityColor, getRarityHexColor } from '../../utils';
import { parseSubstat } from '../../utils/substat-utils';
import styles from './WeaponsTable.module.css';

interface WeaponsDetailedGridProps {
  weapons: WeaponSummary[];
  selectedRarity: number | null;
  onRarityChange: (rarity: number | null) => void;
}

interface WeaponRowProps {
  weapon: WeaponSummary;
  index: number;
  isMounted: boolean;
}

const WeaponRow: React.FC<WeaponRowProps> = ({ weapon, index, isMounted }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const isVisible = useSharedIntersectionObserver(rowRef, {
    rootMargin: '80px',
    threshold: 0.1,
  });

  const { name, iconUrl, rarity, attack, subStat, effect } = weapon;

  const rarityColors = useMemo(() => getRarityColor(rarity), [rarity]);
  const rarityHex = useMemo(() => getRarityHexColor(rarity), [rarity]);
  const parsedSubstat = useMemo(() => parseSubstat(subStat), [subStat]);
  const staggerDelay = isMounted ? Math.min(index * 0.04, 0.6) : 0;

  const stars = useMemo(
    () => Array.from({ length: rarity }).map((_, i) => <span key={i}>★</span>),
    [rarity]
  );

  return (
    <Link to={`/weapons/${name}`} className="block no-underline">
      <div ref={rowRef}>
        <div
          className={`${styles.rowFadeIn} ${isVisible ? styles.visible : ''}`}
          style={{ animationDelay: `${staggerDelay}s` }}
        >
          <div
            className={`
              rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm
              ${styles.rowHover}

            `}
          >
            {/* Desktop: side-by-side · Mobile: stacked */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-3 sm:p-4">
              {/* ── LEFT: Weapon info ──────────────────────────── */}
              <div className="flex items-center gap-3 sm:gap-4 md:w-85 lg:w-100 shrink-0">
                {/* Icon */}
                <CachedImage
                  src={iconUrl}
                  alt={name}
                  showSkeleton
                  skeletonShape="rounded"
                  className={`h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-white/5 ${rarityColors.avatarBorder} border-2 shrink-0`}
                />

                {/* Name + rarity + stats */}
                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold text-sm sm:text-base leading-snug truncate">
                    {name}
                  </h3>

                  <div
                    className="text-xs tracking-wide"
                    style={{ color: rarityHex }}
                  >
                    {stars}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      ATK{' '}
                      <span className="font-semibold text-foreground">
                        {attack}
                      </span>
                    </span>

                    {parsedSubstat.type !== 'None' && (
                      <span className={parsedSubstat.colors.text}>
                        {parsedSubstat.type}{' '}
                        <span className="font-semibold">
                          {parsedSubstat.value}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Divider (mobile only) ──────────────────────── */}
              <div className="border-t border-border/30 md:hidden" />

              <div className="flex-1 min-w-0">
                <ListSplitter text={effect} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const MemoizedWeaponRow = React.memo(WeaponRow, (prev, next) => {
  return prev.weapon.name === next.weapon.name && prev.index === next.index;
});

const WeaponsDetailedGrid: React.FC<WeaponsDetailedGridProps> = ({
  weapons,
  selectedRarity,
  onRarityChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClearFilters = () => {
    setSearchTerm('');
    onRarityChange(null);
  };

  const handleRemoveRarityFilter = () => {
    onRarityChange(null);
  };

  const filteredWeapons = weapons
    .filter((weapon) =>
      selectedRarity ? weapon.rarity === selectedRarity : true
    )
    .filter((weapon) =>
      weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const hasActiveFilters = searchTerm !== '' || selectedRarity !== null;

  return (
    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
      {/* Search Bar - Primary Action */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-3xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search weapons by name..."
            className="w-full px-4 py-3 sm:py-3.5 pl-11 sm:pl-12 pr-10 text-base rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm hover:shadow-md"
          />
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="text-sm text-muted-foreground font-medium">
              Active:
            </span>

            {/* Search Term Chip */}
            {searchTerm && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                <Search className="h-3.5 w-3.5" />
                <span className="font-medium max-w-37.5 truncate">
                  "{searchTerm}"
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label="Remove search filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Rarity Chip */}
            {selectedRarity !== null &&
              (() => {
                const colors = getRarityColor(selectedRarity);
                return (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${colors.background} ${colors.text}`}
                  >
                    <span className="font-medium">
                      {selectedRarity}★ Rarity
                    </span>
                    <button
                      onClick={handleRemoveRarityFilter}
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                      aria-label="Remove rarity filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })()}
          </div>

          {/* Results Counter & Clear All */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">
              {filteredWeapons.length} weapon
              {filteredWeapons.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearFilters}
              className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1 hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Weapons Table */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {filteredWeapons.length > 0 ? (
          filteredWeapons.map((weapon, index) => (
            <MemoizedWeaponRow
              key={weapon.name}
              weapon={weapon}
              index={index}
              isMounted={true}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="relative mb-6">
              <Frown
                className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground/30"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl font-semibold mb-2">
              No weapons found
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              Try adjusting your search term or filters to find what you're
              looking for
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponsDetailedGrid;
