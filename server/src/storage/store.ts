import { SupabaseClient } from "@supabase/supabase-js";
import { supaBase } from "./client";

/**
 * StorageClient is a wrapper around the SupabaseClient to interact with storage buckets.
 */
class StorageClient {
  /**
   * Constructs a new StorageClient instance.
   * @param supabase - The Supabase client instance.
   */
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns a Bucket instance for the specified bucket name.
   * @param bucketName - The name of the bucket.
   * @returns A Bucket instance.
   */
  bucket(bucketName: string) {
    return new Bucket(this.supabase, bucketName);
  }
}

/**
 * Bucket provides methods to interact with a specific storage bucket.
 */
class Bucket {
  /**
   * Constructs a new Bucket instance.
   * @param supabase - The Supabase client instance.
   * @param bucketName - The name of the bucket.
   */
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly bucketName: string
  ) {}

  /**
   * Uploads a file to the specified path in the bucket.
   * @param path - The path where the file will be uploaded.
   * @param file - The file to upload, either as a File or Buffer.
   * @param contentType - Optional MIME type of the file.
   * @returns The data returned from the upload operation.
   * @throws Will throw an error if the upload fails.
   */
  async upload(path: string, file: File | Buffer, contentType?: string) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Downloads a file from the specified path in the bucket.
   * @param path - The path of the file to download.
   * @returns The data of the downloaded file.
   * @throws Will throw an error if the download fails.
   */
  async download(path: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(path);

    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  /**
   * Gets the public URL for a file at the specified path in the bucket.
   * @param path - The path of the file.
   * @returns The public URL of the file.
   */
  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Removes files from the bucket at the specified paths.
   * @param paths - A single path or an array of paths to remove.
   * @returns True if the removal was successful.
   * @throws Will throw an error if the removal fails.
   */
  async remove(paths: string | string[]): Promise<boolean> {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove(pathArray);

    if (error) throw error;
    return true;
  }

  /**
   * Lists files in the specified folder path within the bucket.
   * @param folderPath - Optional folder path to list files from.
   * @returns An array of file data.
   * @throws Will throw an error if the listing fails.
   */
  async list(folderPath?: string) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(folderPath);

    if (error) throw error;
    return data;
  }
}

const storageClient = new StorageClient(supaBase);
export default storageClient;
