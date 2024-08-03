import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './../assets/images/sk_logo.png';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logging out...'); // Debugging log
        localStorage.clear(); // Update the key here
        navigate('/login'); // Redirect to the login page after logout
    };
 

    // Debugging: Check the token on component render
    React.useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                console.log('Current user:', user);
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        } else {
            console.log('User not found in localStorage');
        }
    }, []);
   

    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            console.log('User data:', user);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    } else {
        console.log('No user data found');
    }
    


    return (
        <div className="sidebar position-relative">
            <div className="logo">
                <img src={Logo} alt="Logo" width={100} height={100} />
            </div>
            <ul className="menu ">
                <li><Link to="/"><div className='d-flex justify-content-start align-items-center'><i className='dashboard-icon'></i> Dashboard </div></Link></li>
                <li><Link to="/products"><div className='d-flex justify-content-start align-items-center'><i className='products-icon'></i> Products</div></Link></li>
                <li><Link to="/dispatches"><div className='d-flex justify-content-start align-items-center'><i className='dispatches-icon'></i>  Quality Control</div></Link></li>
                <li><Link to="/mrp"><div className='d-flex justify-content-start align-items-center'><i className='mrp-icon'></i> MRP Data</div></Link></li>
                <li><Link to="/mrpbarcodes"><div className='d-flex justify-content-start align-items-center'><i className='barcode-icon'></i>  MRP Barcodes</div></Link></li>
            </ul>
            <div className="logout "
                onClick={handleLogout}><div className='d-flex justify-content-start align-items-center'> <i className='logout-icon'></i> Logout</div>
            </div>
        </div>
    );
}

export default Sidebar;
