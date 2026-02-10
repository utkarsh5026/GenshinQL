import { ChevronDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CachedImage } from '@/features/cache';
import { useWeaponTypes } from '@/stores/usePrimitivesStore';

import type { WeaponSummary } from '../../types';
import WeaponShowcaseFilters from '../filters/WeaponShowcaseFilters';
import LazyWeaponAvatar from './card/lazy-weapon-avatar';

interface WeaponShowCaseProps {
  weapons: WeaponSummary[];
  enableFilters?: boolean;
  enableCollapsible?: boolean;
  enableNavigation?: boolean;
  defaultExpanded?: boolean;
}

/**
 * WeaponShowCase component displays weapons grouped by type
 * with optional filtering, collapsible sections, and navigation
 */
const WeaponShowCase: React.FC<WeaponShowCaseProps> = ({
  weapons,
  enableFilters = true,
  enableCollapsible = true,
  enableNavigation = false,
  defaultExpanded = true,
}) => {
  const weaponTypes = useWeaponTypes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarities, setSelectedRarities] = useState<number[]>([]);
  const [allExpanded, setAllExpanded] = useState(defaultExpanded);

  // Create weapon type icon map
  const weaponTypeIcons = useMemo(() => {
    const iconMap: Record<string, string> = {};
    weaponTypes.forEach((wType) => {
      iconMap[wType.name] = wType.url;
    });
    return iconMap;
  }, [weaponTypes]);

  // Filter weapons based on search and rarity
  const filteredWeapons = useMemo(() => {
    return weapons.filter((weapon) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        weapon.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity =
        selectedRarities.length === 0 ||
        selectedRarities.includes(weapon.rarity);
      return matchesSearch && matchesRarity;
    });
  }, [weapons, searchQuery, selectedRarities]);

  // Group filtered weapons by type
  const weaponMap = useMemo(() => {
    const wepTypeMap: Record<string, WeaponSummary[]> = {};

    for (const weapon of filteredWeapons) {
      if (!wepTypeMap[weapon.weaponType]) {
        wepTypeMap[weapon.weaponType] = [];
      }
      wepTypeMap[weapon.weaponType].push(weapon);
    }

    // Sort weapons by rarity for each weapon weaponType
    for (const weaponType in wepTypeMap) {
      wepTypeMap[weaponType].sort((a, b) => a.rarity - b.rarity);
    }

    return wepTypeMap;
  }, [filteredWeapons]);

  const weaponTypeKeys = Object.keys(weaponMap);

  const handleToggleRarity = (rarity: number) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleClearAll = () => {
    setSelectedRarities([]);
    setSearchQuery('');
  };

  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
  };

  return (
    <div>
      {/* Filters */}
      {enableFilters && (
        <WeaponShowcaseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRarities={selectedRarities}
          onToggleRarity={handleToggleRarity}
          onClearAll={handleClearAll}
        />
      )}

      {/* Navigation */}
      {enableNavigation && weaponTypeKeys.length > 0 && (
        <WeaponTypeNav
          types={weaponTypeKeys}
          weaponTypeIcons={weaponTypeIcons}
        />
      )}

      {/* Expand/Collapse All Button */}
      {enableCollapsible && weaponTypeKeys.length > 1 && (
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpandCollapseAll}
            className="text-xs"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      )}

      {/* Weapon Sections */}
      <div>
        {weaponTypeKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No weapons found matching your filters.
          </div>
        ) : (
          weaponTypeKeys.map((type) => {
            if (enableCollapsible) {
              return (
                <CollapsibleWeaponSection
                  key={`${type}-${allExpanded}`}
                  type={type}
                  weapons={weaponMap[type]}
                  defaultOpen={allExpanded}
                  weaponTypeIconUrl={weaponTypeIcons[type]}
                />
              );
            }

            // Non-collapsible fallback (backward compatible)
            return (
              <div key={type} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {weaponTypeIcons[type] && (
                    <CachedImage
                      src={weaponTypeIcons[type]}
                      alt={type}
                      className="h-5 w-5"
                    />
                  )}
                  <h3
                    className="text-lg font-semibold text-foreground"
                    id={`weapon-type-${type}`}
                  >
                    {type}
                  </h3>
                </div>
                <div className="grid grid-cols-0 gap-2 sm:grid-cols-3">
                  {weaponMap[type].map((weapon) => (
                    <LazyWeaponAvatar key={weapon.name} weapon={weapon} />
                  ))}
                </div>
                <hr className="my-4 border-border dark:border-celestial-900/50" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface CollapsibleWeaponSectionProps {
  type: string;
  weapons: WeaponSummary[];
  defaultOpen?: boolean;
  weaponTypeIconUrl?: string;
}

/**
 * CollapsibleWeaponSection component displays weapons grouped by type
 * with expand/collapse functionality
 */
const CollapsibleWeaponSection: React.FC<CollapsibleWeaponSectionProps> = ({
  type,
  weapons,
  defaultOpen = true,
  weaponTypeIconUrl,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-4">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md p-2 hover:bg-accent/50 dark:hover:bg-accent transition-colors">
          <div className="flex items-center gap-2">
            {weaponTypeIconUrl && (
              <CachedImage
                src={weaponTypeIconUrl}
                alt={type}
                className="h-6 w-6 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            )}
            <h6
              className="text-sm font-medium text-foreground/90 group-hover:text-foreground"
              id={`weapon-type-${type}`}
            >
              {type}
            </h6>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 grid grid-cols-0 gap-2 sm:grid-cols-3">
            {weapons.map((weapon) => (
              <LazyWeaponAvatar key={weapon.name} weapon={weapon} />
            ))}
          </div>
        </CollapsibleContent>
        {!isOpen && (
          <hr className="my-2 border-border dark:border-celestial-900/50" />
        )}
      </div>
    </Collapsible>
  );
};

interface WeaponTypeNavProps {
  types: string[];
  weaponTypeIcons?: Record<string, string>;
}

/**
 * WeaponTypeNav component provides sticky quick-jump navigation
 * for weapon type sections
 */
const WeaponTypeNav: React.FC<WeaponTypeNavProps> = ({
  types,
  weaponTypeIcons,
}) => {
  const scrollToType = (type: string) => {
    const element = document.getElementById(`weapon-type-${type}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 dark:bg-surface-100/95 backdrop-blur-sm border-b border-border dark:border-celestial-900/50 shadow-sm">
      <div className="flex gap-2 overflow-x-auto p-2">
        {types.map((type) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => scrollToType(type)}
            className="shrink-0 gap-2 border-border dark:border-celestial-900/50 hover:bg-accent/50 dark:hover:bg-accent hover:border-primary/50 transition-all"
          >
            {weaponTypeIcons?.[type] && (
              <CachedImage
                src={weaponTypeIcons[type]}
                alt={type}
                className="h-4 w-4"
              />
            )}
            <span className="text-foreground/80 hover:text-foreground">
              {type}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WeaponShowCase;
