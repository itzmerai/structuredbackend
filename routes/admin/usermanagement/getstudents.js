const express = require('express');
const router = express.Router();

module.exports =(db) => {
    router.get('/', (req, res) => {
        const query = `
        SELECT 
          s.student_schoolid,
          CONCAT(cor.coordinator_firstname, ' ', cor.coordinator_lastname) AS coordinator_name,
          p.program_name,
          com.company_name,
          p.program_hours
        FROM student s
        LEFT JOIN company com ON s.company_id = com.company_id
        LEFT JOIN coordinator cor ON s.coordinator_id = cor.coordinator_id
        LEFT JOIN program p ON cor.program_id = p.program_id;
      `;
    
      db.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching students:", err);
          return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json(results);
      });
    });
return router;
}