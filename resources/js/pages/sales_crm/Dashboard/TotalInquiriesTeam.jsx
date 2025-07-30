import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';

const TotalInquiriesTeam = ({ teamInquiryData }) => {
  const employeeData = teamInquiryData.map((emp) => {
    const initials = emp.employee_name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();

    return {
      name: initials,
      fullName: emp.employee_name,
      count: emp.total_customers,
      id: emp.employee_id,
      software: emp.total_software_qualified,
      agent: emp.total_agent_qualified,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const software = payload.find(p => p.dataKey === 'software')?.value || 0;
      const agent = payload.find(p => p.dataKey === 'agent')?.value || 0;
      const total = software + agent;

      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f15b5b' }}>●</span> Software Qualified: {software}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#0977de' }}>●</span> Agent Qualified: {agent}</p>
          {/* <strong>Total Qualified Inquiries: {total}</strong> */}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <h5 className="fw-bold mb-4 text-start">Total Inquiries Received By Source</h5>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            barCategoryGap={20}
          >
            <defs>
              <linearGradient id="software3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f15b5b" />
                <stop offset="100%" stopColor="#b02a2a" />
              </linearGradient>
              <linearGradient id="agent3D" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0977de" />
                <stop offset="100%" stopColor="#044f96" />
              </linearGradient>
              <filter id="barShadow3D" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="name"
              label={{ value: "Sales Employee Name", position: "bottom", offset: 20 }}
              tick={({ x, y, payload }) => {
                const match = employeeData.find(emp => emp.name === payload.value);
                const fullName = match ? match.fullName : payload.value;

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

            <YAxis
              label={{
                value: "Number of Qualified Inquiries",
                angle: -90,
                position: "insideLeft",
                dy: 10,
              }}
            />

            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={76} />

            <Bar
              dataKey="software"
              stackId="a"
              fill="url(#software3D)"
              barSize={35}
              radius={[0, 0, 0, 0]}
              name="Software Qualified"
              style={{ pointerEvents: 'auto' }}
            >
              <LabelList dataKey="software" position="insideTop" fill="#fff" />
              {employeeData.map((_, index) => (
                <Cell key={`sw-${index}`} filter="url(#barShadow3D)" style={{ pointerEvents: 'auto' }} />
              ))}
            </Bar>

            <Bar
              dataKey="agent"
              stackId="a"
              fill="url(#agent3D)"
              barSize={35}
              radius={[10, 10, 0, 0]}
              name="Agent Qualified"
              style={{ pointerEvents: 'auto' }}
            >
              <LabelList dataKey="agent" position="top" />
              {employeeData.map((_, index) => (
                <Cell key={`ag-${index}`} filter="url(#barShadow3D)" style={{ pointerEvents: 'auto' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TotalInquiriesTeam;
 