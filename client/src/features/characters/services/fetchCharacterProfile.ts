import { fetchWithCache } from '@/features/cache';
import type { AnimationMedia, Primitives } from '@/types';

import type {
  AttackTalentType,
  Character,
  CharacterDetailed,
  CharacterRaw,
  GalleryRaw,
  GIFWithVideo,
  ScreenAnimation,
  Talent,
} from '../types';

/**
 * Optimized character JSON structure with index-based references.
 * Lookup arrays store unique values once, characters reference them by index.
 */
type CharactersJson = {
  elements: string[];
  regions: string[];
  weaponTypes: string[];
  rarities: string[];
  modelTypes: string[];
  characters: Array<{
    name: string;
    iconUrl: string;
    element: number;
    region: number;
    weaponType: number;
    rarity: number;
    modelType: number;
    idleAnimations?: AnimationMedia[];
    partyJoinAnimation?: AnimationMedia;
    version?: string;
    [key: string]: unknown;
  }>;
};

export async function fetchCharacterProfile(
  character: string,
  primitives: Primitives
): Promise<CharacterDetailed | null> {
  const parseAnimation = ({
    videoType,
    url,
    caption,
    videoUrl,
  }: GIFWithVideo): AnimationMedia => {
    return {
      imageUrl: url,
      videoUrl: videoUrl || '', // Provide default empty string for optional videoUrl
      caption,
      videoType: videoType || 'mp4', // Provide default video type
    };
  };

  const transformGalleryToScreenAnimation = (
    animations: GalleryRaw['screenAnimations']
  ): ScreenAnimation => {
    return {
      idleOne: animations[0] ? parseAnimation(animations[0]) : undefined,
      idleTwo: animations[1] ? parseAnimation(animations[1]) : undefined,
      partySetup: animations[2] ? parseAnimation(animations[2]) : undefined,
    };
  };

  const extractImageUrls = (nameCards: GalleryRaw['nameCards']) => {
    const icon = nameCards[1]?.url || ''; // Icon
    const background = nameCards[0]?.url || ''; // Background
    return {
      card: icon,
      wish: background,
      inGame: background,
      nameCard: background,
    };
  };

  try {
    const { data: rawData } = await fetchWithCache<CharacterRaw>(
      `characters/${character}.json`
    );

    const transformedTalents: Talent[] = rawData.talents.map((talent) => ({
      ...talent,
      talentType: talent.talentType as AttackTalentType,
      figureUrls: talent.figureUrls.map(({ url, caption }) => ({
        url,
        caption,
      })),
      scaling: Object.entries(talent.scaling).map(([key, value]) => ({
        key,
        value,
      })),
    }));

    const { gallery, element, weaponType, region } = rawData;
    const screenAnimation = gallery?.screenAnimations
      ? transformGalleryToScreenAnimation(gallery.screenAnimations)
      : { idleOne: undefined, idleTwo: undefined, partySetup: undefined };

    const imageUrls = rawData.imageUrls?.card
      ? rawData.imageUrls
      : gallery?.nameCards
        ? extractImageUrls(gallery.nameCards)
        : { card: '', wish: '', inGame: '', nameCard: '' };

    return {
      ...rawData,
      elementUrl:
        rawData.elementUrl || lookupUrl('elements', element, primitives),
      weaponUrl:
        rawData.weaponUrl || lookupUrl('weaponTypes', weaponType, primitives),
      regionUrl: rawData.regionUrl || lookupRegionUrl(region, primitives),
      talents: transformedTalents,
      imageUrls,
      screenAnimation,
      buildGuide: rawData.buildGuide,
    };
  } catch (error) {
    console.error('Error fetching character:', character, error);
    return null;
  }
}

/**
 * Converts optimized indexed character data to full Character objects.
 * Replaces numeric indices with actual string values from lookup arrays.
 *
 * @param optimizedData - The indexed character data from characters.json
 * @returns Array of Character objects with string values
 */
function populateCharacters(optimizedData: CharactersJson): Character[] {
  const { elements, regions, weaponTypes, rarities, modelTypes, characters } =
    optimizedData;

  if (
    !elements?.length ||
    !regions?.length ||
    !weaponTypes?.length ||
    !rarities?.length ||
    !modelTypes?.length
  ) {
    console.error('Invalid optimized data: missing or empty lookup arrays');
    throw new Error('Corrupted character data structure');
  }

  return characters.map((char) => ({
    ...char,
    element: elements[char.element] || 'Unknown',
    region: regions[char.region] || 'Unknown',
    weaponType: weaponTypes[char.weaponType] || 'Unknown',
    rarity: rarities[char.rarity] || 'Unknown',
    modelType: modelTypes[char.modelType] || 'Unknown',
  })) as Character[];
}

/**
 * Fetches all characters with basic info.
 * Enriches each character with URL fields from primitives.json.
 * Supports both optimized (index-based) and legacy (direct array) formats.
 */
export async function fetchCharacters(
  primitives: Primitives
): Promise<Character[]> {
  const characters = await fetchWithCache<Character[]>(`characters.json`, {
    transform: (data: unknown) => {
      const populated = populateCharacters(data as CharactersJson);
      return populated.map((char) => enrichCharacterWithUrls(char, primitives));
    },
  });

  return characters.data;
}

/**
 * Enriches a character object with URL fields looked up from primitives
 * @param character - The character object (with or without URL fields)
 * @param primitives - The primitives data containing URL mappings
 * @returns The character object with elementUrl, weaponUrl, and regionUrl populated
 */
function enrichCharacterWithUrls<
  T extends {
    element: string;
    weaponType: string;
    region: string;
    elementUrl?: string;
    weaponUrl?: string;
    regionUrl?: string;
  },
>(
  character: T,
  primitives: Primitives
): T & {
  elementUrl: string;
  weaponUrl: string;
  regionUrl: string;
} {
  return {
    ...character,
    elementUrl:
      character.elementUrl || lookupElementUrl(character.element, primitives),
    weaponUrl:
      character.weaponUrl || lookupWeaponUrl(character.weaponType, primitives),
    regionUrl:
      character.regionUrl || lookupRegionUrl(character.region, primitives),
  };
}

function lookupUrl(
  primKey: keyof Primitives,
  name: string,
  primitives: Primitives
): string {
  return primitives[primKey]?.find((item) => item.name === name)?.url || '';
}

function lookupRegionUrl(region: string, primitives: Primitives): string {
  const normalizedRegion = region.replace(/-/g, '');
  const regionData = primitives.regions?.find((r) => {
    const normalizedPrimitiveRegion = r.name.replace(/-/g, '');
    return r.name === region || normalizedPrimitiveRegion === normalizedRegion;
  });
  return regionData ? regionData.url : '';
}

function lookupElementUrl(element: string, primitives: Primitives): string {
  return primitives.elements?.find((e) => e.name === element)?.url || '';
}

function lookupWeaponUrl(weaponType: string, primitives: Primitives): string {
  return primitives.weaponTypes?.find((w) => w.name === weaponType)?.url || '';
}
