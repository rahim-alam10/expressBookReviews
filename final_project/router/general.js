// Use axios or fetch for async operations
const axios = require('axios');

// Get book list with async/await
public_users.get('/', async function (req, res) {
    try {
        // Simulate async operation
        const bookList = Object.keys(books).map(isbn => ({
            isbn: isbn,
            title: books[isbn].title,
            author: books[isbn].author,
            year: books[isbn].year
        }));
        
        // Simulate delay (like a database query)
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

// Get book by ISBN with async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Simulate database query
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