const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req, res) => {
        const query = `SELECT program_id, program_name, program_description, program_hours FROM program`;

        db.query(query, (err, results) => {
          if (err) {
            console.error('Error fetching programs:', err);
            return res.status(500).json({ message: 'Database error', error: err });
          }
      
          res.status(200).json(results);
        });
    });
    return router;
}