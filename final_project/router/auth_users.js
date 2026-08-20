const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// JWT secret key (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-here';

// Check if username is valid
const isValid = (username) => {
    // Returns boolean - check if username already exists
    return users.some(user => user.username === username);
}

// Check if username and password match records
const authenticatedUser = (username, password) => {
    // Returns boolean - check if username and password match
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }

    // Check if user exists
    if (!isValid(username)) {
        return res.status(401).json({ 
            message: "User not found. Please register first." 
        });
    }

    // Authenticate user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ 
            message: "Invalid password" 
        });
    }

    // Generate JWT token
    const accessToken = jwt.sign(
        { username: username }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // Store session
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({
        message: "Login successful",
        accessToken,
        username
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.session.authorization?.username;

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({ 
            message: "Please login first" 
        });
    }

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ 
            message: "Review content is required" 
        });
    }

    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ 
            message: "Book not found" 
        });
    }

    // Initialize reviews object if it doesn't exist
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update review
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        book: {
            isbn: isbn,
            title: book.title,
            reviews: book.reviews
        }
    });
});

// Optional: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check if user is authenticated
    if (!username) {
        return res.status(401).json({ 
            message: "Please login first" 
        });
    }

    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ 
            message: "Book not found" 
        });
    }

    // Check if review exists
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ 
            message: "Review not found for this user" 
        });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        book: {
            isbn: isbn,
            title: book.title,
            reviews: book.reviews
        }
    });
});

// Optional: Register new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }

    // Check if username already exists
    if (isValid(username)) {
        return res.status(409).json({ 
            message: "Username already exists" 
        });
    }

    // Add new user
    users.push({ username, password });

    return res.status(201).json({
        message: "User registered successfully",
        username
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;