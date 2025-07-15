// Overview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Overview.css';

const Overview = ({ user }) => {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [liabilityList, setLiabilityList] = useState([]);
  // const [topGoals, setTopGoals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expenseRes, assetRes, liabilityRes] = await Promise.all([
          axios.get(`/api/income/user/${user.id}`),
          axios.get(`/api/expenses/user/${user.id}`),
          axios.get(`/api/assets/user/${user.id}`),
          axios.get(`/api/liabilities/user/${user.id}`)
          // axios.get(`/api/goals/${user.id}`)
        ]);

        setIncomeList(incomeRes.data || []);
        setExpenseList(expenseRes.data || []);
        setAssetList(assetRes.data || []);
        setLiabilityList(liabilityRes.data || []);

        // const sortedGoals = (goalsRes.data || [])
        //   .filter(goal => goal.future_value > 0)
        //   .sort((a, b) => (b.present_value / b.future_value) - (a.present_value / a.future_value))
        //   .slice(0, 3);
        // setTopGoals(sortedGoals);

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
          .slice(0, 5);

        setRecentActivity(sortedTransactions);
      } catch (err) {
        console.error('❌ Error fetching overview data:', err);
      }
    };

    if (user?.id) fetchData();
  }, [user]);

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
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="overview-page">
      <h2>Overview</h2>

      <div className="overview-cards">
        <div className="overview-card">
          <h4>Total Income</h4>
          <p>₹{getTotal(incomeList, 'income').toLocaleString('en-IN')}</p>
        </div>
        <div className="overview-card">
          <h4>Total Expenses</h4>
          <p>₹{getTotal(expenseList, 'expense').toLocaleString('en-IN')}</p>
        </div>
        <div className="overview-card">
          <h4>Total Assets</h4>
          <p>₹{getTotal(assetList, 'asset').toLocaleString('en-IN')}</p>
        </div>
        <div className="overview-card">
          <h4>Total Liabilities</h4>
          <p>₹{getTotal(liabilityList, 'liability').toLocaleString('en-IN')}</p>
        </div>
      </div>

      <h3>Recent Activity</h3>

      <div className="recent-activity">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.length > 0 ? (
              recentActivity.map((transaction, index) => (
                <tr key={index}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>{transaction.category || 'N/A'}</td>
                  <td className={`amount ${transaction.type.toLowerCase()}`}>
                    ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">No recent activity found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* <h3>Financial Goals</h3>
      <div className="goal-overview">
        {topGoals.map(goal => {
          const progress = Math.min((goal.present_value / goal.future_value) * 100, 100);
          return (
            <div key={goal.id} className="goal-card">
              <h4>{goal.final_description || goal.description}</h4>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${progress}%` }}></div>
              </div>       
              <p>{progress.toFixed(0)}% complete</p>
            </div>
          );
        })}
      </div> */}
    </div>
  );
};

export default Overview;
