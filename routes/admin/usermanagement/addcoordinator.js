const express = require('express');
const router = express.Router();
const sendEmail = require('../../../mailer/emailSender');

module.exports = (db) => {
    router.post('/', async (req, res) => {
        const {
            admin_id, 
            coordinator_firstname, 
            coordinator_midname,
            coordinator_lastname, 
            coordinator_contact, 
            coordinator_sex,
            program_id,
            coordinator_email, 
            coordinator_user, 
            coordinator_pass 
        } = req.body;
        
        // Validate input
        if (!admin_id || !coordinator_firstname || !coordinator_midname || !coordinator_lastname || !coordinator_contact || !coordinator_sex || !program_id || !coordinator_email || !coordinator_user || !coordinator_pass) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        
        // Check if contact number, email, or username already exists
        const checkQuery = `SELECT * FROM coordinator WHERE coordinator_contact = ? OR coordinator_email = ? OR coordinator_user = ?`;
        db.query(checkQuery, [coordinator_contact, coordinator_email, coordinator_user], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            
            if (results.length > 0) {
                const existingFields = [];
                if (results.some(coordinator => coordinator.coordinator_contact === coordinator_contact)) {
                    existingFields.push('Contact Number');
                }
                if (results.some(coordinator => coordinator.coordinator_email === coordinator_email)) {
                    existingFields.push('Email');
                }
                if (results.some(coordinator => coordinator.coordinator_user === coordinator_user)) {
                    existingFields.push('Username');
                }
                return res.status(400).json({ message: `${existingFields.join(', ')} already exist.` });
            }
            
            // Hash password (for security)
            const hashedPassword = coordinator_pass; // Replace this with bcrypt hashing in production
            
            const insertQuery = `INSERT INTO coordinator (admin_id, coordinator_firstname, coordinator_midname, coordinator_lastname, coordinator_contact, coordinator_sex, program_id, coordinator_email, coordinator_user, coordinator_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.query(insertQuery, [admin_id, coordinator_firstname, coordinator_midname, coordinator_lastname, coordinator_contact, coordinator_sex, program_id, coordinator_email, coordinator_user, hashedPassword], async (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error', error: err });
                }
            
                // Email content
                const subject = "Your Coordinator Account Details";
                const text = `Hello ${coordinator_firstname} ${coordinator_lastname},\n\n` +
                             `Your coordinator account has been created successfully.\n\n` +
                             `Login Credentials:\n` +
                             `Username: ${coordinator_user}\n` +
                             `Password: ${coordinator_pass}\n\n` +
                             `Please change your password upon first login for security purposes.\n\n` +
                             `Best Regards,\nAdmin Team`;
            
                // Send email
                const emailResponse = await sendEmail(coordinator_email, subject, text);
            
                if (!emailResponse.success) {
                    return res.status(201).json({ 
                        message: 'Coordinator added successfully, but email sending failed.',
                        coordinator_id: results.insertId,
                        emailError: emailResponse.error
                    });
                }
            
                return res.status(201).json({ 
                    message: 'Coordinator added successfully, login credentials sent via email',
                    coordinator_id: results.insertId 
                });
            });
        });
    });
    // addcoordinator.js
    router.post('/check-duplicates', (req, res) => {
    const { coordinator_contact, coordinator_email, coordinator_user } = req.body;
    
    const checkQuery = `SELECT * FROM coordinator 
      WHERE coordinator_contact = ? 
      OR coordinator_email = ? 
      OR coordinator_user = ?`;
    
    db.query(checkQuery, [coordinator_contact, coordinator_email, coordinator_user], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      
      const duplicates = {
        contact: results.some(c => c.coordinator_contact === coordinator_contact),
        email: results.some(c => c.coordinator_email === coordinator_email),
        username: results.some(c => c.coordinator_user === coordinator_user)
      };
      
      res.status(200).json({ duplicates });
    });
    });
    return router;
};