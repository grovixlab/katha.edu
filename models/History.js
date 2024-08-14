const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    memberId: { type: String, ref: 'Member', required: true, ref: 'Member' },
    bookId: { type: String, ref: 'Book', required: true, ref: 'Book' },
    bookName: { type: String, required: true },
    status: { type: String, enum: ['taken', 'returned'], default: 'taken' },
    dueDate: { type: Date, required: true },
    fine: { type: Number, default: 0 },
    studentDbID: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    bookDbID: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
});

module.exports = mongoose.model('History', historySchema);
