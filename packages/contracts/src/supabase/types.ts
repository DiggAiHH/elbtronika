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
      agent_tasks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          type: string;
          goal: string;
          context: Json;
          plan: Json;
          status: string;
          result: Json | null;
          error: string | null;
          run_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          actor_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type: string;
          goal: string;
          context?: Json;
          plan?: Json;
          status?: string;
          result?: Json | null;
          error?: string | null;
          run_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          actor_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          type?: string;
          goal?: string;
          context?: Json;
          plan?: Json;
          status?: string;
          result?: Json | null;
          error?: string | null;
          run_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          actor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_tasks_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      // HAND-PATCHED (Sprint 3+6, 2026-07-09): flow-engine tables from
      // 20260429120000_flow_engine.sql and web_vitals from
      // 20260709120000_web_vitals.sql, written in gen-types style. Replace by
      // re-running `supabase gen types` once CLI access to the project exists —
      // the output must match this shape.
      web_vitals: {
        Row: {
          id: string;
          created_at: string;
          metric: string;
          value: number;
          rating: string | null;
          path: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          metric: string;
          value: number;
          rating?: string | null;
          path?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          metric?: string;
          value?: number;
          rating?: string | null;
          path?: string | null;
        };
        Relationships: [];
      };
      audio_features: {
        Row: {
          set_id: string;
          bpm: number | null;
          key: string | null;
          valence: number | null;
          arousal: number | null;
          spectral_centroid: number | null;
          mood_tags: string[] | null;
          embedding: Json | null;
          analyzed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          set_id: string;
          bpm?: number | null;
          key?: string | null;
          valence?: number | null;
          arousal?: number | null;
          spectral_centroid?: number | null;
          mood_tags?: string[] | null;
          embedding?: Json | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          set_id?: string;
          bpm?: number | null;
          key?: string | null;
          valence?: number | null;
          arousal?: number | null;
          spectral_centroid?: number | null;
          mood_tags?: string[] | null;
          embedding?: Json | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audio_features_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: true;
            referencedRelation: "sets";
            referencedColumns: ["id"];
          },
        ];
      };
      artwork_features: {
        Row: {
          artwork_id: string;
          dominant_colors: Json | null;
          color_harmony: string | null;
          brightness: number | null;
          contrast: number | null;
          saturation: number | null;
          composition_score: number | null;
          symmetry_score: number | null;
          style_tags: string[] | null;
          mood_tags: string[] | null;
          complexity: number | null;
          embedding: Json | null;
          analyzed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          artwork_id: string;
          dominant_colors?: Json | null;
          color_harmony?: string | null;
          brightness?: number | null;
          contrast?: number | null;
          saturation?: number | null;
          composition_score?: number | null;
          symmetry_score?: number | null;
          style_tags?: string[] | null;
          mood_tags?: string[] | null;
          complexity?: number | null;
          embedding?: Json | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          artwork_id?: string;
          dominant_colors?: Json | null;
          color_harmony?: string | null;
          brightness?: number | null;
          contrast?: number | null;
          saturation?: number | null;
          composition_score?: number | null;
          symmetry_score?: number | null;
          style_tags?: string[] | null;
          mood_tags?: string[] | null;
          complexity?: number | null;
          embedding?: Json | null;
          analyzed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "artwork_features_artwork_id_fkey";
            columns: ["artwork_id"];
            isOneToOne: true;
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
        ];
      };
      music_art_matches: {
        Row: {
          id: string;
          set_id: string | null;
          artwork_id: string | null;
          similarity_score: number | null;
          match_reason: string | null;
          curator_approved: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          set_id?: string | null;
          artwork_id?: string | null;
          similarity_score?: number | null;
          match_reason?: string | null;
          curator_approved?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          set_id?: string | null;
          artwork_id?: string | null;
          similarity_score?: number | null;
          match_reason?: string | null;
          curator_approved?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "music_art_matches_set_id_fkey";
            columns: ["set_id"];
            isOneToOne: false;
            referencedRelation: "sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "music_art_matches_artwork_id_fkey";
            columns: ["artwork_id"];
            isOneToOne: false;
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
        ];
      };
      mcp_audit_log: {
        Row: {
          id: string;
          created_at: string;
          actor_id: string | null;
          role: string;
          server: string;
          tool: string;
          status: string;
          duration_ms: number | null;
          error_class: string | null;
          request_hash: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          actor_id?: string | null;
          role: string;
          server: string;
          tool: string;
          status: string;
          duration_ms?: number | null;
          error_class?: string | null;
          request_hash?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          actor_id?: string | null;
          role?: string;
          server?: string;
          tool?: string;
          status?: string;
          duration_ms?: number | null;
          error_class?: string | null;
          request_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mcp_audit_log_actor_id_fkey";
            columns: ["actor_id"];
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
          is_demo: boolean;
          is_published: boolean;
          medium: string | null;
          model_url: string | null;
          price_eur: number;
          room_id: string | null;
          sanity_id: string | null;
          set_id: string | null;
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
          is_demo?: boolean;
          is_published?: boolean;
          medium?: string | null;
          model_url?: string | null;
          price_eur?: number;
          room_id?: string | null;
          sanity_id?: string | null;
          set_id?: string | null;
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
          is_demo?: boolean;
          is_published?: boolean;
          medium?: string | null;
          model_url?: string | null;
          price_eur?: number;
          room_id?: string | null;
          sanity_id?: string | null;
          set_id?: string | null;
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
      rooms: {
        Row: {
          created_at: string;
          id: string;
          is_published: boolean;
          lighting_preset: string;
          max_artworks: number;
          sanity_id: string | null;
          skybox: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          lighting_preset?: string;
          max_artworks?: number;
          sanity_id?: string | null;
          skybox?: string;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_published?: boolean;
          lighting_preset?: string;
          max_artworks?: number;
          sanity_id?: string | null;
          skybox?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          stripe_session_id: string | null;
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
          stripe_session_id?: string | null;
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
          stripe_session_id?: string | null;
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
