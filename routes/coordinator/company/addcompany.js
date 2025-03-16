const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const {
      coordinator_id,
      company_name,
      company_address,
      company_mentor,
      company_contact,
    } = req.body;

    try {
      // Validate input
      if (
        !coordinator_id ||
        !company_name ||
        !company_address ||
        !company_mentor ||
        !company_contact
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const query = `
        INSERT INTO company 
        (coordinator_id, company_name, company_address, company_mentor, company_contact)
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(query, [
        coordinator_id,
        company_name,
        company_address,
        company_mentor,
        company_contact,
      ]);

      res.status(201).json({
        message: "Company added successfully",
        company_id: result.insertId,
      });
    } catch (err) {
      console.error("Error inserting company:", err);
      res.status(500).json({ message: "Database error", error: err });
    }
  });

  return router;
};
