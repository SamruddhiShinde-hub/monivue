import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Liabilities.css';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const liabilityCategories = [
  'Credit Card Debt',
  'Personal Loans',
  'Student Loans',
  'Home Mortgage',
  'Car Loan',
  'Medical Bills',
  'Buy Now, Pay Later (BNPL) Balances',
  'Home Equity Loan / Line of Credit (HELOC)',
  'Business Loan (if personally guaranteed)',
  'Outstanding Rent or Utility Bills'
];

const formatDueDate = (rawDate) => {
  if (!rawDate) return 'Invalid Date';
  const date = new Date(rawDate);
  if (isNaN(date)) return 'Invalid Date';

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

const Liabilities = ({ user }) => {
  // Regular Liabilities
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newLiability, setNewLiability] = useState({ category: '', amount: '', due_date: '' });
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Monthly Debt Payments
  const [monthlyDebtData, setMonthlyDebtData] = useState([]);
  const [monthlyNew, setMonthlyNew] = useState({ category: '', amount: '', due_date: '' });
  const [monthlyEditingId, setMonthlyEditingId] = useState(null);
  const [monthlyDebtChart, setMonthlyDebtChart] = useState({ labels: [], datasets: [] });
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0); // NEW

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`/api/liabilities/user/${user.id}`);
      setData(res.data);

      const total = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotal(total);

      const categoryMap = {};
      res.data.forEach(item => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + parseFloat(item.amount);
      });

      const colors = Object.keys(categoryMap).map((_, i) => `hsl(${(i * 36) % 360}, 70%, 60%)`);

      setChartData({
        labels: Object.keys(categoryMap),
        datasets: [{ label: 'Liability Distribution', data: Object.values(categoryMap), backgroundColor: colors }]
      });
    } catch (err) {
      console.error('Error fetching liabilities:', err);
    }
  }, [user.id]);

  const fetchMonthlyDebt = useCallback(async () => {
    try {
      const res = await axios.get(`/api/liabilities/monthly-debt/user/${user.id}`);
      setMonthlyDebtData(res.data);

      const catMap = {};
      res.data.forEach(item => {
        catMap[item.category] = (catMap[item.category] || 0) + parseFloat(item.amount);
      });

      const total = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0); // NEW
      setMonthlyTotal(total); // NEW

      const colors = Object.keys(catMap).map((_, i) => `hsl(${(i * 36) % 360}, 80%, 65%)`);

      setMonthlyDebtChart({
        labels: Object.keys(catMap),
        datasets: [{ data: Object.values(catMap), backgroundColor: colors, label: 'Monthly Debt Distribution' }]
      });
    } catch (err) {
      console.error('Error fetching monthly debt payments:', err);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
      fetchMonthlyDebt();
    }
  }, [user, fetchData, fetchMonthlyDebt]);

  const handleInlineChange = (e) => setNewLiability({ ...newLiability, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const { category, amount, due_date } = newLiability;
    if (!category || !amount || !due_date) return alert('All fields required.');
    try {
      if (editingId) {
        await axios.put(`/api/liabilities/update/${editingId}`, newLiability);
      } else {
        await axios.post('/api/liabilities/add', { ...newLiability, user_id: user.id });
      }
      setNewLiability({ category: '', amount: '', due_date: '' });
      setEditingId(null);
      setShowInlineForm(false);
      fetchData();
    } catch (err) {
      alert('Error saving liability.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this liability?')) {
      try {
        await axios.delete(`/api/liabilities/delete/${id}`);
        fetchData();
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  const handleEdit = (item) => {
    const dueDate = item.due_date ? item.due_date.split('T')[0] : '';
    setNewLiability({ category: item.category, amount: item.amount, due_date: dueDate });
    setEditingId(item.id);
    setShowInlineForm(true);
  };

  const handleMonthlyChange = (e) => setMonthlyNew({ ...monthlyNew, [e.target.name]: e.target.value });

  const handleMonthlySave = async () => {
    const { category, amount, due_date } = monthlyNew;
    if (!category || !amount || !due_date) return alert('All fields required.');
    try {
      if (monthlyEditingId) {
        await axios.put(`/api/liabilities/monthly-debt/update/${monthlyEditingId}`, monthlyNew);
      } else {
        await axios.post('/api/liabilities/monthly-debt/add', { ...monthlyNew, user_id: user.id });
      }
      setMonthlyNew({ category: '', amount: '', due_date: '' });
      setMonthlyEditingId(null);
      setShowMonthlyForm(false);
      fetchMonthlyDebt();
    } catch (err) {
      alert('Error saving monthly debt.');
    }
  };

  const handleMonthlyDelete = async (id) => {
    if (window.confirm('Delete this monthly debt entry?')) {
      try {
        await axios.delete(`/api/liabilities/monthly-debt/delete/${id}`);
        fetchMonthlyDebt();
      } catch (err) {
        alert('Delete failed.');
      }
    }
  };

  const handleMonthlyEdit = (item) => {
    const dueDate = item.due_date ? item.due_date.split('T')[0] : '';
    setMonthlyNew({ category: item.category, amount: item.amount, due_date: dueDate });
    setMonthlyEditingId(item.id);
    setShowMonthlyForm(true);
  };

  return (
    <div className="liabilities-page">
      <h2>Liabilities</h2>
      <div className="liabilities-layout">
        <div className="liabilities-left">
          <div className="liability-actions">
            <button className="btn-light" onClick={() => {
              setShowInlineForm(true);
              setEditingId(null);
              setNewLiability({ category: '', amount: '', due_date: '' });
            }}>Add Liability</button>
          </div>
          <div className="total-liability-card">
            <h3>Total Liabilities</h3>
            <p>₹{total.toLocaleString('en-IN')}</p>
          </div>
          <h3>Liability Details</h3>
          <table className="liability-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showInlineForm && (
                <tr className="inline-edit-row">
                  <td>
                    <select name="category" value={newLiability.category} onChange={handleInlineChange} className="inline-select">
                      <option value="">Select Category</option>
                      {liabilityCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" name="amount" value={newLiability.amount} onChange={handleInlineChange} className="inline-input" />
                  </td>
                  <td>
                    <input type="date" name="due_date" value={newLiability.due_date} onChange={handleInlineChange} className="inline-input" />
                  </td>
                  <td>
                    <button className="save-btn" onClick={handleSave}>✓</button>
                    <button className="cancel-btn" onClick={() => {
                      setShowInlineForm(false);
                      setEditingId(null);
                    }}>✕</button>
                  </td>
                </tr>
              )}
              {data.map((item) => {
                const isOverdue = new Date(item.due_date) < new Date();
                return (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>₹{parseFloat(item.amount).toLocaleString('en-IN')}</td>
                    <td className={isOverdue ? 'due-date-overdue' : 'due-date-upcoming'}>{formatDueDate(item.due_date)}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="liabilities-right">
          <div className="liability-chart-section">
            <h3>Liability Distribution</h3>
            <Pie data={chartData} />
          </div>
        </div>
      </div>

      <h2>Monthly Debt Payments</h2>
      <div className="liabilities-layout">
        <div className="liabilities-left">
          <div className="liability-actions">
            <button className="btn-light" onClick={() => {
              setShowMonthlyForm(true);
              setMonthlyEditingId(null);
              setMonthlyNew({ category: '', amount: '', due_date: '' });
            }}>Add Monthly Debt</button>
          </div>

          <div className="total-liability-card">
            <h3>Total Monthly Debt</h3>
            <p>₹{monthlyTotal.toLocaleString('en-IN')}</p>
          </div>

          <table className="liability-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showMonthlyForm && (
                <tr className="inline-edit-row">
                  <td>
                    <select name="category" value={monthlyNew.category} onChange={handleMonthlyChange} className="inline-select">
                      <option value="">Select Category</option>
                      {liabilityCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" name="amount" value={monthlyNew.amount} onChange={handleMonthlyChange} className="inline-input" />
                  </td>
                  <td>
                    <input type="date" name="due_date" value={monthlyNew.due_date} onChange={handleMonthlyChange} className="inline-input" />
                  </td>
                  <td>
                    <button className="save-btn" onClick={handleMonthlySave}>✓</button>
                    <button className="cancel-btn" onClick={() => {
                      setShowMonthlyForm(false);
                      setMonthlyEditingId(null);
                    }}>✕</button>
                  </td>
                </tr>
              )}
              {monthlyDebtData.map((item) => {
                const isOverdue = new Date(item.due_date) < new Date();
                return (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>₹{parseFloat(item.amount).toLocaleString('en-IN')}</td>
                    <td className={isOverdue ? 'due-date-overdue' : 'due-date-upcoming'}>{formatDueDate(item.due_date)}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleMonthlyEdit(item)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleMonthlyDelete(item.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="liabilities-right">
          <div className="liability-chart-section">
            <h3>Monthly Debt Breakdown</h3>
            <Pie data={monthlyDebtChart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liabilities;
