import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Assets.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';

ChartJS.register(ArcElement, Tooltip, Legend);

const assetCategories = [
  'Cash', 'Current Account', 'Savings Account', 'Fixed Deposits(FDs)', 'Stocks',
  'Mutual Funds / ETFs', 'Retirement Accounts', 'Real Estate', 'Bonds',
  'Cryptocurrency', 'Gold / Precious Metals', 'Business Investments',
  'Life Insurance Cash Value', 'Collectibles', 'Other Investments'
];

const investmentCategories = [
  'FD', 'Public Provident Fund (PPF)', 'National Savings Certificate (NSC)',
  'Employee Provident Fund (EPF)', 'Mutual Funds', 'Bonds', 'Direct Equity'
];

const formatIndianNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  return num.toLocaleString('en-IN');
};

const Assets = ({ user }) => {
  const [assetData, setAssetData] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const [newAsset, setNewAsset] = useState({ category: '', amount: '' });
  const [newInvestment, setNewInvestment] = useState({ category: '', amount: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingInvestmentId, setEditingInvestmentId] = useState(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [totalAsset, setTotalAsset] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [assetChartData, setAssetChartData] = useState({ labels: [], datasets: [] });
  const [investmentChartData, setInvestmentChartData] = useState({ labels: [], datasets: [] });

  const calculateTotal = (data) => data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const buildChartData = (data, type = 'asset') => {
    const categoryMap = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
      return acc;
    }, {});

    const navyBlueShades = ['#001f3f', '#003366', '#004080', '#00509e', '#003d73', '#002244', '#001a33'];
    const defaultColors = ['#36A2EB', '#FFCE56', '#FF6384', '#8E44AD', '#3498DB', '#2ECC71', '#E67E22', '#E74C3C', '#1ABC9C', '#9B59B6'];

    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        label: 'Amount',
        data: Object.values(categoryMap),
        backgroundColor: type === 'investment' ? navyBlueShades : defaultColors,
      }]
    };
  };

  const fetchAssets = useCallback(async () => {
    if (!user?.id) return;
    const res = await axios.get(`/api/assets/user/${user.id}`);
    setAssetData(res.data);
    setTotalAsset(calculateTotal(res.data));
    setAssetChartData(buildChartData(res.data, 'asset'));
  }, [user?.id]);

  const fetchInvestments = useCallback(async () => {
    if (!user?.id) return;
    const res = await axios.get(`/api/assets/investments/${user.id}`);
    setInvestmentData(res.data);
    setTotalInvestment(calculateTotal(res.data));
    setInvestmentChartData(buildChartData(res.data, 'investment'));
  }, [user?.id]);

  useEffect(() => {
    fetchAssets();
    fetchInvestments();
  }, [fetchAssets, fetchInvestments]);

  const handleChange = (setter) => (e) => setter(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (isInvestment) => {
    const item = isInvestment ? newInvestment : newAsset;
    const id = isInvestment ? editingInvestmentId : editingId;
    const url = isInvestment
      ? (id ? `/api/assets/investments/update/${id}` : '/api/assets/investments/add')
      : (id ? `/api/assets/update/${id}` : '/api/assets/add');

    if (!item.category || !item.amount) return alert('Category and Amount are required');

    try {
      await axios[id ? 'put' : 'post'](url, { ...item, user_id: user.id });
      isInvestment ? fetchInvestments() : fetchAssets();
    } catch {
      alert('Save failed');
    } finally {
      if (isInvestment) {
        setNewInvestment({ category: '', amount: '' });
        setEditingInvestmentId(null);
        setShowInvestmentForm(false);
      } else {
        setNewAsset({ category: '', amount: '' });
        setEditingId(null);
        setShowAssetForm(false);
      }
    }
  };

  const handleDelete = async (id, isInvestment) => {
    if (!window.confirm('Confirm delete?')) return;
    const url = isInvestment ? `/api/assets/investments/delete/${id}` : `/api/assets/delete/${id}`;
    try {
      await axios.delete(url);
      isInvestment ? fetchInvestments() : fetchAssets();
    } catch {
      alert('Delete failed');
    }
  };

  const handleEdit = (item, isInvestment) => {
    if (isInvestment) {
      setNewInvestment({ category: item.category, amount: item.amount });
      setEditingInvestmentId(item.id);
      setShowInvestmentForm(true);
    } else {
      setNewAsset({ category: item.category, amount: item.amount });
      setEditingId(item.id);
      setShowAssetForm(true);
    }
  };

  const renderTable = (data, formVisible, newItem, categories, onChange, onSave, onEdit, onDelete, isInvestment) => (
    <table className="asset-table">
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
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </td>
            <td>
              <input type="number" name="amount" value={newItem.amount} onChange={onChange} className="inline-input" placeholder="Amount" />
            </td>
            <td>
              <button onClick={() => onSave(isInvestment)} className="save-btn">✓</button>
              <button onClick={() => isInvestment ? setShowInvestmentForm(false) : setShowAssetForm(false)} className="cancel-btn">✕</button>
            </td>
          </tr>
        )}
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.category}</td>
            <td>₹{formatIndianNumber(item.amount)}</td>
            <td>
              <button className="edit-btn" onClick={() => onEdit(item, isInvestment)}>✏️</button>
              <button className="delete-btn" onClick={() => onDelete(item.id, isInvestment)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const exportData = (data, filename) => {
    const csv = ['Category,Amount', ...data.map(i => `"${i.category}",${i.amount}`)].join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
  };

  return (
    <div className="assets-page">
      <h2>Assets</h2>
      <div className="assets-layout">
        <div className="assets-left">
          <div className="asset-actions">
            <button className="btn-light" onClick={() => { setShowAssetForm(true); setEditingId(null); setNewAsset({ category: '', amount: '' }); }}>Add Asset</button>
            <button className="btn-light" onClick={() => exportData(assetData, 'assets_data.csv')}>Export Assets</button>
          </div>
          <div className="asset-cards"><div className="total-asset-card"><h3>Total Assets Value</h3><p>₹{formatIndianNumber(totalAsset)}</p></div></div>
          <h3>Asset Details</h3>
          {renderTable(assetData, showAssetForm, newAsset, assetCategories, handleChange(setNewAsset), handleSave, handleEdit, handleDelete, false)}
        </div>
        <div className="assets-right">
          <div className="asset-chart-section">
            <h3>Assets by Category</h3>
            <div className="pie-container"><Pie data={assetChartData} options={{ maintainAspectRatio: false }} /></div>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem' }}>Monthly Investments</h2>
      <div className="assets-layout">
        <div className="assets-left">
          <div className="asset-actions">
            <button className="btn-light" onClick={() => { setShowInvestmentForm(true); setEditingInvestmentId(null); setNewInvestment({ category: '', amount: '' }); }}>Add Investment</button>
            <button className="btn-light" onClick={() => exportData(investmentData, 'monthly_investments.csv')}>Export Investments</button>
          </div>
          <div className="asset-cards"><div className="total-investment-card"><h3>Total Monthly Investments</h3><p>₹{formatIndianNumber(totalInvestment)}</p></div></div>
          <h3>Investment Details</h3>
          {renderTable(investmentData, showInvestmentForm, newInvestment, investmentCategories, handleChange(setNewInvestment), handleSave, handleEdit, handleDelete, true)}
        </div>
        <div className="assets-right">
          <div className="asset-chart-section">
            <h3>Investments by Category</h3>
            <div className="pie-container"><Pie data={investmentChartData} options={{ maintainAspectRatio: false }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;