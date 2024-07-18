import React from 'react';
import Sidebar from './components/sidebar';
import DashboardData from './components/dashboardData';

const Dashboard = () => {
    return (
        <div className='d-flex w-100 overflow-hidden'>
        <div className='asidebar'>
            <Sidebar/>
        </div>
        <div className='main-content'>
       <div className='d-flex align-items-center justify-content-between mb-4'>
        <h2>Dashboard</h2>  

        

     
</div>
<DashboardData />
        
       
    </div>


    </div>
    );
}

export default Dashboard;
