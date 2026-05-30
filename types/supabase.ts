export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      patterns: {
        Row: {
          id: number;
          slug: string;
          title: string;
          description: string | null;
          difficulty: string;
          category: string | null;
          cover_image_key: string;
          estimated_minutes: number | null;
          materials_text: string | null;
          skills_text: string | null;
          expectation_text: string | null;
          steps_json: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          description?: string | null;
          difficulty: string;
          category?: string | null;
          cover_image_key: string;
          estimated_minutes?: number | null;
          materials_text?: string | null;
          skills_text?: string | null;
          expectation_text?: string | null;
          steps_json: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          title?: string;
          description?: string | null;
          difficulty?: string;
          category?: string | null;
          cover_image_key?: string;
          estimated_minutes?: number | null;
          materials_text?: string | null;
          skills_text?: string | null;
          expectation_text?: string | null;
          steps_json?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pattern_translations: {
        Row: {
          id: number;
          pattern_id: number;
          locale: string;
          title: string;
          description: string | null;
          materials_json: string | null;
          skills_json: string | null;
          expectation_text: string | null;
          steps_json: string;
        };
        Insert: {
          id?: number;
          pattern_id: number;
          locale: string;
          title: string;
          description?: string | null;
          materials_json?: string | null;
          skills_json?: string | null;
          expectation_text?: string | null;
          steps_json: string;
        };
        Update: {
          id?: number;
          pattern_id?: number;
          locale?: string;
          title?: string;
          description?: string | null;
          materials_json?: string | null;
          skills_json?: string | null;
          expectation_text?: string | null;
          steps_json?: string;
        };
      };
      lessons: {
        Row: {
          id: number;
          slug: string;
          title: string;
          description: string | null;
          sort_order: number;
          difficulty: string;
          content: string | null;
          video_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          title: string;
          description?: string | null;
          sort_order: number;
          difficulty: string;
          content?: string | null;
          video_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          difficulty?: string;
          content?: string | null;
          video_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_translations: {
        Row: {
          id: number;
          lesson_id: number;
          locale: string;
          title: string;
          description: string | null;
          content_json: string;
        };
        Insert: {
          id?: number;
          lesson_id: number;
          locale: string;
          title: string;
          description?: string | null;
          content_json: string;
        };
        Update: {
          id?: number;
          lesson_id?: number;
          locale?: string;
          title?: string;
          description?: string | null;
          content_json?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type PatternRow = Database['public']['Tables']['patterns']['Row'];
export type PatternTranslationRow =
  Database['public']['Tables']['pattern_translations']['Row'];
export type LessonRow = Database['public']['Tables']['lessons']['Row'];
export type LessonTranslationRow =
  Database['public']['Tables']['lesson_translations']['Row'];
