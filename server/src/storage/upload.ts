import { initDb } from "../db/init";
import { loadCharacters } from "../db/load";
import { writeFile } from "fs/promises";
import { repo } from "../db/utils";
import Nation from "../db/models/Nation";
import { StorageClient, type StorageBucketType } from "./store";
import WeaponType from "../db/models/WeaponType";
import Element from "../db/models/Element";

const PRIMITIVES_BUCKET = "primitives";
type FileType = "image" | "video" | "audio";

/**
 * Downloads a file from the given URL and returns its buffer and file type.
 *
 * @param url - The URL of the file to download.
 * @returns A promise that resolves to an object containing the file buffer and file type.
 * @throws Will throw an error if the download fails.
 */
async function downloadFile(
  url: string
): Promise<{ buffer: Buffer; fileType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  // Get content type from headers
  const contentType = response.headers.get("content-type");
  const fileType = contentType?.split("/")[1] ?? "unknown";

  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, fileType };
}

async function uploadCharacterMedia() {
  const characters = await loadCharacters();
  for (const character of characters.slice(0, 1)) {
    if (character.iconUrl) {
      try {
        const { buffer, fileType } = await downloadFile(character.iconUrl);
        await writeFile(`${character.id}.${fileType}`, buffer);
        console.log(`Downloaded ${character.id} as ${fileType}`);
      } catch (error) {
        console.error(`Failed to download image for ${character.id}:`, error);
      }
    }
  }
}

/**
 * Downloads a file from a given URL and uploads it to a specified storage bucket.
 *
 * @param url - The URL of the file to download.
 * @param bucket - The storage bucket where the file will be uploaded.
 * @param fileName - The name to use for the uploaded file.
 * @param fileType - The type of the file (e.g., "image", "video", "audio").
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
  maxRetries = 3,
  initialDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { buffer, fileType } = await downloadFile(url);
      const res = await bucket.upload(
        `${fileName}.${fileType}`,
        buffer,
        contentType
      );
      console.log(res);
      return { res, url: bucket.getPublicUrl(res.path) };
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
      }
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
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

async function main() {
  await initDb();
  const store = await StorageClient.create();
  const primitiveBucket = await store.bucket(PRIMITIVES_BUCKET);
  await Promise.all([
    uploadNation(primitiveBucket),
    uploadElement(primitiveBucket),
    uploadWeaponType(primitiveBucket),
  ]);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
