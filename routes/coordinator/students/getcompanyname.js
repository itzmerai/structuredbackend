const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req, res) => {
      const coordinator_id = req.query.coordinator_id;
      const query = `SELECT company_id, company_name FROM company WHERE coordinator_id = ?`;
    
      db.query(query, [coordinator_id], (err, results) => {
        if (err) {
          console.error('Error fetching companies:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(200).json(results);
      });
      });

    return router;
}