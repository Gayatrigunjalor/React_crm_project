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

interface CustomerStatusStats {
  vip_customers: number;
  genuine_customers: number;
  blacklisted_customers: number;
}

interface TeamMemberData {
  employee_name: string;
  employee_id: number;
  customer_status_stats: CustomerStatusStats;
}

interface CustomerCategoryTeamProps {
  teamCustomerStatusBySourceData: TeamMemberData[];
}

const CustomerCategoryTeam: React.FC<CustomerCategoryTeamProps> = ({ teamCustomerStatusBySourceData }) => {
  const employeeData = teamCustomerStatusBySourceData.map(member => {
    // Get initials from employee name
    const initials = member.employee_name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

    return {
      name: initials,
      fullName: member.employee_name,
      vip: member.customer_status_stats.vip_customers,
      customer: member.customer_status_stats.genuine_customers,
      blacklisted: member.customer_status_stats.blacklisted_customers,
      remaining: member.customer_status_stats.remaining_customers
    };
  });

  

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const vip = data.vip || 0;
      const customer = data.customer || 0;
      const blacklisted = data.blacklisted || 0;
      const remaining = data.remaining || 0;
      const total = vip + customer + blacklisted + remaining;

      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#22803b' }}>●</span> VIP : {vip}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#0977de' }}>●</span> Genuine : {customer}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#f15b5b' }}>●</span> Blacklisted : {blacklisted}</p>
            <p style={{ margin: 0 }}><span style={{ color: '#f15baeff' }}>●</span> Remaining : {remaining}</p>
          <strong>Total Customers : {total}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: '35rem' }}>
      <h5 className="fw-bold mb-4 text-start">Customer Category by Teammate</h5>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            barCategoryGap={20}
          >
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
            <defs>
              <linearGradient id="vip3d" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22803b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1a5e2f" />
              </linearGradient>
              <linearGradient id="customer3d" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0977de" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#065ca7" />
              </linearGradient>
              <linearGradient id="blacklisted3d" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f15b5b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#c94444" />
              </linearGradient>
            </defs>
            <Bar dataKey="vip" stackId="a" fill="url(#vip3d)" barSize={35} name="VIP">
              <LabelList 
                dataKey="vip" 
                position="insideTop" 
                fill="#fff" 
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>
            <Bar dataKey="customer" stackId="a" fill="url(#customer3d)" barSize={35} name="Genuine">
              <LabelList 
                dataKey="customer" 
                position="insideTop" 
                fill="#fff" 
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>
            <Bar dataKey="blacklisted" stackId="a" fill="url(#blacklisted3d)" barSize={35} name="Blacklisted">
              <LabelList 
                dataKey="blacklisted" 
                position="insideTop" 
                fill="#fff" 
                formatter={(value: number) => value > 0 ? value : ''}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CustomerCategoryTeam;
