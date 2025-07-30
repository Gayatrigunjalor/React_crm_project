import React from 'react';
import { Col, Row, Form, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const productSourcingStats = [
  { type: 'Price Shared', value: 200, color: '#1E90FF' },
  { type: 'Price Not Shared', value: 300, color: '#4CAF50' },
  
];

const totalEnquiries = productSourcingStats.reduce((acc, item) => acc + item.value, 0);

const IssuesDiscovered = () => {
  return (
    // <Row className="g-3 mb-3">
    <Card className="d-flex flex-column shadow-sm border-0 p-4 mt-3 align-items-center">
      <Col xs={12} className="d-flex justify-content-between">
      <h4 className="mb-3 text-body-emphasis text-nowrap">Price Shared Dashboard</h4>
      </Col>
      <div className="d-flex justify-content-center align-items-center" style={{ width: 280, height: 280 }}>
        <div style={{ position: 'relative', width: 300, height: 300 }}>
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
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {totalEnquiries}
          </div>
        </div>
      </div>
      <Col xs={12} md={6} className="d-flex flex-column">
        {productSourcingStats.map((item) => (
          <div className="d-flex align-items-center mb-1" key={item.type}>
            <span
              className="d-inline-block bullet-item me-2"
              style={{ backgroundColor: item.color, width: 10, height: 10, borderRadius: '50%' }}
            />
            <p className="mb-0 fw-semibold text-body lh-sm flex-1">
              {item.type}
            </p>
            <h5 className="mb-0 text-body">{item.value}</h5>
          </div>
        ))}
      </Col>

      </Card>
    // </Row>

  );
};

export default IssuesDiscovered;
