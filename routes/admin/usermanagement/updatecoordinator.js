const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const {
      coordinator_firstname,
      coordinator_midname,
      coordinator_lastname,
      coordinator_contact,
      coordinator_sex,
      program_id,
      coordinator_email,
      coordinator_user,
      coordinator_pass,
    } = req.body;
  
    console.log("Updating Coordinator:", req.body); // Debugging
  
    const query = `
      UPDATE coordinator 
      SET 
        coordinator_firstname = ?, 
        coordinator_midname = ?,
        coordinator_lastname = ?,
        coordinator_contact = ?,
        coordinator_sex = ?,
        program_id = ?,
        coordinator_email = ?,
        coordinator_user = ?,
        coordinator_pass = ?
      WHERE coordinator_id = ?`;
  
    db.query(
      query,
      [
        coordinator_firstname,
        coordinator_midname,
        coordinator_lastname,
        coordinator_contact,
        coordinator_sex,
        program_id,
        coordinator_email,
        coordinator_user,
        coordinator_pass,
        id,
      ],
      (err, results) => {
        if (err) {
          console.error("Database Error:", err); // Debugging
          return res.status(500).json({ message: "Database error", error: err });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Coordinator not found" });
        }
        res.status(200).json({ message: "Coordinator updated successfully" });
      }
    );
  });

  return router;
};