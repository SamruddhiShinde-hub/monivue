import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Expenses.css';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { saveAs } from 'file-saver'; // Using file-saver for export

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const expenseCategories = [
  'Rent / Mortgage',
  'Utilities (Electricity, Water, Gas)',
  'Groceries',
  'Transportation / Fuel',
  'Insurance (Health, Vehicle, etc.)',
  'Healthcare / Medical',
  'Subscriptions / Memberships',
  'Entertainment / Dining Out',
  'Education / Tuition Fees',
  'Clothing / Personal Care'
];

// Function to format numbers with Indian comma rules
const formatIndianCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const Expenses = ({ user }) => {
  const [expenseData, setExpenseData] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' });
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
  const [totalAnnualExpense, setTotalAnnualExpense] = useState(0);

  const calculateTotals = useCallback((data) => {
    const monthlyTotal = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    setTotalMonthlyExpense(monthlyTotal);
    setTotalAnnualExpense(monthlyTotal * 12);
  }, []);

  const fetchExpenses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/expenses/user/${user.id}`);
      setExpenseData(res.data);
      calculateTotals(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  }, [user, calculateTotals]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const exportToCSV = () => {
    const headers = 'Category,Amount\n';
    const rows = expenseData.map(item => `${item.category},${item.amount}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'expenses_data.csv');
  };

  const categoryTotals = expenseData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount || 0);
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: 'Monthly Expenses',
      data: Object.values(categoryTotals),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8B4513', '#20B2AA', '#C71585'],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Monthly Expenses by Category' }
    }
  };

  const handleInlineChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    setNewExpense({ category: '', amount: '' });
    setEditingId(null);
    setShowInlineForm(true);
  };

  const handleSaveInlineExpense = async () => {
    if (!newExpense.category || !newExpense.amount) {
      alert('Category and Amount are required.');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/expenses/update/${editingId}`, newExpense);
        alert('Expense updated successfully!');
      } else {
        await axios.post('/api/expenses/add', { ...newExpense, user_id: user.id });
        alert('Expense added successfully!');
      }
      setNewExpense({ category: '', amount: '' });
      setEditingId(null);
      setShowInlineForm(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert('Failed to save expense.');
    }
  };

  const handleCancelInlineEdit = () => {
    setNewExpense({ category: '', amount: '' });
    setEditingId(null);
    setShowInlineForm(false);
  };

  const handleEdit = (expense) => {
    setNewExpense({ category: expense.category, amount: expense.amount });
    setEditingId(expense.id);
    setShowInlineForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/delete/${id}`);
        alert('Expense deleted successfully!');
        fetchExpenses();
      } catch (err) {
        console.error('Failed to delete expense:', err);
        alert('Failed to delete expense.');
      }
    }
  };

  return (
    <div className="expenses-page">
      <h2>Expenses</h2>
      <div className="main-content">
        <div className="left-section">
          <div className="expense-actions">
            <button className="btn-light" onClick={handleAddExpense}>Add Expense</button>
            <button className="btn-light" onClick={exportToCSV}>Export Data</button>
          </div>
          <div className="totals-row">
            <div className="total-expense-card">
              <h4>Total Monthly Expense</h4>
              <p>₹{formatIndianCurrency(totalMonthlyExpense)}</p>
            </div>
            <div className="total-expense-card">
              <h4>Total Annual Expense</h4>
              <p>₹{formatIndianCurrency(totalAnnualExpense)}</p>
            </div>
          </div>
          <h3>Monthly Expense Categories</h3>
          <table className="expense-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showInlineForm && (
                <tr className="inline-edit-row">
                  <td>
                    <select name="category" value={newExpense.category} onChange={handleInlineChange} className="inline-select">
                      <option value="">Select Category</option>
                      {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" name="amount" placeholder="Amount" value={newExpense.amount} onChange={handleInlineChange} className="inline-input" />
                  </td>
                  <td>
                    <button onClick={handleSaveInlineExpense} className="save-btn" title="Save">✓</button>
                    <button onClick={handleCancelInlineEdit} className="cancel-btn" title="Cancel">✕</button>
                  </td>
                </tr>
              )}
              {expenseData.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>₹{formatIndianCurrency(item.amount)}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="edit-btn" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="delete-btn" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="right-section">
          <div className="expense-chart-section">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;