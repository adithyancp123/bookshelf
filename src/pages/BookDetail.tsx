// src/pages/BookDetail.tsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, MessageCircle } from 'lucide-react';
import { useBook } from '../hooks/useBooks'; // Assuming refactored in Prompt 5
import { useReviews } from '../hooks/useReviews'; // Assuming refactored in Prompt 5
import { useAuth } from '../contexts/AuthContext'; // Assuming refactored in Prompt 5
import { StarRating } from '../components/UI/StarRating';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { ReviewCard } from '../components/Reviews/ReviewCard';
import { ReviewForm } from '../components/Reviews/ReviewForm';

// Define a default placeholder image URL (consistent with BookCard)
const PLACEHOLDER_IMAGE_URL = `https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=600`;

export function BookDetail() {
  // Use book_id from URL params, assuming it's a string initially
  const { id: bookIdParam } = useParams<{ id: string }>();
  const { user } = useAuth(); // Contains decoded JWT payload { user_id, name } or null

  // Ensure bookIdParam is treated as a number for hooks/API calls if needed
  // Adjust based on how your useBook hook expects the ID (string or number)
  const bookId = bookIdParam; // Keep as string if useBook expects string, else parseInt(bookIdParam || '0', 10)

  // Fetch book details using the hook (assumes hook handles string ID)
  const { book, loading: bookLoading, error: bookError } = useBook(bookId!);

  // Fetch reviews for this book (assumes hook handles string ID)
  const { reviews, loading: reviewsLoading, addReview, refetch: refetchReviews } = useReviews(bookId!);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    // User object from AuthContext should contain user_id if logged in
    if (!user) {
      // Should ideally not happen if ReviewForm is hidden, but good practice
      return { success: false, error: 'Please sign in to submit a review' };
    }

    // Ensure book object and book_id are available
    if (!book || book.book_id === undefined) {
        return { success: false, error: 'Book information not available.' };
    }

    // Call the refactored addReview (no userId needed, book_id comes from the book object)
    // Ensure the book_id type matches what addReview expects (number vs string)
    const result = await addReview(book.book_id, rating, comment);

    if (result.success) {
      // Refetch reviews to show the new one
      await refetchReviews();
      // Optionally, refetch book data if the backend recalculates ratings/counts
      // await refetchBook(); // Assuming useBook returns a refetch function
    }
    return result; // Return the result { success: boolean, error?: string }
  };

  // --- Loading State ---
  if (bookLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // --- Error State or Book Not Found ---
  // Ensure book is checked after loading is false
  if (bookError || !book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{bookError || 'Book not found'}</p>
          <Link
            to="/books"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  // --- Render Book Details ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Books</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8">
              <div className="aspect-[3/4] mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={book.cover_image_url || PLACEHOLDER_IMAGE_URL} // Use new field
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE_URL; // Fallback on error
                  }}
                />
              </div>

              <div className="space-y-4">
                 {/* Display genre if available */}
                {book.genre && (
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-sm font-medium rounded-full capitalize">
                        {book.genre}
                      </span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Display rating if available, default to 0 */}
                  <StarRating rating={book.average_rating ?? 0} size="md" />
                  {/* Display review count if available */}
                  {book.total_reviews !== undefined && (
                     <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                       <MessageCircle className="h-4 w-4" />
                       <span>{book.total_reviews} reviews</span>
                     </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Display publication year if available */}
                  {book.published_year && (
                     <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                       <Calendar className="h-4 w-4" />
                       <span>Published {book.published_year}</span>
                     </div>
                  )}
                  {/* Display ISBN if available */}
                  {book.isbn && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      ISBN: {book.isbn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Book Details and Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Book Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{book.title}</h1>
              {book.author && <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">by {book.author}</p>}

               {/* Display description if available */}
              {book.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{book.description}</p>
                </div>
              )}
            </div>

            {/* Review Form */}
            {user ? ( // Show form only if user is logged in
              <ReviewForm onSubmit={handleReviewSubmit} />
            ) : ( // Show sign-in prompt if user is not logged in
              <div className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg p-6 text-center">
                <p className="text-primary-700 dark:text-primary-200 mb-4">
                  Want to share your thoughts about this book?
                </p>
                <div className="space-x-4">
                  <Link
                    to="/signin"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg border border-primary-600 hover:bg-primary-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Reviews ({reviews.length}) {/* Update count based on fetched reviews */}
              </h3>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    // Use review_id as key if available, otherwise fallback to id
                    <ReviewCard key={review.review_id ?? review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">No reviews yet.</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Be the first to share your thoughts about this book!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}