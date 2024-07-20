import React from 'react';
import { Link, useNavigate} from 'react-router-dom';
import Logo from './../assets/images/sk_logo.png'


const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Replace 'token' with your actual token key
        navigate('/login'); // Redirect to the login page after logout
    };

    return (
        <div className="sidebar position-relative">
            <div className="logo">
                <img src={Logo} alt="Logo" width={100} height={100} />
            </div>
            <ul className="menu ">
                <li><Link to="/"><div className='d-flex justify-content-start align-items-center'><i className='dashboard-icon'></i> Dashboard </div></Link></li>
                <li><Link to="/products"><div className='d-flex justify-content-start align-items-center'><i className='products-icon'></i> Products</div></Link></li>
                <li><Link to="/dispatches"><div className='d-flex justify-content-start align-items-center'><i className='dispatches-icon'></i>  Quality Control</div></Link></li>
            </ul>
            <div className="logout "
                onClick={handleLogout}><div className='d-flex justify-content-start align-items-center'> <i className='logout-icon'></i> Logout</div>
            </div>
        </div>
    );
}

export default Sidebar;
