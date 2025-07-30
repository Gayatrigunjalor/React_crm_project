import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
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
import axiosInstance from '../../../axios';

interface Employee {
  id: number;
  name: string;
}

interface TargetCostData {
  employee_id: number;
  employee_name: string;
  under_target_cost: number;
  target_cost_exceed: number;
  target_cost_not_assigned: number;
}

const SourcingPerformanceTarget = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<TargetCostData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees for dropdown
  useEffect(() => {
    axiosInstance.get<{ employees: Employee[] }>('/getSalesEmployees')
      .then((res) => {
        setEmployees(res.data.employees || []);
      })
      .catch(() => setEmployees([]));
  }, []);

  // Fetch chart data when employee changes
  useEffect(() => {
    if (selectedEmployeeId === null) {
      setChartData([]);
      return;
    }
    setLoading(true);
    const url = `/getTargetCostDataFromSales?id=${selectedEmployeeId}`;
    axiosInstance.get<TargetCostData[]>(url)
      .then((res) => {
        setChartData(res.data || []);
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [selectedEmployeeId]);

  // Tooltip Component
  interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
  }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const fullName = payload[0].payload.employee_name;
      const undertargetcost = payload.find((p: any) => p.dataKey === 'under_target_cost')?.value || 0;
      const costassigned = payload.find((p: any) => p.dataKey === 'target_cost_not_assigned')?.value || 0;
      const costexceed = payload.find((p: any) => p.dataKey === 'target_cost_exceed')?.value || 0;
      const total = undertargetcost + costassigned + costexceed;

      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Under Target Cost: {undertargetcost}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Target Cost Not Assigned: {costassigned}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f1cfff' }}>●</span> Target Cost Exceed: {costexceed}</p>
          <strong>Total Sourcing Assigned: {total}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: '35rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Sourcing Performance Status Tracker - Target Cost Wise</h5>
        <Form.Select
          style={{ width: 250, height: '50px', fontSize: '1rem' }}
          className="mb-4"
          value={selectedEmployeeId ?? ''}
          onChange={e => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : null)}
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
          <div><span style={{ color: '#3b2fdb' }}>●</span> Under Target Cost</div>
          <div><span style={{ color: '#c17cff' }}>●</span> Target Cost Not Assigned</div>
          <div><span style={{ color: '#f1cfff' }}>●</span> Target Cost Exceed</div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <Spinner animation="border" />
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="employee_name" label={{ value: "CNS Person Name", position: "bottom", offset: 20 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="under_target_cost" stackId="a" fill="#3b2fdb" name="Under Target Cost" barSize={30} minPointSize={2}>
                <LabelList dataKey="under_target_cost" position="top" fill="#3b2fdb" style={{ fontSize: "0.7rem" }} />
              </Bar>
              <Bar dataKey="target_cost_not_assigned" stackId="a" fill="#c17cff" name="Target Cost Not Assigned" barSize={30} minPointSize={2}>
                <LabelList dataKey="target_cost_not_assigned" position="top" fill="#c17cff" style={{ fontSize: "0.7rem" }} />
              </Bar>
              <Bar dataKey="target_cost_exceed" stackId="a" fill="#f1cfff" name="Target Cost Exceed" barSize={30} minPointSize={2}>
                <LabelList dataKey="target_cost_exceed" position="top" fill="#f1cfff" style={{ fontSize: "0.7rem" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default SourcingPerformanceTarget;
