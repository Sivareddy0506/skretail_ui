import React, { useState, useEffect } from 'react';
import BarcodeData from './components/BarcodesData';
import { Offcanvas, OffcanvasBody, OffcanvasHeader, Button, Input } from 'reactstrap';
import Sidebar from './components/sidebar';
import FileUpload from './components/FileUpload';
import { FaFileExport } from 'react-icons/fa';

const MrpData = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState('mrp');
    const [tableOption, setTableOption] = useState('mrp');
    const [data, setData] = useState([]);
    const [apiEndpoint, setApiEndpoint] = useState(`${process.env.REACT_APP_API_BASE_URL}/mrp/upload-chunk`);
    const [currentEndpoint, setCurrentEndpoint] = useState(apiEndpoint);

    useEffect(() => {
        const newApiEndpoint = `${process.env.REACT_APP_API_BASE_URL}/${selectedOption}/upload-chunk`;
        setApiEndpoint(newApiEndpoint);
    }, [selectedOption]);

    useEffect(() => {
        setCurrentEndpoint(apiEndpoint);
    }, [apiEndpoint]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/${tableOption}/get-data`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [tableOption]);

    const toggleCanvas = () => {
        setIsOpen(!isOpen);
    };

    const convertToCSV = (data) => {
        if (data.length === 0) return '';
        const header = Object.keys(data[0]).filter(key => key !== 'barcode').join(',');
        const rows = data.map(item => 
            Object.keys(item)
                .filter(key => key !== 'barcode')
                .map(key => `"${String(item[key]).replace(/"/g, '""')}"`) // Enclose in quotes and escape quotes
                .join(',')
        ).join('\n');
        return [header, rows].join('\n');
    };

    const downloadCSV = (csv, filename) => {
        if (!csv) return;
        const csvFile = new Blob([csv], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleSelectItem = (itemId) => {
        const updatedSelectedItems = selectedItems.includes(itemId)
            ? selectedItems.filter(id => id !== itemId)
            : [...selectedItems, itemId];
        setSelectedItems(updatedSelectedItems);
        // Notify parent component (if needed)
    };

    const handleSelectAll = (filteredData) => {
        if (selectedItems.length === filteredData.length) {
            setSelectedItems([]);
            // Notify parent component (if needed)
        } else {
            const allItemIds = filteredData.map(item => item.fsn || item.asin);
            setSelectedItems(allItemIds);
            // Notify parent component (if needed)
        }
    };

    const handleExportSelected = () => {
        if (selectedItems.length === 0) {
            alert('No items selected for export.');
            return;
        }
        const selectedData = data.filter(item => selectedItems.includes(item.fsn || item.asin));
        const csv = convertToCSV(selectedData);
        downloadCSV(csv, 'skretail_mrpdata_export.csv');
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleDropdownChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleDropdownChange1 = (event) => {
        setTableOption(event.target.value);
    };

    const trimAfter5thChar = (str) => {
        if (str.length <= 5) return str;
        const substring = str.substring(5);
        const endIndex = Math.min(substring.indexOf(' '), substring.indexOf(','));
        return endIndex === -1 ? str.substring(0, 5) + substring : str.substring(0, 5) + substring.substring(0, endIndex);
    };

    return (
        <div className='d-flex w-100 overflow-hidden'>
            <div className='asidebar'>
                <Sidebar />
            </div>
            <div className='main-content'>
                <div className='d-flex align-items-center justify-content-between mb-4'>
                    <h2>MRP Label Data</h2>
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
                        <div className='me-3 w-120px'>
                            <Input className='w-120' type="select" value={tableOption} onChange={handleDropdownChange1}>
                                <option value="mrp">Flipkart - ZAP</option>
                                <option value="gn">Flipkart - GN</option>
                                <option value="appario">Appario</option>
                                <option value="coco">Cocoblu</option>
                            </Input>
                        </div>
                        <Button color="secondary" className='px-0 me-3' onClick={handleExportSelected}>
                            <FaFileExport />
                        </Button>
                        <Button color="primary" className='px-5' onClick={toggleCanvas}>
                            Upload MRP Data
                        </Button>
                    </div>
                </div>
                {selectedItems.length > 0 && (
                    <div className='mb-4'>
                        <p>Selected Items: <b>{selectedItems.length}</b></p>
                    </div>
                )}

                <BarcodeData
                    searchQuery={searchQuery}
                    onExportSelected={handleExportSelected}
                    setData={setData}
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
                    dataapiEndpoints={[
                        `${process.env.REACT_APP_API_BASE_URL}/${tableOption}/get-data`
                    ]}
                    onItemSelect={handleSelectItem}
                    onSelectAll={handleSelectAll}
                />

                <Offcanvas isOpen={isOpen} toggle={toggleCanvas} className="custom-canvas-width" direction='end'>
                    <OffcanvasHeader className='mb-4 mx-4 mt-2 border-bottom' toggle={toggleCanvas}>
                        <h3 className='font-weight-bold'>Upload Products</h3>
                    </OffcanvasHeader>
                    <OffcanvasBody>
                        <div className='mb-3'>
                            <Input type="select" value={selectedOption} onChange={handleDropdownChange}>
                                <option value="mrp">Flipkart - ZAP</option>
                                <option value="gn">Flipkart - GN</option>
                                <option value="appario">Appario</option>
                                <option value="coco">Cocoblu</option>
                            </Input>
                        </div>
                        <FileUpload apiEndpoint={currentEndpoint} key={currentEndpoint} />
                    </OffcanvasBody>
                </Offcanvas>
            </div>
        </div>
    );
};

export default MrpData;
