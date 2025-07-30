import React, { useEffect, useState } from 'react';
import {
  Card, Form, OverlayTrigger, Tooltip, Spinner,
} from 'react-bootstrap';
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

// Function to shade colors for 3D effect
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(((R * (100 + percent)) / 100).toString());
  G = parseInt(((G * (100 + percent)) / 100).toString());
  B = parseInt(((B * (100 + percent)) / 100).toString());

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

// Custom 3D Bar component
const Custom3DBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const depth = 6;
  const sideColor = shadeColor(fill, -20);
  const topColor = shadeColor(fill, 20);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} pointerEvents="none" />
      <polygon
        points={`${x + width},${y} ${x + width + depth},${y - depth} ${x + width + depth},${y + height - depth} ${x + width},${y + height}`}
        fill={sideColor}
        pointerEvents="none"
      />
      <polygon
        points={`${x},${y} ${x + depth},${y - depth} ${x + width + depth},${y - depth} ${x + width},${y}`}
        fill={topColor}
        pointerEvents="none"
      />
    </g>
  );
};

// Tooltip content on hover
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="fw-bold mb-1">{data.employee_name}</p>
        <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Sourcing Done: {data.sourcing_done}</p>
        <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Sourcing Not Done: {data.sourcing_not_done}</p>
        <strong>Total Sourcing Assigned: {data.sourcing_done + data.sourcing_not_done}</strong>
      </div>
    );
  }
  return null;
};

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

// Main Component
const ProductSourcingTeam = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [sourcingData, setSourcingData] = useState<SourcingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  useEffect(() => {
    setDropdownLoading(true);
    axiosInstance.get('/getSalesEmployees')
      .then(res => {
        setEmployees(res.data.employees || []);
      })
      .catch(() => setEmployees([]))
      .finally(() => setDropdownLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      setLoading(true);
      axiosInstance.get(`/getCnsSourcingDataFromSales?id=${selectedEmployeeId}`)
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

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedEmployeeId(value);
    setLoading(true); // Show spinner immediately on change
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: '35rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Product Sourcing Done V/S Not Done</h5>
        <h6>Total Sourcing Assigned <span className="fw-bold">{totalAssigned.toLocaleString()}</span></h6>
      </div>

      <Form.Select
        style={{ width: 250 }}
        className="mb-4"
        value={selectedEmployeeId ?? ''}
        onChange={handleEmployeeChange}
        disabled={dropdownLoading || loading}
      >
        <option value="">Select Sales Employee</option>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="employee_name"
                label={{ value: "CNS Person Productivity", position: "bottom", offset: 20 }}
                tick={({ x, y, payload }: any) => {
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
              <Bar
                dataKey="sourcing_done"
                stackId="a"
                fill="#3b2fdb"
                name="Sourcing Done"
                barSize={20}
                shape={<Custom3DBar />}
              >
                <LabelList dataKey="sourcing_done" position="insideTop" fill="#fff" style={{ fontSize: "0.6rem" }} />
              </Bar>
              <Bar
                dataKey="sourcing_not_done"
                stackId="a"
                fill="#c17cff"
                name="Sourcing Not Done"
                barSize={20}
                shape={<Custom3DBar />}
              >
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
