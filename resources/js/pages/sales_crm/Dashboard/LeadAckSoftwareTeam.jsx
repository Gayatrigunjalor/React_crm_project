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
  Tooltip as RechartsTooltip,
} from 'recharts';

const LeadAckTeam = ({teamLeadAckBySoftwareData}) => {

  const employeeData = teamLeadAckBySoftwareData?.map(emp => ({
    name: emp.employee_name.split(' ').map(word => word[0]).join('').toUpperCase(),
    fullName: emp.employee_name,
    qualified: emp.lead_ack_bySoftware_stats.software_qualified_leads,
    disqualified: emp.lead_ack_bySoftware_stats.software_disqualified_leads
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const qualified = data.qualified || 0;
      const disqualified = data.disqualified || 0;
      const total = qualified + disqualified;

      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.fullName}</p>
          <p><span style={{ color: '#f15b5b' }}>●</span> Software Qualified Leads: {qualified}</p>
          <p><span style={{ color: '#0977de' }}>●</span> Software Disqualified Leads: {disqualified}</p>
          <strong>Total Leads: {total}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid px-2 px-sm-4">
      <Card className="shadow-sm border-0 p-3 p-sm-4 mt-3">
        <h5 className="fw-bold mb-4 text-start text-wrap">Lead Acknowledgement Dashboard By Software</h5>
        <div style={{ width: '100%', height: '60vh', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeData}
              margin={{ top: 40, right: 30, left: 10, bottom: 60 }}
              barCategoryGap={20}
            >
              <defs>
                <linearGradient id="3dRed" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f15b5b" />
                  <stop offset="100%" stopColor="#d84343" />
                </linearGradient>
                <linearGradient id="3dBlue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0977de" />
                  <stop offset="100%" stopColor="#005bb5" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="name"
                label={{
                  value: "Sales Employee Name",
                  position: "bottom",
                  offset: 30,
                }}
                minTickGap={10}
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
                  value: "Number of Leads",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10
                }}
              />

              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={60} wrapperStyle={{ fontSize: '0.8rem' }} />

              <Bar
                dataKey="qualified"
                stackId="a"
                fill="url(#3dRed)"
                barSize={30}
                radius={[5, 5, 0, 0]}
                name="Software Qualified Leads"
              >
                <LabelList dataKey="qualified" position="insideTop" fill="#fff" />
              </Bar>
              <Bar
                dataKey="disqualified"
                stackId="a"
                fill="url(#3dBlue)"
                barSize={30}
                radius={[5, 5, 0, 0]}
                name="Software Disqualified Leads"
              >
                <LabelList dataKey="disqualified" position="top" fill="#333" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default LeadAckTeam;
