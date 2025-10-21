// src/components/Books/BookCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle } from 'lucide-react';
import { Book } from '../../types'; // Ensure Book type is imported
import { StarRating } from '../UI/StarRating';

interface BookCardProps {
  book: Book;
}

// Define a default placeholder image URL
const PLACEHOLDER_IMAGE_URL = `https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=400`;

export function BookCard({ book }: BookCardProps) {
  // Use book_id for the link, assuming it's the primary key from MySQL
  const bookLink = `/books/${book.book_id}`;

  return (
    <Link
      to={bookLink}
      className="group bg-white rounded-xl shadow-book hover:shadow-book-hover transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={book.cover_image_url || PLACEHOLDER_IMAGE_URL} // Use the new field name
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder if the image fails to load
            e.currentTarget.src = PLACEHOLDER_IMAGE_URL;
          }}
        />
      </div>

      <div className="p-6">
        <div className="mb-2">
          {/* Display genre if available */}
          {book.genre && (
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
              {book.genre}
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {book.title}
        </h3>

        {/* Display author if available */}
        {book.author && (
          <p className="text-gray-600 mb-3 font-medium">
            by {book.author}
          </p>
        )}

        {/* Display description if available - Removed as it wasn't requested in schema/populate */}
        {/*
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {book.description}
        </p>
        */}

        <div className="flex items-center justify-between mt-4"> {/* Added margin-top */}
          {/* Display StarRating - Pass 0 if average_rating is missing */}
          <StarRating rating={book.average_rating ?? 0} size="sm" />

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {/* Display total reviews if available */}
            {book.total_reviews !== undefined && ( // Check if the property exists
               <div className="flex items-center space-x-1">
                 <MessageCircle className="h-3 w-3" />
                 <span>{book.total_reviews}</span>
               </div>
            )}
            {/* Display publication year if available */}
            {book.published_year && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{book.published_year}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}