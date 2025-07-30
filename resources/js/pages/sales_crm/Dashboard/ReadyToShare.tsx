import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ReadyToShare = ({readyToShareCount}) => {
  const priceShared = readyToShareCount ? readyToShareCount['Price Shared'] || 0 : 0;
  const readyToShare = readyToShareCount ? readyToShareCount['Ready to share Price'] || 0 : 0;
  const priceNotShared = readyToShare - priceShared;

  const leadStats = [
    { type: 'Price Shared', value: priceShared, color: '#1E90FF' },
    { type: 'Price Not Shared', value: priceNotShared, color: '#7CB342' }
  ];
  
  const totalLeads = readyToShareCount ? readyToShareCount['Product_sourcing_Assigned']:0;

  
  return (
    <>
    <style>
    {`
//  .mainCard{
//    height : 38rem;
//  }
    @media screen and (max-width: 1389px) {
  .mainCard {
    height : 40rem;
  }
`}
</style>
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center mainCard">
      <h4 >Ready To Share Price</h4>
    
      <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
        <ResponsiveContainer width={220} height={220}>
          <PieChart>
            <Pie
              data={leadStats}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              fill="#8884d8"
              label={false}
            >
              {leadStats.map((entry, index) => (
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
          textAlign: 'center',
          fontSize: '22px',
          fontWeight: 'bold'
        }}>
          {readyToShare}
          <br />
          <p style={{ fontSize: '10px', color: '#555' }}>Ready To Share Price</p>
        
        </div>  
      </div>
      {/* <div className="d-flex align-items-center justify-content-between mb-1" >
      <h5 className="mt-3 ">Product Sourcing Assigned</h5>
      <h5 className="mt-3 "> {totalLeads}</h5>
      </div> */}
      <hr className="my-2" />
      <div className="text-start">
        {leadStats.map(lead => (
          <div className="d-flex align-items-center justify-content-between mb-1" key={lead.type}>
            <div className="d-flex align-items-center">
              <span
                className="d-inline-block me-2"
                style={{ backgroundColor: lead.color, width: 12, height: 12, borderRadius: '50%' }}
              />
              <p className="mb-0 fw-semibold">{lead.type}</p>
            </div>
            <h6 className="mb-0">{lead.value}</h6>
          </div>
        ))}
      </div>
    </Card>
    </>
  );
};

export default ReadyToShare;
