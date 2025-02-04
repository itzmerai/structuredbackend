const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/', (req, res) => {
        const { coordinator_id, announcement_type, announcement_content } = req.body;
        const query = `INSERT INTO announce (coordinator_id, announcement_type, announcement_content) VALUES (?, ?, ?)`;
        db.query(query, [coordinator_id, announcement_type, announcement_content], (err, results) => {
          if (err) return res.status(500).json({ error: 'Failed to create announcement.' });
          res.status(201).json({ message: 'Announcement created successfully.', announce_id: results.insertId });
        });

    });
    return router;
}