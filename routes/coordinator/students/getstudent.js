const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const coordinator_id = req.query.coordinator_id;

    try {
      const query = `
        SELECT 
          s.student_id, 
          s.coordinator_id, 
          s.student_name, 
          s.student_address, 
          s.student_contact,
          s.student_sex, 
          s.student_status, 
          s.student_email, 
          s.student_schoolid,
          c.company_name, 
          c.company_mentor 
        FROM student s
        LEFT JOIN company c ON s.company_id = c.company_id
        WHERE s.coordinator_id = ?
      `;

      const [results] = await db.query(query, [coordinator_id]);

      res.status(200).json(results);
    } catch (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
