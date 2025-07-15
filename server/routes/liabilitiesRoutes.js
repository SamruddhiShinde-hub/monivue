const express = require('express');
const router = express.Router();
const db = require('../db');

//
// ========== REGULAR LIABILITIES ==========
//

// ADD
router.post('/add', (req, res) => {
  const { user_id, category, amount, due_date } = req.body;
  if (!user_id || !category || !amount || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'INSERT INTO liabilities (user_id, category, amount, due_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, category, amount, due_date], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Liability added');
  });
});

// UPDATE
router.put('/update/:id', (req, res) => {
  const { category, amount, due_date } = req.body;
  const sql = 'UPDATE liabilities SET category=?, amount=?, due_date=? WHERE id=?';
  db.query(sql, [category, amount, due_date, req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Liability updated');
  });
});

// GET BY USER
router.get('/user/:id', (req, res) => {
  const sql = 'SELECT * FROM liabilities WHERE user_id = ? ORDER BY due_date DESC';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// DELETE a liability
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM liabilities WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});


//
// ========== MONTHLY DEBT PAYMENTS ==========
//

// ADD monthly debt payment
router.post('/monthly-debt/add', (req, res) => {
  const { user_id, category, amount, due_date } = req.body;
  if (!user_id || !category || !amount || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'INSERT INTO monthly_debt_payments (user_id, category, amount, due_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, category, amount, due_date], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Monthly debt payment added');
  });
});

// GET all monthly debt payments for a user
router.get('/monthly-debt/user/:id', (req, res) => {
  const sql = 'SELECT * FROM monthly_debt_payments WHERE user_id = ? ORDER BY due_date DESC';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// UPDATE a monthly debt payment
router.put('/monthly-debt/update/:id', (req, res) => {
  const { category, amount, due_date } = req.body;
  if (!category || !amount || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'UPDATE monthly_debt_payments SET category=?, amount=?, due_date=? WHERE id=?';
  db.query(sql, [category, amount, due_date, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Monthly debt payment updated');
  });
});

// DELETE a monthly debt payment
router.delete('/monthly-debt/delete/:id', (req, res) => {
  db.query('DELETE FROM monthly_debt_payments WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

module.exports = router;
