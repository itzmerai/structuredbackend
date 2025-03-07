const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { studentId, scanTime, address } = req.body;

    // Validate required fields
    if (!address) {
      return res.status(400).json({ error: "Address (location) is required" });
    }
    if (!studentId || !scanTime) {
      return res
        .status(400)
        .json({ error: "Student ID and scan time are required" });
    }

    try {
      // Get company_id from the student table
      const [studentResult] = await db
        .promise()
        .query("SELECT company_id FROM student WHERE student_id = ?", [
          studentId,
        ]);

      if (studentResult.length === 0 || !studentResult[0].company_id) {
        return res.status(404).json({ error: "Student or company not found" });
      }

      const companyId = studentResult[0].company_id;
      const scanDate = new Date(scanTime);
      const date = scanDate.toISOString().split("T")[0];
      const time = scanDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // Check if a timesheet entry exists for this student and date
      const [timesheetRows] = await db
        .promise()
        .query("SELECT * FROM timesheet WHERE student_id = ? AND date = ?", [
          studentId,
          date,
        ]);

      if (timesheetRows.length > 0) {
        // Update existing record
        const timesheetEntry = timesheetRows[0];
        const updatedFields = {};

        if (!timesheetEntry.am_in) {
          updatedFields.am_in = time;
        } else if (!timesheetEntry.am_out) {
          updatedFields.am_out = time;
        } else if (!timesheetEntry.pm_in) {
          updatedFields.pm_in = time;
        } else if (!timesheetEntry.pm_out) {
          updatedFields.pm_out = time;
        } else {
          return res
            .status(400)
            .json({ error: "All time slots for the day are filled" });
        }

        await db
          .promise()
          .query("UPDATE timesheet SET ? WHERE time_id = ?", [
            updatedFields,
            timesheetEntry.time_id,
          ]);
      } else {
        // Insert new record if no entry exists for that date
        await db
          .promise()
          .query(
            "INSERT INTO timesheet (student_id, company_id, date, am_in, am_out, pm_in, pm_out, location, dailyrenderedtime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [studentId, companyId, date, time, null, null, null, address, 0]
          );
      }

      // Fetch updated timesheet to calculate rendered time
      const [updatedTimesheet] = await db
        .promise()
        .query("SELECT * FROM timesheet WHERE student_id = ? AND date = ?", [
          studentId,
          date,
        ]);

      if (updatedTimesheet.length > 0) {
        const entry = updatedTimesheet[0];

        const parseTimeToDecimal = (time) => {
          if (!time || typeof time !== "string") return null;
          time = time.trim().toLowerCase();
          const isPM = time.endsWith("pm");
          const isAM = time.endsWith("am");
          const timeWithoutSuffix = time.replace(/(am|pm)/, "").trim();
          const [hours, minutes] = timeWithoutSuffix.split(":").map(Number);
          if (isNaN(hours) || isNaN(minutes)) return null;
          let hoursIn24 = hours;
          if (isPM && hours < 12) hoursIn24 += 12;
          else if (isAM && hours === 12) hoursIn24 = 0;
          return hoursIn24 + minutes / 60;
        };

        const calculateRenderedHours = (inTime, outTime) => {
          const inDecimal = parseTimeToDecimal(inTime);
          const outDecimal = parseTimeToDecimal(outTime);
          if (
            inDecimal === null ||
            outDecimal === null ||
            inDecimal >= outDecimal
          )
            return 0;
          return outDecimal - inDecimal;
        };

        const morningHours = calculateRenderedHours(entry.am_in, entry.am_out);
        const afternoonHours = calculateRenderedHours(
          entry.pm_in,
          entry.pm_out
        );
        const totalHours = (morningHours + afternoonHours).toFixed(2);

        // Update the dailyrenderedtime column
        await db
          .promise()
          .query(
            "UPDATE timesheet SET dailyrenderedtime = ? WHERE time_id = ?",
            [totalHours, entry.time_id]
          );
      }

      res.json({ message: "Timesheet updated successfully" });
    } catch (err) {
      console.error("Error processing timesheet scan:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  return router;
};
