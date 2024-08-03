import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DeleteProduct = ({ corporateCode, id, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getApiEndpoints = () => {
    const pathname = window.location.pathname;

    switch (pathname) {
      case '/mrp':
        return [
          `${API_BASE_URL}/mrp/${id}`,
          // Add more endpoints for /mrp if needed
        ];
      case '/products':
        return [
          `${API_BASE_URL}/products/${corporateCode}`,
          // Add more endpoints for /products if needed
        ];
      default:
        return [
          `${API_BASE_URL}/products/${corporateCode}`,
          // Default endpoint or handle the case where no specific path matches
        ];
    }
  };

  const handleDelete = async () => {
    const apiEndpoints = getApiEndpoints();

    try {
      const deletePromises = apiEndpoints.map(endpoint =>
        fetch(endpoint, { method: 'DELETE' })
      );

      const responses = await Promise.all(deletePromises);

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Error deleting from ${response.url}: ${response.statusText}`);
        }
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
      {/* Ensure ToastContainer is at the root level in your main component file */}
    </div>
  );
};

export default DeleteProduct;
