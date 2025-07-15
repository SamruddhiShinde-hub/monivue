const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all expenses for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new expense
router.post('/add', (req, res) => {
  const { user_id, category, amount, date } = req.body;
  db.query(
    'INSERT INTO expenses (user_id, category, amount, date) VALUES (?, ?, ?, ?)',
    [user_id, category, amount, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Expense added successfully', id: result.insertId });
    }
  );
});

// Update expense
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { category, amount, date } = req.body;
  db.query(
    'UPDATE expenses SET category = ?, amount = ?, date = ? WHERE id = ?',
    [category, amount, date, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Expense updated successfully' });
    }
  );
});

// Delete expense
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM expenses WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Expense deleted successfully' });
  });
});

module.exports = router;
