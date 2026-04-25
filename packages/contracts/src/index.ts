// Barrel export – single import point for all contracts

export * from "./schemas/artist.js";
export * from "./schemas/artwork.js";
export * from "./schemas/dj.js";
export * from "./schemas/order.js";
export * from "./schemas/user.js";

// Supabase database types (generated — do not edit by hand)
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  ProfileRow,
  ArtistRow,
  DjRow,
  ArtworkRow,
  SetRow,
  OrderRow,
  TransactionRow,
  ConsentLogRow,
  WebhookEventRow,
  AiDecisionRow,
  AuditEventRow,
  OrderStatus,
  TransactionStatus,
  ProfileRole,
  ConsentType,
} from "./supabase/index.js";
