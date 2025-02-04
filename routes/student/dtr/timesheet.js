const express = require('express');
const router =  express.Router();

module.exports = (db) =>{
    router.get('/', async (req, res) =>{
        const { student_id } = req.query;

        if (!student_id) {
          return res.status(400).json({ error: "Missing student_id parameter." });
        }
      
        try {
          // Fetch timesheet entries for the student
          const [timesheetEntries] = await db
            .promise()
            .query("SELECT * FROM timesheet WHERE student_id = ?", [student_id]);
      
          if (timesheetEntries.length === 0) {
            return res.status(404).json({ error: "No timesheet entries found." });
          }
      
          // Helper function to parse time strings into decimal hours
          const parseTimeToDecimal = (time) => {
            if (!time || typeof time !== "string") return null;
      
            time = time.trim().toLowerCase();
            const isPM = time.endsWith("pm");
            const isAM = time.endsWith("am");
            const timeWithoutSuffix = time.replace(/(am|pm)/, "").trim();
            const [hours, minutes] = timeWithoutSuffix.split(":").map(Number);
      
            if (isNaN(hours) || isNaN(minutes)) return null;
      
            let hoursIn24 = hours;
            if (isPM && hours < 12) {
              hoursIn24 += 12; // Convert PM hour to 24-hour format
            } else if (isAM && hours === 12) {
              hoursIn24 = 0; // Midnight case
            }
      
            return hoursIn24 + minutes / 60; // Return decimal hours
          };
      
          // Helper function to calculate hours rendered between two times
          const calculateRenderedHours = (inTime, outTime) => {
            const inDecimal = parseTimeToDecimal(inTime);
            const outDecimal = parseTimeToDecimal(outTime);
      
            if (
              inDecimal === null ||
              outDecimal === null ||
              inDecimal >= outDecimal
            ) {
              return 0; // Return 0 for invalid or mismatched times
            }
      
            return outDecimal - inDecimal;
          };
      
          // Process each timesheet entry
          const processedTimesheet = timesheetEntries.map((entry) => {
            const morningHours = calculateRenderedHours(entry.am_in, entry.am_out);
            const afternoonHours = calculateRenderedHours(entry.pm_in, entry.pm_out);
            const totalHours = morningHours + afternoonHours;
      
            return {
              date: entry.date,
              location: entry.location,
              morning: { in: entry.am_in || "-", out: entry.am_out || "-" },
              afternoon: { in: entry.pm_in || "-", out: entry.pm_out || "-" },
              totalHours: totalHours.toFixed(2), // Rounded to 2 decimal places
            };
          });
      
          res.json({ timesheet: processedTimesheet });
        } catch (error) {
          console.error("Error fetching timesheet:", error);
          res.status(500).json({ error: "Internal server error." });
        }
    });
    return router;
}