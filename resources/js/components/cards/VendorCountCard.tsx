import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../js/axios';
import VendorCountTopChart from '../charts/e-charts/VendorCountTopChart';
import { Card } from 'react-bootstrap';

const  VendorCountCard = () => {
 
  const [count, setTotalVendorCount] = useState(0);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const endpoints = [
          '/getVendorsCount', 
        ];

      
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axiosInstance.get(endpoint);
            return response.data;
          })
        );

       
        // const { businessTasksCount } = results[0];
     
        // Update the state with the fetched counts
        setTotalVendorCount(results[0]);
      
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <h5 className="mb-2">Total Vendors</h5>
          </div>
        </div>
        <div className="pb-4 pt-3">
        <VendorCountTopChart totalCount={count}  />
        </div>
        <div>
            <div className="d-flex align-items-center">
            <div className="bullet-item bg-info-dark me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
             Total Vendors
            </h6>
            <h6 className="text-body fw-semibold mb-0">{count}</h6>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default  VendorCountCard;
