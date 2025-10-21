// express-backend/populate_books.js

const axios = require('axios');
const dotenv = require('dotenv');
const pool = require('./db'); // Import the database pool

dotenv.config(); // Load environment variables from .env

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Function to fetch books from Google Books API
async function fetchBooksFromAPI(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        key: API_KEY,
        maxResults: 40, // Fetch up to 40 books per query
        printType: 'books', // Ensure we only get books
        orderBy: 'relevance', // Or 'newest'
      },
    });
    return response.data.items || []; // Return items array or empty array if none found
  } catch (error) {
    console.error(`Failed to fetch books for query "${query}":`, error.response ? error.response.status : error.message);
    // Optionally log more detail: console.error(error.response?.data?.error?.message);
    return []; // Return empty array on error
  }
}

// Function to insert book data into the MySQL database
async function insertBooksIntoDB(apiBooks) {
  let insertedCount = 0;
  if (!apiBooks || apiBooks.length === 0) {
    return insertedCount;
  }

  const connection = await pool.getConnection(); // Get a connection from the pool

  try {
    await connection.beginTransaction(); // Start a transaction

    // Prepare the insert query including the new cover_image_url column
    const insertQuery = `
      INSERT INTO Book (title, author, genre, published_year, cover_image_url)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title=VALUES(title); -- Example: Avoid errors if book somehow already exists (based on a unique key if you add one later)
    `;

    for (const item of apiBooks) {
      if (!item.volumeInfo) continue; // Skip if no volumeInfo

      const volumeInfo = item.volumeInfo;

      // Extract data, providing defaults or null
      const title = volumeInfo.title || 'Unknown Title';
      const author = volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author'; // Take first author
      const genre = volumeInfo.categories ? volumeInfo.categories[0] : 'General'; // Take first category or default
      let publishedYear = null;
      if (volumeInfo.publishedDate) {
        // Extract only the year (YYYY)
        const yearMatch = volumeInfo.publishedDate.match(/^\d{4}/);
        if (yearMatch) {
          publishedYear = parseInt(yearMatch[0], 10);
        }
      }

      // --- NEW: Extract Cover Image URL ---
      const imageLinks = volumeInfo.imageLinks;
      const coverImageUrl = imageLinks?.thumbnail || imageLinks?.smallThumbnail || null;
      // --- End NEW ---

      try {
        // Execute the insert query with all parameters, including coverImageUrl
        await connection.query(insertQuery, [
          title,
          author,
          genre,
          publishedYear,
          coverImageUrl // Add the image URL here
        ]);
        insertedCount++;
      } catch (insertError) {
        // Log individual insert errors but continue with other books
        console.error(`Insert failed for book: { title: '${title}', author: '${author}' }`, insertError.message);
      }
    }

    await connection.commit(); // Commit the transaction if all inserts (or those that didn't fail individually) are done

  } catch (err) {
    await connection.rollback(); // Rollback transaction on major error
    console.error('Error during database insertion transaction:', err);
  } finally {
    connection.release(); // Always release the connection back to the pool
  }

  return insertedCount;
}

// Main function to orchestrate fetching and inserting
async function main() {
  const searchTerms = [
    'fiction',
    'mystery',
    'science fiction',
    'biography',
    'history',
    'romance',
    // Add more general terms or specific genres if desired
  ];
  let totalBooksInserted = 0;

  try {
    // --- NEW: Clear existing books ---
    console.log('Clearing existing books from the table...');
    const [deleteResult] = await pool.query('DELETE FROM Book;');
    console.log(`Book table cleared (${deleteResult.affectedRows} rows deleted). Repopulating with image URLs...`);
    // --- End NEW ---

    for (const term of searchTerms) {
      console.log(`Fetching books for term: ${term}`);
      const booksFromAPI = await fetchBooksFromAPI(term);
      if (booksFromAPI.length > 0) {
        const count = await insertBooksIntoDB(booksFromAPI);
        console.log(`Inserted ${count} books for term: ${term}`);
        totalBooksInserted += count;
      } else {
        console.log(`No books found or error fetching for term: ${term}`);
      }
      // Optional delay to avoid hitting API rate limits too quickly
      // await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('An error occurred during the main process:', error);
  } finally {
    console.log(`Done. Total books inserted: ${totalBooksInserted}`);
    await pool.end(); // Close all connections in the pool
    console.log('MySQL pool closed.');
  }
}

// Execute the main function
main();