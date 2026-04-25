// Re-export all Supabase types from contracts
// Client factories (browser / server / middleware) live in apps/web/src/lib/supabase/
// — they need Next.js cookies() and are not framework-agnostic.
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  // Row aliases
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
  // Status / role branded types
  OrderStatus,
  TransactionStatus,
  ProfileRole,
  ConsentType,
} from "./types.js";
