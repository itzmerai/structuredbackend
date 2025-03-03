const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/', (req, res) => {
        const { admin_id, school_yr } = req.body;

        // Validate input
        if (!admin_id || !school_yr) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if school year already exists
        const checkQuery = `SELECT * FROM school_year WHERE school_yr = ?`;
        db.query(checkQuery, [school_yr], (err, results) => {
            if (err) {
                console.error('Error checking school year:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'School year already exists.' });
            }

            // Insert new school year
            const insertQuery = `INSERT INTO school_year (admin_id, school_yr) VALUES (?, ?)`;
            db.query(insertQuery, [admin_id, school_yr], (err, result) => {
                if (err) {
                    console.error('Error inserting school year:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }

                res.status(201).json({ message: 'School year added successfully', year_id: result.insertId });
            });
        });
    });
    return router;
}