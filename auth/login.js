const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Login API
    router.post('/', (req, res) => {
        const { username, password } = req.body;

        // Check administrator
        db.query(
          "SELECT * FROM administrator WHERE admin_user = ? AND admin_password = ?",
          [username, password],
          (err, results) => {
            if (err) {
              return res.status(500).json({ message: "Database error", error: err });
            }
            if (results.length > 0) {
              const admin = results[0];
              return res.status(200).json({
                message: "Administrator logged in",
                role: "admin",
                user: { admin_id: admin.admin_id, ...admin },
              });
            }
      
            // Check coordinator
            db.query(
              "SELECT * FROM coordinator WHERE coordinator_user = ? AND coordinator_pass = ?",
              [username, password],
              (err, results) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ message: "Database error", error: err });
                }
                if (results.length > 0) {
                  const coordinator = results[0];
                  return res.status(200).json({
                    message: "Coordinator logged in",
                    role: "coordinator",
                    user: {
                      coordinator_id: coordinator.coordinator_id,
                      ...coordinator,
                    },
                  });
                }
      
                // Check student
                db.query(
                  "SELECT * FROM student WHERE student_schoolid = ? AND student_password = ?",
                  [username, password],
                  (err, results) => {
                    if (err) {
                      return res
                        .status(500)
                        .json({ message: "Database error", error: err });
                    }
                    if (results.length > 0) {
                      const student = results[0];
                      return res.status(200).json({
                        message: "Student logged in",
                        role: "student",
                        user: { student_id: student.student_id, ...student },
                      });
                    }
      
                    // If no user found
                    return res
                      .status(401)
                      .json({ message: "Invalid username or password" });
                  }
                );
              }
            );
          }
        );
    });

    return router;
};
