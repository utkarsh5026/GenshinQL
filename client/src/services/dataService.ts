import type {
  Character,
  CharacterDetailed,
  TalentBookCalendar,
  Weapon,
  WeaponMaterialSchedule,
  AttackAnimation,
  ScreenAnimation,
  GalleryRaw,
  CharacterRaw,
  Talent,
  AttackTalentType,
  AnimationMedia,
} from '@/types';

const DATA_BASE_URL = '/';

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

async function loadDataForFile<T>(
  fileName: string,
  cache: T | null
): Promise<T> {
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

function parseAnimation({
  videoType,
  url,
  caption,
  videoUrl,
}: Omit<AnimationMedia, 'imageUrl'> & { url: string }): AnimationMedia {
  return {
    imageUrl: url,
    videoUrl,
    caption,
    videoType,
  };
}

/**
 * Transforms gallery array structure to named object structure
 */
function transformGalleryToScreenAnimation(
  animations: GalleryRaw['screenAnimations']
): ScreenAnimation {
  return {
    idleOne: animations[0] ? parseAnimation(animations[0]) : undefined,
    idleTwo: animations[1] ? parseAnimation(animations[1]) : undefined,
    partySetup: animations[2] ? parseAnimation(animations[2]) : undefined,
  };
}

/**
 * Transforms attack animations array to named object structure
 */
function transformAttackAnimations(
  attackAnimations: GalleryRaw['attackAnimations']
): AttackAnimation {
  const normalAttack = attackAnimations.find(
    (a) => a.skill === 'Normal_Attack'
  );
  const elementalSkill = attackAnimations.find(
    (a) => a.skill === 'Elemental_Skill'
  );
  const elementalBurst = attackAnimations.find(
    (a) => a.skill === 'Elemental_Burst'
  );

  return {
    normalAttack: normalAttack?.animations.map(parseAnimation) || [],
    elementalSkill: elementalSkill?.animations.map(parseAnimation) || [],
    elementalBurst: elementalBurst?.animations.map(parseAnimation) || [],
  };
}

/**
 * Extracts imageUrls from gallery nameCards
 */
function extractImageUrls(nameCards: GalleryRaw['nameCards']) {
  return {
    card: nameCards[1]?.url || '', // Icon
    wish: nameCards[0]?.url || '', // Background
    inGame: nameCards[0]?.url || '', // Background
    nameCard: nameCards[0]?.url || '', // Background
  };
}

/**
 * Fetches detailed character data by name from individual character JSON files.
 */
export async function fetchCharacterDetailed(
  name: string
): Promise<CharacterDetailed | null> {
  try {
    const response = await fetch(`${DATA_BASE_URL}characters/${name}.json`);
    if (!response.ok) {
      console.error(`Failed to fetch character data for ${name}`);
      return null;
    }

    const rawData: CharacterRaw = await response.json();

    const transformedTalents: Talent[] = rawData.talents.map((talent) => ({
      ...talent,
      talentType: talent.talentType as AttackTalentType,
      figureUrls: talent.figureUrls.map((fig) => ({
        url: fig.url,
        caption: fig.caption,
      })),
      scaling: Object.entries(talent.scaling).map(([key, value]) => ({
        key,
        value,
      })),
    }));

    const gallery = rawData.gallery;
    const screenAnimation = gallery?.screenAnimations
      ? transformGalleryToScreenAnimation(gallery.screenAnimations)
      : { idleOne: undefined, idleTwo: undefined, partySetup: undefined };

    const imageUrls = rawData.imageUrls?.card
      ? rawData.imageUrls
      : gallery?.nameCards
        ? extractImageUrls(gallery.nameCards)
        : { card: '', wish: '', inGame: '', nameCard: '' };

    const detailedCharacter: CharacterDetailed = {
      name: rawData.name,
      iconUrl: rawData.iconUrl,
      rarity: rawData.rarity,
      element: rawData.element,
      weaponType: rawData.weaponType,
      region: rawData.region,
      elementUrl: rawData.elementUrl,
      weaponUrl: rawData.weaponUrl,
      regionUrl: rawData.regionUrl,
      modelType: rawData.modelType,
      version: rawData.version,
      talents: transformedTalents,
      constellations: rawData.constellations,
      imageUrls,
      screenAnimation,
    };

    return detailedCharacter;
  } catch (error) {
    console.error(`Error fetching character ${name}:`, error);
    return null;
  }
}

/**
 * Fetches and caches talent book calendar data.
 */
async function loadTalentsData() {
  if (talentsCache) return talentsCache;

  const rawData = await loadDataForFile<Record<string, any[]>>(
    'dailyTalents.json',
    null
  );

  const talentBooks = Object.entries(rawData).map(([location, days]) => ({
    location,
    days,
  }));

  talentsCache = { talentBooks };
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
  if (!response.ok) throw new Error('Failed to fetch weapons data');

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
  if (!response.ok) throw new Error('Failed to fetch gallery data');

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
  const charName = name.split(' ').join('_');
  return data[charName] || data[name] || null;
}

/**
 * Fetches character attack animations from character's embedded gallery data.
 */
export async function fetchCharacterAttackAnimations(
  name: string
): Promise<AttackAnimation | null> {
  try {
    const response = await fetch(`${DATA_BASE_URL}characters/${name}.json`);
    if (!response.ok) return null;

    const rawData: CharacterRaw = await response.json();

    if (!rawData.gallery?.attackAnimations) return null;

    return transformAttackAnimations(rawData.gallery.attackAnimations);
  } catch (error) {
    console.error(`Error fetching attack animations for ${name}:`, error);
    return null;
  }
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
