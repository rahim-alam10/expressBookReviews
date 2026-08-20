const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            message: "Username and password are required" 
        });
    }

    if (isValid(username)) {
        return res.status(409).json({ 
            message: "Username already exists" 
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: "User registered successfully",
        username: username
    });
});

public_users.get('/', async function (req, res) {
    try {
        const bookList = Object.keys(books).map(isbn => ({
            isbn: isbn,
            title: books[isbn].title,
            author: books[isbn].author,
            year: books[isbn].year
        }));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return res.status(200).json({
            message: "Book list retrieved successfully",
            count: bookList.length,
            books: bookList
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error retrieving books",
            error: error.message 
        });
    }
});

public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!books[isbn]) {
            return res.status(404).json({ 
                message: "Book not found with ISBN: " + isbn 
            });
        }
        
        return res.status(200).json({
            message: "Book retrieved successfully",
            book: {
                isbn: isbn,
                ...books[isbn]
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error retrieving book",
            error: error.message 
        });
    }
});

public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author.toLowerCase();

        const foundBooks = Object.keys(books)
            .filter(isbn => books[isbn].author.toLowerCase().includes(author))
            .map(isbn => ({
                isbn: isbn,
                title: books[isbn].title,
                author: books[isbn].author,
                year: books[isbn].year
            }));

        await new Promise(resolve => setTimeout(resolve, 50));

        if (foundBooks.length === 0) {
            return res.status(404).json({ 
                message: "No books found by author: " + req.params.author 
            });
        }

        return res.status(200).json({
            message: `Books by ${req.params.author} retrieved successfully`,
            count: foundBooks.length,
            books: foundBooks
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error retrieving books by author",
            error: error.message 
        });
    }
});

public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();

        const foundBooks = Object.keys(books)
            .filter(isbn => books[isbn].title.toLowerCase().includes(title))
            .map(isbn => ({
                isbn: isbn,
                title: books[isbn].title,
                author: books[isbn].author,
                year: books[isbn].year
            }));

        await new Promise(resolve => setTimeout(resolve, 50));

        if (foundBooks.length === 0) {
            return res.status(404).json({ 
                message: "No books found with title: " + req.params.title 
            });
        }

        return res.status(200).json({
            message: `Books with title containing "${req.params.title}" retrieved successfully`,
            count: foundBooks.length,
            books: foundBooks
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error retrieving books by title",
            error: error.message 
        });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ 
            message: "Book not found with ISBN: " + isbn 
        });
    }

    const reviews = books[isbn].reviews || {};

    if (Object.keys(reviews).length === 0) {
        return res.status(200).json({
            message: "No reviews found for this book",
            isbn: isbn,
            title: books[isbn].title,
            reviews: {}
        });
    }

    return res.status(200).json({
        message: "Reviews retrieved successfully",
        isbn: isbn,
        title: books[isbn].title,
        reviews: reviews
    });
});

module.exports.general = public_users;