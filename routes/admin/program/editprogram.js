const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.put('/:program_id', (req, res) => {
        const { program_id } = req.params;
        const { admin_id, program_name, program_description, program_hours } = req.body;

        // Validate required fields
        if (!admin_id || !program_name || !program_description || !program_hours) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if another program with the same name AND description already exists (excluding the current program)
        const checkQuery = `
            SELECT * FROM program 
            WHERE program_name = ? AND program_description = ?
            AND program_id != ?
        `;

        db.query(checkQuery, [program_name, program_description, program_id], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking program:', checkErr);
                return res.status(500).json({ message: 'Database error' });
            }

            if (checkResult.length > 0) {
                return res.status(400).json({ message: 'A program with the same name and description already exists.' });
            }

            // If no duplicate, proceed to update
            const updateQuery = `
                UPDATE program 
                SET admin_id = ?, program_name = ?, program_description = ?, program_hours = ?
                WHERE program_id = ?
            `;

            db.query(updateQuery, [admin_id, program_name, program_description, program_hours, program_id], (updateErr, result) => {
                if (updateErr) {
                    console.error('Error updating program:', updateErr);
                    return res.status(500).json({ message: 'Database error', error: updateErr });
                }

                res.status(200).json({ message: 'Program updated successfully', program_id });
            });
        });
    });

    return router;
};