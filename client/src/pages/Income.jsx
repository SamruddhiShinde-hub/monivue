import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Income.css';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { saveAs } from 'file-saver';

ChartJS.register(ArcElement, Tooltip, Legend);

const incomeCategories = [
  'Salary / Wages',
  'Freelancing / Consulting',
  'Business Income',
  'Rental Income',
  'Investment Income',
  'Capital Gains',
  'Royalties',
  'Pension / Retirement Income',
  'Government Benefits',
  'Side Hustle / Passive Income'
];

const Income = ({ user }) => {
  const [incomeData, setIncomeData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalAnnualIncome, setTotalAnnualIncome] = useState(0);
  const [newIncome, setNewIncome] = useState({ category: '', amount: '' });
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Format numbers according to Indian numbering system
  const formatIndianNumber = (num) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} L`;
    } else {
      return num.toLocaleString('en-IN');
    }
  };

  const fetchIncome = useCallback(async () => {
    try {
      const res = await axios.get(`/api/income/user/${user.id}`);
      const data = res.data;
      setIncomeData(data);

      const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalIncome(total);
      setTotalAnnualIncome(total * 12); // Calculate annual income

      const categoryMap = {};
      data.forEach(item => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + parseFloat(item.amount);
      });

      setChartData({
        labels: Object.keys(categoryMap),
        datasets: [{
          label: 'Monthly Income by Category',
          data: Object.values(categoryMap),
          backgroundColor: [
            '#38E078', '#FFCE56', '#36A2EB', '#FF6384', '#8E44AD',
            '#3498DB', '#2ECC71', '#E67E22', '#E74C3C', '#1ABC9C'
          ],
        }]
      });
    } catch (err) {
      console.error('Failed to fetch income:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchIncome();
  }, [user, fetchIncome]);

  const handleAddIncome = () => {
    setNewIncome({ category: '', amount: '' });
    setEditingId(null);
    setShowInlineForm(true);
  };

  const handleInlineChange = (e) => {
    setNewIncome({ ...newIncome, [e.target.name]: e.target.value });
  };

  const handleSaveInlineIncome = async () => {
    if (!newIncome.category || !newIncome.amount) {
      alert('Please fill all fields.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/income/update/${editingId}`, newIncome);
        alert('Monthly Income updated successfully!');
      } else {
        await axios.post('/api/income/add', { ...newIncome, user_id: user.id });
        alert('Monthly Income added successfully!');
      }

      setNewIncome({ category: '', amount: '' });
      setEditingId(null);
      setShowInlineForm(false);
      fetchIncome();
    } catch (err) {
      console.error('Failed to save income:', err);
      alert('Failed to save income.');
    }
  };

  const handleCancelInlineEdit = () => {
    setNewIncome({ category: '', amount: '' });
    setEditingId(null);
    setShowInlineForm(false);
  };

  const handleEdit = (income) => {
    setNewIncome({
      category: income.category,
      amount: income.amount,
    });
    setEditingId(income.id);
    setShowInlineForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await axios.delete(`/api/income/delete/${id}`);
        alert('Monthly Income deleted successfully!');
        fetchIncome();
      } catch (err) {
        console.error('Failed to delete income:', err);
        alert('Failed to delete income.');
      }
    }
  };

  const handleExport = () => {
    const headers = 'Category,Amount\n';
    const rows = incomeData.map(item => `${item.category},${item.amount}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'monthly_income_data.csv');
  };

  return (
    <div className="income-page">
      <h2>Income</h2>

      <div className="income-layout">
        <div className="income-left">
          <div className="income-actions">
            <button className="btn-light" onClick={handleAddIncome}>
              Add Monthly Income
            </button>
            <button className="btn-light" onClick={handleExport}>
              Export Data
            </button>
          </div>

          <div className="income-cards">
            <div className="total-income-card">
              <h3>Total Monthly Income</h3>
              <p>₹{formatIndianNumber(totalIncome)}</p>
            </div>

            <div className="total-income-card">
              <h3>Total Annual Income</h3>
              <p>₹{formatIndianNumber(totalAnnualIncome)}</p>
            </div>
          </div>

          <h3>Monthly Income Categories</h3>
          <table className="income-table">
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
                    <select 
                      name="category" 
                      value={newIncome.category} 
                      onChange={handleInlineChange}
                      className="inline-select"
                    >
                      <option value="">Select Category</option>
                      {incomeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={newIncome.amount}
                      onChange={handleInlineChange}
                      className="inline-input"
                    />
                  </td>
                  <td>
                    <button 
                      onClick={handleSaveInlineIncome}
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

              {incomeData.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>₹{formatIndianNumber(parseFloat(item.amount))}</td>
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

        <div className="income-right">
          <div className="income-chart-section">
            <h3>Monthly Income Distribution</h3>
            <Pie data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Income;