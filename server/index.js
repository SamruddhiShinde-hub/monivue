const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

const authRoutes = require('./routes/auth');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const assetRoutes = require('./routes/assetRoutes');
const liabilitiesRoutes = require('./routes/liabilitiesRoutes');
const goalsRoutes = require('./routes/goalRoutes'); // ✅ FIXED here

dotenv.config();
const app = express();

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilitiesRoutes); 
app.use('/api/goals', goalsRoutes); // ✅ Goals route

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
