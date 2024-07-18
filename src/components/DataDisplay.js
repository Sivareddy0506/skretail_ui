import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import axios from 'axios';
import DeleteProduct from './deleteProduct';
import EditProduct from './EditProduct';
import moment from 'moment'; // Import moment for date formatting

const DataDisplay = ({ searchQuery }) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/get-data`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [API_BASE_URL]);
  

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 3);

    const numbers = [];
    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }

    setPageNumbers(numbers);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data); // Show all data if no search query
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = data.filter(item =>
        (item.corporatecode && typeof item.corporatecode === 'string' && item.corporatecode.toLowerCase().includes(lowerCaseQuery)) ||
        (item.skucode && typeof item.skucode === 'string' && item.skucode.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredData(filtered); // Update filteredData state with filtered results
    }
  }, [data, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Sorting here

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleDelete = (deletedCorporateCode) => {
    setData(prevData => prevData.filter(item => item.corporatecode !== deletedCorporateCode));
  };

  const handleEdit = (productId) => {
    setEditProductId(productId);
  };

  const handleUpdate = (updatedProduct) => {
    setData(prevData => prevData.map(item => item.id === updatedProduct.id ? updatedProduct : item));
  };

  return (
    <div>
      {filteredData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <>
          <table className='w-100'>
            <thead style={{ backgroundColor: 'rgb(250, 248, 255)', borderTop: '1px solid rgb(233, 230, 241)', borderBottom: '1px solid rgb(233, 230, 241)' }}>
              <tr>
                <th className='p-3 text-center'>ID</th>
                <th className='p-3 text-center'>SKU Code</th>
                <th className='p-3 text-center'>ASN/FSN</th>
                <th className='p-3 text-center'>Image</th>
                <th className='p-3 text-center'>Updated Date</th>
                <th className='p-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
  {currentItems.map((item) => (
    <tr key={item.id} className='link-row border-bottom'>
      <td className='p-2 text-center'>{item.id}</td>
      <td className='p-2 text-center'>{item.skucode}</td>
      <td className='p-2 text-center'>{item.corporatecode}</td>
      <td className='p-2 text-center'>
        <img src={item.imageurl} alt={item.corporatecode} height={50} width={50} />
      </td>
      <td className='p-2 text-center'>{moment(item.updated_at).format('DD-MM-YYYY, HH:mm:ss')}</td> {/* Format updated_at */}
      <td className='p-2 text-center' style={{ width: '100px' }}>
        <div className='d-flex justify-content-end align-items-center actions'>
          <i className='view-icon'></i>
          <i className='edit-icon' onClick={() => handleEdit(item.id)}></i>
          <DeleteProduct corporateCode={item.corporatecode} onDelete={() => handleDelete(item.corporatecode)} />
        </div>
      </td>
    </tr>
  ))}
</tbody>

          </table>

          <div className='d-flex align-items-center justify-content-between'>
            <div>
              <label htmlFor="itemsPerPage">Items per page: </label>
              <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <nav>
              <ul className="pagination">
                {currentPage > 1 && (
                  <li className="page-item">
                    <button onClick={() => paginate(currentPage - 1)} className="page-link">
                      Prev
                    </button>
                  </li>
                )}
                {pageNumbers.map((number) => (
                  <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                    <button onClick={() => paginate(number)} className="page-link">
                      {number}
                    </button>
                  </li>
                ))}
                {currentPage < Math.ceil(filteredData.length / itemsPerPage) && (
                  <li className="page-item">
                    <button onClick={() => paginate(currentPage + 1)} className="page-link">
                      Next
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </>
      )}

      <Modal className='edit-product' isOpen={editProductId !== null} toggle={() => setEditProductId(null)}>
        <ModalHeader toggle={() => setEditProductId(null)}>Edit Product</ModalHeader>
        <ModalBody>
          <EditProduct
            product={data.find(item => item.id === editProductId)}
            onUpdate={handleUpdate}
            onClose={() => setEditProductId(null)}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DataDisplay;
