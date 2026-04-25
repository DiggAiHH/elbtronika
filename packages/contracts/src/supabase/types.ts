// @generated — do not edit by hand
// Source: supabase gen types typescript --project-id srsxruutknqkzdmhonoa
// Re-generate: pnpm supabase gen types typescript --project-id srsxruutknqkzdmhonoa > packages/contracts/src/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_decisions: {
        Row: {
          action: string;
          confidence: number | null;
          created_at: string;
          id: string;
          input_summary: string | null;
          metadata: Json;
          model: string;
          output_summary: string | null;
          triggered_by: string | null;
        };
        Insert: {
          action: string;
          confidence?: number | null;
          created_at?: string;
          id?: string;
          input_summary?: string | null;
          metadata?: Json;
          model: string;
          output_summary?: string | null;
          triggered_by?: string | null;
        };
        Update: {
          action?: string;
          confidence?: number | null;
          created_at?: string;
          id?: string;
          input_summary?: string | null;
          metadata?: Json;
          model?: string;
          output_summary?: string | null;
          triggered_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_decisions_triggered_by_fkey";
            columns: ["triggered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      artists: {
        Row: {
          bio: string | null;
          created_at: string;
          embedding: string | null;
          genre_tags: string[];
          id: string;
          instagram: string | null;
          is_published: boolean;
          name: string;
          payout_enabled: boolean;
          profile_id: string;
          slug: string;
          stripe_account_id: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          instagram?: string | null;
          is_published?: boolean;
          name: string;
          payout_enabled?: boolean;
          profile_id: string;
          slug: string;
          stripe_account_id?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          instagram?: string | null;
          is_published?: boolean;
          name?: string;
          payout_enabled?: boolean;
          profile_id?: string;
          slug?: string;
          stripe_account_id?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "artists_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      artworks: {
        Row: {
          artist_id: string;
          created_at: string;
          description: string | null;
          dimensions: string | null;
          edition_size: number | null;
          editions_sold: number;
          embedding: string | null;
          genre_tags: string[];
          id: string;
          image_url: string | null;
          is_published: boolean;
          medium: string | null;
          model_url: string | null;
          price_eur: number;
          sanity_id: string | null;
          slug: string;
          title: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          artist_id: string;
          created_at?: string;
          description?: string | null;
          dimensions?: string | null;
          edition_size?: number | null;
          editions_sold?: number;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          medium?: string | null;
          model_url?: string | null;
          price_eur?: number;
          sanity_id?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          artist_id?: string;
          created_at?: string;
          description?: string | null;
          dimensions?: string | null;
          edition_size?: number | null;
          editions_sold?: number;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          medium?: string | null;
          model_url?: string | null;
          price_eur?: number;
          sanity_id?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_events: {
        Row: {
          action: string;
          changed_by: string | null;
          created_at: string;
          id: number;
          new_data: Json | null;
          old_data: Json | null;
          record_id: string;
          table_name: string;
        };
        Insert: {
          action: string;
          changed_by?: string | null;
          created_at?: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id: string;
          table_name: string;
        };
        Update: {
          action?: string;
          changed_by?: string | null;
          created_at?: string;
          id?: never;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string;
          table_name?: string;
        };
        Relationships: [];
      };
      consent_log: {
        Row: {
          consent_type: string;
          created_at: string;
          document_version: string | null;
          granted: boolean;
          id: string;
          ip_hash: string | null;
          profile_id: string;
          user_agent: string | null;
        };
        Insert: {
          consent_type?: string;
          created_at?: string;
          document_version?: string | null;
          granted: boolean;
          id?: string;
          ip_hash?: string | null;
          profile_id: string;
          user_agent?: string | null;
        };
        Update: {
          consent_type?: string;
          created_at?: string;
          document_version?: string | null;
          granted?: boolean;
          id?: string;
          ip_hash?: string | null;
          profile_id?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consent_log_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      djs: {
        Row: {
          bio: string | null;
          created_at: string;
          embedding: string | null;
          genre_tags: string[];
          id: string;
          instagram: string | null;
          is_published: boolean;
          name: string;
          payout_enabled: boolean;
          profile_id: string;
          slug: string;
          soundcloud: string | null;
          stripe_account_id: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          instagram?: string | null;
          is_published?: boolean;
          name: string;
          payout_enabled?: boolean;
          profile_id: string;
          slug: string;
          soundcloud?: string | null;
          stripe_account_id?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          embedding?: string | null;
          genre_tags?: string[];
          id?: string;
          instagram?: string | null;
          is_published?: boolean;
          name?: string;
          payout_enabled?: boolean;
          profile_id?: string;
          slug?: string;
          soundcloud?: string | null;
          stripe_account_id?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "djs_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          amount_eur: number;
          artist_payout_eur: number;
          artwork_id: string;
          buyer_id: string;
          created_at: string;
          dj_payout_eur: number;
          id: string;
          platform_fee_eur: number;
          status: string;
          stripe_charge_id: string | null;
          stripe_payment_intent_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount_eur: number;
          artist_payout_eur: number;
          artwork_id: string;
          buyer_id: string;
          created_at?: string;
          dj_payout_eur?: number;
          id?: string;
          platform_fee_eur: number;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_eur?: number;
          artist_payout_eur?: number;
          artwork_id?: string;
          buyer_id?: string;
          created_at?: string;
          dj_payout_eur?: number;
          id?: string;
          platform_fee_eur?: number;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_artwork_id_fkey";
            columns: ["artwork_id"];
            isOneToOne: false;
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          locale: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          locale?: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          locale?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sets: {
        Row: {
          bpm: number | null;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          dj_id: string;
          duration_sec: number | null;
          genre_tags: string[];
          hls_url: string | null;
          id: string;
          is_published: boolean;
          sanity_id: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          bpm?: number | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          dj_id: string;
          duration_sec?: number | null;
          genre_tags?: string[];
          hls_url?: string | null;
          id?: string;
          is_published?: boolean;
          sanity_id?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          bpm?: number | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          dj_id?: string;
          duration_sec?: number | null;
          genre_tags?: string[];
          hls_url?: string | null;
          id?: string;
          is_published?: boolean;
          sanity_id?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sets_dj_id_fkey";
            columns: ["dj_id"];
            isOneToOne: false;
            referencedRelation: "djs";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount_eur: number;
          created_at: string;
          id: string;
          order_id: string;
          recipient_profile_id: string | null;
          role: string;
          status: string;
          stripe_destination: string | null;
          stripe_transfer_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount_eur: number;
          created_at?: string;
          id?: string;
          order_id: string;
          recipient_profile_id?: string | null;
          role: string;
          status?: string;
          stripe_destination?: string | null;
          stripe_transfer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_eur?: number;
          created_at?: string;
          id?: string;
          order_id?: string;
          recipient_profile_id?: string | null;
          role?: string;
          status?: string;
          stripe_destination?: string | null;
          stripe_transfer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_recipient_profile_id_fkey";
            columns: ["recipient_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          created_at: string;
          error: string | null;
          event_type: string;
          id: string;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          source: string;
          stripe_event_id: string | null;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          event_type: string;
          id?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          source?: string;
          stripe_event_id?: string | null;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          source?: string;
          stripe_event_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

// ---------------------------------------------------------------------------
// Convenience row-type aliases
// ---------------------------------------------------------------------------
export type ProfileRow = Tables<"profiles">;
export type ArtistRow = Tables<"artists">;
export type DjRow = Tables<"djs">;
export type ArtworkRow = Tables<"artworks">;
export type SetRow = Tables<"sets">;
export type OrderRow = Tables<"orders">;
export type TransactionRow = Tables<"transactions">;
export type ConsentLogRow = Tables<"consent_log">;
export type WebhookEventRow = Tables<"webhook_events">;
export type AiDecisionRow = Tables<"ai_decisions">;
export type AuditEventRow = Tables<"audit_events">;

// ---------------------------------------------------------------------------
// Branded status types (narrow the raw `string` from the generated types)
// ---------------------------------------------------------------------------
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "disputed";
export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";
export type ProfileRole = "visitor" | "collector" | "artist" | "dj" | "curator" | "admin";
export type ConsentType =
  | "analytics"
  | "marketing"
  | "data_processing"
  | "terms_of_service"
  | "privacy_policy";
