const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/', (req, res) => {
        const { admin_id, program_name, program_description, program_hours } = req.body;

        // Debugging: log received data
        console.log('Received data:', req.body);
      
        if (!admin_id || !program_name || !program_description || !program_hours) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
      
        const query = `
          INSERT INTO program (admin_id, program_name, program_description, program_hours)
          VALUES (?, ?, ?, ?)
        `;
      
        db.query(query, [admin_id, program_name, program_description, program_hours], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Database error', error: err });
          }
      
          // Log result for debugging
          console.log('Program added successfully:', result);
      
          res.status(201).json({ message: 'Program added successfully', program_id: result.insertId });
        });

    });
    return router;
}