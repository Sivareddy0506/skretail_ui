import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './Dashboard';
import Products from './Products';
import Dispatches from './Dispatches';
import MrpData from './MrpData';
import MrpBarCodes from './MrpBarCodes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check for token in localStorage on initial load
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      // Optionally validate tokens or fetch user details
      // For now, just set authenticated if tokens are present
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false); // Set loading to false once authentication check is complete
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    // Optionally show a loading spinner or message while authentication is checked
    return <div>Loading...</div>;
  }

  return (
    <React.StrictMode>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/reg" element={<Signup />} />
            <Route
              path="/"
              element={isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            />
            <Route
              path="/products"
              element={isAuthenticated ? (
                <Products onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            />
            <Route
              path="/dispatches"
              element={isAuthenticated ? (
                <Dispatches onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            />
            <Route
              path="/mrp"
              element={isAuthenticated ? (
                <MrpData onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            />
            <Route
              path="/mrpbarcodes"
              element={isAuthenticated ? (
                <MrpBarCodes onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            />
          </Routes>
        </div>
      </Router>
    </React.StrictMode>
  );
};

export default App;
