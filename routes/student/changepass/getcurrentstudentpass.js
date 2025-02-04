const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/', async (req, res) => {
        const { student_id } = req.query;

        if (!student_id) {
          return res.status(400).json({ error: "Missing student_id parameter." });
        }
      
        try {
          const [result] = await db
            .promise()
            .query("SELECT student_password FROM student WHERE student_id = ?", [
              student_id,
            ]);
      
          if (result.length === 0) {
            return res.status(404).json({ error: "Student not found." });
          }
      
          res.json({ password: result[0].student_password });
        } catch (error) {
          console.error("Error fetching student password:", error);
          res.status(500).json({ error: "Internal server error." });
        }

    });
    return router;
}