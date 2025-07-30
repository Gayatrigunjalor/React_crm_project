import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Card } from 'react-bootstrap';

const ThreeDBar = (props) => {
  const { x, y, width, height, fill } = props;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      <polygon
        points={`${x},${y} ${x + 10},${y - 10} ${x + width + 10},${y - 10} ${x + width},${y}`}
        fill="#a58af4"
      />
      <polygon
        points={`${x + width},${y} ${x + width + 10},${y - 10} ${x + width + 10},${y + height - 10} ${x + width},${y + height}`}
        fill="#7761c1"
      />
    </g>
  );
};

const OpportunityTracker = ({opportunityStatsData}) => {
  const data = [
    { name: 'Total Qualified Inquiries By Software', value: opportunityStatsData?.total_qualified_inquiries_by_software || 0 },
    { name: 'Total Qualified Inquiries by Agent', value: opportunityStatsData?.total_qualified_inquiries_by_agent || 0 },
    { name: 'Total Sourcing Done', value: opportunityStatsData?.total_sourcing_done || 0 },
    { name: 'Ready to share Price', value: opportunityStatsData?.ready_to_share_price || 0 },
    { name: 'Total Price Shared', value: opportunityStatsData?.total_price_shared || 0 },
    { name: 'Total Quotation Shared', value: opportunityStatsData?.total_quotation_shared || 0 },
    { name: 'Deal Won', value: opportunityStatsData?.deal_won || 0 },
    { name: 'BT Created', value: opportunityStatsData?.bt_created || 0 },
  ];

  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <h5 className="fw-bold mb-3">End to End Opportunity Tracker</h5>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
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
            <Bar dataKey="value" fill="#8884d8" barSize={30} shape={<ThreeDBar />}>
              <LabelList dataKey="value" position="top" style={{ fontSize: '12px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OpportunityTracker;
