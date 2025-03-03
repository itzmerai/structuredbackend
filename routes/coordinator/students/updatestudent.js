const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.put('/:id', (req, res) => {
        const { id } = req.params; // Get student_id from URL params
        const {
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

        if (!student_name || !student_address || !student_contact || !student_sex || !company_id || !student_status || !student_email || !student_schoolid || !student_password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const query = `
            UPDATE student
            SET 
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

        db.query(query, [student_name, student_address, student_contact, student_sex, company_id, student_status, student_email, student_schoolid, student_password, student_id], (err, result) => {
            if (err) {
                console.error('Error updating student:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found.' });
            }

            res.status(200).json({ message: 'Student updated successfully' });
        });
    });
 return router;

}