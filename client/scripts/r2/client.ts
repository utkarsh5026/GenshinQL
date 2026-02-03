import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { R2_CONFIG, validateEnvironment } from './config.js';

/**
 * Create and configure R2 S3 client
 * R2 is S3-compatible, so we use the AWS S3 SDK
 *
 * @returns Configured S3 client for R2
 */
export function createR2Client(): S3Client {
  validateEnvironment();
  const endpoint = `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: R2_CONFIG.region,
    endpoint,
    credentials: {
      accessKeyId: R2_CONFIG.accessKeyId,
      secretAccessKey: R2_CONFIG.secretAccessKey,
    },
  });
}

/**
 * Upload a file to R2
 *
 * @param client - S3 client
 * @param key - Object key (path in bucket)
 * @param body - File content (Buffer or Uint8Array)
 * @param contentType - MIME type
 * @returns Upload result
 */
export async function uploadToR2(
  client: S3Client,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);
}

/**
 * Check if an object exists in R2
 *
 * @param client - S3 client
 * @param key - Object key
 * @returns true if object exists
 */
export async function objectExists(
  client: S3Client,
  key: string
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    // 404 error means object doesn't exist
    const err = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Get object metadata from R2
 *
 * @param client - S3 client
 * @param key - Object key
 * @returns Object metadata
 */
export async function getObjectMetadata(
  client: S3Client,
  key: string
): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
} | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    const response = await client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
    };
  } catch (error) {
    const err = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * Download object from R2
 *
 * @param client - S3 client
 * @param key - Object key
 * @returns Object content as Buffer
 */
export async function downloadFromR2(
  client: S3Client,
  key: string
): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`No body in response for key: ${key}`);
  }

  const chunks: Uint8Array[] = [];
  const body = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * List objects in R2 bucket with prefix
 *
 * @param client - S3 client
 * @param prefix - Object key prefix (e.g., 'icons/')
 * @param maxKeys - Maximum number of keys to return
 * @returns Array of object keys
 */
export async function listObjects(
  client: S3Client,
  prefix: string = '',
  maxKeys: number = 1000
): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_CONFIG.bucketName,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await client.send(command);

  return (response.Contents || [])
    .map((obj) => obj.Key)
    .filter((key): key is string => key !== undefined);
}

/**
 * Delete object from R2
 *
 * @param client - S3 client
 * @param key - Object key
 */
export async function deleteFromR2(
  client: S3Client,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * Test R2 connection and credentials
 *
 * @param client - S3 client
 * @returns true if connection is successful
 */
export async function testR2Connection(client: S3Client): Promise<boolean> {
  try {
    await listObjects(client, '', 1);
    return true;
  } catch (error) {
    console.error('R2 connection test failed:', error);
    return false;
  }
}

/**
 * Get bucket statistics
 *
 * @param client - S3 client
 * @returns Bucket statistics
 */
export async function getBucketStats(client: S3Client): Promise<{
  totalObjects: number;
  totalSize: number;
}> {
  let totalObjects = 0;
  let totalSize = 0;
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucketName,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    totalObjects += response.KeyCount || 0;
    totalSize += (response.Contents || []).reduce(
      (sum, obj) => sum + (obj.Size || 0),
      0
    );

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return { totalObjects, totalSize };
}
