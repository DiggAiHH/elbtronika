// Re-export all Supabase types from contracts
// Client factories (browser / server / middleware) live in apps/web/src/lib/supabase/
// — they need Next.js cookies() and are not framework-agnostic.
export type {
  AiDecisionRow,
  ArtistRow,
  ArtworkRow,
  AuditEventRow,
  CompositeTypes,
  ConsentLogRow,
  ConsentType,
  Database,
  DjRow,
  Enums,
  Json,
  OrderRow,
  // Status / role branded types
  OrderStatus,
  ProfileRole,
  // Row aliases
  ProfileRow,
  SetRow,
  Tables,
  TablesInsert,
  TablesUpdate,
  TransactionRow,
  TransactionStatus,
  WebhookEventRow,
} from "./types.js";
