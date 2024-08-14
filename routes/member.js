const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');
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

async function generateUniqueId() {
    let uniqueId = await 'LR' + Math.floor(10000 + Math.random() * 90000);
    let member = await Member.findOne({ memberId: uniqueId }).lean();
    member ? uniqueId = await 'LR' + Math.floor(10000 + Math.random() * 90000) : null;
    return uniqueId;
}

// Members Listing Route
router.get('/', async (req, res) => {
    const members = await Member.find().sort({ _id: -1 }).lean();
    res.render('members', { title: "Members", members });
});

// Member Search Route
router.post('/search', async (req, res) => {
    let { q } = req.body;
    q = q.toString(); // Ensure q is a string

    // Create a case-insensitive search query to match any part of bookName, author, or bookId
    const query = {
        $or: [
            { studentName: { $regex: q, $options: 'i' } },
            { registerNumber: { $regex: q, $options: 'i' } },
            { standard: { $regex: q, $options: 'i' } },
            { division: { $regex: q, $options: 'i' } },
            { memberId: { $regex: q, $options: 'i' } }
        ]
    };

    try {
        // Fetch the books that match the query
        const members = await Member.find(query).sort({ _id: -1 }).lean();

        // Render the books page with the filtered results
        res.render('members', { title: `Results (${q})`, q, members });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Member Registration Route
router.get('/register', isAuthorised, (req, res) => {
    res.render('member-register', { title: "Register Member" });
});

router.post('/register', isAuthorised, async (req, res) => {
    const { studentName, registerNumber, standard, division } = req.body;

    let member = await Member.findOne({ registerNumber: registerNumber }).lean();
    if (member) {
        return res.render('member-register', { title: "Register Member", error: { message: 'Member already registered.' } });
    }

    const memberId = await generateUniqueId();

    try {
        // Create a document
        const doc = new PDFDocument();
        const member = new Member({ studentName, registerNumber, standard, division, memberId: memberId });
        await member.save();


        // Generate QR code 
        const qrData = JSON.stringify({ memberId, studentName, registerNumber, standard, division });
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        doc.fontSize(16).text('Luminara', { align: 'center' });
        doc.fontSize(12).text(`Member ID: ${memberId}`);
        doc.text(`Name: ${studentName}`);
        doc.text(`Register Number: ${registerNumber}`);
        doc.text(`Standard: ${standard}`);
        doc.text(`Division: ${division}`);
        doc.text(' ');
        doc.image(qrCodeUrl, { fit: [100, 100], align: 'center' });

        doc.pipe(res);

        doc.end();

        // res.redirect('/students/register');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Member Editing Route
router.get('/edit/:memberId', async (req, res) => {
    try {
        // Find the member by memberId
        const member = await Member.findOne({ memberId: req.params.memberId }).lean();

        // If no member is found, render with an error message
        if (!member) {
            return res.render('member-edit', { title: "Edit Member", error: { message: 'Member not found' } });
        }

        // Render the member edit form with the member details
        res.render('member-edit', { title: "Edit Member", member });
    } catch (err) {
        // Log and display any errors that occur
        console.log('Error retrieving member:', err);
        res.render('member-edit', { title: "Edit Member", error: { message: 'Internal server error' } });
    }
});

// Member Update Route
router.post('/update/', async (req, res) => {
    try {
        const { memberId, studentName, registerNumber, standard, division } = req.body;

        // Ensure all required fields are present
        if (!memberId || !studentName || !registerNumber || !standard || !division) {
            return res.render('member-edit', {
                title: "Edit Member",
                error: { message: 'All fields are required' },
                member: req.body // Retain input values
            });
        }

        // Perform the update operation
        const result = await Member.updateOne(
            { memberId },
            { $set: { studentName, registerNumber, standard, division } }
        );

        // Check if the update was successful
        if (result.nModified === 0) {
            return res.render('member-edit', {
                title: "Edit Member",
                error: { message: 'Update failed or no changes made' },
                member: req.body // Retain input values
            });
        }

        // Render the member edit form with a success message
        res.redirect('/members/')
    } catch (err) {
        // Log and handle any errors that occur
        console.log('Error updating member:', err);
        res.render('member-edit', {
            title: "Edit Member",
            error: { message: 'Internal server error' },
            member: req.body // Retain input values
        });
    }
});

// Member Deleting Route
router.delete('/delete/:memberId', async (req, res) => {
    try {
        // Ensure memberId is provided
        if (!req.params.memberId) {
            return res.status(400).json({ message: 'Member ID is required' });
        }

        // Attempt to delete the member by memberId
        const result = await Member.deleteOne({ memberId: req.params.memberId });

        // Check if any document was deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Respond with success message if deletion is successful
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (err) {
        // Log and handle any errors that occur
        console.log('Error deleting member:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});





// Fetch Member by ID
router.get('/api/member/:id', async (req, res) => {
    const memberId = req.params.id;

    if (!memberId) {
        return res.status(400).json({ message: 'Invalid member ID' });
    }

    try {
        const member = await Member.findOne({ memberId: memberId });
        if (member) {
            res.json({ studentName: member.studentName });
        } else {
            res.status(404).json({ message: 'Member not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
