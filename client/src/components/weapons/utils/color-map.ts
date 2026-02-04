export const rarityColorMap: Record<
  number,
  {
    border: string;
    text: string;
    divider: string;
    avatarBorder: string;
    background: string;
  }
> = {
  5: {
    border: 'border-legendary-600/30',
    text: 'text-legendary-500',
    divider: 'border-legendary-600/20',
    avatarBorder: 'border-legendary-500',
    background: 'bg-legendary-500/10',
  },
  4: {
    border: 'border-epic-600/30',
    text: 'text-epic-500',
    divider: 'border-epic-600/20',
    avatarBorder: 'border-epic-500',
    background: 'bg-epic-500/10',
  },
  3: {
    border: 'border-rare-600/30',
    text: 'text-rare-500',
    divider: 'border-rare-600/20',
    avatarBorder: 'border-rare-500',
    background: 'bg-rare-500/10',
  },
  2: {
    border: 'border-uncommon-600/30',
    text: 'text-uncommon-500',
    divider: 'border-uncommon-600/20',
    avatarBorder: 'border-uncommon-500',
    background: 'bg-uncommon-500/10',
  },
  1: {
    border: 'border-common-600/30',
    text: 'text-common-500',
    divider: 'border-common-600/20',
    avatarBorder: 'border-common-500',
    background: 'bg-common-500/10',
  },
} as const;

export function getRarityColor(rarity: number) {
  return rarityColorMap[rarity];
}
