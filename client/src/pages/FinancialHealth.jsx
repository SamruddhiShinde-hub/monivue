import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './FinancialHealth.css';

const FinancialHealth = ({ user }) => {
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [fixedDeposits, setFixedDeposits] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [totalMonthlyDebt, setTotalMonthlyDebt] = useState(0);

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

      const incomeTotal = incomeRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setMonthlyIncome(incomeTotal);

      const expenseTotal = expenseRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalExpenses(expenseTotal);

      const investmentTotal = investmentRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);

      const fdItems = assetRes.data.filter(a =>
        typeof a.category === 'string' &&
        (a.category.toLowerCase().includes('fixed deposit') || a.category.toLowerCase().includes('fd'))
      );
      const fdTotal = fdItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setFixedDeposits(fdTotal);

      const assetTotal = assetRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalAssets(assetTotal);

      const liabilityTotal = liabilityRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalLiabilities(liabilityTotal);

      const savings = incomeTotal - expenseTotal - investmentTotal;
      setMonthlySavings(savings);

      const monthlyDebtTotal = monthlyDebtRes.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      setTotalMonthlyDebt(monthlyDebtTotal);

    } catch (err) {
      console.error('Failed to fetch financial data:', err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const savingsRate = monthlyIncome ? (monthlySavings / monthlyIncome) * 100 : 0;
  const debtToIncome = monthlyIncome ? (totalMonthlyDebt / monthlyIncome) * 100 : 0;
  const netWorthRatio = monthlyIncome ? (totalAssets - totalLiabilities) / (monthlyIncome * 12) : 0;
  const emergencyFundRatio = totalExpenses ? fixedDeposits / totalExpenses : 0;

  // Scoring
  let savings_rate_score, debt_to_income_score, net_worth_score, emergency_fund_score;

  // Savings Rate
  if (isNaN(savingsRate)) {
    savings_rate_score = 'NA';
  } else if (savingsRate <= 10) {
    savings_rate_score = 1;
  } else if (savingsRate <= 20) {
    savings_rate_score = 2;
  } else if (savingsRate <= 30) {
    savings_rate_score = 3;
  } else {
    savings_rate_score = 4;
  }

  const savings_rate_result =
    savings_rate_score === 'NA' ? 'ERROR' :
    savings_rate_score === 4 ? 'Excellent!' :
    savings_rate_score === 3 ? 'Good' :
    savings_rate_score === 2 ? 'Fair' : 'Poor';

  const savings_rate_remark =
    savings_rate_score === 'NA' ? 'ERROR' :
    savings_rate_score === 4 ? 'Excellent savings discipline! Maintain and look for growth opportunities.' :
    savings_rate_score === 3 ? 'You are on the right track. Keep building on your current savings habits.' :
    savings_rate_score === 2 ? 'Consider automating savings to consistently increase the rate.' :
    'Increase savings rate. Aim to reduce unnecessary expenses.';

  // DTI
  if (isNaN(debtToIncome)) {
    debt_to_income_score = 'NA';
  } else if (debtToIncome >= 41) {
    debt_to_income_score = 1;
  } else if (debtToIncome >= 31) {
    debt_to_income_score = 2;
  } else if (debtToIncome >= 21) {
    debt_to_income_score = 3;
  } else {
    debt_to_income_score = 4;
  }

  const debt_to_income_result =
    debt_to_income_score === 'NA' ? 'ERROR' :
    debt_to_income_score === 4 ? 'Excellent!' :
    debt_to_income_score === 3 ? 'Good' :
    debt_to_income_score === 2 ? 'Fair' : 'Poor';

  const debt_to_income_remark =
    debt_to_income_score === 'NA' ? 'ERROR' :
    debt_to_income_score === 4 ? 'Excellent control of debt. You have great financial flexibility!' :
    debt_to_income_score === 3 ? 'Good balance. Keep debt low while focusing on other financial goals.' :
    debt_to_income_score === 2 ? 'Monitor debt levels closely. Aim to pay off high-interest debt first.' :
    'Work on reducing debt. Consider debt consolidation or refinancing.';

  // Net Worth
  if (isNaN(netWorthRatio)) {
    net_worth_score = 'NA';
  } else if (netWorthRatio <= 1) {
    net_worth_score = 1;
  } else if (netWorthRatio <= 2) {
    net_worth_score = 2;
  } else if (netWorthRatio <= 5) {
    net_worth_score = 3;
  } else {
    net_worth_score = 4;
  }

  const net_worth_result =
    net_worth_score === 'NA' ? 'ERROR' :
    net_worth_score === 4 ? 'Excellent!' :
    net_worth_score === 3 ? 'Good' :
    net_worth_score === 2 ? 'Fair' : 'Poor';

  const net_worth_remark =
    net_worth_score === 'NA' ? 'ERROR' :
    net_worth_score === 4 ? 'Excellent financial health! Consider diversifying your investments.' :
    net_worth_score === 3 ? "You're on track. Continue growing your net worth." :
    net_worth_score === 2 ? 'Work on building assets and reducing liabilities for long-term security.' :
    'Focus on growing your assets through savings and investments.';

  // Emergency Fund
  if (isNaN(emergencyFundRatio)) {
    emergency_fund_score = 'NA';
  } else if (emergencyFundRatio <= 3) {
    emergency_fund_score = 1;
  } else if (emergencyFundRatio <= 6) {
    emergency_fund_score = 2;
  } else if (emergencyFundRatio <= 12) {
    emergency_fund_score = 3;
  } else {
    emergency_fund_score = 4;
  }

  const emergency_fund_result =
    emergency_fund_score === 'NA' ? 'ERROR' :
    emergency_fund_score === 4 ? 'Excellent!' :
    emergency_fund_score === 3 ? 'Good' :
    emergency_fund_score === 2 ? 'Fair' : 'Poor';

  const emergency_fund_remark =
    emergency_fund_score === 'NA' ? 'ERROR' :
    emergency_fund_score === 4 ? 'You have excellent reserves! Consider longer-term investment vehicles.' :
    emergency_fund_score === 3 ? 'Adequate safety cushion. Maintain and monitor your spending.' :
    emergency_fund_score === 2 ? 'Build a stronger emergency fund for at least 6 months.' :
    'Critical! Try to save at least 3 months of expenses in safe assets.';

  const overall_score = [savings_rate_score, debt_to_income_score, net_worth_score, emergency_fund_score]
    .filter(s => s !== 'NA')
    .reduce((a, b) => a + b, 0);

  const overall_result =
    overall_score >= 14 ? 'Excellent!' :
    overall_score >= 10 ? 'Good' :
    overall_score >= 6 ? 'Fair' : 'Poor';

  const overall_remark =
    overall_score >= 14 ? 'You\'re in great financial shape! Keep up the excellent work.' :
    overall_score >= 10 ? 'You\'re on the right track. Optimize where possible.' :
    overall_score >= 6 ? 'Needs improvement in key areas like debt and savings.' :
    'Focus on improving your savings, reducing debt, and building assets.';

  return (
    <div className="financial-health-page">
      <h2>Financial Health Overview</h2>

      <div className="fin-health-stat">
        <table className="financial-health-table">
          <thead>
            <tr>
              <th>Parameters</th>
              <th>Ratio</th>
              <th>Score</th>
              <th>Result</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Savings Rate</td>
              <td>{savingsRate.toFixed(2)}%</td>
              <td className="score-cell">{savings_rate_score}</td>
              <td>{savings_rate_result}</td>
              <td>{savings_rate_remark}</td>
            </tr>
            <tr>
              <td>Debt-to-Income Ratio</td>
              <td>{debtToIncome.toFixed(2)}%</td>
              <td className="score-cell">{debt_to_income_score}</td>
              <td>{debt_to_income_result}</td>
              <td>{debt_to_income_remark}</td>
            </tr>
            <tr>
              <td>Net Worth (as a multiple of annual income)</td>
              <td>{netWorthRatio.toFixed(2)}</td>
              <td className="score-cell">{net_worth_score}</td>
              <td>{net_worth_result}</td>
              <td>{net_worth_remark}</td>
            </tr>
            <tr>
              <td>Emergency Fund Ratio</td>
              <td>{emergencyFundRatio.toFixed(2)}</td>
              <td className="score-cell">{emergency_fund_score}</td>
              <td>{emergency_fund_result}</td>
              <td>{emergency_fund_remark}</td>
            </tr>
            <tr>
              <td><b>Overall Financial Health</b></td>
              <td></td>
              <td><b>{overall_score}</b></td>
              <td><b>{overall_result}</b></td>
              <td><b>{overall_remark}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialHealth;