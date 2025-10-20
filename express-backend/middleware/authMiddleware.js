'use strict';

const jsonwebtoken = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        console.error('JWT verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      // Attach user info to request object
      req.user = decoded;
      next();
    });
    
  } catch (error) {
    console.error('Error in authenticateToken middleware:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = { authenticateToken };
