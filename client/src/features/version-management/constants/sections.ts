export const SECTIONS = [
  { id: 'characters', label: 'New Characters' },
  { id: 'banners', label: 'Event Wishes' },
  { id: 'weapons', label: 'New Weapons' },
  { id: 'artifacts', label: 'New Artifacts' },
  { id: 'events', label: 'Events' },
  { id: 'areas', label: 'New Areas' },
  { id: 'abyss', label: 'Spiral Abyss' },
  { id: 'gallery', label: 'Gallery' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
