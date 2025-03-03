const express = require('express');
const router = express.Router();
const sendEmail = require('../../../mailer/emailSender');

module.exports = (db) => {
    router.post('/', (req, res) => {
        const {
            coordinator_id,
            student_name,
            student_address,
            student_contact,
            student_sex,
            company_id,
            student_status,
            student_email,
            student_schoolid,
            student_password,
        } = req.body;

        // Validate required fields
        if (!coordinator_id || !student_name || !student_address || !student_contact || !student_sex || !company_id || !student_status || !student_email || !student_schoolid || !student_password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check for duplicates (email, school ID, contact)
        const checkQuery = `
            SELECT 
                SUM(student_email = ?) as email_exists,
                SUM(student_schoolid = ?) as schoolid_exists,
                SUM(student_contact = ?) as contact_exists
            FROM student
        `;

        db.query(checkQuery, [student_email, student_schoolid, student_contact], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking duplicates:', checkErr);
                return res.status(500).json({ message: 'Database error during duplicate check', error: checkErr });
            }

            const { email_exists, schoolid_exists, contact_exists } = checkResult[0];
            const errors = [];
            if (email_exists > 0) errors.push('Email already exists');
            if (schoolid_exists > 0) errors.push('School ID already exists');
            if (contact_exists > 0) errors.push('Contact number already exists');
            if (errors.length > 0) {
                return res.status(409).json({ message: errors.join(', ') });
            }

            // Fetch the most recent school year
            const yearQuery = `SELECT year_id FROM school_year ORDER BY year_id DESC LIMIT 1`;
            db.query(yearQuery, (yearErr, yearResult) => {
                if (yearErr) {
                    console.error('Error fetching school year:', yearErr);
                    return res.status(500).json({ message: 'Database error fetching school year', error: yearErr });
                }

                const year_id = yearResult.length > 0 ? yearResult[0].year_id : null;
                if (!year_id) {
                    return res.status(400).json({ message: 'No school year available.' });
                }

                // Insert the new student
                const insertQuery = `
                    INSERT INTO student (coordinator_id, student_name, student_address, student_contact, student_sex, company_id, year_id, student_status, student_email, student_schoolid, student_password)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(insertQuery, [coordinator_id, student_name, student_address, student_contact, student_sex, company_id, year_id, student_status, student_email, student_schoolid, student_password], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Error inserting student:', insertErr);
                        return res.status(500).json({ message: 'Database error', error: insertErr });
                    }

                    // Fetch the newly inserted student for response
                    const fetchQuery = `SELECT * FROM student WHERE student_id = ?`;
                    db.query(fetchQuery, [insertResult.insertId], (fetchErr, fetchResult) => {
                        if (fetchErr) {
                            console.error('Error fetching new student:', fetchErr);
                            return res.status(500).json({ message: 'Database error fetching new student', error: fetchErr });
                        }

                        const newStudent = fetchResult[0];

                        // Send email to student
                        const emailSubject = 'Student Account Credentials';
                        const emailBody = `
                            Dear ${student_name},
                            
                            Welcome to our system! Here are your account credentials:
                            
                            - School ID: ${student_schoolid}
                            - Email: ${student_email}
                            - Password: ${student_password}
                            
                            Please keep this information safe and do not share it with anyone.
                            
                            Regards,
                            Your Coordinator Team
                        `;

                        sendEmail(student_email, emailSubject, emailBody, (emailErr, emailRes) => {
                            if (emailErr) {
                                console.error('Error sending email:', emailErr);
                                return res.status(500).json({ message: 'Student registered but failed to send email.', error: emailErr });
                            }

                            // Return success response with new student data
                            res.status(201).json({ message: 'Student added successfully and email sent', student: newStudent });
                        });
                    });
                });
            });
        });
    });


    router.put('/:student_id', (req, res) => {
        const studentId = req.params.student_id;
        const {
          coordinator_id,
          student_name,
          student_address,
          student_contact,
          student_sex,
          company_id,
          student_status,
          student_email,
          student_schoolid,
          student_password,
        } = req.body;
      
        // Validate required fields
        if (!coordinator_id || !student_name || !student_address || !student_contact || 
            !student_sex || !company_id || !student_status || !student_email || 
            !student_schoolid || !student_password) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
      
        // Check for existing email, school ID, or contact (excluding current student)
        const checkQuery = `
          SELECT 
            SUM(student_email = ?) as email_exists,
            SUM(student_schoolid = ?) as schoolid_exists,
            SUM(student_contact = ?) as contact_exists
          FROM student
          WHERE student_id != ?
        `;
      
        db.query(checkQuery, [student_email, student_schoolid, student_contact, studentId], (err, result) => {
          if (err) {
            console.error('Error checking duplicates:', err);
            return res.status(500).json({ message: 'Database error during duplicate check', error: err });
          }
      
          const { email_exists, schoolid_exists, contact_exists } = result[0];
          const errors = [];
          if (email_exists > 0) errors.push('Email already exists');
          if (schoolid_exists > 0) errors.push('School ID already exists');
          if (contact_exists > 0) errors.push('Contact number already exists');
          if (errors.length > 0) {
            return res.status(409).json({ message: errors.join(', ') });
          }
      
          // Update student data
          const updateQuery = `
            UPDATE student
            SET 
              coordinator_id = ?,
              student_name = ?,
              student_address = ?,
              student_contact = ?,
              student_sex = ?,
              company_id = ?,
              student_status = ?,
              student_email = ?,
              student_schoolid = ?,
              student_password = ?
            WHERE student_id = ?
          `;
      
          const params = [
            coordinator_id,
            student_name,
            student_address,
            student_contact,
            student_sex,
            company_id,
            student_status,
            student_email,
            student_schoolid,
            student_password,
            studentId
          ];
      
          db.query(updateQuery, params, (err, result) => {
            if (err) {
              console.error('Error updating student:', err);
              return res.status(500).json({ message: 'Database error updating student', error: err });
            }
      
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: 'Student not found' });
            }
      
            res.status(200).json({ message: 'Student updated successfully' });
          });
        });
      });
    return router;
};
