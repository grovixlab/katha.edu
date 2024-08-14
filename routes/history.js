const express = require('express');
const router = express.Router();
const History = require('../models/History');
const Member = require('../models/Member');
const Book = require('../models/Book');
const moment = require('moment');
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

const isAuthorised = (req, res, next) => {
    try {
        if (!req.session.logged) {
            res.redirect('/auth/login');
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        console.error("Error:", err);
    }
}

const isNotAuthorised = (req, res, next) => {
    try {
        if (!req.session.logged) {
            next();
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        console.error("Error:", err);
    }
}

// Book Taking Registration Route
router.get('/borrow', (req, res) => {
    res.render('book-take', { title: "Register Book Taking" });
});

router.post('/take', isAuthorised, async (req, res) => {
    const { memberId, bookId, bookName } = req.body;

    try {
        let member = await Member.findOne({ memberId: memberId }).lean();
        let book = await Book.findOne({ bookId: bookId });

        if (!member) {
            return res.render('book-take', { title: "Register Member", error: { message: 'Member not registered.' } });
        }
        if (!book) {
            return res.render('book-take', { title: "Register Member", error: { message: 'Book not registered.' } });
        }

        // Check if the book is already taken
        if (book.status === 'taken') {
            return res.render('book-take', { title: "Register Member", error: { message: 'Book is already taken.' } });
        }

        // Update book status to 'taken'
        book.status = 'taken';
        await book.save();

        const dueDate = moment().add(7, 'days').toDate();
        const history = new History({ memberId, bookId, bookName, dueDate, studentDbID: member._id, bookDbID: book._id });
        await history.save();

        res.redirect('/history/borrow');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// History Page
router.get('/', isAuthorised, async (req, res) => {
    try {
        // Fetch overdue books
        const overdueBooks = await History.find({ status: 'taken', dueDate: { $lt: new Date() } }).lean();
        for (let entry of overdueBooks) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
        }

        // Fetch books taken
        const booksTaken = await History.find({ status: 'taken', dueDate: { $gte: new Date() } }).lean();
        for (let entry of booksTaken) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
        }

        // Fetch books returned
        const booksReturned = await History.find({ status: 'returned' }).lean();
        for (let entry of booksReturned) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
        }


        res.render('history', {
            title: "History",
            overdueBooks,
            booksTaken,
            booksReturned
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Book Return Registration Route
router.get('/return', isAuthorised, (req, res) => {
    res.render('book-return', { title: "Register Book Taking" });
});

router.post('/return', isAuthorised, async (req, res) => {
    const { memberId, bookId } = req.body;
    try {
        let member = await Member.findOne({ memberId: memberId }).lean();
        let book = await Book.findOne({ bookId: bookId }).lean();
        let upBook = await Book.findOne({ bookId: bookId });
        if (!member) {
            return res.render('book-return', { title: "Register Member", error: { message: 'Member not registered.' } });
        }
        if (!book) {
            return res.render('book-return', { title: "Register Member", error: { message: 'Book not registered.' } });
        }
        const historyEntry = await History.findOne({ memberId, bookId, status: 'taken' });
        if (historyEntry) {
            // Update book status to 'taken'
            upBook.status = 'available';
            await upBook.save();
            historyEntry.status = 'returned';
            await historyEntry.save();
        }
        res.redirect('/history');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// History Pages Routes

// Overdue Books History
router.get('/overdue', isAuthorised, async (req, res) => {
    try {
        // Fetch overdue books
        const overdueBooks = await History.find({ status: 'taken', dueDate: { $lt: new Date() } }).lean();
        for (let entry of overdueBooks) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
            entry.fine = moment().diff(entry.dueDate, 'days') * 5;
        }

        res.render('overdue-history', {
            title: "Overdue Books History",
            overdueBooks,
            formatDate: date => moment(date).format('YYYY-MM-DD') // Helper function for formatting dates
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Books Taken History
router.get('/taken', isAuthorised, async (req, res) => {
    try {
        // Fetch books taken
        const booksTaken = await History.find({ status: 'taken', dueDate: { $gte: new Date() } }).lean();
        for (let entry of booksTaken) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
        }

        // Render the page with book and member details
        res.render('taken-history', {
            title: "Books Taken History",
            booksTaken,
            formatDate: date => moment(date).format('YYYY-MM-DD') // Helper function for formatting dates
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Books Returned History
router.get('/returned', isAuthorised, async (req, res) => {
    try {
        // Fetch books returned
        const booksReturned = await History.find({ status: 'returned' }).lean();
        for (let entry of booksReturned) {
            const member = await Member.findOne({ memberId: entry.memberId }); // Find member by custom ID
            const book = await Book.findOne({ bookId: entry.bookId });            // Find book by custom ID
            entry.studentName = member ? member.studentName : 'Unknown';
            entry.bookName = book ? book.bookName : 'Unknown';
        }

        res.render('returned-history', {
            title: "Books Returned History",
            booksReturned,
            formatDate: date => moment(date).format('YYYY-MM-DD') // Helper function for formatting dates
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
