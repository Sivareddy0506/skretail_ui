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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (accessToken && user) {
        console.log('Access Token:', accessToken);
        console.log('User:', user);

        // Optional: Validate token
        axios.get(`${API_BASE_URL}/auth/validate`, { headers: { Authorization: `Bearer ${accessToken}` } })
            .then(response => {
                // Token is valid
                console.log('Token is valid');
            })
            .catch(error => {
                // Token is invalid
                console.error('Token validation failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                navigate('/login');
            });
    } else {
        navigate('/login'); // Redirect to login if no token or user found
    }
}, [navigate, API_BASE_URL]);


const handleSubmit = async (event) => {
  event.preventDefault();

  try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const responseData = response.data; // Extract response data

      console.log('Login response:', responseData);

      // Check for required fields in responseData
      const requiredFields = ['accessToken', 'refreshToken']; // Adjust based on actual response
      for (const field of requiredFields) {
          if (!responseData[field]) {
              console.error(`Login response missing required field: ${field}`);
              return; // Exit if any required field is missing
          }
      }

      // Since user details are not included, adjust logic accordingly
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);

      // Handle login and redirection
      onLogin(); // If no user details are available, adjust this logic as needed
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
