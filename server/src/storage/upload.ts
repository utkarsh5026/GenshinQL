import { initDb } from "../db/init";
import { repo } from "../db/utils";
import Nation from "../db/models/Nation";
import { type StorageBucketType, StorageClient } from "./store";
import WeaponType from "../db/models/WeaponType";
import Element from "../db/models/Element";
import Character from "../db/models/Character";
import CharacterTalent from "../db/models/CharacterTalent";
import Constellation from "../db/models/Constellation";

const PRIMITIVES_BUCKET = "primitives";
const CHARACTER_BUCKET = "characters";
const CONSTELLATION_BUCKET = "constellations";
const TALENT_BUCKET = "talents";
type FileType = "image" | "video" | "audio";

/**
 * Downloads a file from the given URL and returns its buffer and file type.
 *
 * @param url - The URL of the file to download.
 * @param maxRetries - The maximum number of retry attempts for downloading the file. Default is 4.
 * @param initialDelay - The initial delay in milliseconds before retrying a failed attempt. Default is 1000ms.
 * @returns A promise that resolves to an object containing the file buffer and file type.
 * @throws Will throw an error if the download fails.
 */
async function downloadFile(
  url: string,
  maxRetries = 4,
  initialDelay = 1000
): Promise<{ buffer: Buffer; fileType: string } | undefined> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to download: ${url}`);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      const fileType = contentType?.split("/")[1] ?? "unknown";
      const buffer = Buffer.from(await response.arrayBuffer());

      console.log(`Successfully downloaded: ${url}`);
      return { buffer, fileType };
    } catch (error) {
      console.error(`Download error for URL ${url}:`, error);

      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for URL: ${url}`);
        return undefined; // Return undefined instead of throwing
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(
        `Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`
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
 * @param initialDelay - The initial delay in milliseconds before retrying a failed attempt. Default is 1000ms.
 * @returns A promise that resolves to an object containing the upload response and the public URL of the uploaded file.
 * @throws Will throw an error if the operation fails after the maximum number of retries.
 */
async function downLoadThenUpload(
  url: string,
  bucket: StorageBucketType,
  fileName: string,
  contentType: string,
  maxRetries = 4,
  initialDelay = 1000
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
        contentType
      );

      return { res, url: bucket.getPublicUrl(res.path) };
    } catch (error) {
      if (attempt === maxRetries)
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(
        `Attempt ${attempt} failed, retrying in ${delay}ms...`,
        error
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
    })
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
    })
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
    })
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
    })
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
    const result = await downLoadThenUpload(iconUrl, bucket, name, "image");
    if (result) constellation.iconUrl = result.url;
    constellationsToSave.push(constellation);
  }
  await repo(Constellation).save(constellationsToSave);
}

async function main() {
  await initDb();
  const store = await StorageClient.create();
  const primitiveBucket = await store.bucket(PRIMITIVES_BUCKET);
  const characterBucket = await store.bucket(CHARACTER_BUCKET);
  const talentBucket = await store.bucket(TALENT_BUCKET);
  const constellationBucket = await store.bucket(CONSTELLATION_BUCKET);

  await Promise.all([
    uploadNation(primitiveBucket),
    uploadElement(primitiveBucket),
    uploadWeaponType(primitiveBucket),
    uploadCharacterMedia(characterBucket),
    uploadTalents(talentBucket),
    uploadConstellations(constellationBucket),
  ]);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
