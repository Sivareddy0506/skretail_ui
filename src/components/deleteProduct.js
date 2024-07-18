import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const DeleteProduct = ({ corporateCode, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${corporateCode}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      onDelete(corporateCode);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete product: ${error.message}`);
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div>
      <i className='delete-icon' onClick={() => setModalOpen(true)} aria-label="Delete Product"></i>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p className='mt-5 pt-3'>Are you sure you want to delete this product?</p>
            <div className="modal-buttons text-center d-flex align-items-center justify-content-center w-100">
              <button className='btn btn-secondary w-150px me-4' onClick={() => setModalOpen(false)}>Cancel</button>
              <button className='btn btn-primary w-150px' onClick={handleDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DeleteProduct;
