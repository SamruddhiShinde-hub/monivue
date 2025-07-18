const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all expenses for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  // Added ORDER BY to show most recent entries first
  db.query('SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new expense
router.post('/add', (req, res) => {
  // Removed 'date' from destructuring
  const { user_id, category, amount } = req.body;
  db.query(
    // Updated SQL query
    'INSERT INTO expenses (user_id, category, amount) VALUES (?, ?, ?)',
    // Updated parameters
    [user_id, category, amount],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Expense added successfully', id: result.insertId });
    }
  );
});

// Update expense
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  // Removed 'date' from destructuring
  const { category, amount } = req.body;
  db.query(
    // Updated SQL query
    'UPDATE expenses SET category = ?, amount = ? WHERE id = ?',
    // Updated parameters
    [category, amount, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Expense updated successfully' });
    }
  );
});

// Delete expense (No changes needed)
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM expenses WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Expense deleted successfully' });
  });
});

module.exports = router;