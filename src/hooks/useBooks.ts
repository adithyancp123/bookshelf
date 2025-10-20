import { useState, useEffect } from 'react';
import { getBooks, getBookById } from '../lib/api';
import { Book } from '../types';

export function useBooks(searchTerm?: string, genre?: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, genre]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (genre && genre !== 'all') {
        params.genre = genre;
      }

      const data = await getBooks(params);
      setBooks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, error, refetch: fetchBooks };
}

export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBookById(id);
      setBook(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { book, loading, error, refetch: fetchBook };
}