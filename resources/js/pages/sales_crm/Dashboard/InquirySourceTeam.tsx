import React, { useState, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
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

// Type definitions
interface PlatformStats {
  online_inquiries?: number;
  offline_inquiries?: number;
  total_inquiries?: number;
  [key: string]: any;
}

interface EmployeeData {
  employee_name: string;
  platform_wise_stats: {
    [platform: string]: PlatformStats;
  };
}

interface InquirySourceTeamProps {
  teamInquiryBySourceData: EmployeeData[];
}

interface ChartData {
  name: string;
  online?: number;
  offline?: number;
  manual?: number;
}

// Custom 3D bar shape
const ThreeDBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const shadowColor = "#ccc";
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} ry={3} />
      <path
        d={`M${x + width},${y} L${x + width + 4},${y + 4} \
            L${x + width + 4},${y + height + 4} \
            L${x + width},${y + height} Z`}
        fill={shadowColor}
        opacity={0.4}
      />
    </g>
  );
};

// Tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    // Find which bar is being hovered
    const hoveredDataKey = payload[0]?.dataKey;
    if (hoveredDataKey === 'manual') {
      const manual = payload.find((p) => p.dataKey === 'manual')?.value || 0;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p style={{ margin: 0 }}><span style={{ color: '#ffb347' }}>●</span> Manual: {manual}</p>
          <strong>Total Inquiries by Source: {manual}</strong>
        </div>
      );
    } else {
      const online = payload.find((p) => p.dataKey === 'online')?.value || 0;
      const offline = payload.find((p) => p.dataKey === 'offline')?.value || 0;
      const total = online + offline;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p style={{ margin: 0 }}><span style={{ color: '#9f68f8' }}>●</span> Online: {online}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f1cfff' }}>●</span> Offline: {offline}</p>
          <strong>Total Inquiries by Source: {total}</strong>
        </div>
      );
    }
  }
  return null;
};

// Map platform names
const platformNameMapper = (name: string) => {
  switch (name.toLowerCase()) {
    case 'purvee':
      return 'CH-i7PRV';
    case 'inorbvict':
      return 'CH-i7IRB';
    case 'vortex':
      return 'CH-i7VX';
    case 'tradeindia':
      return 'Trade Inquiry';
    case 'manual':
      return 'Manual';
    default:
      return name;
  }
};

// Main component
const InquirySourceTeam: React.FC<InquirySourceTeamProps> = ({ teamInquiryBySourceData }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [employeeOptions, setEmployeeOptions] = useState<string[]>([]);
  const [employeeChartData, setEmployeeChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (teamInquiryBySourceData?.length > 0) {
      const names = teamInquiryBySourceData.map(emp => emp.employee_name);
      setEmployeeOptions(names);

      const defaultEmployee = teamInquiryBySourceData[0];
      setSelectedEmployee(defaultEmployee.employee_name);
      updateChartData(defaultEmployee);
    }
  }, [teamInquiryBySourceData]);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedEmployee(name);
    const employee = teamInquiryBySourceData.find((emp) => emp.employee_name === name);
    if (employee) {
      updateChartData(employee);
    }
  };

  const updateChartData = (employee: EmployeeData) => {
    const platformStats = employee.platform_wise_stats;
    const data: ChartData[] = Object.entries(platformStats).map(([platform, stats]) => {
      if (platform.toLowerCase() === 'manual') {
        return {
          name: platformNameMapper(platform),
          manual: stats.total_inquiries || 0,
        };
      }
      return {
        name: platformNameMapper(platform),
        online: stats.online_inquiries || 0,
        offline: stats.offline_inquiries || 0,
      };
    });
    setEmployeeChartData(data);
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: '35rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Inquiry By Source</h5>
        <Form.Select style={{ width: 250 }} className="mb-4" onChange={handleEmployeeChange} value={selectedEmployee}>
          <option>Select Sales Employee</option>
          {employeeOptions.map((name, idx) => (
            <option key={idx} value={name}>{name}</option>
          ))}
        </Form.Select>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-25}
              textAnchor="end"
              dy={10}
              style={{ fontSize: '0.7rem' }}
              label={{ value: "Platform Name", position: "bottom", offset: 30 }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="online"
              stackId="a"
              fill="#9f68f8"
              name="Online"
              barSize={20}
              shape={ThreeDBar}
            >
              <LabelList dataKey="online" position="insideTop" fill="#fff" style={{ fontSize: "0.6rem" }} />
            </Bar>
            <Bar
              dataKey="offline"
              stackId="a"
              fill="#f1cfff"
              name="Offline"
              barSize={20}
              shape={ThreeDBar}
            >
              <LabelList dataKey="offline" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
            </Bar>
            <Bar
              dataKey="manual"
              fill="#ffb347"
              name="Manual"
              barSize={20}
              shape={ThreeDBar}
            >
              <LabelList dataKey="manual" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default InquirySourceTeam;
