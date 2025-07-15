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

const exportToCSV = (data, filename = 'expenses.csv') => {
  const csvRows = [];
  const headers = ['Category', 'Amount', 'Date'];
  csvRows.push(headers.join(','));

  data.forEach((item) => {
    const row = [item.category, item.amount, item.date];
    csvRows.push(row.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.click();
};

// Function to format numbers with Indian comma rules
const formatIndianCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Function to format date in required format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  const getDayWithSuffix = (day) => {
    if (day >= 11 && day <= 13) return day + 'th';
    switch (day % 10) {
      case 1: return day + 'st';
      case 2: return day + 'nd';
      case 3: return day + 'rd';
      default: return day + 'th';
    }
  };
  
  return `${getDayWithSuffix(day)} ${month}, ${year}`;
};

const Expenses = ({ user }) => {
  const [expenseData, setExpenseData] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: '' });
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
  const [totalAnnualExpense, setTotalAnnualExpense] = useState(0);

  const calculateTotals = useCallback((data) => {
    const monthlyTotal = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const annualTotal = monthlyTotal * 12;
    setTotalMonthlyExpense(Math.round(monthlyTotal * 100) / 100);
    setTotalAnnualExpense(Math.round(annualTotal * 100) / 100);
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await axios.get(`/api/expenses/user/${user.id}`);
      const data = res.data;
      setExpenseData(data);
      calculateTotals(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  }, [user, calculateTotals]);

  useEffect(() => {
    if (user?.id) fetchExpenses();
  }, [user, fetchExpenses]);

  useEffect(() => {
    calculateTotals(expenseData);
  }, [expenseData, calculateTotals]);

  // Group expenses by category for pie chart
  const categoryTotals = expenseData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount || 0);
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Monthly Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF6384'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF6384'
        ]
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Monthly Expenses by Category'
      }
    }
  };

  const handleInlineChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    setNewExpense({ category: '', amount: '', date: '' });
    setEditingId(null);
    setShowInlineForm(true);
  };

  const handleSaveInlineExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.date) {
      alert('All fields are required.');
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

      setNewExpense({ category: '', amount: '', date: '' });
      setEditingId(null);
      setShowInlineForm(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert('Failed to save expense.');
    }
  };

  const handleCancelInlineEdit = () => {
    setNewExpense({ category: '', amount: '', date: '' });
    setEditingId(null);
    setShowInlineForm(false);
  };

  const handleEdit = (expense) => {
    setNewExpense({
      category: expense.category,
      amount: expense.amount,
      date: expense.date.split('T')[0],
    });
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
            <button className="btn-light" onClick={handleAddExpense}>
              Add Expense
            </button>
            <button className="btn-light" onClick={() => exportToCSV(expenseData)}>
              Export Data
            </button>
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
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showInlineForm && (
                <tr className="inline-edit-row">
                  <td>
                    <select 
                      name="category" 
                      value={newExpense.category} 
                      onChange={handleInlineChange}
                      className="inline-select"
                    >
                      <option value="">Select Category</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={newExpense.amount}
                      onChange={handleInlineChange}
                      className="inline-input"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="date"
                      value={newExpense.date}
                      onChange={handleInlineChange}
                      className="inline-input"
                    />
                  </td>
                  <td>
                    <button 
                      onClick={handleSaveInlineExpense}
                      className="save-btn"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancelInlineEdit}
                      className="cancel-btn"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )}
              {expenseData.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>₹{formatIndianCurrency(item.amount)}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
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