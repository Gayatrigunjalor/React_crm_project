import React from 'react';
import { Col, Row, Form, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const productSourcingStats = [
  { type: 'Product Sourcing Details', value: 300, color: '#1E90FF' },
  { type: 'Product Sourcing Not Required', value: 100, color: '#4CAF50' },
  { type: 'Hybrid Enquiries', value: 100, color: '#FF6347' }
];

const totalEnquiries = productSourcingStats.reduce((acc, item) => acc + item.value, 0);

const IssuesDiscovered = () => {
  return (
    // <Row className="g-3 mb-3">

    <Card className="d-flex flex-column shadow-sm border-0 p-4 mt-3 align-items-center">
    {/* Title */}
     <Col xs={12} className="d-flex justify-content-between">
    <h4 className="mb-3 text-body-emphasis text-nowrap">Product Sourcing Dashboard</h4>
    </Col>
    {/* Pie Chart Section */}
    <div className="d-flex justify-content-center align-items-center" style={{ width: 280, height: 280 }}>
      <div style={{ position: 'relative', width: 240, height: 240 }}> {/* Adjusted size */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productSourcingStats}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              // label={({ value }) => `${((value / totalEnquiries) * 100).toFixed(0)}%`}
            >
              {productSourcingStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
  
        {/* Center Total Count */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#000',
        }}>
          {totalEnquiries}
        </div>
      </div>
    </div>
  
    {/* Legend Section */}
    <div className="d-flex flex-column align-items-center gap-3 mt-3">
      {productSourcingStats.map((item) => (
        <div className="d-flex align-items-center justify-content-between w-100 px-4" key={item.type}>
          <div className="d-flex align-items-center">
            <span
              className="d-inline-block me-2"
              style={{ backgroundColor: item.color, width: 12, height: 12, borderRadius: '50%' }}
            />
            <p className="mb-0 fw-semibold text-body lh-sm">{item.type}</p>
          </div>
          <h5 className="mb-0 text-body">{item.value}</h5>
        </div>
      ))}
    </div>
  </Card>
  
  
    // </Row>

  );
};

export default IssuesDiscovered;
