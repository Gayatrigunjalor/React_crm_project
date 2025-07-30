import React, { useEffect, useState } from 'react';
import { Card, OverlayTrigger, Tooltip, Form, Spinner } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import axiosInstance from '../../../axios';

interface EmployeeOption {
  id: number;
  name: string;
}

interface SourcingData {
  employee_id: number;
  employee_name: string;
  sourcing_done: number;
  sourcing_not_done: number;
}

const ProductSourcingTeam = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [sourcingData, setSourcingData] = useState<SourcingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  useEffect(() => {
    setDropdownLoading(true);
    axiosInstance.get('/getCnsEmployees')
      .then(res => {
        setEmployees(res.data.employees || []);
      })
      .catch(() => setEmployees([]))
      .finally(() => setDropdownLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      setLoading(true);
      axiosInstance.get(`/getSalesSourcingDataFromCNS?id=${selectedEmployeeId}`)
        .then(res => {
          setSourcingData(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setSourcingData([]))
        .finally(() => setLoading(false));
    } else {
      setSourcingData([]);
    }
  }, [selectedEmployeeId]);

  const totalAssigned = Array.isArray(sourcingData)
    ? sourcingData.reduce((sum, e) => sum + e.sourcing_done + e.sourcing_not_done, 0)
    : 0;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.employee_name}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Sourcing Done: {data.sourcing_done}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Sourcing Not Done: {data.sourcing_not_done}</p>
        </div>
      );
    }
    return null;
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedEmployeeId(value);
    setLoading(true); // Show spinner immediately on change
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-start">Sales Person Productivity Tracker: Assigned V/S Unassigned Sourcing</h5>
        <h6>Product Sourcing Required: <span className="fw-bold">{totalAssigned.toLocaleString()}</span></h6>
      </div>

      <Form.Select
        style={{ width: 250 }}
        className="mb-4"
        value={selectedEmployeeId ?? ''}
        onChange={handleEmployeeChange}
        disabled={dropdownLoading || loading}
      >
        <option value="">Select CNS Employee</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.id}>{emp.name}</option>
        ))}
      </Form.Select>

      <div style={{ width: '100%', height: 400 }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" />
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={sourcingData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barCategoryGap={20}
            >
              <defs>
                <linearGradient id="doneGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b2fdb" />
                  <stop offset="100%" stopColor="#2a1f9f" />
                </linearGradient>
                <linearGradient id="notDoneGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c17cff" />
                  <stop offset="100%" stopColor="#a65fd2" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="employee_name"
                label={{ value: "Sales Person Productivity", position: "bottom", offset: 20 }}
                tick={({ x, y, payload }) => {
                  const fullName = payload.value;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id={`tooltip-${payload.value}`}>{fullName}</Tooltip>}
                      >
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="middle"
                          fill="#666"
                          fontSize="0.8rem"
                          style={{ cursor: 'pointer' }}
                        >
                          {payload.value}
                        </text>
                      </OverlayTrigger>
                    </g>
                  );
                }}
              />

              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={76} />

              <Bar dataKey="sourcing_done" stackId="a" fill="url(#doneGradient)" name="Sourcing Done" barSize={20}>
                <LabelList dataKey="sourcing_done" position="insideTop" fill="#fff" style={{ fontSize: "0.6rem" }} />
              </Bar>
              <Bar dataKey="sourcing_not_done" stackId="a" fill="url(#notDoneGradient)" name="Sourcing Not Done" barSize={20}>
                <LabelList dataKey="sourcing_not_done" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default ProductSourcingTeam;
