const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req, res) => {
        const coordinator_id = req.query.coordinator_id;

        if (!coordinator_id) {
          return res.status(400).json({ message: "Coordinator ID is required" });
        }
      
        const query = `
          SELECT s.student_id, s.student_schoolid, s.student_name, c.company_name
          FROM student s
          LEFT JOIN company c ON s.company_id = c.company_id
          WHERE s.coordinator_id = ?
          ORDER BY s.student_id DESC
          LIMIT 5
        `;
      
        db.query(query, [coordinator_id], (err, results) => {
          if (err) {
            console.error('Error fetching recently added students:', err);
            return res.status(500).json({ message: 'Database error', error: err });
          }
      
          res.status(200).json({ recentStudents: results });
        });

    });
    return router;
}