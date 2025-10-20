'use strict';

const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/reviews - Get reviews for a specific book
router.get('/', (req, res) => {
  try {
    const { bookId } = req.query;
    
    // Validate required bookId parameter
    if (!bookId) {
      return res.status(400).json({ message: 'bookId query parameter is required' });
    }
    
    // Construct query to join Review and User tables
    const queryString = `
      SELECT Review.*, User.name 
      FROM Review 
      JOIN User ON Review.user_id = User.user_id 
      WHERE Review.book_id = ? 
      ORDER BY Review.timestamp DESC
    `;
    
    pool.query(queryString, [bookId], (error, result) => {
      if (error) {
        console.error('Database error fetching reviews:', error);
        return res.status(500).json({ message: 'Database error occurred' });
      }
      
      res.json(result);
    });
    
  } catch (error) {
    console.error('Error in GET reviews route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/reviews - Create a new review (Protected Route)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { book_id, rating, comment } = req.body;
    const user_id = req.user.user_id; // From authenticated user
    
    // Validate required fields
    if (!book_id || !rating) {
      return res.status(400).json({ message: 'book_id and rating are required' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Insert new review
    const insertReviewQuery = 'INSERT INTO Review (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)';
    pool.query(insertReviewQuery, [user_id, book_id, rating, comment || null], (error, result) => {
      if (error) {
        console.error('Database error inserting review:', error);
        
        // Handle duplicate review error (if unique constraint exists)
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'You have already reviewed this book' });
        }
        
        return res.status(500).json({ message: 'Database error occurred' });
      }
      
      res.status(201).json({ 
        message: 'Review created successfully',
        reviewId: result.insertId 
      });
    });
    
  } catch (error) {
    console.error('Error in POST reviews route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
