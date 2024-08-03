import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const PrintedMrpTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageNumbers, setPageNumbers] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/mrp/getprintedmrp`);
                setData(response.data);
            } catch (error) {
                setError('Failed to fetch data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_BASE_URL]);

    useEffect(() => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 3);

        const numbers = [];
        for (let i = startPage; i <= endPage; i++) {
            numbers.push(i);
        }

        setPageNumbers(numbers);
    }, [data, currentPage, itemsPerPage]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    function trimAfter5thChar(str) {
        if (str.length <= 5) {
            return str;
        }
        const substring = str.substring(5);
        const endIndex = Math.min(
            substring.indexOf(' '),
            substring.indexOf(',')
        );
        if (endIndex === -1) {
            return str.substring(0, 5) + substring;
        } else {
            return str.substring(0, 5) + substring.substring(0, endIndex);
        }
    }

    return (
        <div>
            <table className='w-100'>
                <thead style={{ backgroundColor: 'rgb(250, 248, 255)', borderTop: '1px solid rgb(233, 230, 241)', borderBottom: '1px solid rgb(233, 230, 241)' }}>
                    <tr>
                        <th className='p-3 text-center'>ASIN/FSN</th>
                        <th className='p-3 text-center'>Brand</th>
                        <th className='p-3 text-center'>Month & Year</th>
                        <th className='p-3 text-center'>Printed by</th>
                        <th className='p-3 text-center'>Printed Time</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((item) => (
                        <tr key={item.id} className='border-bottom'>
                            <td className='p-2 text-center'>{item.corporatecode}</td>
                            <td className='p-2 text-center'>{trimAfter5thChar(item.brand)}</td>
                            <td className='p-2 text-center'>{item.manufacturedate}</td>
                            <td className='p-2 text-center'>{item.useremail}</td>
                            <td className='p-2 text-center'>{moment(item.createddate).format('DD-MM-YYYY, HH:mm:ss')}</td>
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
                        {currentPage < Math.ceil(data.length / itemsPerPage) && (
                            <li className="page-item">
                                <button onClick={() => paginate(currentPage + 1)} className="page-link">
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

export default PrintedMrpTable;
