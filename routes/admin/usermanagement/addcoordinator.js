const express = require('express');
const router = express.Router();
const sendEmail = require('../../../mailer/emailSender');

module.exports = (db) => {
    router.post('/', (req, res) => {
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
        
        // Hash password (for security)
        const hashedPassword = coordinator_pass; // Replace this with bcrypt hashing in production
        
        const query = `INSERT INTO coordinator (admin_id, coordinator_firstname, coordinator_midname, coordinator_lastname, coordinator_contact, coordinator_sex, program_id, coordinator_email, coordinator_user, coordinator_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.query(query, [admin_id, coordinator_firstname, coordinator_midname, coordinator_lastname, coordinator_contact, coordinator_sex, program_id, coordinator_email, coordinator_user, hashedPassword], async (err, results) => {
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

    return router;
};
