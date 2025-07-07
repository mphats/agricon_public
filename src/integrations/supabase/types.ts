export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          created_by: string
          dataset_id: string | null
          deployment_date: string | null
          hyperparameters: Json | null
          id: string
          metrics: Json | null
          model_path: string | null
          model_type: string
          name: string
          status: Database["public"]["Enums"]["model_status"] | null
          training_completed_at: string | null
          training_started_at: string | null
          version: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          created_by: string
          dataset_id?: string | null
          deployment_date?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_path?: string | null
          model_type?: string
          name: string
          status?: Database["public"]["Enums"]["model_status"] | null
          training_completed_at?: string | null
          training_started_at?: string | null
          version: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          created_by?: string
          dataset_id?: string | null
          deployment_date?: string | null
          hyperparameters?: Json | null
          id?: string
          metrics?: Json | null
          model_path?: string | null
          model_type?: string
          name?: string
          status?: Database["public"]["Enums"]["model_status"] | null
          training_completed_at?: string | null
          training_started_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "training_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      case_evidence: {
        Row: {
          case_id: string
          file_path: string
          file_type: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          file_path: string
          file_type: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          file_path?: string
          file_type?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_updates: {
        Row: {
          case_id: string
          comment: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["case_status"] | null
          updated_by: string
        }
        Insert: {
          case_id: string
          comment?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["case_status"] | null
          updated_by: string
        }
        Update: {
          case_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["case_status"] | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_updates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          category: Database["public"]["Enums"]["case_category"]
          created_at: string
          description: string
          id: string
          latitude: number
          location: string
          longitude: number
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["case_urgency"]
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["case_category"]
          created_at?: string
          description: string
          id?: string
          latitude: number
          location: string
          longitude: number
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["case_category"]
          created_at?: string
          description?: string
          id?: string
          latitude?: number
          location?: string
          longitude?: number
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
          user_id?: string
        }
        Relationships: []
      }
      farming_advice: {
        Row: {
          advice_type: string | null
          content: string
          created_at: string | null
          crop_type: Database["public"]["Enums"]["crop_type"] | null
          district: string | null
          id: string
          is_featured: boolean | null
          seasonal_relevance: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          advice_type?: string | null
          content: string
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          district?: string | null
          id?: string
          is_featured?: boolean | null
          seasonal_relevance?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          advice_type?: string | null
          content?: string
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          district?: string | null
          id?: string
          is_featured?: boolean | null
          seasonal_relevance?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_answers: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          question_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          question_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          question_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "forum_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_questions: {
        Row: {
          content: string
          created_at: string | null
          crop_type: Database["public"]["Enums"]["crop_type"] | null
          id: string
          is_answered: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          id?: string
          is_answered?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          id?: string
          is_answered?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      input_suppliers: {
        Row: {
          contact_phone: string | null
          created_at: string | null
          district: string
          id: string
          is_verified: boolean | null
          name: string
          products_offered: string[] | null
          rating: number | null
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string | null
          district: string
          id?: string
          is_verified?: boolean | null
          name: string
          products_offered?: string[] | null
          rating?: number | null
        }
        Update: {
          contact_phone?: string | null
          created_at?: string | null
          district?: string
          id?: string
          is_verified?: boolean | null
          name?: string
          products_offered?: string[] | null
          rating?: number | null
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          created_at: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          description: string | null
          farmer_id: string
          harvest_date: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location_district: string
          phone_number: string | null
          price_per_kg: number
          quality_grade: string | null
          quantity_kg: number
          status: Database["public"]["Enums"]["market_listing_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          description?: string | null
          farmer_id: string
          harvest_date?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location_district: string
          phone_number?: string | null
          price_per_kg: number
          quality_grade?: string | null
          quantity_kg: number
          status?: Database["public"]["Enums"]["market_listing_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"]
          description?: string | null
          farmer_id?: string
          harvest_date?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location_district?: string
          phone_number?: string | null
          price_per_kg?: number
          quality_grade?: string | null
          quantity_kg?: number
          status?: Database["public"]["Enums"]["market_listing_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          created_at: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          date_recorded: string
          district: string
          id: string
          market_name: string | null
          price_per_kg: number
          source: string | null
        }
        Insert: {
          created_at?: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          date_recorded?: string
          district: string
          id?: string
          market_name?: string | null
          price_per_kg: number
          source?: string | null
        }
        Update: {
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"]
          date_recorded?: string
          district?: string
          id?: string
          market_name?: string | null
          price_per_kg?: number
          source?: string | null
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          action_type: string
          created_at: string | null
          data: Json | null
          id: string
          record_id: string | null
          sync_status: string | null
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          data?: Json | null
          id?: string
          record_id?: string | null
          sync_status?: string | null
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          record_id?: string | null
          sync_status?: string | null
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_disease_diagnoses: {
        Row: {
          ai_diagnosis: string | null
          confidence_score: number | null
          created_at: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          farmer_id: string
          id: string
          image_url: string | null
          location_coordinates: unknown | null
          prevention_advice: string | null
          severity: Database["public"]["Enums"]["pest_disease_severity"] | null
          symptoms_description: string | null
          treatment_recommendations: string | null
        }
        Insert: {
          ai_diagnosis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_type: Database["public"]["Enums"]["crop_type"]
          farmer_id: string
          id?: string
          image_url?: string | null
          location_coordinates?: unknown | null
          prevention_advice?: string | null
          severity?: Database["public"]["Enums"]["pest_disease_severity"] | null
          symptoms_description?: string | null
          treatment_recommendations?: string | null
        }
        Update: {
          ai_diagnosis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_type?: Database["public"]["Enums"]["crop_type"]
          farmer_id?: string
          id?: string
          image_url?: string | null
          location_coordinates?: unknown | null
          prevention_advice?: string | null
          severity?: Database["public"]["Enums"]["pest_disease_severity"] | null
          symptoms_description?: string | null
          treatment_recommendations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pest_disease_diagnoses_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_disease_knowledge: {
        Row: {
          causes: string | null
          confidence_threshold: number | null
          created_at: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          disease_name: string
          id: string
          prevention: string | null
          symptoms: string[]
          treatment: string
          updated_at: string
        }
        Insert: {
          causes?: string | null
          confidence_threshold?: number | null
          created_at?: string
          crop_type: Database["public"]["Enums"]["crop_type"]
          disease_name: string
          id?: string
          prevention?: string | null
          symptoms: string[]
          treatment: string
          updated_at?: string
        }
        Update: {
          causes?: string | null
          confidence_threshold?: number | null
          created_at?: string
          crop_type?: Database["public"]["Enums"]["crop_type"]
          disease_name?: string
          id?: string
          prevention?: string | null
          symptoms?: string[]
          treatment?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          farm_size_acres: number | null
          first_name: string | null
          id: string
          is_admin: boolean
          last_name: string | null
          location_coordinates: unknown | null
          location_district: string | null
          phone_number: string | null
          phone_verified: boolean | null
          preferred_language: string | null
          primary_crops: Database["public"]["Enums"]["crop_type"][] | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_size_acres?: number | null
          first_name?: string | null
          id: string
          is_admin?: boolean
          last_name?: string | null
          location_coordinates?: unknown | null
          location_district?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          primary_crops?: Database["public"]["Enums"]["crop_type"][] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_size_acres?: number | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          location_coordinates?: unknown | null
          location_district?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          primary_crops?: Database["public"]["Enums"]["crop_type"][] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      training_datasets: {
        Row: {
          created_at: string
          created_by: string
          crop_type: Database["public"]["Enums"]["crop_type"] | null
          description: string | null
          id: string
          name: string
          processed_files: number | null
          status: Database["public"]["Enums"]["training_data_status"] | null
          total_files: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          description?: string | null
          id?: string
          name: string
          processed_files?: number | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
          total_files?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          crop_type?: Database["public"]["Enums"]["crop_type"] | null
          description?: string | null
          id?: string
          name?: string
          processed_files?: number | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
          total_files?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      training_files: {
        Row: {
          dataset_id: string
          extracted_features: Json | null
          file_path: string
          file_size: number | null
          file_type: Database["public"]["Enums"]["training_file_type"]
          filename: string
          id: string
          labels: Json | null
          metadata: Json | null
          processed_date: string | null
          status: Database["public"]["Enums"]["training_data_status"] | null
          upload_date: string
        }
        Insert: {
          dataset_id: string
          extracted_features?: Json | null
          file_path: string
          file_size?: number | null
          file_type: Database["public"]["Enums"]["training_file_type"]
          filename: string
          id?: string
          labels?: Json | null
          metadata?: Json | null
          processed_date?: string | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
          upload_date?: string
        }
        Update: {
          dataset_id?: string
          extracted_features?: Json | null
          file_path?: string
          file_size?: number | null
          file_type?: Database["public"]["Enums"]["training_file_type"]
          filename?: string
          id?: string
          labels?: Json | null
          metadata?: Json | null
          processed_date?: string | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_files_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "training_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      training_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          dataset_id: string
          error_message: string | null
          id: string
          logs: string | null
          model_id: string | null
          progress_percentage: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["training_data_status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          dataset_id: string
          error_message?: string | null
          id?: string
          logs?: string | null
          model_id?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          dataset_id?: string
          error_message?: string | null
          id?: string
          logs?: string | null
          model_id?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_data_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "training_jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "training_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_jobs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_alerts: {
        Row: {
          affected_districts: string[] | null
          alert_type: Database["public"]["Enums"]["weather_alert_type"]
          created_at: string | null
          description: string
          end_time: string | null
          id: string
          is_active: boolean | null
          mitigation_advice: string | null
          severity: Database["public"]["Enums"]["urgency_level"]
          start_time: string
          title: string
        }
        Insert: {
          affected_districts?: string[] | null
          alert_type: Database["public"]["Enums"]["weather_alert_type"]
          created_at?: string | null
          description: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          mitigation_advice?: string | null
          severity: Database["public"]["Enums"]["urgency_level"]
          start_time: string
          title: string
        }
        Update: {
          affected_districts?: string[] | null
          alert_type?: Database["public"]["Enums"]["weather_alert_type"]
          created_at?: string | null
          description?: string
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          mitigation_advice?: string | null
          severity?: Database["public"]["Enums"]["urgency_level"]
          start_time?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_plant_symptoms: {
        Args: {
          p_crop_type: Database["public"]["Enums"]["crop_type"]
          p_symptoms: string
        }
        Returns: {
          disease_name: string
          confidence: number
          treatment: string
          prevention: string
          severity: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      case_category:
        | "theft"
        | "assault"
        | "traffic"
        | "suspicious"
        | "disturbance"
        | "other"
      case_status: "pending" | "investigating" | "resolved" | "closed"
      case_urgency: "low" | "medium" | "high"
      crop_type:
        | "maize"
        | "beans"
        | "vegetables"
        | "cassava"
        | "rice"
        | "tobacco"
        | "groundnuts"
        | "soybean"
        | "cotton"
        | "other"
      market_listing_status: "active" | "sold" | "expired" | "cancelled"
      model_status: "training" | "trained" | "deployed" | "archived"
      pest_disease_severity: "mild" | "moderate" | "severe" | "critical"
      training_data_status: "pending" | "processing" | "processed" | "failed"
      training_file_type: "image" | "pdf" | "csv" | "json" | "zip"
      urgency_level: "low" | "medium" | "high" | "critical"
      user_role: "farmer" | "buyer" | "advisor" | "admin"
      weather_alert_type: "drought" | "flood" | "storm" | "frost" | "heatwave"
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
      case_category: [
        "theft",
        "assault",
        "traffic",
        "suspicious",
        "disturbance",
        "other",
      ],
      case_status: ["pending", "investigating", "resolved", "closed"],
      case_urgency: ["low", "medium", "high"],
      crop_type: [
        "maize",
        "beans",
        "vegetables",
        "cassava",
        "rice",
        "tobacco",
        "groundnuts",
        "soybean",
        "cotton",
        "other",
      ],
      market_listing_status: ["active", "sold", "expired", "cancelled"],
      model_status: ["training", "trained", "deployed", "archived"],
      pest_disease_severity: ["mild", "moderate", "severe", "critical"],
      training_data_status: ["pending", "processing", "processed", "failed"],
      training_file_type: ["image", "pdf", "csv", "json", "zip"],
      urgency_level: ["low", "medium", "high", "critical"],
      user_role: ["farmer", "buyer", "advisor", "admin"],
      weather_alert_type: ["drought", "flood", "storm", "frost", "heatwave"],
    },
  },
} as const
