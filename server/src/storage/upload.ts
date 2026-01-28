import { initDb } from "../db/init";
import { repo } from "../db/utils";
import { type StorageBucketType, StorageClient } from "./store";

import Nation from "../db/models/Nation";
import WeaponType from "../db/models/WeaponType";
import Element from "../db/models/Element";
import Character from "../db/models/Character";
import CharacterTalent from "../db/models/CharacterTalent";
import Constellation from "../db/models/Constellation";
import TalentMaterial from "../db/models/TalentMaterial";
import ScreenAnimationMedia from "../db/models/ScreenAnimationMedia";
import { AnimationSchema } from "../data/schema";

const PRIMITIVES_BUCKET = "primitives";
const CHARACTER_BUCKET = "characters";
const CONSTELLATION_BUCKET = "constellations";
const TALENT_BUCKET = "talents";
const SCREEN_ANIMATION_BUCKET = "screen_animations";
const ATTACK_ANIMATION_BUCKET = "attack_animations";

type FileType = "image" | "video" | "audio";

const createCharName = (charName: string, suffix: string) =>
  `${charName}_${suffix}`;

/**
 * Downloads a file from the given URL and returns its buffer and file type.
 *
 * @param url - The URL of the file to download.
 * @param maxRetries - The maximum number of retry attempts for downloading the file. Default is 4.
 * @param initialDelay - The initial delay in milliseconds before retrying a failed attempt.
 * Default is 1000 ms.
 * @returns A promise that resolves to an object containing the file buffer and file type.
 * @throws Will throw an error if the download fails.
 */
async function downloadFile(
  url: string,
  maxRetries = 4,
  initialDelay = 1000,
): Promise<{ buffer: Buffer; fileType: string } | undefined> {
  const getFileType = (url: string) => {
    const parts = url.split(".");
    return parts[parts.length - 1];
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to download: ${url}`);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`Successfully downloaded: ${url}`);
      return { buffer, fileType: getFileType(url) };
    } catch (error) {
      console.error(`Download error for URL ${url}:`, error);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for URL: ${url}`);
        return undefined; // Return undefined instead of throwing
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(
        `Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Downloads a file from a given URL and uploads it to a specified storage bucket.
 *
 * @param url - The URL of the file to download.
 * @param bucket - The storage bucket where the file will be uploaded.
 * @param fileName - The name to use for the uploaded file.
 * @param contentType - The MIME type of the file.
 * @param maxRetries - The maximum number of retry attempts for downloading and uploading the file. Default is 3.
 * @param initialDelay - The initial delay in milliseconds before retrying a failed attempt. Default is 1000 ms.
 * @returns A promise that resolves to an object containing the upload response and the public URL of the uploaded file.
 * @throws Will throw an error if the operation fails after the maximum number of retries.
 */
async function downLoadThenUpload(
  url: string,
  bucket: StorageBucketType,
  fileName: string,
  contentType: FileType = "image",
  maxRetries = 4,
  initialDelay = 1000,
) {
  if (!url.includes("static.wikia.nocookie.net"))
    return {
      url: url,
    };
  const result = await downloadFile(url, maxRetries, initialDelay);
  if (!result) return;
  const { buffer, fileType } = result;

  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9]/g, "_") // Replace special chars with underscore
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .toLowerCase(); // Convert to lowercase for consistency

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await bucket.upload(
        `${sanitizedFileName}.${fileType}`,
        buffer,
        contentType,
      );

      return { res, url: bucket.getPublicUrl(res.path) };
    } catch (error) {
      if (attempt === maxRetries)
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(
        `Attempt ${attempt} failed, retrying in ${delay}ms...`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Uploads icons for nations to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadNation(bucket: StorageBucketType) {
  const nations = await repo(Nation).find();
  const nationsToSave = await Promise.all(
    nations.map(async (nation) => {
      const { iconUrl, name } = nation;
      const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
      if (result) nation.iconUrl = result.url;
      return nation;
    }),
  );
  await repo(Nation).save(nationsToSave);
}

/**
 * Uploads icons for elements to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadElement(bucket: StorageBucketType) {
  const elements = await repo(Element).find();
  const elementsToSave = await Promise.all(
    elements.map(async (element) => {
      const { iconUrl, name } = element;
      const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
      if (result) element.iconUrl = result.url;
      return element;
    }),
  );
  await repo(Element).save(elementsToSave);
}

/**
 * Uploads icons for weapon types to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadWeaponType(bucket: StorageBucketType) {
  const weaponTypes = await repo(WeaponType).find();
  const weaponTypesToSave = await Promise.all(
    weaponTypes.map(async (weaponType) => {
      const { iconUrl, name } = weaponType;
      const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
      if (result) weaponType.iconUrl = result.url;
      return weaponType;
    }),
  );
  await repo(WeaponType).save(weaponTypesToSave);
}

/**
 * Uploads icons for characters to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadCharacterMedia(bucket: StorageBucketType) {
  const characters = await repo(Character).find();
  const charactersToSave = await Promise.all(
    characters.map(async (character) => {
      const { iconUrl, name } = character;
      const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
      if (result) character.iconUrl = result.url;
      return character;
    }),
  );
  await repo(Character).save(charactersToSave);
}

/**
 * Uploads icons for character talents to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadTalents(bucket: StorageBucketType) {
  const talents = await repo(CharacterTalent).find();
  const talentsToSave = [];
  for (const talent of talents) {
    const { iconUrl, name } = talent;
    const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
    if (result) talent.iconUrl = result.url;
    talentsToSave.push(talent);
  }
  await repo(CharacterTalent).save(talentsToSave);
}

/**
 * Uploads icons for constellations to the specified bucket.
 * @param bucket - The storage bucket.
 */
async function uploadConstellations(bucket: StorageBucketType) {
  const constellations = await repo(Constellation).find();
  const constellationsToSave = [];
  for (const constellation of constellations) {
    const { iconUrl, name } = constellation;
    const result = await downLoadThenUpload(iconUrl, bucket, name);
    if (result) constellation.iconUrl = result.url;
    constellationsToSave.push(constellation);
  }
  await repo(Constellation).save(constellationsToSave);
}

/**
 * Uploads talent material icons to the specified bucket.
 *
 * This function retrieves all talent materials from the database, downloads their
 * associated guide, philosophy, and teaching icons, and uploads them to the specified
 * storage bucket. The URLs of the uploaded icons are then updated in the database.
 *
 * @param bucket - The storage bucket where the icons will be uploaded.
 */
async function uploadTalentMaterials(bucket: StorageBucketType) {
  const talentMaterials = await repo(TalentMaterial).find();
  const save = [];
  for (const talentMaterial of talentMaterials) {
    const { guideUrl, philosophyUrl, name, teachingUrl } = talentMaterial;
    const newGuide = await downLoadThenUpload(
      guideUrl,
      bucket,
      `material_${name}_guide`,
    );
    const newPhilosophy = await downLoadThenUpload(
      philosophyUrl,
      bucket,
      `material_${name}_philosophy`,
    );
    const newTeaching = await downLoadThenUpload(
      teachingUrl,
      bucket,
      `material_${name}_teaching`,
    );

    if (newGuide) talentMaterial.guideUrl = newGuide.url;
    if (newPhilosophy) talentMaterial.philosophyUrl = newPhilosophy.url;
    if (newTeaching) talentMaterial.teachingUrl = newTeaching.url;
    save.push(talentMaterial);
  }
  await repo(TalentMaterial).save(save);
}

/**
 * Uploads screen animations for characters to the specified storage bucket.
 *
 * This function retrieves all characters with their associated screen animations
 * from the database. It then downloads the image and video files for each screen
 * animation and uploads them to the specified storage bucket. The URLs of the
 * uploaded files are updated in the database.
 *
 * @param bucket - The storage bucket where the screen animations will be uploaded.
 */
async function uploadScreenAnimations(bucket: StorageBucketType) {
  const upload = async (media: ScreenAnimationMedia | null, name: string) => {
    if (!media) return;
    const { imageUrl, videoUrl } = media;
    if (imageUrl) {
      const result = await downLoadThenUpload(imageUrl, bucket, name, "image");
      if (result) media.imageUrl = result.url;
    }
    if (videoUrl) {
      const result = await downLoadThenUpload(videoUrl, bucket, name, "video");
      if (result) media.videoUrl = result.url;
    }
  };

  const name = (charName: string, suffix: string) =>
    `character_${charName}_${suffix}`;

  const screenAnimations = await repo(Character).find({
    relations: ["gallery", "gallery.screenAnimation"],
  });

  const save = [];
  for (const character of screenAnimations) {
    const {
      name: charName,
      gallery: { screenAnimation },
    } = character;

    const { idleOne, idleTwo, talentMenu, weaponMenu, partySetup } =
      screenAnimation;
    await upload(idleOne, name(charName, "idle_one"));
    await upload(idleTwo, name(charName, "idle_two"));
    await upload(talentMenu, name(charName, "talent_menu"));
    await upload(weaponMenu, name(charName, "weapon_menu"));
    await upload(partySetup, name(charName, "party_setup"));

    save.push(character);
  }
  await repo(Character).save(save);
}

/**
 * Uploads attack animation media for characters to the specified storage bucket.
 *
 * This function retrieves all characters with their associated attack animations
 * from the database. It then downloads the image and video files for each frame
 * of the attack animations and uploads them to the specified storage bucket.
 * The URLs of the uploaded files are updated in the database.
 *
 * @param bucket - The storage bucket where the attack animations will be uploaded.
 */
async function uploadAttackAnimationsMedia(bucket: StorageBucketType) {
  const upload = async (animation: AnimationSchema[], name: string) => {
    for (let i = 0; i < animation.length; i++) {
      const frame = animation[i];
      const { url: imageUrl, videoUrl } = frame;
      if (imageUrl) {
        const result = await downLoadThenUpload(
          imageUrl,
          bucket,
          `${name}_${i}`,
          "image",
        );
        if (result) frame.url = result.url;
      }
      if (videoUrl) {
        const result = await downLoadThenUpload(
          videoUrl,
          bucket,
          `${name}_${i}`,
          "video",
        );
        if (result) frame.videoUrl = result.url;
      }
    }
  };

  const attackAnimations = await repo(Character).find({
    relations: ["gallery", "gallery.attackAnimation"],
  });

  for (const character of attackAnimations) {
    try {
      const {
        name,
        gallery: { attackAnimation },
      } = character;

      const { normalAttack, elementalSkill, elementalBurst } = attackAnimation;
      await upload(normalAttack, createCharName(name, "normal_attack"));
      await upload(elementalSkill, createCharName(name, "elemental_skill"));
      await upload(elementalBurst, createCharName(name, "elemental_burst"));

      await repo(Character).save(character);
    } catch (error) {
      console.error(
        `Error uploading attack animations for character ${character.name}:`,
        error,
      );
    }
  }
}

async function main() {
  await initDb();
  const store = await StorageClient.create();
  const primitiveBucket = await store.bucket(PRIMITIVES_BUCKET);
  const characterBucket = await store.bucket(CHARACTER_BUCKET);
  const talentBucket = await store.bucket(TALENT_BUCKET);
  const constellationBucket = await store.bucket(CONSTELLATION_BUCKET);
  const screenAnimationBucket = await store.bucket(SCREEN_ANIMATION_BUCKET);
  const attackAnimationBucket = await store.bucket(ATTACK_ANIMATION_BUCKET);
  await Promise.all([
    uploadNation(primitiveBucket),
    uploadElement(primitiveBucket),
    uploadWeaponType(primitiveBucket),
    uploadCharacterMedia(characterBucket),
    uploadTalents(talentBucket),
    uploadConstellations(constellationBucket),
    uploadTalentMaterials(talentBucket),
    uploadScreenAnimations(screenAnimationBucket),
    uploadAttackAnimationsMedia(attackAnimationBucket),
  ]);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
