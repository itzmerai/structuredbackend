const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { student_id, currentPassword, newPassword, confirmPassword } =
      req.body;

    if (!student_id || !currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords don't match" });
    }

    try {
      // Verify current password
      const [rows] = await db
        .promise()
        .query("SELECT student_password FROM student WHERE student_id = ?", [
          student_id,
        ]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Plain text comparison (INSECURE)
      if (currentPassword !== rows[0].student_password) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }

      // Update with plain text password (INSECURE)
      await db
        .promise()
        .query("UPDATE student SET student_password = ? WHERE student_id = ?", [
          newPassword,
          student_id,
        ]);

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  return router;
};
