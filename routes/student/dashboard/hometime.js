const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", async (req, res) => {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ message: "Missing student_id parameter." });
    }

    try {
      // Fetch student details
      const [studentData] = await db
        .promise()
        .query(
          `SELECT student_name, coordinator_id, student_sex FROM student WHERE student_id = ?`,
          [student_id]
        );

      if (studentData.length === 0) {
        return res.status(404).json({ message: "Student not found." });
      }

      const { student_name, coordinator_id, student_sex } = studentData[0];
      const firstName = student_name.split(" ")[0];

      // Fetch coordinator and program details
      const [coordinatorData] = await db
        .promise()
        .query(`SELECT program_id FROM coordinator WHERE coordinator_id = ?`, [
          coordinator_id,
        ]);

      if (coordinatorData.length === 0) {
        return res.status(404).json({ message: "Coordinator not found." });
      }

      const { program_id } = coordinatorData[0];
      const [programData] = await db
        .promise()
        .query(`SELECT program_hours FROM program WHERE program_id = ?`, [
          program_id,
        ]);

      if (programData.length === 0) {
        return res.status(404).json({ message: "Program not found." });
      }

      const { program_hours } = programData[0];

      // Get pre-computed times from ojt_status or use defaults
      const [ojtStatus] = await db
        .promise()
        .query(
          "SELECT rendered_time, remaining_time FROM ojt_status WHERE student_id = ?",
          [student_id]
        );

      // Default values if no OJT status record exists
      let renderedTime = 0;
      let remainingTime = 0;

      if (ojtStatus.length > 0) {
        // Handle potential NULL values and convert to numbers
        renderedTime = Number(ojtStatus[0].rendered_time) || 0;
        remainingTime = Number(ojtStatus[0].remaining_time) || 0;
      }

      res.json({
        studentDetails: {
          firstName,
          renderedTime: renderedTime.toFixed(2),
          remainingTime: remainingTime.toFixed(2),
          requiredTime: program_hours,
          studentSex: student_sex,
        },
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  return router;
};
