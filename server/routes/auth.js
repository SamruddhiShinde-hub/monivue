const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =========================
// ✅ REGISTER ROUTE
// =========================
router.post('/register', async (req, res) => {
    console.log("Register route hit ✅");
    const { name, email, password } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserSql, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error: ' + err.message });

      if (result.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertUserSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertUserSql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: 'Insert error: ' + err.message });

        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// =========================
// ✅ LOGIN ROUTE
// =========================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error: ' + err.message });

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
});

module.exports = router;
