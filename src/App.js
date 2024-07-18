import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './Dashboard';
import Products from './Products';
import Dispatches from './Dispatches';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
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
        </Routes>
     </div>
    </Router>
  );
};

export default App;
