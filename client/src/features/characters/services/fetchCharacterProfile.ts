import { fetchWithCache } from '@/features/cache';
import type { AnimationMedia, Primitives } from '@/types';

import type {
  AttackTalentType,
  CharacterDetailed,
  CharacterRaw,
  GalleryRaw,
  GIFWithVideo,
  ScreenAnimation,
  Talent,
} from '../types';

export async function fetchCharacterProfile(
  character: string,
  primitives: Primitives
): Promise<CharacterDetailed | null> {
  const lookupUrl = (primKey: keyof Primitives, name: string) => {
    return primitives[primKey]?.find((item) => item.name === name)?.url || '';
  };

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

  const lookupRegionUrl = (region: string, primitives: Primitives): string => {
    const normalizedRegion = region.replace(/-/g, '');
    const regionData = primitives.regions?.find((r) => {
      const normalizedPrimitiveRegion = r.name.replace(/-/g, '');
      return (
        r.name === region || normalizedPrimitiveRegion === normalizedRegion
      );
    });
    return regionData ? regionData.url : '';
  };

  try {
    const { data: rawData } = await fetchWithCache<CharacterRaw>(
      `/characters/${character}.json`
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
      elementUrl: rawData.elementUrl || lookupUrl('elements', element),
      weaponUrl: rawData.weaponUrl || lookupUrl('weaponTypes', weaponType),
      regionUrl: rawData.regionUrl || lookupRegionUrl(region, primitives),
      talents: transformedTalents,
      imageUrls,
      screenAnimation,
    };
  } catch (error) {
    console.error('Error fetching character:', character, error);
    return null;
  }
}
