'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');

app.get('/', (req, res) => {
  res.json({ message: 'Book review backend is running.' });
});

// Use routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});


