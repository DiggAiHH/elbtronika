import { createClient } from "next-sanity";

/**
 * Sanity client for server-side and static queries.
 * CDN enabled in production for edge caching.
 */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});

/**
 * Preview client — bypasses CDN, uses token for draft content.
 * Only instantiated when SANITY_API_READ_TOKEN is present.
 */
export const sanityPreviewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  perspective: "previewDrafts",
  ...(process.env.SANITY_API_READ_TOKEN ? { token: process.env.SANITY_API_READ_TOKEN } : {}),
});

/**
 * Returns the appropriate client based on preview mode.
 */
export function getClient(preview = false) {
  return preview ? sanityPreviewClient : sanityClient;
}
