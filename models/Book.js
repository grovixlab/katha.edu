const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookName: { type: String, required: true },
    bookId: { type: String, required: true},
    author: { type: String, required: true },
    status: {
        type: String,
        enum: ['taken', 'available'],
        default: 'available',
        required: true
    }
});

// Create a text index on bookName, author, and bookId
bookSchema.index({ bookName: 'text', author: 'text', bookId: 'text' });

module.exports = mongoose.model('Book', bookSchema);