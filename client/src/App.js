import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Overview from './pages/Overview';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Assets from './pages/Assets';
import Liabilities from './pages/Liabilities';
import Goals from './pages/Goals';
import NetWorth from './pages/NetWorth';
import FinancialHealth from './pages/FinancialHealth';
import SIPCalculator from './pages/SIPCalculator';
import StepUpSIPCalculator from './pages/StepUpSIPCalculator';
import RetirementCalculator from './pages/RetirementCalculator'; // Correctly imported

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing login token on initial app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Layout component to wrap protected pages with Header
  const Layout = ({ children }) => (
    <div className="app-container-no-sidebar">
      <Header isLoggedIn={isLoggedIn} user={user} />
      <div className="main-content-no-sidebar">{children}</div>
    </div>
  );

  return (
    <Router>
      <div className="full-wrapper">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
          />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/overview"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Overview user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Income user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Expenses user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Assets user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/liabilities"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Liabilities user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <Goals user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/net-worth"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <NetWorth user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-health"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <FinancialHealth user={user} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sip-calculator"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <SIPCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/step-up-sip-calculator"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <StepUpSIPCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/retirement-calculator"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Layout>
                  <RetirementCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;