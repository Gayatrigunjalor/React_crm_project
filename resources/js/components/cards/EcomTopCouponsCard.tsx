import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../js/axios';
import EcomTopCouponsChart from '../charts/e-charts/EcomTopCouponsChart';
import { Card } from 'react-bootstrap';

const EcomTopCouponsCard = () => {
  // State to store the active and inactive employee counts
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Define the API endpoint
        const endpoints = [
          '/fetchEmployeeCounts', // Replace with your actual endpoint
        ];

        // Fetch data from the API
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axiosInstance.get(endpoint);
            return response.data;
          })
        );

        // Assuming the data structure contains active and inactive counts
        const { active, inactive } = results[0];

        // Update the state with the fetched counts
        setActiveCount(active);
        setInactiveCount(inactive);
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
            <h5 className="mb-2">Total Employees</h5>
          </div>
        </div>
        <div className="pb-4 pt-3">
        <EcomTopCouponsChart activeCount={activeCount} inactiveCount={inactiveCount} />
        </div>
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Active Employees
            </h6>
            <h6 className="text-body fw-semibold mb-0">{activeCount}</h6>
          </div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary-lighter me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Inactive Employees
            </h6>
            <h6 className="text-body fw-semibold mb-0">{inactiveCount}</h6>
          </div>
            <div className="d-flex align-items-center">
            <div className="bullet-item bg-info-dark me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
             Total Employees
            </h6>
            <h6 className="text-body fw-semibold mb-0">{activeCount+inactiveCount}</h6>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EcomTopCouponsCard;
