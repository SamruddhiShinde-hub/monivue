import './Header.css';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/" className="logo-text">Monivue</NavLink>
      </div>

      <nav className={`nav-menu ${!isLoggedIn ? 'show-guest' : ''}`}>
        {!isLoggedIn ? (
          <NavLink to="/login" className="nav-link">Login</NavLink>
        ) : (
          <>
            <NavLink
              to="/overview"
              className={`nav-btn ${location.pathname === '/overview' ? 'active-link' : ''}`}
            >
              Overview
            </NavLink>

            {/* User Profile Dropdown */}
            <div className="dropdown">
              <button className="dropdown-btn">User Profile</button>
              <div className="dropdown-content">
                <NavLink to="/income" className={`dropdown-item ${location.pathname === '/income' ? 'active-item' : ''}`}>Income</NavLink>
                <NavLink to="/expenses" className={`dropdown-item ${location.pathname === '/expenses' ? 'active-item' : ''}`}>Expenses</NavLink>
                <NavLink to="/assets" className={`dropdown-item ${location.pathname === '/assets' ? 'active-item' : ''}`}>Assets</NavLink>
                <NavLink to="/liabilities" className={`dropdown-item ${location.pathname === '/liabilities' ? 'active-item' : ''}`}>Liabilities</NavLink>
                {/* <NavLink to="/goals" className={`dropdown-item ${location.pathname === '/goals' ? 'active-item' : ''}`}>Goals</NavLink> */}
              </div>
            </div>

            {/* Calculators Dropdown */}
            <div className="dropdown">
              <button className="dropdown-btn">Calculators</button>
              <div className="dropdown-content">
                <NavLink to="/sip-calculator" className={`dropdown-item ${location.pathname === '/sip-calculator' ? 'active-item' : ''}`}>SIP Calculator</NavLink>
                <NavLink to="/step-up-sip-calculator" className={`dropdown-item ${location.pathname === '/step-up-sip-calculator' ? 'active-item' : ''}`}>Step UP SIP Calculator</NavLink>
              </div>
            </div>

            <NavLink
              to="/net-worth"
              className={`nav-btn ${location.pathname === '/net-worth' ? 'active-link' : ''}`}
            >
              Net Worth
            </NavLink>

            <NavLink
              to="/financial-health"
              className={`nav-btn ${location.pathname === '/financial-health' ? 'active-link' : ''}`}
            >
              Financial Health
            </NavLink>

            <div className="profile-icon-wrapper">
              <div
                className="profile-icon"
                title="View Profile"
                onClick={() => navigate('/profile')}
              >
                👤
              </div>
              <div className="logout-hover" onClick={handleLogout}>Logout</div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
