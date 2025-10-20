const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import the database pool

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT user_id FROM User WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user
    const insertQuery = 'INSERT INTO User (name, email, password) VALUES (?, ?, ?)';
    const [result] = await pool.query(insertQuery, [name, email, hashedPassword]);

    // Optional: Log the inserted user ID
    // console.log('User registered with ID:', result.insertId);

    res.status(201).json({ message: 'User registered successfully.' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // Find the user by email
    const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    const user = users[0]; // Get the first user found (should be unique)

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Passwords don't match
    }

    // Passwords match - Create JWT
    const payload = {
      user_id: user.user_id, // Ensure your schema.sql named the primary key 'user_id'
      name: user.name,
    };

    // Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not found in environment variables!');
        return res.status(500).json({ message: 'Server configuration error.' });
    }


    try {
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '1h' } // Token expires in 1 hour (optional)
        );
        res.json({ token }); // Send the token to the client
    } catch (jwtError) {
        console.error("Error creating token:", jwtError);
        // Send the specific error you were seeing before
        return res.status(500).json({ message: "token creation failed" });
    }


  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;