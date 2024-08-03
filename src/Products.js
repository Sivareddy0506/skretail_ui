import React, { useState } from 'react';
import DataDisplay from './components/DataDisplay';
import { Offcanvas, OffcanvasBody, OffcanvasHeader, Button } from 'reactstrap';
import Sidebar from './components/sidebar';
import FileUpload from './components/FileUpload';
import { FaFileExport } from 'react-icons/fa';

const Products = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);
    const apiEndpoint = `${process.env.REACT_APP_API_BASE_URL}/products/upload-chunk`;

    const toggleCanvas = () => setIsOpen(!isOpen);

    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const convertToCSV = (data) => {
        if (data.length === 0) return '';
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(',')).join('\n');
        return [header, rows].join('\n');
    };

    const downloadCSV = (csv, filename) => {
        const csvFile = new Blob([csv], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleExportSelected = () => {
        if (selectedItems.length === 0) {
            alert('No items selected for export.');
            return;
        }
        const selectedData = data.filter(item => selectedItems.includes(item.id));
        const csv = convertToCSV(selectedData);
        downloadCSV(csv, 'skretail_products_export.csv');
    };

    return (
        <div className='d-flex w-100 overflow-hidden'>
            <div className='asidebar'>
                <Sidebar />
            </div>
            <div className='main-content'>
                <div className='d-flex align-items-center justify-content-between mb-4'>
                    <h2>Products</h2>
                    <div className='d-flex align-items-center justify-content-end'>
                        <div className="me-3">
                            <input
                                type="text"
                                className="form-control w-300px rounded-50 ps-3"
                                style={{ height: '50px' }}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <Button color="secondary" className='px-0 me-3' onClick={handleExportSelected}>
                            <FaFileExport />
                        </Button>
                        <Button color="primary" className='px-5 me-2' onClick={toggleCanvas}>
                            Add Products
                        </Button>
                    </div>
                </div>
                
                {/* Selected items count */}
                {selectedItems.length > 0 && (
                    <div className='mb-4'>
                        <p>Selected Items: <b>{selectedItems.length}</b> </p>
                    </div>
                )}

                <DataDisplay
                    searchQuery={searchQuery}
                    onExportSelected={handleExportSelected}
                    setData={setData}
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
                />
                
                <Offcanvas isOpen={isOpen} toggle={toggleCanvas} className="custom-canvas-width" direction='end'>
                    <OffcanvasHeader className='mb-4 mx-4 mt-2 border-bottom' toggle={toggleCanvas}>
                        <h3 className='font-weight-bold'> Upload Products</h3>
                    </OffcanvasHeader>
                    <OffcanvasBody>
                        <FileUpload apiEndpoint={apiEndpoint} />
                    </OffcanvasBody>
                </Offcanvas>
            </div>
        </div>
    );
}

export default Products;
