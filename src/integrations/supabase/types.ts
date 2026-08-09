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
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      app_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          page_context: string | null
          rating: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          page_context?: string | null
          rating?: number | null
          status?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          page_context?: string | null
          rating?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
      course_unit_tasks: {
        Row: {
          course_unit_id: string
          task_id: string
        }
        Insert: {
          course_unit_id: string
          task_id: string
        }
        Update: {
          course_unit_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_unit_tasks_course_unit_id_fkey"
            columns: ["course_unit_id"]
            isOneToOne: false
            referencedRelation: "course_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_unit_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "eco_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_unit_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_task_coverage"
            referencedColumns: ["task_id"]
          },
        ]
      }
      course_units: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          sequence: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          sequence: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          sequence?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      diplomas: {
        Row: {
          diploma_type: string
          exam_id: string
          id: string
          issued_at: string
          score_by_domain: Json | null
          score_pct: number
          threshold_pct: number
          user_id: string
        }
        Insert: {
          diploma_type?: string
          exam_id: string
          id?: string
          issued_at?: string
          score_by_domain?: Json | null
          score_pct: number
          threshold_pct: number
          user_id: string
        }
        Update: {
          diploma_type?: string
          exam_id?: string
          id?: string
          issued_at?: string
          score_by_domain?: Json | null
          score_pct?: number
          threshold_pct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diplomas_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diplomas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
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
          error_type_chosen:
            | Database["public"]["Enums"]["error_type_enum"]
            | null
          exam_id: string | null
          id: string
          is_correct: boolean | null
          is_pretest: boolean | null
          marked_for_review: boolean | null
          order_index: number
          question_id: string | null
          section_number: number | null
          time_spent_seconds: number | null
          user_answer: Json | null
        }
        Insert: {
          answered_at?: string | null
          cluster_id?: string | null
          error_type_chosen?:
            | Database["public"]["Enums"]["error_type_enum"]
            | null
          exam_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_pretest?: boolean | null
          marked_for_review?: boolean | null
          order_index: number
          question_id?: string | null
          section_number?: number | null
          time_spent_seconds?: number | null
          user_answer?: Json | null
        }
        Update: {
          answered_at?: string | null
          cluster_id?: string | null
          error_type_chosen?:
            | Database["public"]["Enums"]["error_type_enum"]
            | null
          exam_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_pretest?: boolean | null
          marked_for_review?: boolean | null
          order_index?: number
          question_id?: string | null
          section_number?: number | null
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
          {
            foreignKeyName: "exam_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_question_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "exam_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_questions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sections: {
        Row: {
          exam_id: string | null
          finished_at: string | null
          id: string
          section_number: number
          started_at: string | null
          status: string
          time_limit_seconds: number
          total_questions: number
        }
        Insert: {
          exam_id?: string | null
          finished_at?: string | null
          id?: string
          section_number: number
          started_at?: string | null
          status?: string
          time_limit_seconds: number
          total_questions: number
        }
        Update: {
          exam_id?: string | null
          finished_at?: string | null
          id?: string
          section_number?: number
          started_at?: string | null
          status?: string
          time_limit_seconds?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_sections_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          break_extension_seconds: number
          breaks_used: number
          config: Json | null
          finished_at: string | null
          id: string
          license_id: string | null
          mode: Database["public"]["Enums"]["exam_mode"]
          new_items_count: number | null
          paused_at: string | null
          repeated_items_count: number | null
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
          break_extension_seconds?: number
          breaks_used?: number
          config?: Json | null
          finished_at?: string | null
          id?: string
          license_id?: string | null
          mode?: Database["public"]["Enums"]["exam_mode"]
          new_items_count?: number | null
          paused_at?: string | null
          repeated_items_count?: number | null
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
          break_extension_seconds?: number
          breaks_used?: number
          config?: Json | null
          finished_at?: string | null
          id?: string
          license_id?: string | null
          mode?: Database["public"]["Enums"]["exam_mode"]
          new_items_count?: number | null
          paused_at?: string | null
          repeated_items_count?: number | null
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
          {
            foreignKeyName: "exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          approach: Database["public"]["Enums"]["approach_type"] | null
          completed_at: string | null
          connector_id: string | null
          count_failed: number | null
          count_generated: number | null
          count_requested: number
          created_at: string | null
          difficulty_max: number | null
          difficulty_min: number | null
          error_message: string | null
          focus_tags: string[] | null
          format: Database["public"]["Enums"]["item_format"]
          id: string
          requested_by: string | null
          started_at: string | null
          status: string
          task_ids: string[]
        }
        Insert: {
          approach?: Database["public"]["Enums"]["approach_type"] | null
          completed_at?: string | null
          connector_id?: string | null
          count_failed?: number | null
          count_generated?: number | null
          count_requested: number
          created_at?: string | null
          difficulty_max?: number | null
          difficulty_min?: number | null
          error_message?: string | null
          focus_tags?: string[] | null
          format?: Database["public"]["Enums"]["item_format"]
          id?: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          task_ids: string[]
        }
        Update: {
          approach?: Database["public"]["Enums"]["approach_type"] | null
          completed_at?: string | null
          connector_id?: string | null
          count_failed?: number | null
          count_generated?: number | null
          count_requested?: number
          created_at?: string | null
          difficulty_max?: number | null
          difficulty_min?: number | null
          error_message?: string | null
          focus_tags?: string[] | null
          format?: Database["public"]["Enums"]["item_format"]
          id?: string
          requested_by?: string | null
          started_at?: string | null
          status?: string
          task_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "llm_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "v_question_stats"
            referencedColumns: ["generation_connector_id"]
          },
          {
            foreignKeyName: "generation_jobs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          category: string
          created_at: string
          definition: string
          id: string
          term: string
        }
        Insert: {
          category: string
          created_at?: string
          definition: string
          id?: string
          term: string
        }
        Update: {
          category?: string
          created_at?: string
          definition?: string
          id?: string
          term?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          expires_at: string
          free_full_sim_used: boolean
          free_half_sim_used: boolean
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
          free_full_sim_used?: boolean
          free_half_sim_used?: boolean
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
          free_full_sim_used?: boolean
          free_half_sim_used?: boolean
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
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      llm_connectors: {
        Row: {
          api_base_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean
          model_id: string
          name: string
          provider: string
          secret_id: string
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          model_id: string
          name: string
          provider: string
          secret_id: string
        }
        Update: {
          api_base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean
          model_id?: string
          name?: string
          provider?: string
          secret_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_connectors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          source: string
          status: string
          synced_to_resend_at: string | null
          synced_to_substack_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          source?: string
          status?: string
          synced_to_resend_at?: string | null
          synced_to_substack_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          source?: string
          status?: string
          synced_to_resend_at?: string | null
          synced_to_substack_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
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
      question_rejections: {
        Row: {
          format: string
          id: string
          question_id: string | null
          question_number: number
          reason: string
          rejected_at: string
          rejected_by: string
          stem_snapshot: string
          task_id: string
        }
        Insert: {
          format: string
          id?: string
          question_id?: string | null
          question_number: number
          reason: string
          rejected_at?: string
          rejected_by: string
          stem_snapshot: string
          task_id: string
        }
        Update: {
          format?: string
          id?: string
          question_id?: string | null
          question_number?: number
          reason?: string
          rejected_at?: string
          rejected_by?: string
          stem_snapshot?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_rejections_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_rejections_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_question_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "question_rejections_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_questions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_rejections_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "question_rejections_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "eco_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_rejections_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_task_coverage"
            referencedColumns: ["task_id"]
          },
        ]
      }
      question_reports: {
        Row: {
          comment: string
          created_at: string
          exam_id: string | null
          id: string
          question_id: string
          status: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          exam_id?: string | null
          id?: string
          question_id: string
          status?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          exam_id?: string | null
          id?: string
          question_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reports_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_question_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_questions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      question_tag_defs: {
        Row: {
          code: string
          exclusive: boolean
          label: string
          sort_order: number
          tag_type: string
          tag_type_label: string
        }
        Insert: {
          code: string
          exclusive: boolean
          label: string
          sort_order: number
          tag_type: string
          tag_type_label: string
        }
        Update: {
          code?: string
          exclusive?: boolean
          label?: string
          sort_order?: number
          tag_type?: string
          tag_type_label?: string
        }
        Relationships: []
      }
      question_tags: {
        Row: {
          question_id: string
          tag_code: string
        }
        Insert: {
          question_id: string
          tag_code: string
        }
        Update: {
          question_id?: string
          tag_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_question_stats"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_questions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_tag_code_fkey"
            columns: ["tag_code"]
            isOneToOne: false
            referencedRelation: "question_tag_defs"
            referencedColumns: ["code"]
          },
        ]
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
          generation_job_id: string | null
          id: string
          item_type: Database["public"]["Enums"]["item_type"]
          options: Json
          performance_domain:
            | Database["public"]["Enums"]["performance_domain_type"]
            | null
          practicum_payload: Json | null
          process_group:
            | Database["public"]["Enums"]["process_group_type"]
            | null
          question_number: number
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
          generation_job_id?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          options: Json
          performance_domain?:
            | Database["public"]["Enums"]["performance_domain_type"]
            | null
          practicum_payload?: Json | null
          process_group?:
            | Database["public"]["Enums"]["process_group_type"]
            | null
          question_number?: number
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
          generation_job_id?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          options?: Json
          performance_domain?:
            | Database["public"]["Enums"]["performance_domain_type"]
            | null
          practicum_payload?: Json | null
          process_group?:
            | Database["public"]["Enums"]["process_group_type"]
            | null
          question_number?: number
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
            foreignKeyName: "questions_generation_job_id_fkey"
            columns: ["generation_job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
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
        Relationships: [
          {
            foreignKeyName: "retargeting_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          source: string
          status: string
          training_interest: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          source?: string
          status?: string
          training_interest?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          source?: string
          status?: string
          training_interest?: string
        }
        Relationships: []
      }
      user_error_type_stats: {
        Row: {
          error_type: Database["public"]["Enums"]["error_type_enum"]
          last_seen_at: string | null
          occurrences: number | null
          user_id: string
        }
        Insert: {
          error_type: Database["public"]["Enums"]["error_type_enum"]
          last_seen_at?: string | null
          occurrences?: number | null
          user_id: string
        }
        Update: {
          error_type?: Database["public"]["Enums"]["error_type_enum"]
          last_seen_at?: string | null
          occurrences?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_error_type_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
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
          {
            foreignKeyName: "user_task_mastery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_admin_users: {
        Row: {
          current_expires_at: string | null
          current_plan_code: Database["public"]["Enums"]["plan_code"] | null
          email: string | null
          exams_taken: number | null
          is_admin: boolean | null
          last_exam_at: string | null
          last_sign_in_at: string | null
          latest_license_status: string | null
          paid_licenses_count: number | null
          signed_up_at: string | null
          user_id: string | null
        }
        Insert: {
          current_expires_at?: never
          current_plan_code?: never
          email?: string | null
          exams_taken?: never
          is_admin?: never
          last_exam_at?: never
          last_sign_in_at?: string | null
          latest_license_status?: never
          paid_licenses_count?: never
          signed_up_at?: string | null
          user_id?: string | null
        }
        Update: {
          current_expires_at?: never
          current_plan_code?: never
          email?: string | null
          exams_taken?: never
          is_admin?: never
          last_exam_at?: never
          last_sign_in_at?: string | null
          latest_license_status?: never
          paid_licenses_count?: never
          signed_up_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_exam_stats: {
        Row: {
          avg_score_pct: number | null
          first_exam_at: string | null
          last_exam_at: string | null
          mode: Database["public"]["Enums"]["exam_mode"] | null
          status: string | null
          total_exams: number | null
        }
        Relationships: []
      }
      v_question_stats: {
        Row: {
          approach: Database["public"]["Enums"]["approach_type"] | null
          cluster_id: string | null
          cluster_scenario: string | null
          correct_answer: Json | null
          created_at: string | null
          difficulty: number | null
          domain_code: string | null
          domain_name: string | null
          explanation: string | null
          focus_tags: string[] | null
          format: Database["public"]["Enums"]["item_format"] | null
          generation_connector_id: string | null
          generation_connector_name: string | null
          generation_job_id: string | null
          generation_model_id: string | null
          generation_provider: string | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          latest_rejection_reason: string | null
          open_reports_count: number | null
          options: Json | null
          performance_domain:
            | Database["public"]["Enums"]["performance_domain_type"]
            | null
          process_group:
            | Database["public"]["Enums"]["process_group_type"]
            | null
          question_id: string | null
          question_number: number | null
          status: Database["public"]["Enums"]["item_status"] | null
          stem: string | null
          success_rate_pct: number | null
          tag_codes: string[] | null
          task_id: string | null
          task_title: string | null
          times_answered: number | null
          times_correct: number | null
          times_used_in_exams: number | null
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
            foreignKeyName: "questions_generation_job_id_fkey"
            columns: ["generation_job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
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
      v_questions_public: {
        Row: {
          approach: Database["public"]["Enums"]["approach_type"] | null
          cluster_id: string | null
          created_at: string | null
          difficulty: number | null
          domain_code: string | null
          focus_tags: string[] | null
          format: Database["public"]["Enums"]["item_format"] | null
          id: string | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          performance_domain:
            | Database["public"]["Enums"]["performance_domain_type"]
            | null
          process_group:
            | Database["public"]["Enums"]["process_group_type"]
            | null
          question_number: number | null
          status: Database["public"]["Enums"]["item_status"] | null
          tag_codes: string[] | null
          task_id: string | null
          task_number: number | null
          task_title: string | null
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
      admin_exam_stats: {
        Args: never
        Returns: {
          avg_score_pct: number
          mode: string
          status: string
          total_exams: number
        }[]
      }
      admin_mrr_trend: {
        Args: { p_granularity: string; p_periods?: number }
        Returns: {
          active_paid_licenses: number
          mrr_cents: number
          period_start: string
        }[]
      }
      admin_sales_by_plan: {
        Args: { p_from: string; p_to: string }
        Returns: {
          plan_code: string
          plan_name: string
          purchases: number
          revenue_cents: number
        }[]
      }
      admin_signups_vs_purchases: {
        Args: { p_granularity: string; p_periods?: number }
        Returns: {
          conversion_pct: number
          period_start: string
          purchases: number
          signups: number
        }[]
      }
      get_untagged_ae_questions: {
        Args: { p_limit: number }
        Returns: {
          focus_tags: string[]
          format: string
          id: string
          performance_domain: string
          practicum_payload: Json
          process_group: string
          stem: string
        }[]
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      record_error_type: {
        Args: {
          p_error_type: Database["public"]["Enums"]["error_type_enum"]
          p_user_id: string
        }
        Returns: undefined
      }
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
      vault_create_secret_for_connector: {
        Args: { p_name: string; p_secret_value: string }
        Returns: string
      }
      vault_read_secret_for_connector: {
        Args: { p_secret_id: string }
        Returns: string
      }
    }
    Enums: {
      approach_type: "predictive" | "agile" | "hybrid"
      error_type_enum:
        | "knowledge"
        | "interpretation"
        | "sequence"
        | "role"
        | "approach"
        | "reading"
        | "analysis"
        | "time"
      exam_mode:
        | "full_sim"
        | "domain_drill"
        | "case_only"
        | "custom"
        | "unit_quiz"
        | "cumulative"
        | "half_sim"
      item_format:
        | "mc_single"
        | "mc_multi"
        | "matching"
        | "enhanced_matching"
        | "graphic_based"
        | "hotspot"
        | "pulldown"
      item_status: "draft" | "published" | "retired"
      item_type: "standalone" | "case_child" | "practicum"
      performance_domain_type:
        | "gobernanza"
        | "alcance"
        | "cronograma"
        | "finanzas"
        | "recursos"
        | "riesgos"
        | "interesados"
      plan_code: "basica_3m" | "premium_6m" | "free" | "premium_1m"
      process_group_type:
        | "initiation"
        | "planning"
        | "execution"
        | "monitoring_control"
        | "closing"
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
      error_type_enum: [
        "knowledge",
        "interpretation",
        "sequence",
        "role",
        "approach",
        "reading",
        "analysis",
        "time",
      ],
      exam_mode: [
        "full_sim",
        "domain_drill",
        "case_only",
        "custom",
        "unit_quiz",
        "cumulative",
        "half_sim",
      ],
      item_format: [
        "mc_single",
        "mc_multi",
        "matching",
        "enhanced_matching",
        "graphic_based",
        "hotspot",
        "pulldown",
      ],
      item_status: ["draft", "published", "retired"],
      item_type: ["standalone", "case_child", "practicum"],
      performance_domain_type: [
        "gobernanza",
        "alcance",
        "cronograma",
        "finanzas",
        "recursos",
        "riesgos",
        "interesados",
      ],
      plan_code: ["basica_3m", "premium_6m", "free", "premium_1m"],
      process_group_type: [
        "initiation",
        "planning",
        "execution",
        "monitoring_control",
        "closing",
      ],
    },
  },
} as const
