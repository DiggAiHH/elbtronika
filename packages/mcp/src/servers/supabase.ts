/**
 * MCP Server for Supabase (Database & Auth)
 * Exposes CRUD operations as MCP tools.
 */

import { MCPServer } from "../server";
import {
  DeleteParamsSchema,
  InsertParamsSchema,
  QueryParamsSchema,
  UpdateParamsSchema,
} from "../tools";
import type { ToolDefinition } from "../types";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL not set");
  return url;
}

function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return key;
}

async function supabaseRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  const url = `${getSupabaseUrl()}/rest/v1/${path}`;
  const headers: Record<string, string> = {
    apikey: getSupabaseServiceKey(),
    Authorization: `Bearer ${getSupabaseServiceKey()}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation" : "",
  };
  const init: RequestInit = { method, headers };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`Supabase ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}

const tools: ToolDefinition[] = [
  {
    name: "supabase_query",
    description: "Query rows from a Supabase table. Supports filtering, ordering, and pagination.",
    schema: {
      type: "object",
      properties: {
        table: { type: "string", description: "Table name" },
        select: { type: "string", description: "Columns to select (default: *)" },
        eq: { type: "object", description: "Filter: { column: value }" },
        order: {
          type: "object",
          properties: { column: { type: "string" }, ascending: { type: "boolean" } },
        },
        limit: { type: "number", description: "Max rows (1-100)" },
      },
      required: ["table"],
    },
    handler: async (params) => {
      const p = QueryParamsSchema.parse(params);
      let query = `${p.table}?select=${encodeURIComponent(p.select)}`;
      if (p.eq) {
        for (const [col, val] of Object.entries(p.eq)) {
          query += `&${col}=eq.${encodeURIComponent(String(val))}`;
        }
      }
      if (p.order) {
        query += `&order=${p.order.column}.${p.order.ascending ? "asc" : "desc"}`;
      }
      if (p.limit) {
        query += `&limit=${p.limit}`;
      }
      return supabaseRequest(query, "GET");
    },
  },
  {
    name: "supabase_insert",
    description: "Insert a row into a Supabase table.",
    schema: {
      type: "object",
      properties: {
        table: { type: "string" },
        data: { type: "object", description: "Row data" },
      },
      required: ["table", "data"],
    },
    handler: async (params) => {
      const p = InsertParamsSchema.parse(params);
      return supabaseRequest(p.table, "POST", p.data);
    },
  },
  {
    name: "supabase_update",
    description: "Update rows in a Supabase table filtered by eq.",
    schema: {
      type: "object",
      properties: {
        table: { type: "string" },
        data: { type: "object" },
        eq: { type: "object" },
      },
      required: ["table", "data", "eq"],
    },
    handler: async (params) => {
      const p = UpdateParamsSchema.parse(params);
      let query = `${p.table}?`;
      const filters = Object.entries(p.eq).map(
        ([col, val]) => `${col}=eq.${encodeURIComponent(String(val))}`,
      );
      query += filters.join("&");
      return supabaseRequest(query, "PATCH", p.data);
    },
  },
  {
    name: "supabase_delete",
    description: "Delete rows from a Supabase table filtered by eq.",
    schema: {
      type: "object",
      properties: {
        table: { type: "string" },
        eq: { type: "object" },
      },
      required: ["table", "eq"],
    },
    handler: async (params) => {
      const p = DeleteParamsSchema.parse(params);
      let query = `${p.table}?`;
      const filters = Object.entries(p.eq).map(
        ([col, val]) => `${col}=eq.${encodeURIComponent(String(val))}`,
      );
      query += filters.join("&");
      return supabaseRequest(query, "DELETE");
    },
  },
  {
    name: "supabase_query_profiles",
    description: "Query artist/DJ profiles with role filter.",
    schema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: ["visitor", "collector", "artist", "dj", "curator", "admin"],
        },
        limit: { type: "number" },
      },
    },
    handler: async (params) => {
      const role = String(params.role ?? "");
      const limit = Number(params.limit ?? 20);
      let query = `profiles?select=*&limit=${limit}`;
      if (role) query += `&role=eq.${encodeURIComponent(role)}`;
      return supabaseRequest(query, "GET");
    },
  },
  {
    name: "supabase_query_artworks",
    description: "Query artworks with status filter.",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["draft", "published", "sold", "archived"] },
        artistId: { type: "string" },
        limit: { type: "number" },
      },
    },
    handler: async (params) => {
      const status = String(params.status ?? "");
      const artistId = String(params.artistId ?? "");
      const limit = Number(params.limit ?? 20);
      let query = `artworks?select=*&limit=${limit}`;
      if (status) query += `&status=eq.${encodeURIComponent(status)}`;
      if (artistId) query += `&artist_id=eq.${encodeURIComponent(artistId)}`;
      return supabaseRequest(query, "GET");
    },
  },
];

export function createSupabaseMCPServer(): MCPServer {
  return new MCPServer({
    name: "elbtronika-supabase",
    version: "1.0.0",
    tools,
  });
}
