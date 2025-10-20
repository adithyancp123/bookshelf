'use strict';

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// GET /api/books - Fetch all books with optional search and genre filters
router.get('/', (req, res) => {
  try {
    const { search, genre } = req.query;
    
    let queryString = 'SELECT * FROM Book';
    const queryParams = [];
    const whereClauses = [];
    
    // Add search filter if provided
    if (req.query.search) {
      whereClauses.push('(title LIKE ? OR author LIKE ?)');
      const searchTerm = req.query.search;
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    // Add genre filter if provided and not 'all'
    if (req.query.genre && req.query.genre !== 'all') {
      whereClauses.push('genre = ?');
      queryParams.push(req.query.genre);
    }
    
    // Add WHERE clause if we have conditions
    if (whereClauses.length > 0) {
      queryString += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    pool.query(queryString, queryParams, (error, result) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Database error occurred' });
      }
      
      res.json(result);
    });
    
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/books/:id - Fetch a single book by ID
router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const queryString = 'SELECT * FROM Book WHERE book_id = ?';
    
    pool.query(queryString, [id], (error, result) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Database error occurred' });
      }
      
      if (result.length === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(result[0]);
    });
    
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
