import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Overview.css';

const Overview = ({ user }) => {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [liabilityList, setLiabilityList] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [fixedDeposits, setFixedDeposits] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [totalMonthlyDebt, setTotalMonthlyDebt] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  const navigate = useNavigate();

  const fetchFinancialData = useCallback(async () => {
    try {
      const [
        incomeRes,
        expenseRes,
        assetRes,
        liabilityRes,
        investmentRes,
        monthlyDebtRes
      ] = await Promise.all([
        axios.get(`/api/income/user/${user.id}`),
        axios.get(`/api/expenses/user/${user.id}`),
        axios.get(`/api/assets/user/${user.id}`),
        axios.get(`/api/liabilities/user/${user.id}`),
        axios.get(`/api/assets/investments/${user.id}`),
        axios.get(`/api/liabilities/monthly-debt/user/${user.id}`)
      ]);

      const incomeTotal = incomeRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setMonthlyIncome(incomeTotal);

      const expenseTotal = expenseRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setTotalExpenses(expenseTotal);

      const investmentTotal = investmentRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

      const fdItems = assetRes.data.filter(a =>
        typeof a.category === 'string' &&
        (a.category.toLowerCase().includes('fixed deposit') || a.category.toLowerCase().includes('fd'))
      );
      const fdTotal = fdItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setFixedDeposits(fdTotal);

      const savings = incomeTotal - expenseTotal - investmentTotal;
      setMonthlySavings(savings);

      const monthlyDebtTotal = monthlyDebtRes.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      setTotalMonthlyDebt(monthlyDebtTotal);

      setIncomeList(incomeRes.data || []);
      setExpenseList(expenseRes.data || []);
      setAssetList(assetRes.data || []);
      setLiabilityList(liabilityRes.data || []);

      const totalAssets = assetRes.data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalLiabilities = liabilityRes.data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      setNetWorth(totalAssets - totalLiabilities);

      const allTransactions = [
        ...(incomeRes.data || []).map(item => ({
          ...item,
          type: 'Income',
          date: item.date || item.createdAt
        })),
        ...(expenseRes.data || []).map(item => ({
          ...item,
          type: 'Expense',
          date: item.date || item.createdAt
        }))
      ];

      const sortedTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

      setRecentActivity(sortedTransactions);
    } catch (err) {
      console.error('❌ Error fetching overview data:', err);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) fetchFinancialData();
  }, [fetchFinancialData, user]);

  const getTotal = (list, type) => {
    return list.reduce((sum, item) => {
      let value = 0;
      switch (type) {
        case 'income':
        case 'expense':
        case 'liability':
          value = Number(item.amount || 0);
          break;
        case 'asset':
          value = Number(item.value || item.amount || 0);
          break;
        default:
          value = 0;
      }
      return sum + value;
    }, 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const debtToIncome = monthlyIncome > 0 ? (totalMonthlyDebt / monthlyIncome) * 100 : 0;
  const emergencyFundRatio = totalExpenses > 0 ? fixedDeposits / totalExpenses : 0;
  const netWorthToIncomeRatio = monthlyIncome > 0 ? netWorth / (monthlyIncome * 12) : 0;

  let savings_rate_score = savingsRate > 30 ? 4 : savingsRate > 20 ? 3 : savingsRate > 10 ? 2 : savingsRate > 0 ? 1 : 0;
  
  let debt_to_income_score = monthlyIncome > 0 
    ? (debtToIncome < 21 ? 4 : debtToIncome < 31 ? 3 : debtToIncome < 41 ? 2 : 1) 
    : 0;
  
  let emergency_fund_score = emergencyFundRatio > 12 ? 4 : emergencyFundRatio > 6 ? 3 : emergencyFundRatio > 3 ? 2 : emergencyFundRatio > 0 ? 1 : 0;
  
  let net_worth_score = netWorthToIncomeRatio > 5 ? 4 : netWorthToIncomeRatio > 3 ? 3 : netWorthToIncomeRatio > 1 ? 2 : netWorthToIncomeRatio > 0 ? 1 : 0;

  const overall_score = savings_rate_score + debt_to_income_score + emergency_fund_score + net_worth_score;
  const maxScore = 16;
  const normalizedScore = Math.round((overall_score / maxScore) * 100);

  const getHealthGrade = (score) => {
    if (!score || score === 0) return null; // If score is 0, don't return a grade
    if (score >= 90) return 'Grade A';
    if (score >= 80) return 'Grade B';
    if (score >= 70) return 'Grade C';
    if (score >= 60) return 'Grade D';
    return 'Grade F';
  };

  return (
    <div className="overview-page">
      <h2>Overview</h2>

      <div className="overview-cards">
        <div className="overview-card card-income">
          <div className="card-content">
            <div className="card-header">
              <span>Monthly Income 📈</span>
            </div>
            <div className="card-amount">₹{getTotal(incomeList, 'income').toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="overview-card card-expense">
          <div className="card-content">
            <div className="card-header">
              <span>Monthly Expenses 📉</span>
            </div>
            <div className="card-amount">₹{getTotal(expenseList, 'expense').toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="overview-card card-assets">
          <div className="card-content">
            <div className="card-header">
              <span>Total Assets 🏦</span>
            </div>
            <div className="card-amount">₹{getTotal(assetList, 'asset').toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="overview-card card-liabilities">
          <div className="card-content">
            <div className="card-header">
              <span>Total Liabilities 🧾</span>
            </div>
            <div className="card-amount">₹{getTotal(liabilityList, 'liability').toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="overview-bottom-section">
        <div className="financial-health-box">
          <div className="section-header">
            <h3>Financial Health</h3>
            <span className="health-grade">{getHealthGrade(normalizedScore)}</span>
          </div>
          <div className="health-score">
            <div className="score-display">
              <span className="score-number">{normalizedScore}</span>
              <span className="score-total">/100</span>
            </div>
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${normalizedScore}%` }}></div>
            </div>
          </div>
          <div className="health-metrics">
            <div className="metric">
              <span className="metric-label">Savings Rate</span>
              <span className="metric-value">{savingsRate.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Debt to Income Ratio</span>
              <span className="metric-value">{debtToIncome.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Emergency Fund</span>
              <span className="metric-value">{emergencyFundRatio.toFixed(1)} months</span>
            </div>
            <div className="metric">
              <span className="metric-label">Net Worth</span>
              <span className="metric-value">₹{netWorth.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="quick-actions-box">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <div className="action-button add-income" onClick={() => navigate('/income')}>
              <div className="action-icon">📈</div>
              <div className="action-content">
                <div className="action-title">Add Income</div>
                <div className="action-subtitle">Record new income source</div>
              </div>
            </div>

            <div className="action-button add-expense" onClick={() => navigate('/expenses')}>
              <div className="action-icon">📉</div>
              <div className="action-content">
                <div className="action-title">Add Expense</div>
                <div className="action-subtitle">Track new expense</div>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-activity-box">
          <h3>Recent Activity</h3>
          <div className="activity-items">
            {recentActivity.length > 0 ? (
              recentActivity.map((transaction, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {transaction.type === 'Income' ? '📈' : '📉'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{transaction.category || 'General'}</div>
                    <div className="activity-amount">
                      ₹{Number(transaction.amount || 0).toLocaleString('en-IN')} • {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;