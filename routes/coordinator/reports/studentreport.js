const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/', (req, res) => {
        const { coordinatorId, searchQuery } = req.query;
  
        if (!coordinatorId || !searchQuery) {
          return res.status(400).json({ error: "Missing coordinator ID or search query" });
        }
      
        const sql = `
          SELECT s.student_id, s.student_name, t.date, t.am_in, t.am_out, t.pm_in, t.pm_out, t.location
          FROM student s
          LEFT JOIN timesheet t ON s.student_id = t.student_id
          WHERE s.coordinator_id = ? AND s.student_name LIKE ?
        `;
      
        db.query(sql, [coordinatorId, `%${searchQuery}%`], (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Database error" });
          }
          res.json(results);
        });
    });
    return router;
};