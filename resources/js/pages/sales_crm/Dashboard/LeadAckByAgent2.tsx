import { cl } from '@fullcalendar/core/internal-common';
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
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';

const LeadAckByAgent2 = ({teamLeadAckByAgentData}) => {
  

   const employeeData = teamLeadAckByAgentData?.map(emp => ({
    name: emp.employee_name.split(' ').map(word => word[0]).join('').toUpperCase(),
    fullName: emp.employee_name,
    qualified: emp.lead_ack_byAgent_stats.qualified,
    clearitypending: emp.lead_ack_byAgent_stats.clarity_pending,
    disqualified: emp.lead_ack_byAgent_stats.disqualified
  })) || [];
  // const employeeData = [
  //   { name: 'DC', fullName: 'Dhanashree Chavan', qualified: 50, clearitypending: 60, disqualified: 120 },
  //   { name: 'GJ', fullName: 'Gauri Jadhav', qualified: 30, clearitypending: 80, disqualified: 100 },
  //   { name: 'HK', fullName: 'Harsh Kale', qualified: 20, clearitypending: 60, disqualified: 130 },
  //   { name: 'HP', fullName: 'Harsh Pawar', qualified: 100, clearitypending: 70, disqualified: 80 },
  //   { name: 'SJ', fullName: 'Suraj Jadhav', qualified: 110, clearitypending: 90, disqualified: 50 },
  //   { name: 'AB', fullName: 'Aditi Bapat', qualified: 80, clearitypending: 40, disqualified: 90 },
  // ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      const qualified = data.qualified;
      const disqualified = data.disqualified;
      const clearitypending = data.clearitypending;
      const total = qualified + disqualified + clearitypending;

      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#22803b' }}>●</span> Qualified: {qualified}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#0977de' }}>●</span> Clarity Pending: {clearitypending}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f15b5b' }}>●</span> Disqualified: {disqualified}</p>
          <strong>Total Leads: {total}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: "32.5rem" }}>
      <h5 className="fw-bold mb-4 text-start">Lead Acknowledgement Dashboard By Agent</h5>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            barCategoryGap={20}
          >
            <defs>
              <linearGradient id="3dGreen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#22803b" />
              </linearGradient>
              <linearGradient id="3dBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00c6ff" />
                <stop offset="100%" stopColor="#0977de" />
              </linearGradient>
              <linearGradient id="3dRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff6a6a" />
                <stop offset="100%" stopColor="#f15b5b" />
              </linearGradient>
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
            <YAxis />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={76} />

            <Bar
              dataKey="qualified"
              stackId="a"
              fill="url(#3dGreen)"
              barSize={35}
              radius={[5, 5, 0, 0]}
              name="Qualified"
            >
              <LabelList dataKey="qualified" position="insideTop" fill="#fff"  formatter={(value: number) => value > 0 ? value : ''}/>
             
            </Bar>

            <Bar
              dataKey="clearitypending"
              stackId="a"
              fill="url(#3dBlue)"
              barSize={35}
              radius={[5, 5, 0, 0]}
              name="Clarity Pending"
            >
              <LabelList dataKey="clearitypending" position="insideTop" fill="#fff"   formatter={(value: number) => value > 0 ? value : ''}/>
            </Bar>

            <Bar
              dataKey="disqualified"
              stackId="a"
              fill="url(#3dRed)"
              barSize={35}
              radius={[5, 5, 0, 0]}
              name="Disqualified"
            >
              <LabelList dataKey="disqualified" position="insideTop" fill="#fff"   formatter={(value: number) => value > 0 ? value : ''}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default LeadAckByAgent2;
