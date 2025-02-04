const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.put('/:program_id', (req, res) => {
        const { program_id } = req.params;
        const { admin_id, program_name, program_description, program_hours } = req.body;
      
        if (!admin_id || !program_name || !program_description || !program_hours) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
      
        const query = `
          UPDATE program 
          SET admin_id = ?, program_name = ?, program_description = ?, program_hours = ?
          WHERE program_id = ?
        `;
      
        db.query(query, [admin_id, program_name, program_description, program_hours, program_id], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Database error', error: err });
          }
      
          res.status(200).json({ message: 'Program updated successfully', program_id });
        });
    });
    return router;
}