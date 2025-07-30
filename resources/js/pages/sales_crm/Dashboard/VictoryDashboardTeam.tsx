import React from 'react';
import { Col, Row, Form, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';



const IssuesDiscovered = ({victoryStatsData}) => {
  const productSourcingStats = [
    { type: 'Total Inquiry Received', value: victoryStatsData?.total_inquiries || 0, color: '#1E90FF' },
    { type: 'Lead Won', value: victoryStatsData?.deals_won || 0, color: '#4CAF50' },
  ];
  
  const totalEnquiries = productSourcingStats.reduce((acc, item) => acc + item.value, 0);
  return (
    // <Row className="g-3 mb-3">
    <Card
    className="d-flex flex-column align-items-center shadow-sm border-0 p-3 mt-3 pb-4"
    style={{
      height: "30rem",
      boxShadow: `
        0 4px 12px rgba(0, 0, 0, 0.08),        
        0 8px 16px rgba(0, 0, 0, 0.1),         
        inset 0 2px 4px rgba(255, 255, 255, 0.6), 
        inset 0 -2px 6px rgba(0, 0, 0, 0.05)    
      `,
    }}
  >
      <Col xs={12} className="d-flex justify-content-center mb-3">
        <h4 className="text-body-emphasis text-nowrap">Victory Dashboard</h4>
      </Col>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.08),        
      inset 0 2px 4px rgba(255, 255, 255, 0.6), 
      inset 0 -2px 6px rgba(0, 0, 0, 0.05)    
    `,
          position: 'relative',
          transform: 'perspective(600px) rotateX(8deg)',
        }}
      >
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
              stroke="#f9f9f9"
              strokeWidth={1.5}
              fill="#8884d8"
              labelLine={false}
            >
              {productSourcingStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '26px',
            fontWeight: '600',
            color: '#444',
            textAlign: 'center',
            width: '100%',
            textShadow: '0 1px 1px rgba(255,255,255,0.8)',
          }}
        >
          {totalEnquiries}
        </div>
      </div>

      <Col xs={12} md={6} className="d-flex flex-column align-items-center mt-4">
        {productSourcingStats.map((item) => (
          <div className="d-flex align-items-center mb-1 w-100 justify-content-between" key={item.type}>
            <div className="d-flex align-items-center">
              <span
                className="d-inline-block bullet-item me-2"
                style={{ backgroundColor: item.color, width: 10, height: 10, borderRadius: '50%' }}
              />
              <p className="mb-0 fw-semibold text-body lh-sm">
                {item.type}
              </p>
            </div>
            <h5 className="mb-0 text-body">{item.value}</h5>
          </div>
        ))}
      </Col>

    </Card>
    // </Row>

  );
};

export default IssuesDiscovered;

