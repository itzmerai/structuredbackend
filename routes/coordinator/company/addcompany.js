const express = require('express');
const router = express.Router();
 
module.exports = (db) => {
    router.post('/', (req, res) => {
        const {
            coordinator_id,
            company_name,
            company_address,
            company_mentor,
            company_contact,
          } = req.body;
        
          // Validate input, including company_qr
          if (!coordinator_id || !company_name || !company_address || !company_mentor || !company_contact) {
            return res.status(400).json({ message: 'All fields, including QR code, are required.' });
          }
        
          const query = `
            INSERT INTO company (coordinator_id, company_name, company_address, company_mentor, company_contact)
            VALUES (?, ?, ?, ?, ?)
          `;
        
          db.query(query, [coordinator_id, company_name, company_address, company_mentor, company_contact], (err, result) => {
            if (err) {
              console.error('Error inserting company:', err);
              return res.status(500).json({ message: 'Database error', error: err });
            }
        
            res.status(201).json({ message: 'Company added successfully', company_id: result.insertId});
          });


    });
    return router;
}