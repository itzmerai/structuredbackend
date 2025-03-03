const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/', async (req, res) => {
    const { coordinator_id } = req.query;
  
    try {
        const results = await db.query(
            `SELECT c.company_name, COUNT(s.student_id) as student_count
             FROM company c
             LEFT JOIN student s ON c.company_id = s.company_id
             WHERE c.coordinator_id = $1
             GROUP BY c.company_id
             ORDER BY student_count DESC
             LIMIT 3`,
            [coordinator_id]
          );
      res.json(results.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};