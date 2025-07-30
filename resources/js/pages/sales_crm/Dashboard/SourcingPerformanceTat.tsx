import React, { useEffect, useState } from 'react';
import { Card, Form, OverlayTrigger } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend
} from 'recharts';

interface Employee {
  id: number;
  name: string;
}

interface TATData {
  employee_id: number;
  employee_name: string;
  under_tat: number;
  tat_exceed: number;
}

const SourcingPerformanceTarget = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<number | ''>('');
  const [tatData, setTatData] = useState<TATData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch sales employees on mount
    axiosInstance.get('/getSalesEmployees')
      .then(res => {
        setEmployees(res.data.employees || []);
      })
      .catch(() => setEmployees([]));
  }, []);

  useEffect(() => {
    if (selectedEmpId !== '') {
      setLoading(true);
      axiosInstance.get(`/getTATDataFromSales?id=${selectedEmpId}`)
        .then(res => {
          setTatData(res.data || []);
        })
        .catch(() => setTatData([]))
        .finally(() => setLoading(false));
    } else {
      setTatData([]);
    }
  }, [selectedEmpId]);

  // Tooltip Component
  const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { employee_name, under_tat, tat_exceed } = payload[0].payload;
      const total = under_tat + tat_exceed;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{employee_name}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Under TAT: {under_tat}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f1cfff' }}>●</span> TAT Exceed: {tat_exceed}</p>
          <strong>Total Sourcing Assigned: {total}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: '35rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Sourcing Performance Status Tracker - TAT Wise</h5>
        <Form.Select
          style={{ width: 250, height: '50px', fontSize: '1rem' }}
          className="mb-4"
          value={selectedEmpId}
          onChange={e => setSelectedEmpId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Select a Sales Person</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </Form.Select>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        {/* Custom legend */}
        <div className="d-flex gap-3 mb-3">
          <div><span style={{ color: '#3b2fdb' }}>●</span>Under TAT</div>
          <div><span style={{ color: '#f1cfff' }}>●</span>TAT Exceed</div>
        </div>

        <ResponsiveContainer>
          <BarChart
            data={tatData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="employee_name"
              label={{ value: "Sales Person Name", position: "bottom", offset: 20 }}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <div
                        style={{
                          backgroundColor: 'rgba(42, 41, 41, 0.9)',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {payload.value}
                      </div>
                    }
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
              )}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="under_tat" stackId="a" fill="#3b2fdb" name="Under TAT" barSize={30}>
              <LabelList dataKey="under_tat" position="insideTop" fill="#fff" style={{ fontSize: "0.6rem" }} />
            </Bar>
            <Bar dataKey="tat_exceed" stackId="a" fill="#f1cfff" name="TAT Exceed" barSize={30}>
              <LabelList dataKey="tat_exceed" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {loading && <div className="text-center mt-3">Loading...</div>}
        {!loading && tatData.length === 0 && selectedEmpId !== '' && (
          <div className="text-center mt-3">No data available for this employee.</div>
        )}
      </div>
    </Card>
  );
};

export default SourcingPerformanceTarget;
