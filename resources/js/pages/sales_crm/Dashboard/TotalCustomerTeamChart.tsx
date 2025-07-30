import React from 'react';
import { Card } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';

type TeamCustomer = {
  employee_name: string;
  employee_id: number;
  total_customers: number;
};

type Employee = {
  name: string;
  fullName: string;
  count: number;
  id: number;
};

const TotalCustomerTeamChart = ({ teamCustomersData }: { teamCustomersData: TeamCustomer[] }) => {
  const employeeData: Employee[] = teamCustomersData.map((emp) => {
    const initials = emp.employee_name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();

    return {
      name: initials,
      fullName: emp.employee_name,
      count: emp.total_customers,
      id: emp.employee_id
    };
  });

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <h5 className="fw-bold mb-4 text-start" style={{ marginLeft: '2px' }}>
        Total Customers Employee Wise
      </h5>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <defs>
              <linearGradient id="3dBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#444" floodOpacity="0.4" />
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
            <YAxis label={{ value: "Customer Count", angle: -90, position: "insideLeft" }} />

            <RechartsTooltip
              formatter={(value) => [`Customer Count : ${value}`]}
              labelFormatter={(name) => {
                const match = employeeData.find(emp => emp.name === name);
                return match ? match.fullName : name;
              }}
            />

            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              barSize={35}
              fill="url(#3dBarGradient)"
              style={{ pointerEvents: 'auto' }}
            >
              {employeeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  filter="url(#shadow)"
                  style={{ pointerEvents: 'auto' }}
                />
              ))}
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TotalCustomerTeamChart;
