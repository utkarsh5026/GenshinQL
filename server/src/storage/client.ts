import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const userEmail = process.env.SUPABASE_USER_EMAIL;
const userPassword = process.env.SUPABASE_USER_PASSWORD;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates and returns a Supabase client instance.
 *
 * This function attempts to create a Supabase client using the provided
 * environment variables. It includes retry logic to handle transient
 * connection issues, retrying up to a specified number of attempts with
 * exponential backoff.
 *
 * @throws Will throw an error if the necessary environment variables are
 * missing or if the connection to Supabase fails after the maximum number
 * of retry attempts.
 *
 * @returns {Promise<SupabaseClient>} A promise that resolves to a Supabase
 * client instance.
 */
export async function createSupabaseClient(): Promise<SupabaseClient> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Add retry logic
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        },
      });

      if (userEmail && userPassword) {
        const { error } = await client.auth.signInWithPassword({
          email: userEmail,
          password: userPassword,
        });
        if (error) throw error;
      }

      return client;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // Wait for increasing amounts of time between retries (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        console.warn(
          `Supabase connection attempt ${attempt} failed, retrying...`
        );
      }
    }
  }

  throw new Error(
    `Failed to connect to Supabase after ${maxRetries} attempts: ${lastError}`
  );
}
