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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bot_profiles: {
        Row: {
          about_me: string
          age: number
          alcohol: string | null
          children: string | null
          city: string
          created_at: string | null
          family_goals: string
          gender: string
          honesty_rating: number | null
          id: string
          looking_for: string
          name: string
          phone: string
          photos: string[] | null
          smoking: string | null
          total_ratings: number | null
          updated_at: string | null
          values: string
          zodiac_sign: string | null
        }
        Insert: {
          about_me: string
          age: number
          alcohol?: string | null
          children?: string | null
          city: string
          created_at?: string | null
          family_goals: string
          gender: string
          honesty_rating?: number | null
          id?: string
          looking_for: string
          name: string
          phone: string
          photos?: string[] | null
          smoking?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          values: string
          zodiac_sign?: string | null
        }
        Update: {
          about_me?: string
          age?: number
          alcohol?: string | null
          children?: string | null
          city?: string
          created_at?: string | null
          family_goals?: string
          gender?: string
          honesty_rating?: number | null
          id?: string
          looking_for?: string
          name?: string
          phone?: string
          photos?: string[] | null
          smoking?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          values?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      bot_response_queue: {
        Row: {
          bot_id: string
          conversation_id: string
          created_at: string | null
          id: string
          message_id: string
          processed: boolean | null
          scheduled_at: string
        }
        Insert: {
          bot_id: string
          conversation_id: string
          created_at?: string | null
          id?: string
          message_id: string
          processed?: boolean | null
          scheduled_at: string
        }
        Update: {
          bot_id?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_id?: string
          processed?: boolean | null
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_response_queue_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bot_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_response_queue_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_response_queue_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          meeting_confirmed: boolean | null
          meeting_date: string | null
          meeting_requested_by_user1: boolean | null
          meeting_requested_by_user2: boolean | null
          ready_for_meeting: boolean | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_confirmed?: boolean | null
          meeting_date?: string | null
          meeting_requested_by_user1?: boolean | null
          meeting_requested_by_user2?: boolean | null
          ready_for_meeting?: boolean | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_confirmed?: boolean | null
          meeting_date?: string | null
          meeting_requested_by_user1?: boolean | null
          meeting_requested_by_user2?: boolean | null
          ready_for_meeting?: boolean | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dislikes: {
        Row: {
          created_at: string | null
          disliked_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          disliked_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          disliked_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          liked_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_liked_user_id_fkey"
            columns: ["liked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          confirmed_by_user1: boolean | null
          confirmed_by_user2: boolean | null
          created_at: string | null
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          confirmed_by_user1?: boolean | null
          confirmed_by_user2?: boolean | null
          created_at?: string | null
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          confirmed_by_user1?: boolean | null
          confirmed_by_user2?: boolean | null
          created_at?: string | null
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string
          age: number
          alcohol: string | null
          children: string | null
          city: string
          created_at: string | null
          family_goals: string
          gender: string | null
          honesty_rating: number | null
          id: string
          is_bot: boolean | null
          looking_for: string | null
          name: string
          phone: string
          photo_url: string | null
          photos: string[] | null
          smoking: string | null
          total_ratings: number | null
          updated_at: string | null
          values: string
          zodiac_sign: string | null
        }
        Insert: {
          about_me: string
          age: number
          alcohol?: string | null
          children?: string | null
          city: string
          created_at?: string | null
          family_goals: string
          gender?: string | null
          honesty_rating?: number | null
          id: string
          is_bot?: boolean | null
          looking_for?: string | null
          name: string
          phone: string
          photo_url?: string | null
          photos?: string[] | null
          smoking?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          values: string
          zodiac_sign?: string | null
        }
        Update: {
          about_me?: string
          age?: number
          alcohol?: string | null
          children?: string | null
          city?: string
          created_at?: string | null
          family_goals?: string
          gender?: string | null
          honesty_rating?: number | null
          id?: string
          is_bot?: boolean | null
          looking_for?: string | null
          name?: string
          phone?: string
          photo_url?: string | null
          photos?: string[] | null
          smoking?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          values?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          conversation_id: string
          created_at: string | null
          id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
