import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Benzy POS</h1>
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/pos" 
          className={location.pathname === '/pos' ? 'active' : ''}
        >
          POS
        </Link>
        <Link 
          to="/products" 
          className={location.pathname === '/products' ? 'active' : ''}
        >
          Products
        </Link>
        <Link 
          to="/customers" 
          className={location.pathname === '/customers' ? 'active' : ''}
        >
          Customers
        </Link>
        <Link 
          to="/suppliers" 
          className={location.pathname === '/suppliers' ? 'active' : ''}
        >
          Suppliers
        </Link>
        <Link 
          to="/inventory" 
          className={location.pathname === '/inventory' ? 'active' : ''}
        >
          Purchases
        </Link>
        <Link 
          to="/stock" 
          className={location.pathname === '/stock' ? 'active' : ''}
        >
          Stock
        </Link>
        <Link 
          to="/analytics" 
          className={location.pathname === '/analytics' ? 'active' : ''}
        >
          Analytics
        </Link>
        <Link 
          to="/reports" 
          className={location.pathname === '/reports' ? 'active' : ''}
        >
          Reports
        </Link>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <Link 
            to="/users" 
            className={location.pathname === '/users' || location.pathname === '/activity-logs' ? 'active' : ''}
          >
            Users
          </Link>
        )}
        <Link 
          to="/settings" 
          className={location.pathname === '/settings' ? 'active' : ''}
        >
          Settings
        </Link>
      </div>
      
      <div className="navbar-user">
        <span>{user?.full_name} ({user?.role})</span>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
