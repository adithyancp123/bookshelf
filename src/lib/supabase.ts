import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string;
          description: string;
          genre: string;
          publication_date: string;
          cover_image: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn: string;
          description: string;
          genre: string;
          publication_date: string;
          cover_image: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string;
          description?: string;
          genre?: string;
          publication_date?: string;
          cover_image?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};