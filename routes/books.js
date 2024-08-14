const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// Book Listing Route
router.get('/', async (req, res) => {
    const books = await Book.find().sort({ _id: -1 }).lean();
    res.render('books', { title: "Books", books });
});

// Book Search Route
router.post('/search', async (req, res) => {
    let { q } = req.body;
    q = q.toString(); // Ensure q is a string

    // Create a case-insensitive search query to match any part of bookName, author, or bookId
    const query = {
        $or: [
            { bookName: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { bookId: { $regex: q, $options: 'i' } }
        ]
    };

    try {
        // Fetch the books that match the query
        const books = await Book.find(query).sort({ _id: -1 }).lean();

        // Render the books page with the filtered results
        res.render('books', { title: `Results (${q})`, q, books });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Book Adding Route
router.get('/add', (req, res) => {
    res.render('book-add', { title: "Add Book" });
});

router.post('/add', async (req, res) => {
    const { bookName, bookNumber, bookAuthor } = req.body;

    try {
        if (!bookNumber) {
            return res.render('book-add', { title: "Add Book", error: { message: 'Book number cannot be null' } });
        }

        if (!bookName) {
            return res.render('book-add', { title: "Add Book", error: { message: 'Book name cannot be null' } });
        }

        if (!bookAuthor) {
            return res.render('book-add', { title: "Add Book", error: { message: 'Book author cannot be null' } });
        }

        let bookId = await bookNumber.toString();

        const newBook = new Book({ bookName, bookId, author: bookAuthor });
        await newBook.save();
        res.redirect('/books/add');
        
    } catch (err) {

        console.log(err);
        return res.render('book-add', { title: "Add Book", error: { message: 'Internal server error' } });

    }
});


// Fetch Book by ID
router.get('/api/book/:id', async (req, res) => {
    const bookId = req.params.id;

    // Ensure the ID is a valid MongoDB ObjectId
    if (!bookId) {
        return res.status(400).json({ message: 'Invalid book ID' });
    }

    try {
        const book = await Book.findOne({ bookId: bookId });

        if (book) {
            res.json({ bookName: book.bookName });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
