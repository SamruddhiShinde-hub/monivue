import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Liabilities.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const liabilityCategories = [
  'Credit Card Debt', 'Personal Loans', 'Student Loans', 'Home Mortgage', 'Car Loan',
  'Medical Bills', 'Buy Now, Pay Later (BNPL) Balances', 'Home Equity Loan / Line of Credit (HELOC)',
  'Business Loan (if personally guaranteed)', 'Outstanding Rent or Utility Bills'
];

// A reusable table component
const LiabilityTable = ({
  data,
  formVisible,
  newItem,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onSave,
}) => (
  <table className="liability-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Amount</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {formVisible && (
        <tr className="inline-edit-row">
          <td>
            <select name="category" value={newItem.category} onChange={onChange} className="inline-select">
              <option value="">Select Category</option>
              {liabilityCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </td>
          <td>
            <input type="number" name="amount" value={newItem.amount} onChange={onChange} className="inline-input" placeholder="Amount"/>
          </td>
          <td>
            <button className="save-btn" onClick={onSave}>✓</button>
            <button className="cancel-btn" onClick={onCancel}>✕</button>
          </td>
        </tr>
      )}
      {data.map((item) => (
        <tr key={item.id}>
          <td>{item.category}</td>
          <td>₹{parseFloat(item.amount).toLocaleString('en-IN')}</td>
          <td>
            <button className="edit-btn" onClick={() => onEdit(item)}>✏️</button>
            <button className="delete-btn" onClick={() => onDelete(item.id)}>🗑️</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Liabilities = ({ user }) => {
  // State for Regular Liabilities
  const [liabilities, setLiabilities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newLiability, setNewLiability] = useState({ category: '', amount: '' });
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // State for Monthly Debt Payments
  const [monthlyDebtData, setMonthlyDebtData] = useState([]);
  const [monthlyNew, setMonthlyNew] = useState({ category: '', amount: '' });
  const [monthlyEditingId, setMonthlyEditingId] = useState(null);
  const [monthlyDebtChart, setMonthlyDebtChart] = useState({ labels: [], datasets: [] });
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  // --- Data Fetching ---
  const fetchLiabilities = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/liabilities/user/${user.id}`);
      setLiabilities(res.data);
      const totalAmount = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotal(totalAmount);

      const categoryMap = res.data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
        return acc;
      }, {});
      const colors = Object.keys(categoryMap).map((_, i) => `hsl(${(i * 36) % 360}, 70%, 60%)`);
      setChartData({
        labels: Object.keys(categoryMap),
        datasets: [{ label: 'Liability Distribution', data: Object.values(categoryMap), backgroundColor: colors }]
      });
    } catch (err) {
      console.error('Error fetching liabilities:', err);
    }
  }, [user?.id]);

  const fetchMonthlyDebt = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/liabilities/monthly-debt/user/${user.id}`);
      setMonthlyDebtData(res.data);
      const totalAmount = res.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setMonthlyTotal(totalAmount);

      const catMap = res.data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
        return acc;
      }, {});
      const colors = Object.keys(catMap).map((_, i) => `hsl(${(i * 36) % 360}, 80%, 65%)`);
      setMonthlyDebtChart({
        labels: Object.keys(catMap),
        datasets: [{ data: Object.values(catMap), backgroundColor: colors, label: 'Monthly Debt Distribution' }]
      });
    } catch (err) {
      console.error('Error fetching monthly debt payments:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLiabilities();
    fetchMonthlyDebt();
  }, [fetchLiabilities, fetchMonthlyDebt]);

  // --- Handlers for Regular Liabilities ---
  const handleLiabilityChange = (e) => setNewLiability({ ...newLiability, [e.target.name]: e.target.value });

  const handleLiabilitySave = async () => {
    if (!newLiability.category || !newLiability.amount) return alert('Category and Amount are required.');
    try {
      const method = editingId ? 'put' : 'post';
      const url = editingId ? `/api/liabilities/update/${editingId}` : '/api/liabilities/add';
      await axios[method](url, { ...newLiability, user_id: user.id });
      fetchLiabilities();
    } catch (err) {
      alert('Error saving liability.');
    } finally {
      setNewLiability({ category: '', amount: '' });
      setEditingId(null);
      setShowInlineForm(false);
    }
  };

  const handleLiabilityDelete = async (id) => {
    if (!window.confirm('Delete this liability?')) return;
    try {
      await axios.delete(`/api/liabilities/delete/${id}`);
      fetchLiabilities();
    } catch (err) {
      alert('Delete failed.');
    }
  };
  
  const handleLiabilityEdit = (item) => {
    setNewLiability({ category: item.category, amount: item.amount });
    setEditingId(item.id);
    setShowInlineForm(true);
  };
  
  // --- Handlers for Monthly Debt ---
  const handleMonthlyDebtChange = (e) => setMonthlyNew({ ...monthlyNew, [e.target.name]: e.target.value });
  
  const handleMonthlyDebtSave = async () => {
    if (!monthlyNew.category || !monthlyNew.amount) return alert('Category and Amount are required.');
    try {
      const method = monthlyEditingId ? 'put' : 'post';
      const url = monthlyEditingId ? `/api/liabilities/monthly-debt/update/${monthlyEditingId}` : '/api/liabilities/monthly-debt/add';
      await axios[method](url, { ...monthlyNew, user_id: user.id });
      fetchMonthlyDebt();
    } catch (err) {
      alert('Error saving monthly debt.');
    } finally {
      setMonthlyNew({ category: '', amount: '' });
      setMonthlyEditingId(null);
      setShowMonthlyForm(false);
    }
  };

  const handleMonthlyDebtDelete = async (id) => {
    if (!window.confirm('Delete this monthly debt payment?')) return;
    try {
      await axios.delete(`/api/liabilities/monthly-debt/delete/${id}`);
      fetchMonthlyDebt();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleMonthlyDebtEdit = (item) => {
    setMonthlyNew({ category: item.category, amount: item.amount });
    setMonthlyEditingId(item.id);
    setShowMonthlyForm(true);
  };


  return (
    <div className="liabilities-page">
      <h2>Liabilities</h2>
      <div className="liabilities-layout">
        <div className="liabilities-left">
          <div className="liability-actions">
            <button className="btn-light" onClick={() => { setShowInlineForm(true); setEditingId(null); setNewLiability({ category: '', amount: '' }); }}>Add Liability</button>
          </div>
          <div className="total-liability-card"><h3>Total Liabilities</h3><p>₹{total.toLocaleString('en-IN')}</p></div>
          <h3>Liability Details</h3>
          <LiabilityTable
            data={liabilities}
            formVisible={showInlineForm}
            newItem={newLiability}
            onCancel={() => { setShowInlineForm(false); setEditingId(null); }}
            onChange={handleLiabilityChange}
            onDelete={handleLiabilityDelete}
            onEdit={handleLiabilityEdit}
            onSave={handleLiabilitySave}
          />
        </div>
        <div className="liabilities-right">
          <div className="liability-chart-section"><h3>Liability Distribution</h3><Pie data={chartData} /></div>
        </div>
      </div>

      <h2>Monthly Debt Payments</h2>
      <div className="liabilities-layout">
        <div className="liabilities-left">
          <div className="liability-actions">
            <button className="btn-light" onClick={() => { setShowMonthlyForm(true); setMonthlyEditingId(null); setMonthlyNew({ category: '', amount: '' }); }}>Add Monthly Debt</button>
          </div>
          <div className="total-liability-card"><h3>Total Monthly Debt</h3><p>₹{monthlyTotal.toLocaleString('en-IN')}</p></div>
          <LiabilityTable
            data={monthlyDebtData}
            formVisible={showMonthlyForm}
            newItem={monthlyNew}
            onCancel={() => { setShowMonthlyForm(false); setMonthlyEditingId(null); }}
            onChange={handleMonthlyDebtChange}
            onDelete={handleMonthlyDebtDelete}
            onEdit={handleMonthlyDebtEdit}
            onSave={handleMonthlyDebtSave}
          />
        </div>
        <div className="liabilities-right">
          <div className="liability-chart-section"><h3>Monthly Debt Breakdown</h3><Pie data={monthlyDebtChart} /></div>
        </div>
      </div>
    </div>
  );
};

export default Liabilities;