const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    registerNumber: { type: String, required: true },
    standard: { type: String, required: true },
    division: { type: String, required: true },
    memberId: { type: String, required: true }
}); 

// Create a text index on studentName, registerNumber, and memberId
studentSchema.index({ studentName: 'text', registerNumber: 'text', memberId: 'text' });

module.exports = mongoose.model('Member', studentSchema);
