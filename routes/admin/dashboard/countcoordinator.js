const express = require('express');
const router = express.Router();
 
module.exports = (db) => {
    router.get('/', (req, res) =>{
        const query = 'SELECT COUNT(DISTINCT coordinator_id) AS count FROM coordinator';
    
        db.query(query, (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
          }
          // Log result for debugging
          console.log("Unique Coordinators Count:", results[0].count);
          return res.status(200).json({ count: results[0].count }); // Send the count of unique coordinators
        });

    });
    return router;
}