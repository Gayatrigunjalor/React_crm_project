import { Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import Unicon from '../base/Unicon';
import {
  Icon,
  UilEnvelope,
  UilEnvelopeBlock,
  UilEnvelopeCheck,
  UilEnvelopeOpen,
  UilEnvelopeUpload,
  UilEnvelopes,
  UilUserCheck, 
  UilUserTimes, 
  UilLock, 
  UilBox, 
  UilCheckCircle, 
  UilBan 
} from '@iconscout/react-unicons';
import { useState, useEffect } from 'react';
import axiosInstance from '../../../js/axios';

interface StatType {
  id: number;
  icon: Icon;
  iconColor: string;
  count: string;
  title: string;
  apiField?: string;
  apiField2?: string; 
}

const AnalyticsStats = () => {
  const [stats, setStats] = useState<StatType[]>([
    { id: 1, icon: UilUserCheck, iconColor: 'success', count: '0', title: 'Active Employees', apiField: 'active' },
    { id: 2, icon: UilUserTimes, iconColor: 'danger', count: '0', title: 'Inactive Employees', apiField: 'inactive' },
    { id: 3, icon: UilBox, iconColor: 'info', count: '0', title: 'Total Assets', apiField: 'totalAssetCount' },
    { id: 4, icon: UilCheckCircle, iconColor: 'success', count: '0', title: 'Assigned Assets', apiField: 'assignedAssetCount' },
    { id: 5, icon: UilBan, iconColor: 'danger', count: '0', title: 'Unassigned Assets', apiField: 'unassignedAssetCount' },
    { id: 6, icon: UilLock, iconColor: 'primary', count: '0', title: 'Total Credentials', apiField: 'totalCredentialCount' },
    { id: 7, icon: UilLock, iconColor: 'success', count: '0', title: 'Assigned Credentials', apiField: 'assignedCredentialCount' },
    { id: 8, icon: UilLock, iconColor: 'danger', count: '0', title: 'Unassigned Credentials', apiField: 'UnassignedCredentialCount' },
    { id: 9, icon: UilEnvelopeOpen, iconColor: 'info', count: '0', title: 'Total Procurements', apiField: 'totalProcurementCount' },
    { id: 10, icon: UilEnvelopeCheck, iconColor: 'success', count: '0', title: 'Total Business Tasks', apiField: 'businessTasksCount' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          '/fetchEmployeeCounts', 
          '/fetchAssetsCount', 
          '/fetchCredentialsCount',
          '/fetchProcurementCount',
          '/fetchBusinessTaskCount',
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            const response = await axiosInstance.get(endpoint);
            return response.data;
          })
        );

        setStats((prevStats) => {
          const updatedStats = [...prevStats];
          let statIndex = 0; // Index to track which stat is being updated

          for (let i = 0; i < endpoints.length; i++) {
            const result = results[i];

            if (i === 0) { // Employee Counts
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.active || 0) };
              statIndex++;
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.inactive || 0) };
              statIndex++;

            } else if (i === 1) { // Asset Counts
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.totalAssetCount || 0) };
              statIndex++;
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.assignedAssetCount || 0) };
              statIndex++;
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.unassignedAssetCount || 0) };
              statIndex++;
            }
            else if (i === 2) { // Credentials Counts
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.totalCredentialCount || 0) };
              statIndex++;
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.assignedCredentialCount || 0) };
              statIndex++;
              updatedStats[statIndex] = { ...updatedStats[statIndex], count: String(result.unassignedCredentialCount || 0) };
              statIndex++;
            }
             else { // other endpoints
              const stat = updatedStats[statIndex];
              let count = '0';
              if (result) {
                if (typeof result === 'object' && stat.apiField) {
                  count = result[stat.apiField] || '0';
                } else if (typeof result === 'number') {
                  count = String(result);
                } else if (typeof result === 'object' && result.data && stat.apiField) {
                  count = result.data[stat.apiField] || '0';
                } else if (typeof result === 'object' && result.data && !stat.apiField) {
                  count = result.data || '0';
                } else {
                  count = String(result);
                }
              }
              updatedStats[statIndex] = { ...stat, count: String(count) };
              statIndex++;
            }
          }

          return updatedStats;
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        for (let i = 0; i < stats.length; i++) {
          setStats(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], count: '0' };
            return updated;
          });
        }
      }
    };

    fetchData();
  }, []);


  return (
    <Row className="justify-content-between">
      {stats.map((stat, index) => (
        <Col
          key={stat.id}
          xs={6}
          md={4}
          xxl={2}
          className={classNames(
            'text-center border-start-xxl border-translucent', 
            {
             'border-end border-bottom pb-4': index % 3 !== 2, 
              'border-bottom pb-4': index % 3 === 2 && index < 9, 
              'border-end-md': index % 3 !== 2 && index < 9, 
              'pt-4': index >= 6, 
              'pb-md-4': index >= 6 && index < 9,
              'border-end-xxl': index % 3 !== 2, 
              'pb-xxl-0': true, 
              'pt-xxl-0': true, 
            }
          )}
        >
          <Stat data={stat} />
        </Col>
      ))}
    </Row>
  );
};


const Stat = ({ data }: { data: StatType }) => {
  return (
    <>
      <Unicon
        icon={data.icon}
        className={`text-${data.iconColor} mb-1`}
        size={31.25}
      />
      <h1 className="fs-5 mt-3">{data.count}</h1>
      <p className="fs-9 mb-0">{data.title}</p>
    </>
  );
};

export default AnalyticsStats;