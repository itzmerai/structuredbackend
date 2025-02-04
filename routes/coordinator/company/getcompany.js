const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req, res) => {
        const { coordinator_id } = req.query; // Get coordinator_id from the request query
        
        // Modified query to filter by coordinator_id if provided
        const query = 'SELECT company_id, coordinator_id, company_name, company_address, company_mentor, company_contact FROM company WHERE coordinator_id = ?';
      
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