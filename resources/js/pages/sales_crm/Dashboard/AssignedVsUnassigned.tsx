import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const AssignedVsUnassigned = ({sourcingsTypeCount}) => {
  const leadStats = [
    { type: 'Product Sourcing Assigned', value: sourcingsTypeCount ? sourcingsTypeCount.assigned:0, color: '#FF6B6B' },
    { type: 'Product Sourcing Unassigned', value:sourcingsTypeCount ? sourcingsTypeCount.not_assigned:0, color: '#1E90FF' }
  ];
  
  const totalLeads = sourcingsTypeCount ? sourcingsTypeCount.sourcing_required:0;
  
  return (
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center" style={{height: "31rem"}}>
      <h4>Assigned vs Unassigned Sourcing</h4>
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
            <Tooltip />
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
          <p style={{ fontSize: '10px', color: '#555' }}>Product Sourcing Required</p>
        
        </div>  
      </div>
      <div className="d-flex align-items-center justify-content-between mb-1" >
      <h5 className="mt-3 ">Product Sourcing Required</h5>
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
  );
};

export default AssignedVsUnassigned;
