const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post ('/', async (req, res) => {
        const { student_id, current_password, new_password } = req.body;

        if (!student_id || !current_password || !new_password) {
          return res.status(400).json({
            error: "student_id, current_password, and new_password are required.",
          });
        }
      
        try {
          // Verify the current password
          const [result] = await db
            .promise()
            .query("SELECT student_password FROM student WHERE student_id = ?", [
              student_id,
            ]);
      
          if (result.length === 0) {
            return res.status(404).json({ error: "Student not found." });
          }
      
          const storedPassword = result[0].student_password;
          if (storedPassword !== current_password) {
            return res.status(400).json({ error: "Current password is incorrect." });
          }
      
          // Update the password in the database
          await db
            .promise()
            .query("UPDATE student SET student_password = ? WHERE student_id = ?", [
              new_password,
              student_id,
            ]);
      
          res.json({ message: "Password updated successfully." });
        } catch (error) {
          console.error("Error updating student password:", error);
          res.status(500).json({ error: "Internal server error." });
        }
    });
    return router;
}