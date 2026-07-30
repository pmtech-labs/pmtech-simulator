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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      case_clusters: {
        Row: {
          created_at: string | null
          created_by: string | null
          eco_version_id: string | null
          id: string
          media: Json | null
          primary_domain_id: string | null
          reviewed_by: string | null
          scenario_text: string
          status: Database["public"]["Enums"]["item_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          eco_version_id?: string | null
          id?: string
          media?: Json | null
          primary_domain_id?: string | null
          reviewed_by?: string | null
          scenario_text: string
          status?: Database["public"]["Enums"]["item_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          eco_version_id?: string | null
          id?: string
          media?: Json | null
          primary_domain_id?: string | null
          reviewed_by?: string | null
          scenario_text?: string
          status?: Database["public"]["Enums"]["item_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_clusters_eco_version_id_fkey"
            columns: ["eco_version_id"]
            isOneToOne: false
            referencedRelation: "eco_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_clusters_primary_domain_id_fkey"
            columns: ["primary_domain_id"]
            isOneToOne: false
            referencedRelation: "eco_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_domains: {
        Row: {
          code: string
          eco_version_id: string | null
          id: string
          name: string
          sort_order: number
          weight_pct: number
        }
        Insert: {
          code: string
          eco_version_id?: string | null
          id?: string
          name: string
          sort_order: number
          weight_pct: number
        }
        Update: {
          code?: string
          eco_version_id?: string | null
          id?: string
          name?: string
          sort_order?: number
          weight_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "eco_domains_eco_version_id_fkey"
            columns: ["eco_version_id"]
            isOneToOne: false
            referencedRelation: "eco_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_enablers: {
        Row: {
          description: string
          id: string
          sort_order: number
          task_id: string | null
        }
        Insert: {
          description: string
          id?: string
          sort_order: number
          task_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          sort_order?: number
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eco_enablers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "eco_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eco_enablers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_task_coverage"
            referencedColumns: ["task_id"]
          },
        ]
      }
      eco_tasks: {
        Row: {
          domain_id: string | null
          id: string
          sort_order: number
          task_number: number
          title: string
        }
        Insert: {
          domain_id?: string | null
          id?: string
          sort_order: number
          task_number: number
          title: string
        }
        Update: {
          domain_id?: string | null
          id?: string
          sort_order?: number
          task_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_tasks_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "eco_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_versions: {
        Row: {
          created_at: string | null
          effective_date: string
          id: string
          is_active: boolean | null
          label: string
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: string
          is_active?: boolean | null
          label: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean | null
          label?: string
        }
        Relationships: []
      }
      exam_items: {
        Row: {
          answered_at: string | null
          cluster_id: string | null
          exam_id: string | null
          id: string
          is_correct: boolean | null
          is_pretest: boolean | null
          marked_for_review: boolean | null
          order_index: number
          question_id: string | null
          time_spent_seconds: number | null
          user_answer: Json | null
        }
        Insert: {
          answered_at?: string | null
          cluster_id?: string | null
          exam_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_pretest?: boolean | null
          marked_for_review?: boolean | null
          order_index: number
          question_id?: string | null
          time_spent_seconds?: number | null
          user_answer?: Json | null
        }
        Update: {
          answered_at?: string | null
          cluster_id?: string | null
          exam_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_pretest?: boolean | null
          marked_for_review?: boolean | null
          order_index?: number
          question_id?: string | null
          time_spent_seconds?: number | null
          user_answer?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_items_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "case_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_items_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          config: Json | null
          finished_at: string | null
          id: string
          license_id: string | null
          mode: Database["public"]["Enums"]["exam_mode"]
          score_by_approach: Json | null
          score_by_domain: Json | null
          score_pct: number | null
          started_at: string | null
          status: string | null
          time_limit_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          config?: Json | null
          finished_at?: string | null
          id?: string
          license_id?: string | null
          mode?: Database["public"]["Enums"]["exam_mode"]
          score_by_approach?: Json | null
          score_by_domain?: Json | null
          score_pct?: number | null
          started_at?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          config?: Json | null
          finished_at?: string | null
          id?: string
          license_id?: string | null
          mode?: Database["public"]["Enums"]["exam_mode"]
          score_by_approach?: Json | null
          score_by_domain?: Json | null
          score_pct?: number | null
          started_at?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          plan_id: string | null
          starts_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          plan_id?: string | null
          starts_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          plan_id?: string | null
          starts_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          code: Database["public"]["Enums"]["plan_code"]
          currency: string | null
          duration_months: number
          id: string
          includes_adaptive_engine: boolean | null
          includes_analytics: boolean | null
          includes_practicum_full: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          code: Database["public"]["Enums"]["plan_code"]
          currency?: string | null
          duration_months: number
          id?: string
          includes_adaptive_engine?: boolean | null
          includes_analytics?: boolean | null
          includes_practicum_full?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
        }
        Update: {
          code?: Database["public"]["Enums"]["plan_code"]
          currency?: string | null
          duration_months?: number
          id?: string
          includes_adaptive_engine?: boolean | null
          includes_analytics?: boolean | null
          includes_practicum_full?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          approach: Database["public"]["Enums"]["approach_type"]
          cluster_id: string | null
          correct_answer: Json
          created_at: string | null
          created_by: string | null
          difficulty: number | null
          eco_version_id: string | null
          enabler_ids: string[] | null
          explanation: string
          focus_tags: string[] | null
          format: Database["public"]["Enums"]["item_format"]
          id: string
          item_type: Database["public"]["Enums"]["item_type"]
          options: Json
          practicum_payload: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["item_status"] | null
          stem: string
          task_id: string
          times_answered: number | null
          times_correct: number | null
          updated_at: string | null
        }
        Insert: {
          approach: Database["public"]["Enums"]["approach_type"]
          cluster_id?: string | null
          correct_answer: Json
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          eco_version_id?: string | null
          enabler_ids?: string[] | null
          explanation: string
          focus_tags?: string[] | null
          format?: Database["public"]["Enums"]["item_format"]
          id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          options: Json
          practicum_payload?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stem: string
          task_id: string
          times_answered?: number | null
          times_correct?: number | null
          updated_at?: string | null
        }
        Update: {
          approach?: Database["public"]["Enums"]["approach_type"]
          cluster_id?: string | null
          correct_answer?: Json
          created_at?: string | null
          created_by?: string | null
          difficulty?: number | null
          eco_version_id?: string | null
          enabler_ids?: string[] | null
          explanation?: string
          focus_tags?: string[] | null
          format?: Database["public"]["Enums"]["item_format"]
          id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          options?: Json
          practicum_payload?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stem?: string
          task_id?: string
          times_answered?: number | null
          times_correct?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "case_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_eco_version_id_fkey"
            columns: ["eco_version_id"]
            isOneToOne: false
            referencedRelation: "eco_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "eco_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_task_coverage"
            referencedColumns: ["task_id"]
          },
        ]
      }
      retargeting_signals: {
        Row: {
          created_at: string | null
          detail: Json | null
          id: string
          processed: boolean | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detail?: Json | null
          id?: string
          processed?: boolean | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          detail?: Json | null
          id?: string
          processed?: boolean | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_task_mastery: {
        Row: {
          attempts: number | null
          correct: number | null
          last_attempt_at: string | null
          mastery_pct: number | null
          task_id: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          correct?: number | null
          last_attempt_at?: string | null
          mastery_pct?: number | null
          task_id: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          correct?: number | null
          last_attempt_at?: string | null
          mastery_pct?: number | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_mastery_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "eco_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_mastery_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_task_coverage"
            referencedColumns: ["task_id"]
          },
        ]
      }
    }
    Views: {
      v_task_coverage: {
        Row: {
          domain_code: string | null
          domain_name: string | null
          domain_sort_order: number | null
          domain_weight_pct: number | null
          draft_count: number | null
          in_review_count: number | null
          published_agile_hybrid: number | null
          published_count: number | null
          published_predictive: number | null
          task_id: string | null
          task_number: number | null
          task_title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      upsert_task_mastery: {
        Args: { p_is_correct: boolean; p_task_id: string; p_user_id: string }
        Returns: undefined
      }
      validate_bank_readiness: {
        Args: never
        Returns: {
          published_count: number
          task_id: string
          task_title: string
        }[]
      }
    }
    Enums: {
      approach_type: "predictive" | "agile" | "hybrid"
      exam_mode: "full_sim" | "domain_drill" | "case_only" | "custom"
      item_format:
        | "mc_single"
        | "mc_multi"
        | "matching"
        | "enhanced_matching"
        | "graphic_based"
        | "hotspot"
        | "pulldown"
      item_status: "draft" | "in_review" | "approved" | "published" | "retired"
      item_type: "standalone" | "case_child" | "practicum"
      plan_code: "basica_3m" | "premium_6m"
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
      approach_type: ["predictive", "agile", "hybrid"],
      exam_mode: ["full_sim", "domain_drill", "case_only", "custom"],
      item_format: [
        "mc_single",
        "mc_multi",
        "matching",
        "enhanced_matching",
        "graphic_based",
        "hotspot",
        "pulldown",
      ],
      item_status: ["draft", "in_review", "approved", "published", "retired"],
      item_type: ["standalone", "case_child", "practicum"],
      plan_code: ["basica_3m", "premium_6m"],
    },
  },
} as const
