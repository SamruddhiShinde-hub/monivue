const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/income/add
router.post('/add', (req, res) => {
  const { user_id, category, amount, date } = req.body;

  if (!user_id || !category || !amount || !date) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = 'INSERT INTO income (user_id, category, amount, date) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, category, amount, date], (err, result) => {
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
  const sql = 'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch income' });
    }
    res.json(results);
  });
});

// Update income
router.put('/update/:id', (req, res) => {
  const { category, amount, date } = req.body;
  const sql = 'UPDATE income SET category = ?, amount = ?, date = ? WHERE id = ?';
  db.query(sql, [category, amount, date, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'Income updated successfully' });
  });
});

// Delete income
router.delete('/delete/:id', (req, res) => {
  const sql = 'DELETE FROM income WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    res.json({ message: 'Income deleted successfully' });
  });
});


module.exports = router;