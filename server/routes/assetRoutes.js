// ======== backend/routes/assetsRoutes.js =========
const express = require('express');
const router = express.Router();
const db = require('../db');

// ---------- Existing Assets Routes ----------

// Get all assets for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM assets WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new asset
router.post('/add', (req, res) => {
  const { user_id, category, amount, date } = req.body;
  db.query(
    'INSERT INTO assets (user_id, category, amount, date) VALUES (?, ?, ?, ?)',
    [user_id, category, amount, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Asset added successfully', id: result.insertId });
    }
  );
});

// Update an asset
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { category, amount, date } = req.body;
  db.query(
    'UPDATE assets SET category = ?, amount = ?, date = ? WHERE id = ?',
    [category, amount, date, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Asset updated successfully' });
    }
  );
});

// Delete an asset
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM assets WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Asset deleted successfully' });
  });
});

// ---------- Monthly Investments Routes ----------

// Get all monthly investments
router.get('/investments/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM monthly_investments WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new monthly investment
router.post('/investments/add', (req, res) => {
  const { user_id, category, amount, date } = req.body;
  db.query(
    'INSERT INTO monthly_investments (user_id, category, amount, date) VALUES (?, ?, ?, ?)',
    [user_id, category, amount, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Monthly Investment added successfully', id: result.insertId });
    }
  );
});

// Update monthly investment
router.put('/investments/update/:id', (req, res) => {
  const { id } = req.params;
  const { category, amount, date } = req.body;
  db.query(
    'UPDATE monthly_investments SET category = ?, amount = ?, date = ? WHERE id = ?',
    [category, amount, date, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Monthly Investment updated successfully' });
    }
  );
});

// Delete monthly investment
router.delete('/investments/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM monthly_investments WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Monthly Investment deleted successfully' });
  });
});

module.exports = router;
