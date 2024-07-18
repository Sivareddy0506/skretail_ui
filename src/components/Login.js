import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginBG from '../assets/images/mobile_bg.jpg';
import Logo from '../assets/images/sk_logo.png';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      console.log('Login successful:', response.data);
      // Save token and user details to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user); // Pass user data back to the parent component
      navigate('/'); // Redirect to homepage
    } catch (err) {
      console.error('Error logging in:', err);
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'An unexpected error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className='row'>
        <div className='col-6'>
          <img src={LoginBG} alt='bg' className='w-100' />
        </div>
        <div className='col-6'>
          <div className='w-75 bg-white rounded py-5 mx-auto mt-50-percent'>
            <div className='text-center'>
              <img src={Logo} alt="logo" width={100} height={100} />
              <h2>SK Retail Login</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div>
                <label className='py-2'>Email:</label>
                <input
                  className='form-control mb-3'
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  className='form-control mb-3'
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className='text-danger'>{error}</div>}
              <button className='btn btn-primary1 mt-3 px-5 py-3' type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
