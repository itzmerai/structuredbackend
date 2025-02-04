const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/', (req, res) =>{
        const { coordinator_id } = req.query;

        if (!coordinator_id) {
          return res.status(400).json({ message: "Coordinator ID is required" });
        }
      
        const query = `
          SELECT COUNT(DISTINCT student_id) AS studentCount
          FROM student
          WHERE coordinator_id = ?
        `;
      
        db.query(query, [coordinator_id], (err, results) => {
          if (err) {
            console.error("Error counting students:", err);
            return res.status(500).json({ message: "Database error", error: err });
          }
      
          res.status(200).json({ count: results[0].studentCount });
        });
    });
    return router;

}