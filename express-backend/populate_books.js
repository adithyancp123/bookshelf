'use strict';

const axios = require('axios');
const dotenv = require('dotenv');
const { db, pool } = require('./db');

dotenv.config();

const { GOOGLE_BOOKS_API_KEY } = process.env;

async function fetchBooksFromAPI(query) {
  const params = {
    q: query,
    maxResults: 40,
    printType: 'books',
    orderBy: 'relevance',
  };

  if (GOOGLE_BOOKS_API_KEY && GOOGLE_BOOKS_API_KEY !== 'your_api_key_here') {
    params.key = GOOGLE_BOOKS_API_KEY;
  }

  const url = 'https://www.googleapis.com/books/v1/volumes';

  try {
    const response = await axios.get(url, { params });
    const items = Array.isArray(response.data && response.data.items)
      ? response.data.items
      : [];
    return items;
  } catch (error) {
    // eslint-disable-next-line no-console
    if (error.response && error.response.data) {
      console.error(`Failed to fetch books for query "${query}":`, error.response.status, error.response.data);
    } else {
      console.error(`Failed to fetch books for query "${query}":`, error.message);
    }
    return [];
  }
}

function extractYear(publishedDate) {
  if (!publishedDate || typeof publishedDate !== 'string') return null;
  const yearPart = publishedDate.slice(0, 4);
  const yearNum = Number(yearPart);
  return Number.isFinite(yearNum) ? yearNum : null;
}

async function insertBooksIntoDB(books) {
  if (!Array.isArray(books) || books.length === 0) return 0;

  let insertedCount = 0;

  for (const item of books) {
    const info = item && item.volumeInfo ? item.volumeInfo : {};
    const title = info.title ? String(info.title).trim() : null;
    const author = Array.isArray(info.authors) && info.authors.length > 0
      ? String(info.authors[0]).trim()
      : 'Unknown';
    const genre = Array.isArray(info.categories) && info.categories.length > 0
      ? String(info.categories[0]).trim()
      : 'General';
    const publishedYear = extractYear(info.publishedDate);

    if (!title) {
      continue;
    }

    try {
      await db.execute(
        'INSERT INTO `Book` (`title`, `author`, `genre`, `published_year`) VALUES (?, ?, ?, ?)',
        [title, author, genre, publishedYear]
      );
      insertedCount += 1;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Insert failed for book:', { title, author }, error.message);
    }
  }

  return insertedCount;
}

async function main() {
  const searchTerms = [
    'fiction',
    'mystery',
    'science fiction',
    'biography',
    'history',
    'romance',
  ];

  try {
    let totalInserted = 0;
    for (const term of searchTerms) {
      // eslint-disable-next-line no-console
      console.log(`Fetching books for term: ${term}`);
      const apiBooks = await fetchBooksFromAPI(term);
      const inserted = await insertBooksIntoDB(apiBooks);
      totalInserted += inserted;
      // eslint-disable-next-line no-console
      console.log(`Inserted ${inserted} books for term: ${term}`);
    }
    // eslint-disable-next-line no-console
    console.log(`Done. Total books inserted: ${totalInserted}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error running populate script:', error);
  } finally {
    pool.end((err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error closing MySQL pool:', err.message);
      } else {
        // eslint-disable-next-line no-console
        console.log('MySQL pool closed.');
      }
    });
  }
}

// Execute
main();



