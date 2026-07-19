export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          code: string
          description: string | null
          icon: string | null
          id: string
          is_hidden: boolean | null
          required_count: number
          title: string
          xp_reward: number | null
        }
        Insert: {
          category: string
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          is_hidden?: boolean | null
          required_count?: number
          title: string
          xp_reward?: number | null
        }
        Update: {
          category?: string
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_hidden?: boolean | null
          required_count?: number
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      cefr_levels: {
        Row: {
          code: string
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          required_count: number
          requirement_type: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          required_count: number
          requirement_type: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          required_count?: number
          requirement_type?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      lesson_stages: {
        Row: {
          content: Json | null
          id: string
          is_active: boolean | null
          lesson_id: string | null
          order_index: number
          title: string
          type: string
        }
        Insert: {
          content?: Json | null
          id?: string
          is_active?: boolean | null
          lesson_id?: string | null
          order_index: number
          title: string
          type: string
        }
        Update: {
          content?: Json | null
          id?: string
          is_active?: boolean | null
          lesson_id?: string | null
          order_index?: number
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_stages_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
          order_index: number
          title: string
          xp_reward: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          order_index: number
          title: string
          xp_reward?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          order_index?: number
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          description: string | null
          difficulty: number | null
          estimated_minutes: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number
          sublevel_id: string | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          description?: string | null
          difficulty?: number | null
          estimated_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          sublevel_id?: string | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          description?: string | null
          difficulty?: number | null
          estimated_minutes?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          sublevel_id?: string | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_sublevel_id_fkey"
            columns: ["sublevel_id"]
            isOneToOne: false
            referencedRelation: "sublevels"
            referencedColumns: ["id"]
          },
        ]
      }
      review_queue: {
        Row: {
          ease_factor: number | null
          id: string
          interval_days: number | null
          next_review_at: string
          reviewable_id: string
          reviewable_type: string
          user_id: string | null
        }
        Insert: {
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string
          reviewable_id: string
          reviewable_type: string
          user_id?: string | null
        }
        Update: {
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review_at?: string
          reviewable_id?: string
          reviewable_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sublevels: {
        Row: {
          cefr_level_id: string | null
          code: string
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
        }
        Insert: {
          cefr_level_id?: string | null
          code: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          title: string
        }
        Update: {
          cefr_level_id?: string | null
          code?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sublevels_cefr_level_id_fkey"
            columns: ["cefr_level_id"]
            isOneToOne: false
            referencedRelation: "cefr_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          current_count: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          current_count?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          current_count?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_approvals: {
        Row: {
          reject_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          reject_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          reject_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_quests: {
        Row: {
          completed: boolean | null
          date: string
          progress: number | null
          quest_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          date: string
          progress?: number | null
          quest_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          date?: string
          progress?: number | null
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "daily_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          title: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          title?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          title?: string | null
          username?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          id: string
          score: number | null
          stage_id: string | null
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          score?: number | null
          stage_id?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          score?: number | null
          stage_id?: string | null
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "lesson_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role?: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          grammar: number | null
          listening: number | null
          pronunciation: number | null
          reading: number | null
          speaking: number | null
          user_id: string
          vocabulary: number | null
          writing: number | null
        }
        Insert: {
          grammar?: number | null
          listening?: number | null
          pronunciation?: number | null
          reading?: number | null
          speaking?: number | null
          user_id: string
          vocabulary?: number | null
          writing?: number | null
        }
        Update: {
          grammar?: number | null
          listening?: number | null
          pronunciation?: number | null
          reading?: number | null
          speaking?: number | null
          user_id?: string
          vocabulary?: number | null
          writing?: number | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          last_active_date: string | null
          longest_streak: number | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          level: number | null
          total_xp: number | null
          user_id: string
          xp_to_next_level: number | null
        }
        Insert: {
          level?: number | null
          total_xp?: number | null
          user_id: string
          xp_to_next_level?: number | null
        }
        Update: {
          level?: number | null
          total_xp?: number | null
          user_id?: string
          xp_to_next_level?: number | null
        }
        Relationships: []
      }
      vocabulary_items: {
        Row: {
          example_sentence: string | null
          id: string
          lesson_id: string | null
          part_of_speech: string | null
          translation: string
          word: string
        }
        Insert: {
          example_sentence?: string | null
          id?: string
          lesson_id?: string | null
          part_of_speech?: string | null
          translation: string
          word: string
        }
        Update: {
          example_sentence?: string | null
          id?: string
          lesson_id?: string | null
          part_of_speech?: string | null
          translation?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
