import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Tick from './../assets/images/tick.png';
import Cross from './../assets/images/cross.png';
import errorSound from './../assets/audio/windows-error.mp3';
import axios from 'axios';

Modal.setAppElement('#root');

const formatData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return []; // Return an empty array if data is invalid or empty
    }
    return Object.entries(data[0]).map(([key, value]) => ({
        key: key.toUpperCase().replace(/_/g, ' '),
        value: typeof value === 'string' ? value : JSON.stringify(value) // Ensure value is a string
    }));
};

const PrintMrp = ({ data }) => {
    const [corporateCode, setCorporateCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fetchedData, setFetchedData] = useState(null); // Renamed variable
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [errorField, setErrorField] = useState('');
    const [isFormValid, setIsFormValid] = useState(true); // Add form validation state

    const [currentMonthYear, setCurrentMonthYear] = useState('');

    useEffect(() => {
        const getCurrentMonthAndYear = () => {
            const date = new Date();
            const options = { month: 'long', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            return formattedDate.replace(' ', ' - ');
        };

        setCurrentMonthYear(getCurrentMonthAndYear());
    }, []);

    const [dimensions, setDimensions] = useState({
        width: 341,
        height: 531
    });
    
    const onResize = (event, { size }) => {
        setDimensions({ width: size.width, height: size.height });
    };
    
    
    const corporateCodeRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        if (corporateCodeRef.current) {
            corporateCodeRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
        }
    }, [successMessage]);

    const playErrorSound = () => {
        const audio = new Audio(errorSound);
        audio.play();
    };

    const openModal = (message, field) => {
        playErrorSound();
        setModalMessage(message);
        setErrorField(field);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (errorField === 'corporateCode') {
            setCorporateCode('');
            corporateCodeRef.current.focus();
        }
    };

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const handleCorporateCodeChange = async (event) => {
        const code = event.target.value;
        setCorporateCode(code);
        setError(''); // Clear previous error
        setSuccessMessage(''); // Clear previous success message
        setFetchedData(null); // Clear previous data

        try {
            const response = await fetch(`${API_BASE_URL}/mrp/get-data-by-id?id=${code}`);
            if (!response.ok) {
                throw new Error('Data not found');
            }
            const result = await response.json();
            
            if (result && result.length > 0) { // Ensure data is fetched successfully
                setSuccessMessage('Data fetched successfully');
                setFetchedData(result); // Set fetched data
            } else {
                throw new Error('Data not found');
            }
        } catch (error) {
            setError('Data not found');
            setFetchedData(null); // Clear data on error
            openModal('Data not found', 'corporateCode');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            const target = event.target;
            if (target.name === 'corporateCode') {
                handleCorporateCodeChange(event);
            }
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken'); // Check if this key is correct
        console.log('Retrieved refreshToken:', refreshToken);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
      
        const response = await axios.post(`${API_BASE_URL}/auth/token`, { token: refreshToken });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        console.log('New accessToken set:', accessToken);
        return accessToken;
      };
    
   

    const handlePrintAndSave = async () => {
        let token = localStorage.getItem('accessToken');
        if (!token) {
            openModal('User not authenticated');
            return;
        }
    
        try {
            setIsFormValid(false);
    
            if (tableRef.current) {
                const table = tableRef.current;
    
                // Function to clean table content by removing special characters
                const cleanTableContent = (element) => {
                    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
                    let node = walker.nextNode();
                    while (node) {
                        node.nodeValue = node.nodeValue.replace(/[^\u0000-\u007F]/g, " "); // Removes special characters
                        node = walker.nextNode();
                    }
                };
    
                // Clean the table content before rendering to canvas
                cleanTableContent(table);
    
                const canvasWidthPx = 335; // Canvas width in pixels
                const canvasHeightPx = 531; // Canvas height in pixels
    
                // Add margins
                const marginLeftPx = 3;
                const marginTopPx = 10;
                const contentWidthPx = canvasWidthPx - marginLeftPx * 2;
                const contentHeightPx = 516; // Adjusted table height
    
                // Convert pixels to points for jsPDF
                const pxToPt = (px) => px * 72 / 96;
                const pdfWidth = pxToPt(canvasWidthPx);
                const pdfHeight = pxToPt(canvasHeightPx);
                const contentWidthPt = pxToPt(contentWidthPx);
                const contentHeightPt = pxToPt(contentHeightPx);
                const marginLeftPt = pxToPt(marginLeftPx);
                const marginTopPt = pxToPt(marginTopPx);
    
                // Initialize PDF
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt', // Points
                    format: [pdfWidth, pdfHeight]
                });
    
                // Capture and print the table content
                const canvas = await html2canvas(table, {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    backgroundColor: '#ffffff' // Ensures the background is white
                });
    
                const imgData = canvas.toDataURL('image/png');
    
                // Add image with margin
                pdf.addImage(imgData, 'PNG', marginLeftPt, marginTopPt, contentWidthPt, contentHeightPt);
    
                const pdfBlob = pdf.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');
            }
    
            const barcodeItem = Array.isArray(fetchedData) && fetchedData.length > 0 ? fetchedData[0] : null;
            if (!barcodeItem) {
                throw new Error('No data found to print');
            }
    
            const corporatecode = barcodeItem.fsn || barcodeItem.asin;
            const brand = barcodeItem.brand || barcodeItem.marketed_by;
            const manufacturedate = barcodeItem.month_and_year_of_manufacture || barcodeItem.date_of_manufacture;
    
            if (!corporatecode || !brand || !manufacturedate) {
                throw new Error('Missing data fields for saving print details');
            }
    
            // Add logic to fetch with token and refresh if needed
            const fetchWithToken = async (url, options = {}) => {
                let token = localStorage.getItem('accessToken');
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                };
    
                let response = await fetch(url, options);
    
                if (response.status === 403) {
                    token = await refreshToken();
                    options.headers['Authorization'] = `Bearer ${token}`;
                    response = await fetch(url, options);
                }
    
                return response;
            };
    
            const response = await fetchWithToken(`${API_BASE_URL}/mrp/saveprintdetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    corporatecode,
                    brand,
                    manufacturedate,
                    createdDate: new Date().toISOString(),
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save print details');
            }
    
            toast.success('Print details saved successfully');
            setTimeout(() => {
                setCorporateCode('');
                setSuccessMessage('');
                corporateCodeRef.current.focus();
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Error saving print details');
        } finally {
            setIsFormValid(true);
        }
    };
    
    
        
            

    const formattedData = formatData(fetchedData); // Use renamed variable
   
    const parseConsumerComplaints = (text) => {
        const complaints = {
          text: '',
          telNo: '',
          email: ''
        };
      
        // Regex for matching quoted text
        const textMatch = text.match(/"([^"]*)"/);
        if (textMatch) {
          complaints.text = textMatch[1];
        }
      
        // Regex for matching phone number
        const telNoMatch = text.match(/Tel No:\s*([\d-()]+)/);
        if (telNoMatch) {
          complaints.telNo = telNoMatch[1].trim();
        }
      
        // Regex for matching email
        const emailMatch = text.match(/Email:\s*([\w.-]+@[\w.-]+\.\w+)/);
        if (emailMatch) {
          complaints.email = emailMatch[1];
        }
      
        return complaints;
    };

    const filteredData = formattedData.filter(item =>
        !['ID', 'BARCODE', 'CREATED AT', 'UPDATED AT', 'FSN', 'MADE IN INDIA', 'REVIEW', 'CONSUMER COMPLAINTS CONTACT'].includes(item.key)
    );

    const barcodeItem = Array.isArray(fetchedData) && fetchedData.length > 0 ? fetchedData[0] : null; // Use renamed variable

    return (
        <div className='rounded'>
            <div className='row'>
                <div className='col-5 p-4 bg-white'>
                    <form autoComplete='off'>
                        <label className='pb-2'>Scan ASN/FSN</label>
                        <div className='position-relative'>
                            <input
                                type="text"
                                className='form-control mb-3'
                                name="corporateCode"
                                value={corporateCode}
                                onChange={(e) => setCorporateCode(e.target.value)}
                                onKeyPress={handleKeyPress} // Add onKeyPress handler
                                ref={corporateCodeRef}
                            />
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            {error && <img className='placeit-oninput' src={Cross} alt={error} />}
                            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                            {successMessage && <img className='placeit-oninput' src={Tick} alt={successMessage} />}
                        </div>
                        <button type="button" onClick={handlePrintAndSave} className='btn btn-primary'>
                            Print and Save 
                        </button>
                    </form>
                </div>
                <div className='col-7 p-4 bg-white'>
                    {/* Display Data in Table Format */}
                    {fetchedData && (
                        <div className='mt-4 mx-auto slot'style={{backgroundColor: '#cccccc', width: '345px', height: '535px', padding:'2px'}}>
                          {/* <ResizableBox
    height={dimensions.height}
    width={dimensions.width}
    onResize={onResize}
> */}
    <table
        ref={tableRef}
        className='printing-table bg-white'  
        style={{
            width: '335px',
            height: '516px',
            borderColor: '#000000',
            fontSize: '13px',
            wordBreak: 'break-word',
            margin: '10px 3px 5px 3px'
            
        }}
    >
                          <tbody>
                          {filteredData.length > 0 && !barcodeItem?.review ? (
    <>
        {barcodeItem?.sku && (
            <tr>
                <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
                SKU
                    </td>
                <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
                {barcodeItem.sku}
                    </td>
            </tr>
        )}
        {barcodeItem?.asin && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
             ASIN
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.asin}
                 </td>
         </tr>
        )}
         {barcodeItem?.name_of_the_commodity && barcodeItem?.brand ? (
             <tr style={{height: '65px'}}>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
             NAME OF THE COMMODITY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.name_of_the_commodity}
                 </td>
         </tr>
        ):(
            <tr style={{height: ''}}>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
             NAME OF THE COMMODITY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.name_of_the_commodity}
                 </td>
         </tr>
        )}
        {barcodeItem?.net_quantity && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
            NET QUANTITY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.net_quantity}
                 </td>
         </tr>
        )}
        {barcodeItem?.mrp && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           MRP
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.mrp}
                 </td>
         </tr>
        )}
        {barcodeItem?.month_and_year_of_manufacture && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           MONTH AND YEAR OF MANUFACTURE
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {currentMonthYear}
                 </td>
         </tr>
        )}
        {barcodeItem?.manufactured_packed_and_marketed_by && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           MANUFACTURED, PACKED AND MARKETED BY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.manufactured_packed_and_marketed_by}
                 </td>
         </tr>
        )}
        {barcodeItem?.manufactured_and_packed_by && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           MANUFACTURED AND PACKED BY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.manufactured_and_packed_by}
                 </td>
         </tr>
        )}
         {barcodeItem?.marketed_by && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           MARKETED BY
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.marketed_by}
                 </td>
         </tr>
        )}

{barcodeItem?.product_dimensions && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           PRODUCT DIMENSIONS
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.product_dimensions}
                 </td>
         </tr>
        )}
      

      {barcodeItem?.contact_customer_care_executive_at && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           CONTACT CUSTOMER CARE EXECUTIVE AT
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.contact_customer_care_executive_at}
                 </td>
         </tr>
        )}
        {barcodeItem?.unit_sale_price && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           UNIT SALE PRICE
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.unit_sale_price}
                 </td>
         </tr>
        )}
        {barcodeItem?.country_of_origin && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
           COUNTRY OF ORIGIN
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.country_of_origin}
                 </td>
         </tr>
        )}
        {barcodeItem?.brand && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000' }}>
          BRAND
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.brand}
                 </td>
         </tr>
        )}
      
      
    </>
) : (
    <tr className='d-none'>
        <td colSpan="2">No data available</td>
    </tr>
)}

{filteredData.length > 0 && barcodeItem?.review ? (
    <>
        {barcodeItem?.sku && (
            <tr>
                <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', borderBottom: '0px solid', textAlign: 'center', padding: '0.1rem 0.5rem !important', fontSize: '11px' }}>
                SKU
                    </td>
                <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '11px', borderBottom: '0px solid', padding: '0.1rem 0.5rem !important' }}>
                {barcodeItem.sku}
                    </td>
            </tr>
        )}
       
        
        {barcodeItem?.marketed_by && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', verticalAlign: 'middle', textAlign: 'center' }}>
            Marketed By
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '12px', lineHeight: '15.5px' }}>
             {barcodeItem.marketed_by}
                 </td>
         </tr>
        )}
        {barcodeItem?.manufactured_by && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', verticalAlign: 'middle', textAlign: 'center' }}>
           Manufactured By
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000' }}>
             {barcodeItem.manufactured_by}
                 </td>
         </tr>
        )}
        {barcodeItem?.date_of_manufacture && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', padding:'.03rem .1rem', textAlign: 'center', fontSize: '12px' }}>
           Date of Manufacture
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', padding:'.03rem .1rem', fontSize: '12px' }}>
             <span style={{paddingLeft: '10px'}}>{currentMonthYear}</span>
                 </td>
         </tr>
        )}
        {barcodeItem?.brand && (
             <tr style={{height: '10px'}}>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', textAlign: 'center', padding:'.03rem .1rem' }}>
          Brand
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', padding:'.03rem .1rem' }}>
             <span style={{paddingLeft: '10px'}}>  {barcodeItem.brand}</span>
                 </td>
         </tr>
        )}
        {barcodeItem?.net_quantity && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', textAlign: 'center', padding:'.03rem .1rem' }}>
          Net Quantity
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', padding:'.03rem .1rem' }}>
             <span style={{paddingLeft: '10px'}}> {barcodeItem.net_quantity}</span>
                 </td>
         </tr>
        )}
         {barcodeItem?.country_of_origin && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', textAlign: 'center', padding:'.03rem .1rem' }}>
           Country of Origin
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', padding:'.03rem .1rem' }}>
             <span style={{paddingLeft: '10px'}}>{barcodeItem.country_of_origin}</span>
                 </td>
         </tr>
        )}

{barcodeItem?.mrp && (
             <tr>
             <td style={{ width: '40%', borderLeft: '1px solid',  borderTop: '1px solid',  color: '#000000', textAlign: 'center', padding:'.03rem .1rem' }}>
           MRP
                 </td>
             <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '12px', padding:'.03rem .1rem' }}>
             {barcodeItem.mrp}
                 </td>
         </tr>
        )}
      
      
    </>
) : (
    <tr className='d-none'>
        <td colSpan="2"></td>
    </tr>
)}
                                     {barcodeItem?.consumer_complaints_contact && (
                                        <>
                                            {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).text && (
                                                <tr>
                                                    <td style={{ borderLeft: '1px solid', borderTop: '1px solid', verticalAlign: 'middle' }} rowSpan={3}>
                                                        "For Consumer Complaints"
                                                    </td>
                                                    <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '10px', lineHeight: '14px' }}>
                                                        "{parseConsumerComplaints(barcodeItem.consumer_complaints_contact).text}"
                                                    </td>
                                                </tr>
                                            )}
                                            {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).telNo || parseConsumerComplaints(barcodeItem.consumer_complaints_contact).email ? (
                                                <>
                                                    {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).telNo && (
                                                        <tr>
                                                            <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '12px', padding:'.07rem .15rem' }}>
                                                            <span style={{paddingLeft: '10px'}}> Tel no: {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).telNo}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).email && (
                                                        <tr>
                                                            <td style={{ width: '60%', borderLeft: '1px solid',  borderTop: '1px solid', borderRight: '1px solid', color: '#000000', fontSize: '12px', padding:'.07rem .15rem' }}>
                                                                E-mail: {parseConsumerComplaints(barcodeItem.consumer_complaints_contact).email}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ) : (
                                                <tr>
                                                    <td colSpan={2}>No additional contact information available</td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                    {barcodeItem && barcodeItem.review && (
                                        <tr>
                                            <td style={{ borderTop: '1px solid', borderLeft:'1px solid', borderRight: '1px solid', padding:'.07rem .15rem' }} colSpan={2}>
                                                <div style={{ textAlign: 'center' }}>
                                                    {barcodeItem.review}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={{ border: '1px solid',  padding: '.1rem, .15rem' }} colSpan={2}>
                                            {barcodeItem && barcodeItem.barcode ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <img
                                                        src={`data:image/png;base64,${barcodeItem.barcode}`}
                                                        alt={barcodeItem.asin}
                                                        height={50}
                                                        width="75%"
                                                        style={{margin: '2px'}}
                                                    />
                                                    <div style={{ fontSize: '15px', marginTop: '2px' }}>
                                                        {barcodeItem.fsn || 'MADE IN INDIA'}
                                                    </div>
                                                </div>
                                            ) : (
                                                'No Barcode'
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* </ResizableBox> */}
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className="modal-ne"
                overlayClassName="modalne-overlay"
            >
                <div className="modalne-body">
                    <p>{modalMessage}</p>
                    <button className="btn btn-primary w-100" onClick={closeModal}>Close</button>
                </div>
            </Modal>
        </div>
    );
};

export default PrintMrp;
