// express-backend/db.js

const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Default to localhost if not set
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Use port from .env or default to 3306
  waitForConnections: true, // Wait for a connection if pool is full
  connectionLimit: 10,       // Max number of connections in pool
  queueLimit: 0              // No limit on waiting connections
});

// Optional: Test the connection on startup
// (async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log('Successfully connected to the database.');
//     connection.release(); // Release the connection back to the pool
//   } catch (err) {
//     console.error('Error connecting to the database:', err);
//   }
// })();

// Export the pool to be used in other files
module.exports = pool;