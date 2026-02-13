const ELEMENT_BG_MAP: Record<string, string> = {
  pyro: 'bg-pyro-900/30',
  hydro: 'bg-hydro-900/30',
  anemo: 'bg-anemo-900/30',
  electro: 'bg-electro-900/30',
  cryo: 'bg-cryo-900/30',
  geo: 'bg-geo-900/30',
  dendro: 'bg-dendro-900/30',
};

const ELEMENT_TEXT_MAP: Record<string, string> = {
  pyro: 'text-pyro-300',
  hydro: 'text-hydro-300',
  anemo: 'text-anemo-300',
  electro: 'text-electro-300',
  cryo: 'text-cryo-300',
  geo: 'text-geo-300',
  dendro: 'text-dendro-300',
};

const ELEMENT_BORDER_MAP: Record<string, string> = {
  pyro: 'border-pyro-500/40',
  hydro: 'border-hydro-500/40',
  anemo: 'border-anemo-500/40',
  electro: 'border-electro-500/40',
  cryo: 'border-cryo-500/40',
  geo: 'border-geo-500/40',
  dendro: 'border-dendro-500/40',
};

const ELEMENT_BADGE_MAP: Record<string, string> = {
  pyro: 'bg-pyro-900/50 text-pyro-200 border-pyro-500/30',
  hydro: 'bg-hydro-900/50 text-hydro-200 border-hydro-500/30',
  anemo: 'bg-anemo-900/50 text-anemo-200 border-anemo-500/30',
  electro: 'bg-electro-900/50 text-electro-200 border-electro-500/30',
  cryo: 'bg-cryo-900/50 text-cryo-200 border-cryo-500/30',
  geo: 'bg-geo-900/50 text-geo-200 border-geo-500/30',
  dendro: 'bg-dendro-900/50 text-dendro-200 border-dendro-500/30',
};

export function getElementBgClass(element?: string): string {
  if (!element) return 'bg-midnight-900/30';
  return ELEMENT_BG_MAP[element.toLowerCase()] || 'bg-midnight-900/30';
}

export function getElementTextClass(element?: string): string {
  if (!element) return 'text-muted-foreground';
  return ELEMENT_TEXT_MAP[element.toLowerCase()] || 'text-muted-foreground';
}

export function getElementBorderClass(element?: string): string {
  if (!element) return 'border-midnight-500/40';
  return ELEMENT_BORDER_MAP[element.toLowerCase()] || 'border-midnight-500/40';
}

export function getElementBadgeClass(element?: string): string {
  if (!element)
    return 'bg-midnight-900/50 text-midnight-200 border-midnight-500/30';
  return (
    ELEMENT_BADGE_MAP[element.toLowerCase()] ||
    'bg-midnight-900/50 text-midnight-200 border-midnight-500/30'
  );
}

export function getRarityBorderClass(rarity?: string | number): string {
  const r = typeof rarity === 'number' ? rarity : parseInt(String(rarity));
  if (r === 5 || String(rarity) === '5-Star') return 'border-legendary-500/50';
  if (r === 4 || String(rarity) === '4-Star') return 'border-epic-500/50';
  return 'border-rare-500/50';
}

export function getRarityTextClass(rarity?: string | number): string {
  const r = typeof rarity === 'number' ? rarity : parseInt(String(rarity));
  if (r === 5 || String(rarity) === '5-Star') return 'text-legendary-400';
  if (r === 4 || String(rarity) === '4-Star') return 'text-epic-400';
  return 'text-rare-400';
}

export function getRarityBgClass(rarity?: string | number): string {
  const r = typeof rarity === 'number' ? rarity : parseInt(String(rarity));
  if (r === 5 || String(rarity) === '5-Star') return 'bg-legendary-900/30';
  if (r === 4 || String(rarity) === '4-Star') return 'bg-epic-900/30';
  return 'bg-rare-900/30';
}

export function stripSoftHyphens(text: string): string {
  return text.replace(/\u00AD/g, '');
}
