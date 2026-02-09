import { memo, useMemo } from 'react';

import type { Character } from '@/types';

import { getLinkDisplayName } from '../services/gridGeneratorService';
import type { LinkType } from '../types';
import styles from './LinkerGame.module.css';

interface TargetPanelProps {
  character: Character;
  linkType: LinkType;
  linkValue: string;
  turnKey: number;
}

function getLinkIcon(character: Character, linkType: LinkType): string | null {
  switch (linkType) {
    case 'element':
      return character.elementUrl;
    case 'weaponType':
      return character.weaponUrl;
    case 'region':
      return character.regionUrl;
    case 'rarity':
    case 'versionBefore':
    case 'versionAfter':
      return null; // Use text badges for new link types
  }
}

function getLinkValueDisplay(linkType: LinkType, linkValue: string): string {
  switch (linkType) {
    case 'versionBefore':
      return `Before ${linkValue}`;
    case 'versionAfter':
      return `After ${linkValue}`;
    case 'rarity':
    case 'element':
    case 'weaponType':
    case 'region':
    default:
      return linkValue;
  }
}

export const TargetPanel = memo(function TargetPanel({
  character,
  linkType,
  linkValue,
  turnKey,
}: TargetPanelProps) {
  const linkDisplayName = useMemo(
    () => getLinkDisplayName(linkType),
    [linkType]
  );
  const linkIcon = useMemo(
    () => getLinkIcon(character, linkType),
    [character, linkType]
  );

  const linkValueDisplay = useMemo(
    () => getLinkValueDisplay(linkType, linkValue),
    [linkType, linkValue]
  );

  const badgeClass = useMemo(() => {
    const baseClass = styles.linkBadge;
    switch (linkType) {
      case 'element':
        return `${baseClass} ${styles.linkBadgeElement}`;
      case 'weaponType':
        return `${baseClass} ${styles.linkBadgeWeapon}`;
      case 'region':
        return `${baseClass} ${styles.linkBadgeRegion}`;
      case 'rarity':
        return `${baseClass} ${styles.linkBadgeRarity}`;
      case 'versionBefore':
      case 'versionAfter':
        return `${baseClass} ${styles.linkBadgeVersion}`;
    }
  }, [linkType]);

  return (
    <div className={styles.targetPanel} key={turnKey}>
      <h2 className={styles.targetTitle}>Find the Link</h2>

      <div className={styles.targetCharacterContainer}>
        <img
          src={character.iconUrl}
          alt={character.name}
          className={styles.targetCharacterIcon}
          draggable={false}
        />
      </div>

      <span className={styles.targetCharacterName}>{character.name}</span>

      <div className={styles.linkSection}>
        <span className={styles.linkLabel}>Match by:</span>
        <div className={badgeClass}>
          {linkIcon && (
            <img
              src={linkIcon}
              alt={linkDisplayName}
              className={styles.linkBadgeIcon}
            />
          )}
          <span className={styles.linkBadgeText}>{linkValueDisplay}</span>
        </div>
      </div>
    </div>
  );
});
