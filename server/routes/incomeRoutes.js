const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/income/add
router.post('/add', (req, res) => {
  // Removed 'date' from destructuring
  const { user_id, category, amount } = req.body;

  // Updated validation
  if (!user_id || !category || !amount) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Updated SQL query
  const sql = 'INSERT INTO income (user_id, category, amount) VALUES (?, ?, ?)';
  // Updated query parameters
  db.query(sql, [user_id, category, amount], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to add income' });
    }
    res.status(201).json({ message: 'Income added successfully' });
  });
});

// GET /api/income/user/:userId
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  // Removed 'ORDER BY date DESC' as the column no longer exists
  const sql = 'SELECT * FROM income WHERE user_id = ? ORDER BY id DESC';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch income' });
    }
    res.json(results);
  });
});

// PUT /api/income/update/:id
router.put('/update/:id', (req, res) => {
  // Removed 'date' from destructuring
  const { category, amount } = req.body;
  // Updated SQL query
  const sql = 'UPDATE income SET category = ?, amount = ? WHERE id = ?';
  // Updated query parameters
  db.query(sql, [category, amount, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'Income updated successfully' });
  });
});

// DELETE /api/income/delete/:id (No changes needed)
router.delete('/delete/:id', (req, res) => {
  const sql = 'DELETE FROM income WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    res.json({ message: 'Income deleted successfully' });
  });
});


module.exports = router;