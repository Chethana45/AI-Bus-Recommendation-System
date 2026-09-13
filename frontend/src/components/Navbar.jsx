import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusFront, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      if (token) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error('Failed to parse user data:', error);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    checkAuthStatus();
    window.addEventListener('authChange', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('bookings');
    setIsLoggedIn(false);
    setUser(null);
    setIsMenuOpen(false);
    try {
      window.dispatchEvent(new Event('authChange'));
    } catch (e) {
      // ignore
    }
    navigate('/login');
  };

  const getUserFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0];
    return 'User';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.name) {
      const names = user.name.split(' ');
      return names.map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="navbar navbar-premium"
    >
      <div className="navbar-container">
        <div className="navbar-left">
          <Link className="navbar-logo" to="/" onClick={handleLinkClick}>
            <span className="logo-icon"><BusFront size={18} /></span>
            <span>BusBook</span>
          </Link>
        </div>

        <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={handleLinkClick}>
            Home
          </Link>
          <Link to="/search-bus" className="nav-link" onClick={handleLinkClick}>
            Search Buses
          </Link>
          <Link to="/emergency-reservation" className="nav-link emergency-nav-link" onClick={handleLinkClick}>
            🚨 Emergency
          </Link>
          {isLoggedIn && (
            <Link to="/profile" className="nav-link" onClick={handleLinkClick}>
              Profile
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-link nav-pill" onClick={handleLinkClick}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-primary" onClick={handleLinkClick}>
                Sign Up
              </Link>
            </>
          ) : (
            <div className="navbar-user-actions">
              <Link to="/profile" className="user-pill" onClick={handleLinkClick}>
                <span className="user-avatar">{getUserInitials()}</span>
                <span>{getUserFirstName()}</span>
              </Link>
              <button className="nav-link nav-pill nav-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle navigation menu">
          {isMenuOpen ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
