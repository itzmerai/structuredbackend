const express = require('express');
const router = express.Router();

module.exports = (db) =>{
    router.get('/', (req , res)=>{
        const { coordinator_id } = req.query;

        if (!coordinator_id) {
          return res.status(400).json({ message: "Coordinator ID is required" });
        }
      
        const query = `
          SELECT 
            t.time_id, 
            t.student_id, 
            s.student_name, 
            c.company_name, 
            t.date, 
            t.am_in, 
            t.am_out, 
            t.pm_in, 
            t.pm_out, 
            t.location
          FROM 
            timesheet t
          INNER JOIN 
            student s ON t.student_id = s.student_id
          INNER JOIN 
            company c ON t.company_id = c.company_id
          WHERE 
            c.coordinator_id = ?`;
      
        db.query(query, [coordinator_id], (err, results) => {
          if (err) {
            console.error("Error fetching timesheet data:", err);
            return res.status(500).json({ message: "Database error", error: err });
          }
      
          res.status(200).json(results);
        });
    });
    return router;
}