const express = require("express");
const router = express.Router();

module.exports = (db) => {
    router.get('/' , async (req, res) =>{
        const { student_id } = req.query;

        if (!student_id) {
          return res.status(400).json({ error: "Missing student_id parameter." });
        }
      
        try {
          // Fetch the coordinator_id of the student
          const [studentResult] = await db
            .promise()
            .query("SELECT coordinator_id FROM student WHERE student_id = ?", [
              student_id,
            ]);
      
          if (studentResult.length === 0) {
            return res.status(404).json({ error: "Student not found." });
          }
      
          const { coordinator_id } = studentResult[0];
      
          // Fetch the latest announcement for the coordinator
          const [announcementResult] = await db
            .promise()
            .query(
              "SELECT announce_id, announcement_type, announcement_content FROM announce WHERE coordinator_id = ? ORDER BY announce_id DESC LIMIT 1",
              [coordinator_id]
            );
      
          if (announcementResult.length === 0) {
            return res.status(404).json({ error: "No announcements found." });
          }
      
          const latestAnnouncement = announcementResult[0];
      
          res.json({
            announcement: latestAnnouncement,
          });
        } catch (error) {
          console.error("Error fetching latest announcement:", error);
          res.status(500).json({ error: "Internal server error." });
        }
    });
    return router;
}