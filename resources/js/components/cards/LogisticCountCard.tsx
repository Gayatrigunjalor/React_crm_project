import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../js/axios';
import LogisticCountCardChart from '../charts/e-charts/LogisticCountCardChart';
import { Card } from 'react-bootstrap';

const LogisticCountCard = () => {
  // State to store the active and inactive employee counts
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [irmCount, setIrmCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Define the API endpoint
        const endpoints = [
          '/getLogisticsCount', // Replace with your actual endpoint
        ];

        // Fetch data from the API
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axiosInstance.get(endpoint);
            return response.data;
          })
        );

        // Assuming the data structure contains active and inactive counts
        const { invoiceCount, irmCount } = results[0];

        // Update the state with the fetched counts
        setInvoiceCount(invoiceCount);
        setIrmCount(irmCount);
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
            <h5 className="mb-2">Total Logistics</h5>
          </div>
        </div>
        <div className="pb-4 pt-3">
        <LogisticCountCardChart invoiceCount={invoiceCount} irmCount={irmCount} />
        </div>
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
             Invoice Logistics
            </h6>
            <h6 className="text-body fw-semibold mb-0">{invoiceCount}</h6>
          </div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary-lighter me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              IRM Logistics
            </h6>
            <h6 className="text-body fw-semibold mb-0">{irmCount}</h6>
          </div>
            <div className="d-flex align-items-center">
            <div className="bullet-item bg-info-dark me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
             Total Logistics
            </h6>
            <h6 className="text-body fw-semibold mb-0">{invoiceCount+irmCount}</h6>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LogisticCountCard;
