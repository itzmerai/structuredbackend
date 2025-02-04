const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', (req, res) =>{
    const query = `SELECT COUNT(DISTINCT program_id) AS count FROM program`;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error counting programs:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      res.status(200).json({ count: results[0].count });
    });
  });
return router;
}