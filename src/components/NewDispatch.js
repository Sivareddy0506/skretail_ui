import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Tick from './../assets/images/tick.png';
import Cross from './../assets/images/cross.png';
import errorSound from './../assets/audio/windows-error.mp3';
import axios from 'axios';


Modal.setAppElement('#root');

const ProductForm = () => {
  const [corporateCode, setCorporateCode] = useState('');
  const [mrp, setMRP] = useState('');
  const [skuCode, setSKUCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mrperror, setMrpError] = useState('');
  const [mrpsuccessMessage, setMrpSuccessMessage] = useState('');
  const [skuerror, setSkuError] = useState('');
  const [skusuccessMessage, setSkuSuccessMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [id, setID] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errorField, setErrorField] = useState('');

  const corporateCodeRef = useRef(null);
  const mrpRef = useRef(null);
  const skuCodeRef = useRef(null);

  useEffect(() => {
    if (corporateCodeRef.current) {
      corporateCodeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  const playErrorSound = () => {
    const audio = new Audio(errorSound);
    audio.play();
  };
  
  

  const openModal = (message, field) => {
    playErrorSound();
    setModalMessage(message);
    setErrorField(field);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (errorField === 'corporateCode') {
      setCorporateCode('');
      corporateCodeRef.current.focus();
    } else if (errorField === 'mrp') {
      setMRP('');
      mrpRef.current.focus();
    } else if (errorField === 'skuCode') {
      setSKUCode('');
      skuCodeRef.current.focus();
    }
  };

  //console.log('Token from localStorage:', localStorage.getItem('token'));
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleCorporateCodeChange = async (event) => {
    const code = event.target.value;
    setCorporateCode(code);
    setError('');
    setSuccessMessage('');
    setImageUrl('');
    setID('');

    try {
      const response = await fetch(`${API_BASE_URL}/products/${code}`);
      if (!response.ok) {
        throw new Error('ASN/FSN not found');
      }
      const data = await response.json();
      setSuccessMessage('ASN/FSN verified successfully');
      setImageUrl(data.imageurl);
      setID(data.id);
      mrpRef.current.focus();
    } catch (error) {
      setError('ASN/FSN not found');
      setImageUrl('');
      setID('');
      openModal('ASN/FSN not found', 'corporateCode');
    }
  };

  const handleMRPChange = async (event) => {
    const value = event.target.value;
    setMRP(value);
    setMrpError('');
    setMrpSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/products/${value}`);
      if (!response.ok) {
        throw new Error('Product code not found');
      }

      const data = await response.json();
      const productId = data.id;

      if (productId !== id) {
        throw new Error('ID mismatch');
      }

      setMrpSuccessMessage('MRP Label verified successfully');
      skuCodeRef.current.focus();
    } catch (error) {
      if (error.message === 'Product code not found') {
        setMrpError('MRP Label does not exist');
      } else if (error.message === 'ID mismatch') {
        setMrpError('ID mismatch');
      } else {
        setMrpError('Error verifying MRP Label');
      }
      openModal(mrperror || 'Error verifying MRP Label', 'mrp');
    }
  };

  const handleSKUCodeChange = async (event) => {
    const code = event.target.value;
    setSKUCode(code);
    setSkuError('');
    setSkuSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/dispatch/${corporateCode}/${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'SKU code not found');
      }

      setSkuSuccessMessage('SKU code verified successfully');
      setID(data.id);
      setIsFormValid(true);
    } catch (error) {
      setSkuError('SKU code does not exist');
      setIsFormValid(false);
      openModal('SKU code does not exist', 'skuCode');
    }
  };

  // Function to refresh the token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  console.log('Retrieved refreshToken:', refreshToken);

  if (!refreshToken) {
      console.error('No refresh token available');
      throw new Error('No refresh token available');
  }

  try {
      const response = await axios.post(`${API_BASE_URL}/auth/token`, { token: refreshToken });
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      console.log('New accessToken set:', accessToken);
      return accessToken;
  } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
  }
};

// Function to handle save operation
const handleSave = async () => {
  let token = localStorage.getItem('accessToken');
  if (!token) {
      openModal('User not authenticated');
      return;
  }

  try {
      setIsFormValid(false);

      // Function to fetch with token and refresh if needed
      const fetchWithToken = async (url, options = {}) => {
          let token = localStorage.getItem('accessToken');
          options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
          };

          let response = await fetch(url, options);

          if (response.status === 403) {
              console.log('Access token expired, refreshing token...');
              token = await refreshToken();
              options.headers['Authorization'] = `Bearer ${token}`;
              response = await fetch(url, options);
          }

          return response;
      };

      const response = await fetchWithToken(`${API_BASE_URL}/dispatch/savedispatch`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include the token in the headers
          },
          body: JSON.stringify({
              corporateCode,
              mrp: String(mrp),
              skuCode,
              createdDate: new Date().toISOString(),
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save dispatch');
      }

      toast.success('Dispatch saved successfully');
      setTimeout(() => {
          setCorporateCode('');
          setMRP('');
          setSKUCode('');
          setSkuSuccessMessage('');
          setMrpSuccessMessage('');
          setSuccessMessage('');
          setImageUrl('');
          corporateCodeRef.current.focus();
      }, 2000);
  } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || 'Error saving dispatch');
  } finally {
      setIsFormValid(true);
  }
};

  

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const target = event.target;
      if (target.name === 'corporateCode') {
        handleCorporateCodeChange(event);
      } else if (target.name === 'mrp') {
        handleMRPChange(event);
      } else if (target.name === 'skuCode') {
        handleSKUCodeChange(event);
      }
    }
  };

  return (
    <div className='rounded'>
      <div className='row'>
        <div className='col-6 p-4 bg-white'>
          <form autoComplete='off'>
            <label className='pb-2'>Scan ASN/FSN</label>
            <div className='position-relative'>
              <input
                type="text"
                className='form-control mb-3'
                name="corporateCode"
                value={corporateCode}
                onChange={(e) => setCorporateCode(e.target.value)}
                onKeyPress={handleKeyPress}
                ref={corporateCodeRef}
              />
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {error && <img className='placeit-oninput' src={Cross} alt={error} />}
              {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
              {successMessage && <img className='placeit-oninput' src={Tick} alt={successMessage} />}
            </div>

            <label className='pb-2'>Scan MRP Label</label>
            <div className='position-relative'>
              <input
                type="text"
                className='form-control mb-3'
                name="mrp"
                value={mrp}
                onChange={(e) => setMRP(e.target.value)}
                onKeyPress={handleKeyPress}
                ref={mrpRef}
              />
              {mrperror && <p style={{ color: 'red' }}>{mrperror}</p>}
              {mrperror && <img src={Cross} className='placeit-oninput' alt={mrperror} />}
              {mrpsuccessMessage && <p style={{ color: 'green' }}>{mrpsuccessMessage}</p>}
              {mrpsuccessMessage && <img className='placeit-oninput' src={Tick} alt={mrpsuccessMessage} />}
            </div>

            <label className='pb-2'>Scan Product (SKU Code)</label>
            <div className='position-relative'>
              <input
                type="text"
                className='form-control mb-3'
                name="skuCode"
                value={skuCode}
                onChange={(e) => setSKUCode(e.target.value)}
                onKeyPress={handleKeyPress}
                ref={skuCodeRef}
              />
              {skuerror && <p style={{ color: 'red' }}>{skuerror}</p>}
              {skuerror && <img className='placeit-oninput' src={Cross} alt={skuerror} />}
              {skusuccessMessage && <p style={{ color: 'green' }}>{skusuccessMessage}</p>}
              {skusuccessMessage && <img className='placeit-oninput' src={Tick} alt={skusuccessMessage} />}
            </div>

            <button className='btn btn-primary w-100' type="button" onClick={handleSave} disabled={!isFormValid}>Save</button>
          </form>
        </div>
        <div className='col-6 text-center'>
          {imageUrl && (
            <div className='bg-light rounded py-5'>
              <h4>Product Image</h4>
              <br />
              <img src={imageUrl} alt="Product" className='mt-4' style={{ maxWidth: '100%' }} />
            </div>
          )}
        </div>
      </div>
      <ToastContainer />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal-ne"
        overlayClassName="modalne-overlay"
      >
        <div className="modalne-body">
          <p>{modalMessage}</p>
          <button className="btn btn-primary w-100" onClick={closeModal}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductForm;
