const express = require ('express');
const router = express.Router();

module.exports = (db) => {
    router.put('/:company_id', (req, res) => {
        const { company_id } = req.params;
        const {
            company_name,
            company_address,
            company_mentor,
            company_contact,
        } = req.body;

        if (!company_name || !company_address || !company_mentor || !company_contact) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const query = `
            UPDATE company 
            SET company_name = ?, company_address = ?, company_mentor = ?, company_contact = ?
            WHERE company_id = ?
        `;

        db.query(query, [company_name, company_address, company_mentor, company_contact, company_id], (err, result) => {
            if (err) {
                console.error('Error updating company:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Company not found' });
            }

            res.status(200).json({ message: 'Company updated successfully' });
        });
    });
    return router;
}