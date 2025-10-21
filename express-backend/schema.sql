-- express-backend/schema.sql

-- Drop tables if they exist (optional, useful for resetting during development)
-- DROP TABLE IF EXISTS Review;
-- DROP TABLE IF EXISTS Book;
-- DROP TABLE IF EXISTS User;

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Storing hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Book table
CREATE TABLE IF NOT EXISTS Book (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    published_year INT,
    cover_image_url VARCHAR(512) NULL, -- Added column for cover image URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Review table
CREATE TABLE IF NOT EXISTS Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book_review (user_id, book_id) -- Prevent duplicate reviews by the same user for the same book
);

-- Optional: Add indexes for performance
-- CREATE INDEX idx_book_title ON Book(title);
-- CREATE INDEX idx_book_author ON Book(author);
-- CREATE INDEX idx_book_genre ON Book(genre);
-- CREATE INDEX idx_review_book_id ON Review(book_id);
-- CREATE INDEX idx_review_user_id ON Review(user_id);