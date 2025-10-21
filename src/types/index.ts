// src/types/index.ts

export interface Book {
  book_id: number; // Assuming book_id is the primary key from MySQL
  id?: string; // Keep if previously used, maybe remove if book_id is primary
  title: string;
  author: string;
  isbn?: string; // Make optional if sometimes missing
  description?: string; // Make optional if sometimes missing
  genre: string;
  publication_date?: string; // Keep original if needed
  published_year?: number; // Added from populate script
  cover_image_url?: string; // Added for cover images
  created_at?: string;
  updated_at?: string;
  average_rating?: number; // Made optional as backend might not calculate it yet
  total_reviews?: number; // Made optional as backend might not calculate it yet
}

export interface Review {
  review_id: number; // Assuming review_id is the primary key from MySQL
  id?: string; // Keep if previously used, maybe remove if review_id is primary
  book_id: number; // Match Book primary key type
  user_id: number; // Match User primary key type
  rating: number;
  comment: string;
  created_at?: string; // Keep original if needed
  timestamp?: string; // Added from schema
  updated_at?: string;
  user?: { // Structure based on backend JOIN
    // Assuming backend joins User table and selects name
    name: string;
    // Add other user fields if your backend review query includes them
    // id?: string; // Original Supabase structure might have had this
    // email?: string;
    // full_name?: string; // Backend likely provides 'name' now
    // avatar_url?: string;
  };
  // Remove Supabase specific profile nesting if present
  // profiles?: any;
}

export interface User {
  user_id: number; // Assuming user_id is the primary key from MySQL
  id?: string; // Keep if previously used, maybe remove if user_id is primary
  email: string;
  name: string; // Changed from full_name to match schema/backend
  // password?: string; // Don't typically send password to frontend
  avatar_url?: string; // Keep if you plan to add avatar uploads later
  bio?: string; // Keep if you plan to add profiles later
  created_at?: string;
  updated_at?: string;
}

// Updated AuthUser to reflect JWT payload structure
export interface AuthUser {
  user_id: number; // From JWT payload
  name: string;    // From JWT payload
  iat?: number;    // Issued at (from JWT)
  exp?: number;    // Expiration time (from JWT)
  // Remove Supabase specific fields like email, user_metadata
}