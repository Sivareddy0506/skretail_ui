import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


const DispatchList = ({ searchQuery }) => {
  const [dispatches, setDispatches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [filteredDispatches, setFilteredDispatches] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dispatch/dispatches`);
        setDispatches(response.data);
      } catch (error) {
        console.error('Error fetching dispatches:', error);
        // Handle error appropriately
      }
    };

    fetchDispatches();
  }, [API_BASE_URL]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredDispatches.length / itemsPerPage);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 3);

    const numbers = [];
    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }

    setPageNumbers(numbers);
  }, [filteredDispatches, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredDispatches(dispatches);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = dispatches.filter(dispatch =>
        (dispatch.corporatecode && dispatch.corporatecode.toLowerCase().includes(lowerCaseQuery)) ||
        (dispatch.skucode && dispatch.skucode.toLowerCase().includes(lowerCaseQuery)) ||
        (dispatch.useremail && dispatch.useremail.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredDispatches(filtered);
    }
  }, [dispatches, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDispatches.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const formatDateToIST = (dateString) => {
    return moment.utc(dateString).tz('Asia/Kolkata').format('DD-MM-YYYY, HH:mm:ss');
  };

  return (
    <div>
      <table className="w-100">
        <thead style={{ backgroundColor: 'rgb(250, 248, 255)', borderTop: '1px solid rgb(233, 230, 241)', borderBottom: '1px solid rgb(233, 230, 241)' }}>
          <tr>
            <th className="p-3 text-center">ASN/FSN</th>
            <th className="p-3 text-center">MRP Label</th>
            <th className="p-3 text-center">Product SKU Code</th>
            <th className="p-3 text-center">Created by</th>
            <th className="p-3 text-center">Created Date</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((dispatch, index) => (
              <tr key={index} className="link-row border-bottom">
                <td className="p-2 text-center">{dispatch.corporatecode}</td>
                <td className="p-2 text-center">{dispatch.mrp}</td>
                <td className="p-2 text-center">{dispatch.skucode}</td>
                <td className="p-2 text-center">{dispatch.useremail}</td>
                <td className="p-2 text-center">{formatDateToIST(dispatch.createddate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No dispatches found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="d-flex align-items-center justify-content-between mt-3">
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
                <button onClick={() => paginate(currentPage - 1)} className="page-link" aria-label="Previous Page">
                  Prev
                </button>
              </li>
            )}
            {pageNumbers.map((number) => (
              <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                <button onClick={() => paginate(number)} className="page-link" aria-label={`Page ${number}`}>
                  {number}
                </button>
              </li>
            ))}
            {currentPage < Math.ceil(filteredDispatches.length / itemsPerPage) && (
              <li className="page-item">
                <button onClick={() => paginate(currentPage + 1)} className="page-link" aria-label="Next Page">
                  Next
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default DispatchList;
