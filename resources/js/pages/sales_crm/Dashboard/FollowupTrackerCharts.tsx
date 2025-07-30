import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';

const FollowupTrackerCharts = ({followupTrackerCount,followupTrackerChartCount}) => {
  console.log("followupTrackerCount",followupTrackerCount);
  const readyToShareData = [
    { type: 'Agent Qualified Lead', value: followupTrackerChartCount ? followupTrackerChartCount.agent_qualified_lead:0, color: '#1E90FF' },
    { type: 'Price Shared', value: followupTrackerChartCount ? followupTrackerChartCount.price_shared:0, color: '#7CB342' },
    { type: 'Quotation Shared', value: followupTrackerChartCount ? followupTrackerChartCount.quotation_send:0, color: '#FF6B6B' },
  ];

  const totalQuotationSendData = [
    { type: 'Pre - Qualified Opportunity', value: followupTrackerChartCount ? followupTrackerChartCount.pre_qualified_opportunity:0, color: '#1E90FF' },
    { type: 'Qualified Opportunity', value: followupTrackerChartCount ? followupTrackerChartCount.qualified_opportunity:0, color: '#7CB342' },
    { type: 'Key Opportunity', value: followupTrackerChartCount ? followupTrackerChartCount.key_opportunity:0, color: '#FF6B6B' },
  ];

  const totalReadyToShare = followupTrackerChartCount ? followupTrackerChartCount.sourcing_done:0;
  const totalQuotationSend = followupTrackerChartCount ? followupTrackerChartCount.sourcing_done:0;

  const ChartWithCenterText = ({ data, centerText }) => (
    <div style={{ position: 'relative', width: 220, height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="type"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            wrapperStyle={{ top: '10rem', left: '50%', transform: 'translateX(-50%)' }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{centerText}</div>
        <div style={{ fontSize: '10px', color: '#555' }}>Sourcing Done</div>
      </div>
    </div>
  );


  //for graph
  const data = [
    { name: 'Re- Engage the Lead', value: followupTrackerCount ? followupTrackerCount['Re-Engage the Lead']:0, },
    { name: 'Buyer is Thinking Internally', value: followupTrackerCount ? followupTrackerCount['Buyer is Thinking Internally']:0,},
    { name: 'Active Discussion & Objections', value: followupTrackerCount ? followupTrackerCount['Active Discussion & Objections']:0, },
    { name: 'Offer Under Final Review', value: followupTrackerCount ? followupTrackerCount['Offer Under Final Review']:0, },
    { name: 'Ready to Close - Awating Payment', value: followupTrackerCount ? followupTrackerCount['Ready to Close - Awaiting Payment']:0, },
   
  ];

  return (
    <>
    <style>
    {`
 .mainCard{
   height : 30.5rem;
 }
   @media screen and (max-width: 1389px) {
  .mainCard {
    height : 40rem;
  }
}
`}
</style>
<Card className="shadow-sm border-0 p-4 mt-3 mainCard">
  <div className="d-flex justify-content-between flex-wrap">
    
    {/* Left Side: Pie Charts */}
    {/* <div className="d-flex flex-column align-items-center" style={{ flex: '1 1 50%' }}>
      <div className="d-flex justify-content-center flex-wrap">
        <ChartWithCenterText data={readyToShareData} centerText={totalReadyToShare} />
        <ChartWithCenterText data={totalQuotationSendData} centerText={totalQuotationSend} />
      </div>

      <div className="d-flex justify-content-around mt-4 flex-wrap gap-2" style={{ fontSize: '10px' }}>
        <div>
          <h6 className="fw-bold mb-2" style={{ fontSize: '13px' }}>
            Ready To Share Quotation: {followupTrackerChartCount ? followupTrackerChartCount.ready_to_share_quotation:0}
          </h6>
          {readyToShareData.map((item, idx) => (
            <div key={idx} className="d-flex justify-content-between mb-1">
              <div className="d-flex align-items-center">
                <span style={{
                  backgroundColor: item.color,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  marginRight: 6
                }} />
                <span>{item.type}</span>
              </div>
              <span className="ms-3 fw-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        <div>
          <h6 className="fw-bold mb-2" style={{ fontSize: '13px' }}>
            Total Quotation Send: {totalQuotationSend}
          </h6>
          {totalQuotationSendData.map((item, idx) => (
            <div key={idx} className="d-flex justify-content-between mb-1">
              <div className="d-flex align-items-center">
                <span style={{
                  backgroundColor: item.color,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  marginRight: 6
                }} />
                <span>{item.type}</span>
              </div>
              <span className="ms-3 fw-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div> */}

    {/* Right Side: Follow Up Tracker Graph */}
    <div className="d-flex flex-column" style={{ flex: '1 1 50%', minWidth: '300px' }}>
      <h4 className="fw-bold mb-3 text-center">Follow Up Tracker</h4>
      <div style={{ width: '100%', height: 386 }}>
      <ResponsiveContainer>
  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
        let color = "#8884d8"; // Default color

        // Assign colors based on the bar's name
        if (entry.name === "Re- Engage the Lead") color = "#ff4d4f"; // Red
        if (entry.name === "Buyer is Thinking Internally") color = "#66bb6a"; // Green
        if (entry.name === "Active Discussion & Objections") color = "#2196f3"; // Blue
        if (entry.name === "Offer Under Final Review") color = "#ff4d4f"; // Red
        if (entry.name === "Ready to Close - Awaiting Payment") color = "#66bb6a"; // Green

        return <Cell key={index} fill={color} />;
      })}
    </Bar>
  </BarChart>
</ResponsiveContainer>

      </div>
    </div>

  </div>
</Card>

    </>
  );
};

export default FollowupTrackerCharts;
