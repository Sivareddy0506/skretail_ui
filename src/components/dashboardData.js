import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const DashboardData = () => {
  const [productCount, setProductCount] = useState(0);
  const [dispatchCount, setDispatchCount] = useState(0);
  const [productCountByDate, setProductCountByDate] = useState([]);
  const [dispatchCountByDate, setDispatchCountByDate] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setProductCount(data.productCount);
      setDispatchCount(data.dispatchCount);
      setProductCountByDate(fillMissingDates(data.productCountByDate));
      setDispatchCountByDate(fillMissingDates(data.dispatchCountByDate));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error appropriately, e.g., show error message
    }
  };

  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date;
  };

  const fillMissingDates = (data) => {
    const filledData = [];
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentDate = new Date(sortedData[0].date);

    // Add zero counts for 2 days before the first data point
    for (let i = 2; i > 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      filledData.push({ date: date.toISOString(), count: 0 });
    }

    // Fill in missing dates within the data range
    for (let i = 0; i < sortedData.length; i++) {
      const dataDate = new Date(sortedData[i].date);
      while (currentDate < dataDate) {
        filledData.push({ date: currentDate.toISOString(), count: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      filledData.push(sortedData[i]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add zero counts for 1 day after the last data point
    const endDate = new Date(sortedData[sortedData.length - 1].date);
    for (let i = 1; i <= 1; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() + i);
      filledData.push({ date: date.toISOString(), count: 0 });
    }

    return filledData;
  };

  const commonOptions = {
    chart: {
      height: 280,
      type: 'area',
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#760000',
            opacity: 1,
          },
          {
            offset: 100,
            color: '#000000',
            opacity: 1,
          },
        ],
      },
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      curve: 'smooth',
      width: [0, 2],
    },
    colors: ['#760000', '#000000'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return y.toFixed(0);
          }
          return y;
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 10,
      labels: {
        formatter: function (value) {
          return Math.round(value).toString();
        },
      },
    },
  };

  const productOptions = {
    ...commonOptions,
    xaxis: {
      ...commonOptions.xaxis,
      categories: productCountByDate.map(entry => convertToIST(entry.date).getTime()),
    },
  };

  const dispatchOptions = {
    ...commonOptions,
    xaxis: {
      ...commonOptions.xaxis,
      categories: dispatchCountByDate.map(entry => convertToIST(entry.date).getTime()),
    },
  };

  const productSeries = [
    {
      name: 'Product Count',
      data: productCountByDate.map(entry => [convertToIST(entry.date).getTime(), entry.count]),
    },
  ];

  const dispatchSeries = [
    {
      name: 'Dispatch Count',
      data: dispatchCountByDate.map(entry => [convertToIST(entry.date).getTime(), entry.count]),
    },
  ];

  return (
    <div className="dashboard">
      <div className="row mb-4">
        <div className="col-6">
          <div className="count-card products">
            <h3>Total Products</h3>
            <p>{productCount}</p>
          </div>
        </div>
        <div className="col-6">
          <div className="count-card dispatches">
            <h3>Dispatch Count</h3>
            <p>{dispatchCount}</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="border">
            <div className="bg-light p-3 border-bottom">
              <h3>Products</h3>
            </div>
            <div className="area-chart">
              <Chart options={productOptions} series={productSeries} type="area" height={400} />
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="border">
            <div className="bg-light p-3 border-bottom">
              <h3>Dispatches</h3>
            </div>
            <div className="area-chart">
              <Chart options={dispatchOptions} series={dispatchSeries} type="area" height={400} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardData;
