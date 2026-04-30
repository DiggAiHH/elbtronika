/**
 * MCP Server for Sanity CMS
 */

import { MCPServer } from "../server";
import type { ToolDefinition } from "../types";
import { FetchDocumentSchema } from "../tools";

function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "demo";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_TOKEN;
  return { projectId, dataset, token };
}

async function sanityQuery(query: string, params?: Record<string, unknown>): Promise<unknown> {
  const { projectId, dataset } = getSanityConfig();
  const url = `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}`;
  const queryString = new URLSearchParams({ query });
  if (params) {
    queryString.set("$params", JSON.stringify(params));
  }
  const res = await fetch(`${url}?${queryString.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`Sanity query failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { result?: unknown };
  return json.result;
}

async function sanityFetchDocument(type: string, id?: string, slug?: string): Promise<unknown> {
  if (id) {
    return sanityQuery(`*[_type == $type && _id == $id][0]`, { type, id });
  }
  if (slug) {
    return sanityQuery(`*[_type == $type && slug.current == $slug][0]`, { type, slug });
  }
  return sanityQuery(`*[_type == $type] | order(_createdAt desc) [0...10]`, { type });
}

const tools: ToolDefinition[] = [
  {
    name: "sanity_fetch_document",
    description: "Fetch a Sanity document by type, id, or slug.",
    schema: {
      type: "object",
      properties: {
        type: { type: "string", description: "Document type (e.g. artwork, artist, room)" },
        id: { type: "string", description: "Document _id" },
        slug: { type: "string", description: "Document slug" },
      },
      required: ["type"],
    },
    handler: async (params) => {
      const p = FetchDocumentSchema.parse(params);
      return sanityFetchDocument(p.type, p.id, p.slug);
    },
  },
  {
    name: "sanity_fetch_artwork_by_slug",
    description: "Fetch an artwork by its slug.",
    schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
      },
      required: ["slug"],
    },
    handler: async (params) => {
      const slug = String(params.slug);
      return sanityFetchDocument("artwork", undefined, slug);
    },
  },
  {
    name: "sanity_fetch_room_scene",
    description: "Fetch a room's 3D scene configuration.",
    schema: {
      type: "object",
      properties: {
        roomSlug: { type: "string" },
      },
      required: ["roomSlug"],
    },
    handler: async (params) => {
      const roomSlug = String(params.roomSlug);
      return sanityQuery(`*[_type == "room" && slug.current == $slug][0]{..., "artworks": artworks[]->{...}}`, { slug: roomSlug });
    },
  },
  {
    name: "sanity_list_artworks",
    description: "List published artworks from Sanity.",
    schema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 20 },
      },
    },
    handler: async (params) => {
      const limit = Number(params.limit ?? 20);
      return sanityQuery(`*[_type == "artwork" && defined(slug.current)] | order(_createdAt desc) [0...$limit]`, { limit });
    },
  },
];

export function createSanityMCPServer(): MCPServer {
  return new MCPServer({
    name: "elbtronika-sanity",
    version: "1.0.0",
    tools,
  });
}
