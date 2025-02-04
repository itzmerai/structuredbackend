const express = require('express');
const router = express.Router();

module.exports = (db) => {
 router.get('/', (req, res) => {
    const query = 'SELECT COUNT(*) AS count FROM company';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total companies:', err);
        return res.status(500).json({ error: 'Failed to fetch total companies' });
      }
      res.json({ count: results[0].count });
    });

 })
return router;
}