const express = require('express');
const router = express.Router();

module.exports = (db) =>{
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
        
          if (!coordinator_id || !student_name || !student_address || !student_contact || !student_sex || !company_id || !student_status || !student_email || !student_schoolid || !student_password) {
            return res.status(400).json({ message: 'All fields are required.' });
          }
        
          // Query to get the most recent school year
          const yearQuery = `SELECT year_id FROM school_year ORDER BY year_id DESC LIMIT 1`;
        
          db.query(yearQuery, (err, yearResult) => {
            if (err) {
              console.error('Error fetching school year:', err);
              return res.status(500).json({ message: 'Database error fetching school year', error: err });
            }
        
            const year_id = yearResult.length > 0 ? yearResult[0].year_id : null;
            
            if (!year_id) {
              return res.status(400).json({ message: 'No school year available.' });
            }
        
            const query = `
              INSERT INTO student (coordinator_id, student_name, student_address, student_contact, student_sex, company_id, year_id, student_status, student_email, student_schoolid, student_password)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
        
            db.query(query, [coordinator_id, student_name, student_address, student_contact, student_sex, company_id, year_id, student_status, student_email, student_schoolid, student_password], (err, result) => {
              if (err) {
                console.error('Error inserting student:', err);
                return res.status(500).json({ message: 'Database error', error: err });
              }
              res.status(201).json({ message: 'Student added successfully', student_id: result.insertId });
            });
          });

    });
    return router;
}