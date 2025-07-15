const express = require('express');
const router = express.Router();
const db = require('../db');

// ====================
// GET goals for a user
// ====================
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT *, 
    CASE 
      WHEN description = 'Custom' THEN custom_description
      ELSE description
    END AS final_description 
    FROM goals 
    WHERE user_id = ?
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch goals' });
    res.json(result);
  });
});

// ==============
// ADD a new goal
// ==============
router.post('/add', (req, res) => {
  const {
    user_id, description, custom_description,
    priority, present_value, time_horizon, inflation
  } = req.body;

  const pv = parseFloat(present_value);
  const th = parseInt(time_horizon);
  const inf = parseFloat(inflation);

  if (isNaN(pv) || isNaN(th) || isNaN(inf)) {
    return res.status(400).json({ error: 'Invalid numeric values' });
  }

  const future_value = parseFloat((pv * Math.pow(1 + inf / 100, th)).toFixed(2));

  const sql = `
    INSERT INTO goals (
      user_id, description, custom_description,
      priority, present_value, time_horizon,
      inflation, future_value
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    user_id, description, custom_description || '',
    priority, pv, th, inf, future_value
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add goal' });
    res.json({ message: 'Goal added successfully', id: result.insertId });
  });
});

// =================
// DELETE a goal
// =================
router.delete('/:id', (req, res) => {
  const goalId = req.params.id;
  db.query('DELETE FROM goals WHERE id = ?', [goalId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete goal' });
    res.json({ message: 'Goal deleted successfully' });
  });
});

// ==================================
// ADD calculation details for a goal
// ==================================
router.post('/calculation', (req, res) => {
  const {
    goal_id,
    initial_amount,
    monthly_amount,
    yearly_increase,
    annual_return
  } = req.body;

  const sql = `
    INSERT INTO goal_calculations (
      goal_id, initial_amount, monthly_amount,
      yearly_increase, annual_return
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    goal_id,
    parseFloat(initial_amount),
    parseFloat(monthly_amount),
    parseFloat(yearly_increase),
    parseFloat(annual_return)
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to save goal calculation' });
    res.json({ message: 'Calculation saved', id: result.insertId });
  });
});

module.exports = router;
