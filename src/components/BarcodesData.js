import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import axios from 'axios';
import DeleteProduct from './deleteProduct';
import EditProduct from './Editmrp';
import moment from 'moment'; // Import moment for date formatting
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Ensure you define your API base URL

const DataDisplay = ({ searchQuery, dataapiEndpoints, onSelectionChange, onExportSelected }) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editProductData, setEditProductData] = useState(null);

  // Fetch data when `dataapiEndpoints` or `searchQuery` changes
  useEffect(() => {
    const fetchData = async () => {
      if (!Array.isArray(dataapiEndpoints) || dataapiEndpoints.length === 0) {
        console.warn('No valid endpoints provided.');
        return;
      }

      try {
        console.log('Fetching data from endpoints:', dataapiEndpoints);
        const requests = dataapiEndpoints.map(endpoint => axios.get(endpoint));
        const responses = await Promise.all(requests);
        const combinedData = responses.flatMap(response => response.data);
        setData(combinedData);
      } catch (error) {
        console.error('Error fetching data:', error.response || error.message || error);
      }
    };

    fetchData();
  }, [dataapiEndpoints, searchQuery]);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = data.filter(item =>
        (item.fsn && typeof item.fsn === 'string' && item.fsn.toLowerCase().includes(lowerCaseQuery)) ||
        (item.SKU && typeof item.SKU === 'string' && item.SKU.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredData(filtered);
    }
  }, [data, searchQuery]);

  // Pagination setup
  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    const numbers = [];
    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }

    setPageNumbers(numbers);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleDelete = (deletedId) => {
    setData(prevData => prevData.filter(item => item.fsn !== deletedId && item.asin !== deletedId));
    setFilteredData(prevFilteredData => prevFilteredData.filter(item => item.fsn !== deletedId && item.asin !== deletedId));
    setSelectedItems(prevSelectedItems => prevSelectedItems.filter(item => item !== deletedId));
  };

  const handleEdit = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mrp/get-data-by-id?id=${productId}`);
      setEditProductData(response.data);
      setEditProductId(productId);
    } catch (error) {
      console.error('Error fetching product data for editing:', error);
    }
  };

  const handleUpdate = (updatedProduct) => {
    setData(prevData => prevData.map(item => item.fsn === updatedProduct.fsn || item.asin === updatedProduct.asin ? updatedProduct : item));
    setFilteredData(prevFilteredData => prevFilteredData.map(item => item.fsn === updatedProduct.fsn || item.asin === updatedProduct.asin ? updatedProduct : item));
    setEditProductData(null);
    setEditProductId(null);
  };

  const handleSelectItem = (itemId) => {
    const updatedSelectedItems = selectedItems.includes(itemId)
        ? selectedItems.filter(id => id !== itemId)
        : [...selectedItems, itemId];
    setSelectedItems(updatedSelectedItems);
    onSelectionChange(updatedSelectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
      onSelectionChange([]);
    } else {
      const allItemIds = filteredData.map(item => item.fsn || item.asin);
      setSelectedItems(allItemIds);
      onSelectionChange(allItemIds);
    }
  };

  const handleExportSelected = () => {
    const selectedData = filteredData.filter(item => selectedItems.includes(item.fsn || item.asin));
    onExportSelected(selectedData);
  };

  function trimAfter5thChar(str) {
    if (str.length <= 5) return str;
    const substring = str.substring(5);
    const endIndex = Math.min(substring.indexOf(' '), substring.indexOf(','));
    return endIndex === -1 ? str.substring(0, 5) + substring : str.substring(0, 5) + substring.substring(0, endIndex);
  }

  return (
    <div>
      {filteredData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <>
         <table className='w-100'>
            <thead style={{ backgroundColor: 'rgb(250, 248, 255)', borderTop: '1px solid rgb(233, 230, 241)', borderBottom: '1px solid rgb(233, 230, 241)' }}>
                <tr>
                    <th className='p-3 text-center'><input type="checkbox" onChange={handleSelectAll} checked={selectedItems.length === filteredData.length} /></th>
                    <th className='p-3 text-center'>ASIN/FSN</th>
                    <th className='p-3 text-center'>Brand</th>
                    <th className='p-3 text-center'>Barcode</th>
                    <th className='p-3 text-center'>Updated Date</th>
                    <th className='p-3 text-center'>Actions</th>
                </tr>
            </thead>
            <tbody>
                {currentItems.map((item) => (
                    <tr key={item.fsn || item.asin} className='border-bottom'>
                        <td className='p-2 text-center'><input type="checkbox" onChange={() => handleSelectItem(item.fsn || item.asin)} checked={selectedItems.includes(item.fsn || item.asin)} /></td>
                        <td className='p-2 text-center'>{item.fsn || item.asin}</td>
                        <td className='p-2 text-center'>{item.brand || trimAfter5thChar(item.MarketedBy || '')}</td>
                        <td className='p-2 text-center'>
                            {item.barcode ? 
                                <img src={`data:image/png;base64,${item.barcode}`} alt={item.fsn || item.asin} height={50} width="auto" />
                                : 'No barcode'
                            }
                        </td>
                        <td className='p-2 text-center'>{moment(item.UpdatedAt).format('DD-MM-YYYY, HH:mm:ss')}</td>
                        <td className='p-2 text-center' style={{ width: '100px' }}>
                            <div className='d-flex justify-content-end align-items-center actions'>
                                <i className='view-icon'></i>
                                <i className='edit-icon' onClick={() => handleEdit(item.fsn || item.asin)}></i>
                                <DeleteProduct id={item.fsn || item.asin} onDelete={() => handleDelete(item.fsn || item.asin)} />
                            </div>
                        </td>
                    </tr>                     
                ))}
            </tbody>
        </table>
        <ToastContainer position="top-right" autoClose={3000} />

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
            <div>
              {pageNumbers.map(number => (
                <Button key={number} onClick={() => paginate(number)} className={`pagination-button ${currentPage === number ? 'active' : ''}`}>
                  {number}
                </Button>
              ))}
            </div>
            <Button onClick={handleExportSelected} disabled={selectedItems.length === 0}>Export Selected</Button>
          </div>
        </>
      )}

      {/* Edit Product Modal */}
      <Modal isOpen={editProductId !== null} toggle={() => setEditProductId(null)}>
        <ModalHeader toggle={() => setEditProductId(null)}>Edit Product</ModalHeader>
        <ModalBody>
          {editProductData && (
            <EditProduct 
              product={editProductData} 
              onUpdate={handleUpdate} 
              onCancel={() => setEditProductId(null)} 
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DataDisplay;
