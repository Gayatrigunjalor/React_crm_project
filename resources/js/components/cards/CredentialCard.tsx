import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../js/axios';
import CredentialTopChart from '../charts/e-charts/CredentialTopChart';
import { Card } from 'react-bootstrap';

const  CredentialCard = () => {
 
  const [totalCount, setTotalCredentialCount] = useState(0);
  const [assignedCount, setAssignedAssetCount] = useState(0);
  const [unassignedCount, setUnAssignedAssetCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const endpoints = [
          '/fetchCredentialsCount', 
        ];

      
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axiosInstance.get(endpoint);
            return response.data;
          })
        );

       
        const { totalCredentialCount,totalAssignedCount, totalUnassignedCount } = results[0];
     
        // Update the state with the fetched counts
        setTotalCredentialCount(totalCredentialCount);
        setAssignedAssetCount(totalAssignedCount);
        setUnAssignedAssetCount(totalUnassignedCount);
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
            <h5 className="mb-2">Total Credentials</h5>
          </div>
        </div>
        <div className="pb-4 pt-3">
        <CredentialTopChart totalCount={totalCount} assignedCount={assignedCount} unassignedCount={unassignedCount} />
        </div>
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Assigned Credentials
            </h6>
            <h6 className="text-body fw-semibold mb-0">{assignedCount}</h6>
          </div>
          <div className="d-flex align-items-center mb-2">
            <div className="bullet-item bg-primary-lighter me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
              Unassigned Credentials
            </h6>
            <h6 className="text-body fw-semibold mb-0">{unassignedCount}</h6>
          </div>
            <div className="d-flex align-items-center">
            <div className="bullet-item bg-info-dark me-2" />
            <h6 className="text-body fw-semibold flex-1 mb-0">
             Total Credentials
            </h6>
            <h6 className="text-body fw-semibold mb-0">{totalCount}</h6>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CredentialCard;
