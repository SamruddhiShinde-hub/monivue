const express = require('express');
const router = express.Router();
const db = require('../db');

// ========== REGULAR LIABILITIES ==========

// ADD
router.post('/add', (req, res) => {
  const { user_id, category, amount } = req.body;
  if (!user_id || !category || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'INSERT INTO liabilities (user_id, category, amount) VALUES (?, ?, ?)';
  db.query(sql, [user_id, category, amount], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Liability added');
  });
});

// UPDATE
router.put('/update/:id', (req, res) => {
  const { category, amount } = req.body;
  const sql = 'UPDATE liabilities SET category=?, amount=? WHERE id=?';
  db.query(sql, [category, amount, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Liability updated');
  });
});

// GET BY USER
router.get('/user/:id', (req, res) => {
  const sql = 'SELECT * FROM liabilities WHERE user_id = ? ORDER BY id DESC';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// DELETE
router.delete('/delete/:id', (req, res) => {
  db.query('DELETE FROM liabilities WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

// ========== MONTHLY DEBT PAYMENTS ==========

// ADD
router.post('/monthly-debt/add', (req, res) => {
  const { user_id, category, amount } = req.body;
  if (!user_id || !category || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'INSERT INTO monthly_debt_payments (user_id, category, amount) VALUES (?, ?, ?)';
  db.query(sql, [user_id, category, amount], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Monthly debt payment added');
  });
});

// GET BY USER
router.get('/monthly-debt/user/:id', (req, res) => {
  const sql = 'SELECT * FROM monthly_debt_payments WHERE user_id = ? ORDER BY id DESC';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// UPDATE
router.put('/monthly-debt/update/:id', (req, res) => {
  const { category, amount } = req.body;
  if (!category || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'UPDATE monthly_debt_payments SET category=?, amount=? WHERE id=?';
  db.query(sql, [category, amount, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Monthly debt payment updated');
  });
});

// DELETE
router.delete('/monthly-debt/delete/:id', (req, res) => {
  db.query('DELETE FROM monthly_debt_payments WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

module.exports = router;