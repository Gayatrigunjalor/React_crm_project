import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const TatAnalysis = ({tatAnalysisCount}) => {
  const leadStats = [
    { type: 'Within TAT', value: tatAnalysisCount ? tatAnalysisCount.within_tat_count:0, color: '#FF6B6B' },
    { type: 'TAT exceed', value: tatAnalysisCount ? tatAnalysisCount.tat_exceeded_count:0, color: '#1E90FF' }
  ];
  
  const totalLeads = tatAnalysisCount ? tatAnalysisCount['Price Shared']:0;
  
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
`}
</style>
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center mainCard" >
      <h4>TAT Analysis For Price Shared <span style={{fontSize:"0.6rem"}}>(Within 2 days after sourcing)</span></h4>
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
          {totalLeads}
          <br />
          <p style={{ fontSize: '10px', color: '#555' }}>Price Shared</p>
        
        </div>  
      </div>
      <div className="d-flex align-items-center justify-content-between mb-1" >
      <h5 className="mt-3 ">Price Shared</h5>
      <h5 className="mt-3 "> {totalLeads}</h5>
      </div>
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

export default TatAnalysis;
