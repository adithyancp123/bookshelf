import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle } from 'lucide-react';
import { Book } from '../../types';
import { StarRating } from '../UI/StarRating';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      to={`/books/${book.book_id}`}
      className="group bg-white rounded-xl shadow-book hover:shadow-book-hover transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={`https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
            {book.genre}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {book.title}
        </h3>
        
        <p className="text-gray-600 mb-3 font-medium">
          by {book.author}
        </p>
        
        <div className="flex items-center justify-between">
          <StarRating rating={book.average_rating || 0} size="sm" />
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{book.total_reviews || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{book.published_year || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}