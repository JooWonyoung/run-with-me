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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      Applications: {
        Row: {
          created_at: string
          id: string
          run_id: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          run_id?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          run_id?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Applications_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "Runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Runs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string
          host_id: string
          id: string
          image_urls: string[] | null
          max_capacity: number
          meeting_address: string
          meeting_at: string
          meeting_latitude: number | null
          meeting_longitude: number | null
          meeting_place_name: string
          status: Database["public"]["Enums"]["run_status"] | null
          target_distance_km: number | null
          target_pace_minute: string | null
          thumbnail_url: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description: string
          host_id?: string
          id?: string
          image_urls?: string[] | null
          max_capacity: number
          meeting_address: string
          meeting_at: string
          meeting_latitude?: number | null
          meeting_longitude?: number | null
          meeting_place_name: string
          status?: Database["public"]["Enums"]["run_status"] | null
          target_distance_km?: number | null
          target_pace_minute?: string | null
          thumbnail_url?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string
          host_id?: string
          id?: string
          image_urls?: string[] | null
          max_capacity?: number
          meeting_address?: string
          meeting_at?: string
          meeting_latitude?: number | null
          meeting_longitude?: number | null
          meeting_place_name?: string
          status?: Database["public"]["Enums"]["run_status"] | null
          target_distance_km?: number | null
          target_pace_minute?: string | null
          thumbnail_url?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Runs_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          birth_year: number | null
          created_at: string
          email: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_onboarded: boolean
          mbti: string | null
          message: string | null
          nickname: string | null
          profile_img: string | null
          provider: string | null
          race_records: Json
          sns_links: Json
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          email?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_onboarded?: boolean
          mbti?: string | null
          message?: string | null
          nickname?: string | null
          profile_img?: string | null
          provider?: string | null
          race_records?: Json
          sns_links?: Json
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          email?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_onboarded?: boolean
          mbti?: string | null
          message?: string | null
          nickname?: string | null
          profile_img?: string | null
          provider?: string | null
          race_records?: Json
          sns_links?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "pending"
        | "approved"
        | "rejected"
        | "canceled"
        | "completed"
      gender: "male" | "female" | "none"
      run_status: "open" | "closed" | "canceled" | "completed"
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
    Enums: {
      application_status: [
        "pending",
        "approved",
        "rejected",
        "canceled",
        "completed",
      ],
      gender: ["male", "female", "none"],
      run_status: ["open", "closed", "canceled", "completed"],
    },
  },
} as const
