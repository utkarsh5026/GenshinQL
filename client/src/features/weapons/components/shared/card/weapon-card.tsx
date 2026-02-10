import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import { ListSplitter } from '@/components/utils';
import { AbilityTag } from '@/components/utils/AbilityTag';
import { CachedImage } from '@/features/cache';
import { WeaponSummary } from '@/features/weapons/types';
import { useSharedIntersectionObserver } from '@/hooks/useSharedIntersectionObserver';
import { extractConstellationTags } from '@/lib/constellationTags';

import {
  getRarityColor,
  getRarityHexColor,
  SubstatIcon,
  TierIcon,
} from '../../../utils';
import { getWeaponTier, parseSubstat } from '../../../utils/substat-utils';
import styles from './WeaponCard.module.css';

interface WeaponCardProps {
  weapon: WeaponSummary;
  index?: number;
  isMounted?: boolean;
}

/**
 * WeaponCard component - Clean dark design with smoky effect
 * Fully clickable card with weapon details and passive effect
 */
const WeaponCard: React.FC<WeaponCardProps> = ({
  weapon,
  index = 0,
  isMounted = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useSharedIntersectionObserver(cardRef, {
    rootMargin: '100px',
    threshold: 0.1,
  });

  const { name, iconUrl, rarity, effect, attack, subStat, weaponType } = weapon;
  const rarityColors = useMemo(() => getRarityColor(rarity), [rarity]);
  const rarityHex = useMemo(() => getRarityHexColor(rarity), [rarity]);
  const staggerDelay = isMounted ? Math.min(index * 0.05, 0.8) : 0;

  const stars = useMemo(
    () => Array.from({ length: rarity }).map((_, i) => <span key={i}>★</span>),
    [rarity]
  );

  const parsedSubstat = useMemo(() => parseSubstat(subStat), [subStat]);
  const weaponTier = useMemo(() => getWeaponTier(attack), [attack]);
  const passiveTags = useMemo(() => extractConstellationTags(effect), [effect]);

  return (
    <Link to={`/weapons/${name}`} className="block no-underline group h-full">
      <div ref={cardRef} className="max-h-96 overflow-hidden">
        <div
          className={`h-full dark:bg-card/50 ${styles.cardFadeIn} ${isVisible ? styles.visible : ''}`}
          style={{ animationDelay: `${staggerDelay}s` }}
        >
          <div
            className={`relative overflow-hidden rounded-xl h-full flex flex-col ${styles.cardHover}`}
          >
            <div className="p-5 pl-6">
              <div className="flex gap-4 items-start">
                <div className="relative shrink-0">
                  <CachedImage
                    src={iconUrl}
                    alt={name}
                    showSkeleton={true}
                    skeletonShape="rounded"
                    className={`h-18 w-18 rounded-lg bg-white/5 ${rarityColors.avatarBorder} border`}
                  />
                  {/* Weapon type pill */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wide bg-black/60 backdrop-blur-sm text-white/60 whitespace-nowrap">
                    {weaponType}
                  </div>
                </div>

                {/* Weapon Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Name */}
                  <h3 className="font-semibold text-base text-white/90 leading-tight mb-1 line-clamp-2 group-hover:text-white transition-colors">
                    {name}
                  </h3>

                  {/* Stars */}
                  <div
                    className="text-sm tracking-wide mb-2.5"
                    style={{ color: rarityHex }}
                  >
                    {stars}
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-4 text-sm items-start">
                    {/* ATK Stat */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-white/35 block">
                        ATK
                      </span>
                      <span className="font-semibold text-white/85">
                        {attack}
                      </span>
                    </div>

                    {/* Substat with icon and name */}
                    {parsedSubstat.type !== 'None' && (
                      <div>
                        <span
                          className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${parsedSubstat.colors.text}`}
                        >
                          <SubstatIcon
                            type={parsedSubstat.type}
                            size={10}
                            className="shrink-0 opacity-70"
                          />
                          {parsedSubstat.type}
                        </span>
                        <span
                          className={`font-semibold ${parsedSubstat.colors.text}`}
                        >
                          {parsedSubstat.value}
                        </span>
                      </div>
                    )}

                    {/* Weapon Tier Badge */}
                    <div
                      className="ml-auto px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide bg-white/5 text-white/50 flex items-center gap-1"
                      title={weaponTier.description}
                    >
                      <TierIcon
                        tier={weaponTier.tier}
                        size={10}
                        className="shrink-0 opacity-70"
                      />
                      {weaponTier.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passive Effect - same bg, just subtle separator */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">
                  Passive
                </p>
                {/* Ability Tags */}
                {passiveTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {passiveTags.slice(0, 4).map((tagId) => (
                      <AbilityTag key={tagId} tagId={tagId} size="xs" />
                    ))}
                  </div>
                )}
                <p className="text-[13px] text-white/50 leading-relaxed line-clamp-2 group-hover:text-white/60 transition-colors">
                  <ListSplitter text={effect} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(WeaponCard, (prevProps, nextProps) => {
  return (
    prevProps.weapon.name === nextProps.weapon.name &&
    prevProps.index === nextProps.index
  );
});
