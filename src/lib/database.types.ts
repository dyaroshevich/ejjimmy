export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      knowledge: {
        Row: {
          content: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          bill_amount: number | null
          chat_history: Json | null
          city: string | null
          created_at: string | null
          email: string | null
          equipment_tier: string | null
          id: number
          line_id: string | null
          location: string | null
          name: string | null
          notes: string | null
          payback_years: number | null
          phone: string | null
          source: string | null
          status: string | null
          survey_date: string | null
          system_size: number | null
          unread: boolean | null
          updated_at: string | null
        }
        Insert: {
          bill_amount?: number | null
          chat_history?: Json | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          equipment_tier?: string | null
          id?: number
          line_id?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          payback_years?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          survey_date?: string | null
          system_size?: number | null
          unread?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bill_amount?: number | null
          chat_history?: Json | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          equipment_tier?: string | null
          id?: number
          line_id?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          payback_years?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          survey_date?: string | null
          system_size?: number | null
          unread?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      line_actions_log: {
        Row: {
          action: string
          created_at: string | null
          id: number
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      line_context: {
        Row: {
          calc_bill_range: string | null
          calc_location: string | null
          calc_result_kw: number | null
          calc_roof_type: string | null
          calc_system_type: string | null
          calculator_area: string | null
          calculator_bill: number | null
          calculator_step: string | null
          last_action: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calc_bill_range?: string | null
          calc_location?: string | null
          calc_result_kw?: number | null
          calc_roof_type?: string | null
          calc_system_type?: string | null
          calculator_area?: string | null
          calculator_bill?: number | null
          calculator_step?: string | null
          last_action?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calc_bill_range?: string | null
          calc_location?: string | null
          calc_result_kw?: number | null
          calc_roof_type?: string | null
          calc_system_type?: string | null
          calculator_area?: string | null
          calculator_bill?: number | null
          calculator_step?: string | null
          last_action?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solar_products: {
        Row: {
          brand: string | null
          created_at: string | null
          description: string | null
          gallery: Json | null
          id: string
          image_url: string | null
          included_services: Json | null
          model: string | null
          name: string
          power_kw: number | null
          price_thb: number | null
          specifications: Json | null
          system_components: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          gallery?: Json | null
          id: string
          image_url?: string | null
          included_services?: Json | null
          model?: string | null
          name: string
          power_kw?: number | null
          price_thb?: number | null
          specifications?: Json | null
          system_components?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          description?: string | null
          gallery?: Json | null
          id?: string
          image_url?: string | null
          included_services?: Json | null
          model?: string | null
          name?: string
          power_kw?: number | null
          price_thb?: number | null
          specifications?: Json | null
          system_components?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image: string | null
          author: string | null
          published: boolean | null
          published_at: string | null
          category: string | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          cover_image?: string | null
          author?: string | null
          published?: boolean | null
          published_at?: string | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          author?: string | null
          published?: boolean | null
          published_at?: string | null
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Relationships: []
      }
      research_documents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          file_path: string | null
          file_type: string | null
          content: string | null
          insight: string | null
          tags: string[] | null
          status: string | null
          category: string | null
          content_preview: string | null
          metadata: Json | null
          file_hash: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          file_path?: string | null
          file_type?: string | null
          content?: string | null
          insight?: string | null
          tags?: string[] | null
          status?: string | null
          category?: string | null
          content_preview?: string | null
          metadata?: Json | null
          file_hash?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          file_path?: string | null
          file_type?: string | null
          content?: string | null
          insight?: string | null
          tags?: string[] | null
          status?: string | null
          category?: string | null
          content_preview?: string | null
          metadata?: Json | null
          file_hash?: string | null
        }
        Relationships: []
      }
      research_document_chunks: {
        Row: {
          id: string
          created_at: string
          document_id: string | null
          content: string
          embedding: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          document_id?: string | null
          content: string
          embedding?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          document_id?: string | null
          content?: string
          embedding?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "research_document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "research_documents"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_research_chunks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          p_document_ids?: string[]
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
          metadata: Json
        }[]
      }
      match_knowledge: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
