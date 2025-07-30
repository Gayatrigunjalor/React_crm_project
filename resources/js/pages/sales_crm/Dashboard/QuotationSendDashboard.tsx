import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const QuotationSendDashboard = ({quotationSendCount}) => {
  const totalReadyToShare = quotationSendCount ? quotationSendCount.ready_to_share_quotation : 0;
  const totalQuotationSend = quotationSendCount ? quotationSendCount.Quotation_Send : 0;

  const readyToShareData = [
    { type: 'Quotation Send', value: quotationSendCount ? quotationSendCount.Quotation_Send:0, color: '#1E90FF' },
    { type: 'Quotation Not Send', value: (totalReadyToShare - totalQuotationSend), color: '#7CB342' }
  ];

  const r1="Ready to Share Quotation";
  const r2="Total Quotation Send";

  const totalQuotationSendData = [
    { type: 'Within TAT', value:quotationSendCount ? quotationSendCount.within_tat_count:0, color: '#1E90FF' },
    { type: 'TAT Exceed', value:quotationSendCount ? quotationSendCount.tat_exceeded_count:0,  color: '#7CB342' }
  ];

  const ChartWithCenterText = ({ data, centerText,type }) => (
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
        <div style={{ fontSize: '10px', color: '#555' }}>{type}</div>
      </div>
    </div>
  );

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
      <h4 className="text-center mb-4">
        Quotation Send Dashboard-
        <small className="text-muted"> (Within 3 days from sourcing)</small>
      </h4>
      <div className="d-flex justify-content-center flex-wrap">
        <ChartWithCenterText data={readyToShareData} centerText={totalReadyToShare} type={r1} />
        <ChartWithCenterText data={totalQuotationSendData} centerText={totalQuotationSend} type={r2}/> 
      </div>

      <div className="d-flex justify-content-around mt-4 flex-wrap" style={{ fontSize: '12px' }}>
  <div>
    <h6 className="fw-bold mb-2" style={{ fontSize: '13px' }}>
      Ready To Share Quotation: {totalReadyToShare}
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

    </Card>
    </>
  );
};

export default QuotationSendDashboard;
