import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProduct = ({ product, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    skucode: '',
    corporatecode: '',
    imageurl: '',
    updated_at: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        skucode: product.skucode,
        corporatecode: product.corporatecode,
        imageurl: product.imageurl,
        updated_at: product.updated_at
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/products/update/${formData.corporatecode}`, {
        skucode: formData.skucode,
        imageurl: formData.imageurl
      });
      onUpdate(response.data); // Assuming onUpdate is a callback to handle updated data
      toast.success('Product updated successfully');
      onClose();
      // Set a timer before reloading the page
    setTimeout(() => {
      window.location.reload();
    }, 2000); // Example: reload after 2 seconds (2000 milliseconds)
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    }
  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div>
          <label className='pb-2' htmlFor="corporatecode">Corporate Code:</label>
          <input type="text" className='form-control mb-3' readOnly disabled name="corporatecode" value={formData.corporatecode} />
        </div>
        <div>
          <label className='pb-2' htmlFor="skucode">SKU Code:</label>
          <input type="text" className='form-control mb-3' name="skucode" value={formData.skucode} onChange={handleChange} />
        </div>
        
        <div>
          <label className='pb-2' htmlFor="imageurl">Image URL:</label>
          <input type="text" className='form-control mb-3' name="imageurl" value={formData.imageurl} onChange={handleChange} />
        </div>
        
        <button className='btn btn-primary1 w-100' type="submit">Save</button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EditProduct;
