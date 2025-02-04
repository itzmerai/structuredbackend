const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/', async (req, res) => {
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
          const firstName = student_name.split(" ")[0]; // Extract first name
      
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
      
          // Fetch rendered time from timesheet
          const [timesheetEntries] = await db
            .promise()
            .query("SELECT * FROM timesheet WHERE student_id = ?", [student_id]);
      
          // Calculate total rendered hours
          const calculateRenderedHours = (inTime, outTime) => {
            const parseTime = (time) => {
              if (!time) return 0;
              const [hours, minutes] = time.split(":").map(Number);
              return hours + minutes / 60;
            };
      
            const inDecimal = parseTime(inTime);
            const outDecimal = parseTime(outTime);
            return inDecimal < outDecimal ? outDecimal - inDecimal : 0;
          };
      
          const totalRendered = timesheetEntries.reduce((sum, entry) => {
            const morningHours = calculateRenderedHours(entry.am_in, entry.am_out);
            const afternoonHours = calculateRenderedHours(entry.pm_in, entry.pm_out);
            return sum + morningHours + afternoonHours;
          }, 0);
      
          const remainingTime = Math.max(program_hours - totalRendered, 0);
      
          res.json({
            studentDetails: {
              firstName,
              renderedTime: totalRendered.toFixed(2),
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
}