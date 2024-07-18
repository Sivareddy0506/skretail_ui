import React, { useState } from 'react';
import DataDisplay from './components/DataDisplay';
import { Offcanvas, OffcanvasBody, OffcanvasHeader, Button } from 'reactstrap';
import Sidebar from './components/sidebar';
import FileUpload from './components/FileUpload';

const Products = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleCanvas = () => {
        setIsOpen(!isOpen);
    }

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    }

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
                    onChange={handleSearchChange} // Ensure this function updates `searchQuery`
                    />

                </div>
                        <Button color="primary" className='px-5' onClick={toggleCanvas}>
                            Add Products
                        </Button>
                    </div>
                </div>
                
                <DataDisplay searchQuery={searchQuery} />

                <Offcanvas isOpen={isOpen} toggle={toggleCanvas} className="custom-canvas-width" direction='end'>
                    <OffcanvasHeader className='mb-4 mx-4 mt-2 border-bottom' toggle={toggleCanvas}>
                        <h3 className='font-weight-bold'> Upload Products</h3>
                    </OffcanvasHeader>
                    <OffcanvasBody>
                        <FileUpload />
                    </OffcanvasBody>
                </Offcanvas>
            </div>
        </div>
    );
}

export default Products;
