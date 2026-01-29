import type {
  Character,
  CharacterDetailed,
  TalentBookCalendar,
  Weapon,
  WeaponMaterialSchedule,
  AttackAnimation,
  ScreenAnimation,
} from "@/types";

const DATA_BASE_URL = "/";

let charactersCache: Character[] | null = null;

let talentsCache: { talentBooks: TalentBookCalendar[] } | null = null;

let weaponsCache: {
  weapons: { type: string; weapons: Weapon[] }[];
  materialSchedule: WeaponMaterialSchedule[];
} | null = null;

let galleryCache: Record<
  string,
  {
    screenAnimations: ScreenAnimation;
    attackAnimations: AttackAnimation;
    nameCard: { background: string; icon: string };
  }
> | null = null;

async function loadDataForFile<T>(fileName: string, cache: T | null): Promise<T> {
  if (cache) return cache;

  const response = await fetch(`${DATA_BASE_URL}${fileName}`);
  if (!response.ok) throw new Error(`Failed to fetch data from ${fileName}`);

  const data: T = await response.json();
  return data;
}

/**
 * Fetches and caches character data from the static JSON file.
 */
async function loadCharactersData() {
  if (charactersCache) return charactersCache;

  const data = await loadDataForFile<Character[]>('characters.json', null);
  charactersCache = data;
  return data;
}

/**
 * Fetches all characters with basic info.
 */
export async function fetchCharacters(): Promise<Character[]> {
  return await loadCharactersData();
}

/**
 * Fetches detailed character data by name.
 * TODO: Implement loading detailed character data from separate files
 */
export async function fetchCharacterDetailed(
  _name: string,
): Promise<CharacterDetailed | null> {
  console.warn('fetchCharacterDetailed not yet implemented');
  return null;
}

/**
 * Fetches and caches talent book calendar data.
 */
async function loadTalentsData() {
  if (talentsCache) return talentsCache;

  const response = await fetch(`${DATA_BASE_URL}/talents.json`);
  if (!response.ok) throw new Error("Failed to fetch talents data");

  talentsCache = await response.json();
  return talentsCache!;
}

/**
 * Fetches talent book calendar.
 */
export async function fetchTalentBooks(): Promise<TalentBookCalendar[]> {
  const data = await loadTalentsData();
  return data.talentBooks;
}

/**
 * Fetches and caches weapon data.
 */
async function loadWeaponsData() {
  if (weaponsCache) return weaponsCache;

  const response = await fetch(`${DATA_BASE_URL}/weapons.json`);
  if (!response.ok) throw new Error("Failed to fetch weapons data");

  weaponsCache = await response.json();
  return weaponsCache!;
}

/**
 * Fetches all weapons grouped by type.
 */
export async function fetchWeapons(): Promise<
  { type: string; weapons: Weapon[] }[]
> {
  const data = await loadWeaponsData();
  return data.weapons;
}

/**
 * Fetches weapons of a specific type.
 */
export async function fetchWeaponsOfType(type: string): Promise<Weapon[]> {
  const data = await loadWeaponsData();
  const weaponGroup = data.weapons.find((w) => w.type === type);
  return weaponGroup?.weapons || [];
}

/**
 * Fetches weapon material schedule.
 */
export async function fetchWeaponMaterialSchedule(): Promise<
  WeaponMaterialSchedule[]
> {
  const data = await loadWeaponsData();
  return data.materialSchedule;
}

/**
 * Fetches and caches gallery data.
 */
async function loadGalleryData() {
  if (galleryCache) return galleryCache;

  const response = await fetch(`${DATA_BASE_URL}/gallery.json`);
  if (!response.ok) throw new Error("Failed to fetch gallery data");

  galleryCache = await response.json();
  return galleryCache!;
}

/**
 * Fetches character gallery data (screen animations, attack animations, namecard).
 */
export async function fetchCharacterGallery(name: string): Promise<{
  screenAnimations: ScreenAnimation;
  attackAnimations: AttackAnimation;
  nameCard: { background: string; icon: string };
} | null> {
  const data = await loadGalleryData();
  const charName = name.split(" ").join("_");
  return data[charName] || data[name] || null;
}

/**
 * Fetches character attack animations.
 */
export async function fetchCharacterAttackAnimations(
  name: string,
): Promise<AttackAnimation | null> {
  const gallery = await fetchCharacterGallery(name);
  return gallery?.attackAnimations || null;
}

/**
 * Clears all cached data (useful for refreshing).
 */
export function clearCache() {
  charactersCache = null;
  talentsCache = null;
  weaponsCache = null;
  galleryCache = null;
}
