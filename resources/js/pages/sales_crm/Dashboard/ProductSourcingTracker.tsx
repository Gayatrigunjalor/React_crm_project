import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ProductSourcingTracker = ({ sourcingsTracker }) => {
  const sourcingNotRequired = sourcingsTracker ? sourcingsTracker.Sourcing_not_required : 0;
  const sourcingRequired = sourcingsTracker ? sourcingsTracker.Sourcing_required : 0;
  const totalProductSourcing = sourcingsTracker ? sourcingsTracker.totalProduct_Sourcing : 0;
  const sourcingStatusNull = totalProductSourcing - (sourcingRequired + sourcingNotRequired);

  const leadStats = [
    { type: 'Total Products', value: totalProductSourcing, color: '#4CAF50' },
    { type: 'Product Sourcing Required', value: sourcingRequired, color: '#1E90FF' },
    { type: 'Product Sourcing not required', value: sourcingNotRequired, color: '#FF6B6B' },
    { type: 'Product Sourcing Status Null', value: sourcingStatusNull, color: '#FFD700' }
  ];

  const totalLeads = sourcingsTracker ? sourcingsTracker.qualified_by_agent : 0;

  return (
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center" style={{ height: "31rem" }}>
      <h4 >Product Sourcing Tracker</h4>
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
          <p style={{ fontSize: '10px', color: '#555' }}>Leads qualified by agent</p>

        </div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-1" >
        <h5 className="mt-3 ">Leads qualified by agent </h5>
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

export default ProductSourcingTracker;
