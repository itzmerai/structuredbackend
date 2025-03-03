const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/', (req, res) => {
    const { admin_id, program_name, program_description, program_hours } = req.body;

    // Check if a program with the same name AND description already exists
    const checkQuery = `
        SELECT * FROM program 
        WHERE program_name = ? AND program_description = ?
    `;

    db.query(checkQuery, [program_name, program_description], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Error checking program:', checkErr);
            return res.status(500).json({ message: 'Database error' });
        }

        if (checkResult.length > 0) {
            return res.status(400).json({ message: 'Program with the same name and description already exists' });
        }

        // If no duplicate, proceed to insert
        const insertQuery = `
            INSERT INTO program (admin_id, program_name, program_description, program_hours)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertQuery, [admin_id, program_name, program_description, program_hours], (insertErr, result) => {
            if (insertErr) {
                console.error('Error adding program:', insertErr);
                return res.status(500).json({ message: 'Database error' });
            }

            res.status(201).json({ message: 'Program added successfully', program_id: result.insertId });
        });
    });
});
    return router;
}