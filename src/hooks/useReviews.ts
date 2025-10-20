import { useState, useEffect } from 'react';
import { getReviewsByBookId, addReview } from '../lib/api';
import { Review } from '../types';

export function useReviews(bookId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getReviewsByBookId(bookId);
      setReviews(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addReviewHandler = async (rating: number, comment: string) => {
    try {
      await addReview(bookId, rating, comment);
      await fetchReviews(); // Refresh reviews after adding
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to add review' 
      };
    }
  };

  return { reviews, loading, error, addReview: addReviewHandler, refetch: fetchReviews };
}