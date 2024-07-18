import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginBG from '../assets/images/mobile_bg.jpg';
import Logo from '../assets/images/sk_logo.png';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, { email, password });
      window.location.href = '/login';
    } catch (err) {
      console.error('Error signing up:', err);
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
        <div className='col-6 position-relative'>
          <div className='w-75 bg-white rounded mx-auto pt-3 pb-5 mt-60-percent'>
            <div className='text-center'>
              <img src={Logo} alt="logo" width={100} height={100} />
              <h2>SK Retail Signup</h2>
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
                <label className='py-2'>Password:</label>
                <input
                  className='form-control mb-3'
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className='py-2'>Confirm Password:</label>
                <input
                  className='form-control mb-3'
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className='text-danger'>{error}</div>}
              <button className='btn btn-primary1 mt-3 py-2 px-5' type="submit">Signup</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
