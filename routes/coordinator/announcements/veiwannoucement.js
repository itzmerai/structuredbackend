const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/', ( req, res)=>{
        const coordinator_id = req.query.coordinator_id; // Get coordinator_id from query parameters
        const query = `
          SELECT announce_id, coordinator_id, announcement_type, announcement_content 
          FROM announce 
          WHERE coordinator_id = ?`;
      
        db.query(query, [coordinator_id], (err, results) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch announcements.' });
          res.status(200).json(results);
        });
    });
    return router;
}