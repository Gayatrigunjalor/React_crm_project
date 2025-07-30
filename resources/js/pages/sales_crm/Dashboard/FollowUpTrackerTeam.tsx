import React from 'react';
import { Card, OverlayTrigger } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';

interface FollowUpTrackerData {
  employee_name: string;
  employee_id: number;
  follow_up_tracker_charts: {
    key_opportunity: number;
    pre_qualified_opportunity: number;
    qualified_opportunity: number;
    re_engage_lead: number;
    active_discussion: number;
    in_progress_buyer: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: {
      fullName: string;
      undertargetcost: number;
      costassigned: number;
      costexceed: number;
    };
  }>;
}

const FollowUpTrackerTeam = ({ followupChartsData }: { followupChartsData: FollowUpTrackerData[] }) => {
  console.log("FollowUpTrackerTeam Data:", followupChartsData);
  // Transform the data for the employee chart
  const employeeData = followupChartsData.map(employee => ({
    name: employee.employee_name.split(' ').map(n => n[0]).join(''),
    fullName: employee.employee_name,
    undertargetcost: employee.follow_up_tracker_charts.pre_qualified_opportunity,
    costassigned: employee.follow_up_tracker_charts.qualified_opportunity,
    costexceed: employee.follow_up_tracker_charts.key_opportunity,
  }));

  // Transform the data for the right chart
  const data = [
    { name: 'Re- Engage the Lead', value: followupChartsData.reduce((sum, emp) => sum + emp.follow_up_tracker_charts.re_engage_lead, 0) },
    { name: 'Active Discussion & Objections', value: followupChartsData.reduce((sum, emp) => sum + emp.follow_up_tracker_charts.active_discussion, 0) },
    { name: 'Buyer is Thinking Internally', value: followupChartsData.reduce((sum, emp) => sum + emp.follow_up_tracker_charts.in_progress_buyer, 0) },
  ];

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const undertargetcost = payload.find(p => p.dataKey === 'undertargetcost')?.value || 0;
      const costassigned = payload.find(p => p.dataKey === 'costassigned')?.value || 0;
      const costexceed = payload.find(p => p.dataKey === 'costexceed')?.value || 0;
      const total = undertargetcost + costassigned + costexceed;

      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Opportunity Qualified by software: {undertargetcost}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Opportunity Qualified by agent: {costassigned}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#ff7cc6ff' }}>●</span> Key Opportunity: {costexceed}</p>
          {/* <strong>Total: {total}</strong> */}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <div className="d-flex justify-content-between flex-wrap">


        <div style={{ width: '50%', height: 400 }}>
          <div className="d-flex justify-content-between flex-wrap">
            <h5 className="fw-bold mb-3 text-center">Follow Up Tracker</h5>
            <div className="d-flex gap-3 mb-3">
              <div><span style={{ color: '#3b2fdb' }}>●</span> Opportunity Qualified by software</div>
              <div><span style={{ color: '#c17cff' }}>●</span> Opportunity Qualified by agent</div>
                 <div><span style={{ color: '#ff7cc6ff' }}>●</span> Key Opportunity</div>
            </div>
          </div>

          <ResponsiveContainer>
            <BarChart
              data={employeeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barCategoryGap={20}
            >
              <defs>
                <linearGradient id="undertargetGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b2fdb" />
                  <stop offset="100%" stopColor="#2a1f9f" />
                </linearGradient>
                <linearGradient id="costassignedGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c17cff" />
                  <stop offset="100%" stopColor="#a65fd2" />
                </linearGradient>
                <linearGradient id="costexceedGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f1cfff" />
                  <stop offset="100%" stopColor="#e0b3f1" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name"
                label={{ value: "Sales Employee Names", position: "bottom", offset: 20 }}

                tick={({ x, y, payload }) => {
                  const match = employeeData.find((item) => item.name === payload.value);
                  const fullName = match ? match.fullName : payload.value;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <OverlayTrigger
                        placement="bottom" // Tooltip will appear below the label
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
                            {fullName}
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
                  );
                }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="undertargetcost" stackId="a" fill="url(#undertargetGradient)" barSize={30}>
                <LabelList dataKey="undertargetcost" position="insideTop" fill="#fff" style={{ fontSize: "0.6rem" }} />
              </Bar>
              <Bar dataKey="costassigned" stackId="a" fill="url(#costassignedGradient)" barSize={30}>
                <LabelList dataKey="costassigned" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
              </Bar>
              <Bar dataKey="costexceed" stackId="a" fill="url(#costexceedGradient)" barSize={30}>
                <LabelList dataKey="costexceed" position="insideTop" fill="#000" style={{ fontSize: "0.6rem" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Chart */}
        <div className="d-flex flex-column" style={{ flex: '1 1 50%', minWidth: '300px' }}>
          <div style={{ width: '100%', height: 386, marginTop: '3rem' }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="reengageGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b2fdb" />
                    <stop offset="100%" stopColor="#2a1f9f" />
                  </linearGradient>
                  <linearGradient id="discussionGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c17cff" />
                    <stop offset="100%" stopColor="#a65fd2" />
                  </linearGradient>
                  <linearGradient id="thinkingGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f1cfff" />
                    <stop offset="100%" stopColor="#e0b3f1" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  style={{ fontSize: '10px' }}
                />
                <YAxis />
                <Tooltip />

                <Bar dataKey="value" barSize={30}>
                  {data.map((entry, index) => {
                    let gradient = "#8884d8";
                    if (entry.name === "Re- Engage the Lead") gradient = "url(#reengageGradient)";
                    if (entry.name === "Active Discussion & Objections") gradient = "url(#discussionGradient)";
                    if (entry.name === "Buyer is Thinking Internally") gradient = "url(#thinkingGradient)";
                    return <Cell key={`cell-${index}`} fill={gradient} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default FollowUpTrackerTeam;
