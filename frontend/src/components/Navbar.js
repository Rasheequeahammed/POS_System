import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import benzyLogo from '../images/logo/benzy_logo.png';
import '../styles/Navbar.css';

function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRefs = useRef({});
  const closeTimeoutRef = useRef(null);

  // Check if user has admin or manager role
  const isAdminOrManager = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'MANAGER';

  // Handlers
  const handleLogout = () => dispatch(logout());
  
  const closeDropdown = () => {
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    // Delay closing to allow smooth mouse movement to dropdown menu
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleDropdownClick = (dropdown) => {
    // Clear close timeout when clicking
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActivePath = (paths) => {
    return paths.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const calculateDropdownPosition = useCallback((dropdown) => {
    const element = dropdownRefs.current[dropdown];
    if (element) {
      const rect = element.getBoundingClientRect();
      setDropdownPosition(prev => ({
        ...prev,
        [dropdown]: {
          left: rect.left + rect.width / 2,
          top: rect.bottom
        }
      }));
    }
  }, []);

  const handleMouseEnter = (dropdown) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    calculateDropdownPosition(dropdown);
    setActiveDropdown(dropdown);
  };

  useEffect(() => {
    if (activeDropdown) {
      calculateDropdownPosition(activeDropdown);
    }
    // Cleanup timeout on unmount
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [activeDropdown, calculateDropdownPosition]);

  // Render dropdown menu
  const renderDropdown = (name, items) => {
    const paths = items.map(item => item.path);
    
    return (
      <div 
        className="nav-dropdown"
        ref={(el) => dropdownRefs.current[name] = el}
        onMouseEnter={() => handleMouseEnter(name)}
        onMouseLeave={closeDropdown}
      >
        <button 
          className={`dropdown-trigger ${isActivePath(paths) ? 'active' : ''}`}
          onClick={() => handleDropdownClick(name)}
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
          <span className="dropdown-arrow">▼</span>
        </button>
        <div 
          className={`dropdown-menu ${activeDropdown === name ? 'show' : ''}`}
          style={dropdownPosition[name] ? {
            left: `${dropdownPosition[name].left}px`,
            top: `${dropdownPosition[name].top}px`,
            transform: 'translateX(-50%)'
          } : {}}
          onMouseEnter={() => handleMouseEnter(name)}
          onMouseLeave={closeDropdown}
        >
          {items.map((item, index) => (
            <Link 
              key={index}
              to={item.path}
              className={item.isActive ? 'active' : ''}
              onClick={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                }
                setActiveDropdown(null);
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Dropdown menu configurations
  const salesDropdown = [
    { path: '/customers', label: 'Customers', isActive: location.pathname === '/customers' }
  ];

  const inventoryDropdown = [
    { path: '/products', label: 'Products', isActive: location.pathname === '/products' },
    { path: '/stock', label: 'Stock', isActive: location.pathname === '/stock' },
    { path: '/inventory', label: 'Purchases', isActive: location.pathname === '/inventory' },
    { path: '/suppliers', label: 'Suppliers', isActive: location.pathname === '/suppliers' }
  ];

  const reportsDropdown = [
    { path: '/analytics', label: 'Analytics', isActive: location.pathname === '/analytics' },
    { path: '/reports', label: 'Reports', isActive: location.pathname === '/reports' }
  ];

  const managementDropdown = [
    { path: '/users', label: 'Users', isActive: location.pathname === '/users' || location.pathname === '/activity-logs' },
    { path: '/stores', label: 'Stores', isActive: location.pathname === '/stores' || location.pathname === '/inventory-transfers' },
    { path: '/settings', label: 'Settings', isActive: location.pathname === '/settings' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={benzyLogo} alt="Benzy Logo" className="navbar-logo" />
        <h1>Benzy POS</h1>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>

        <Link to="/pos" className={location.pathname === '/pos' ? 'active' : ''}>
          POS
        </Link>

        {renderDropdown('sales', salesDropdown)}
        {renderDropdown('inventory', inventoryDropdown)}
        {renderDropdown('reports', reportsDropdown)}
        
        {isAdminOrManager && renderDropdown('management', managementDropdown)}
        
        {!isAdminOrManager && (
          <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
            Settings
          </Link>
        )}
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
