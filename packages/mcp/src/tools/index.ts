/**
 * Shared MCP tool schemas and utilities.
 */

import { z } from "zod";

export const QueryParamsSchema = z.object({
  table: z.string().min(1),
  select: z.string().default("*"),
  eq: z.record(z.string(), z.unknown()).optional(),
  order: z.object({ column: z.string(), ascending: z.boolean().default(true) }).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const InsertParamsSchema = z.object({
  table: z.string().min(1),
  data: z.record(z.unknown()),
});

export const UpdateParamsSchema = z.object({
  table: z.string().min(1),
  data: z.record(z.unknown()),
  eq: z.record(z.string(), z.unknown()),
});

export const DeleteParamsSchema = z.object({
  table: z.string().min(1),
  eq: z.record(z.string(), z.unknown()),
});

export const FetchDocumentSchema = z.object({
  type: z.string().min(1),
  id: z.string().optional(),
  slug: z.string().optional(),
  query: z.string().optional(),
});

export const PaymentIntentSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().default("EUR"),
  artworkId: z.string().uuid(),
  buyerId: z.string().uuid(),
});

export const AnalyzeTrackSchema = z.object({
  trackId: z.string().uuid(),
  hlsUrl: z.string().url().optional(),
});

export const MatchArtworkSchema = z.object({
  setId: z.string().uuid(),
  limit: z.number().int().min(1).max(20).default(5),
});

export type QueryParams = z.infer<typeof QueryParamsSchema>;
export type InsertParams = z.infer<typeof InsertParamsSchema>;
export type UpdateParams = z.infer<typeof UpdateParamsSchema>;
export type DeleteParams = z.infer<typeof DeleteParamsSchema>;
export type FetchDocumentParams = z.infer<typeof FetchDocumentSchema>;
export type PaymentIntentParams = z.infer<typeof PaymentIntentSchema>;
export type AnalyzeTrackParams = z.infer<typeof AnalyzeTrackSchema>;
export type MatchArtworkParams = z.infer<typeof MatchArtworkSchema>;
