import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="nav-links">
        <li><NavLink to="/overview">📅 Overview</NavLink></li>
        <li><NavLink to="/income">💰 Income</NavLink></li>
        <li><NavLink to="/expenses">💸 Expenses</NavLink></li>
        <li><NavLink to="/assets">💵 Assets</NavLink></li>
        <li><NavLink to="/liabilities">💳 Liabilities</NavLink></li>
        <li><NavLink to="/goals">🏆 Goals</NavLink></li>
        <li><NavLink to="/net-worth">📊 Net Worth</NavLink></li>
        <li><NavLink to="/financial-health">📈 Financial Health Score</NavLink></li>
        <li><NavLink to="/login">⏻ Logout</NavLink></li>
      </ul>
    </div>
  );
};

export default Sidebar;
