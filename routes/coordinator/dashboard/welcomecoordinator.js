const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req, res) => {
        const { coordinator_id } = req.query;

        if (!coordinator_id) {
          return res.status(400).json({ message: "Coordinator ID is required" });
        }
      
        const query = `
          SELECT coordinator_firstname, coordinator_lastname
          FROM coordinator
          WHERE coordinator_id = ?
        `;
      
        db.query(query, [coordinator_id], (err, results) => {
          if (err) {
            console.error("Error fetching coordinator details:", err);
            return res.status(500).json({ message: "Database error", error: err });
          }
      
          if (results.length === 0) {
            return res.status(404).json({ message: "Coordinator not found" });
          }
      
          const { coordinator_firstname, coordinator_lastname } = results[0];
          res.status(200).json({
            fullName: `${coordinator_firstname} ${coordinator_lastname}`
          });
        });
    });
    return router;
}