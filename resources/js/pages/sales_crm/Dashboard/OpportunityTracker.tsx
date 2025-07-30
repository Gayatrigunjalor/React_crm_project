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

interface OpportunityTrackerProps {
  opportunityTrackerCount: {
    'Total Qualified Inquiries By Software': number;
    'Total Qualified Inquiries by Agent': number;
    'Total Sourcing Done': number;
    'Ready to share Price': number;
    'Total Price Shared': number;
    'Total Quotation Shared': number;
    'Deal Won': number;
    'BT Created': number;
  } | null;
}

const OpportunityTracker = ({ opportunityTrackerCount }: OpportunityTrackerProps) => {
  console.log("opportunityTrackerCount", opportunityTrackerCount)
  
  const softwareInquiriesCount = opportunityTrackerCount ? opportunityTrackerCount['Total Qualified Inquiries By Software'] : 0;
  
  const data = [
    { name: 'Total Qualified Inquiries by Agent', value: opportunityTrackerCount ? opportunityTrackerCount['Total Qualified Inquiries by Agent'] : 0 },
    { name: 'Total Sourcing Done', value: opportunityTrackerCount ? opportunityTrackerCount['Total Sourcing Done'] : 0 },
    { name: 'Ready to share Price', value: opportunityTrackerCount ? opportunityTrackerCount['Ready to share Price'] : 0 },
    { name: 'Total Price Shared', value: opportunityTrackerCount ? opportunityTrackerCount['Total Price Shared'] : 0 },
    { name: 'Total Quotation Shared', value: opportunityTrackerCount ? opportunityTrackerCount['Total Quotation Shared'] : 0 },
    // { name: 'Total price and Quotation Send', 
    //   value:  (opportunityTrackerCount ? opportunityTrackerCount['Total Price Shared'] : 0) + (opportunityTrackerCount ? opportunityTrackerCount['Total Quotation Shared'] : 0) },
    { name: 'Deal Won', value: opportunityTrackerCount ? opportunityTrackerCount['Deal Won'] : 0 },
    { name: 'BT Created', value: opportunityTrackerCount ? opportunityTrackerCount['BT Created'] : 0 },
  ];
  
  return (
    <Card className="shadow-sm border-0 p-4 mt-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h4 className="fw-bold mb-0">Opportunity Tracker</h4>
        <div className="text-end">
          <div className="text-muted small">Total Qualified Inquiries By Software</div>
          <div className="fw-bold fs-6 text-primary">{softwareInquiriesCount}</div>
        </div>
      </div>
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
            <Bar dataKey="value" fill="#8884d8" barSize={30}>
              <LabelList dataKey="value" position="top" style={{ fontSize: '12px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OpportunityTracker;
