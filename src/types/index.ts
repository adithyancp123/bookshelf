export interface Book {
  book_id: number;
  title: string;
  author: string;
  genre: string;
  published_year: number | null;
  average_rating?: number;
  total_reviews?: number;
}

export interface Review {
  review_id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  timestamp: string;
  name: string; // User name from the joined query
}

export interface User {
  user_id: number;
  name: string;
  email: string;
}

export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
}