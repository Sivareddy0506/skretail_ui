import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import { Offcanvas, OffcanvasBody, OffcanvasHeader, Button } from 'reactstrap';
import PrintMrp from './components/NewPrintMrp';
import PrintedMrpTable from './components/MrpPrintedData';

const Dispatches = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // State to force refresh
    const [searchQuery, setSearchQuery] = useState('');

    const toggleCanvas = () => {
        setIsOpen(!isOpen);
        setRefreshKey(prevKey => prevKey + 1); // Increment key to force refresh
    }

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    }

    return (
        <div className='d-flex w-100 overflow-hidden'>
            <div className='asidebar'>
                <Sidebar/>
            </div>
            <div className='main-content'>
                <div className='d-flex align-items-center justify-content-between mb-4'>
                    <h2>Barcode Printing Log</h2>
                    <div className='d-flex align-items-center justify-content-end'>
                    <div className="me-3">
                    <input
                        type="text"
                        className="form-control w-300px rounded-50 ps-3" style={{height: '50px'}}
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                        <Button color="primary" className='px-5' onClick={toggleCanvas}>
                           Print MRP Label
                        </Button>
                    </div>
                </div>
                
                <PrintedMrpTable key={refreshKey} searchQuery={searchQuery} /> {/* Pass searchQuery as prop */}
                
                <Offcanvas isOpen={isOpen} toggle={toggleCanvas} className="custom-canvas-width-1000px" direction='end'>
                    <OffcanvasHeader className='mb-4 mx-4 mt-2 border-bottom' toggle={toggleCanvas}>
                        <span className='font-weight-bold'>New Dispatch</span>
                    </OffcanvasHeader>
                    <OffcanvasBody>
                        <PrintMrp />
                    </OffcanvasBody>
                </Offcanvas>
            </div>
        </div>
    );
}

export default Dispatches;
