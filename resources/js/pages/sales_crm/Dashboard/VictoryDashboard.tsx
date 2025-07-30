import React, { useState } from 'react';
import { Col, Row, Form, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface VictoryCount {
  'Total Inquiry Received': number;
  'Lead Won': number;
  'Deal Won': number;
  'Deal Not Won': number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { type, value } = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          color: '#333',
          minWidth: 120,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <div style={{ fontWeight: 600 }}>{type}</div>
        <div style={{ fontSize: 14 }}>Count: {value}</div>
      </div>
    );
  }
  return null;
};

const IssuesDiscovered = ({victoryCount}: {victoryCount?: VictoryCount}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const totalInquiries = victoryCount ? victoryCount['Total Inquiry Received'] || 0 : 0;
  const dealWon = victoryCount ? victoryCount['Lead Won'] || 0 : 0;
  const dealNotWon = Math.max(0, totalInquiries - dealWon);
  
  const dealStats = [
    { type: 'Deal Won', value: dealWon, color: '#4CAF50' },
    { type: 'Deal Not Won', value: dealNotWon, color: '#FF6B6B' },
  ];
  
  return (
    <Card
      className="d-flex flex-column align-items-center shadow-sm border-0 p-3 mt-3 pb-4"
      style={{
        height: "26rem",
        marginBottom: "2rem",
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
        {/* Custom tooltip on the left side of the pie chart */}
        {hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              left: -140,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: '8px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#333',
              minWidth: 120,
              maxWidth: 180,
              textAlign: 'center',
              zIndex: 9999,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 600 }}>{dealStats[hoveredIndex].type}</div>
            <div style={{ fontSize: 14 }}>Count: {dealStats[hoveredIndex].value}</div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dealStats}
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
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {dealStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* Tooltip removed */}
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              fontSize: '26px',
              fontWeight: '600',
              color: '#444',
              textShadow: '0 1px 1px rgba(255,255,255,0.8)',
            }}
          >
            {totalInquiries}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '4px',
            }}
          >
            Total Inquiries
          </div>
        </div>
      </div>

      {/* Restore summary counts below the chart */}
      <Col xs={12} className="d-flex flex-column align-items-center mt-4">
        <div className="d-flex align-items-center mb-2 w-100 justify-content-center">
          <span
            className="d-inline-block bullet-item me-2"
            style={{ backgroundColor: '#1E90FF', width: 10, height: 10, borderRadius: '50%' }}
          />
          <p className="mb-0 fw-semibold text-body lh-sm flex-1">
            Total Inquiry Received
          </p>
          <h5 className="mb-0 text-body">{totalInquiries}</h5>
        </div>
        
        <div className="d-flex align-items-center mb-2 w-100 justify-content-center">
          <span
            className="d-inline-block bullet-item me-2"
            style={{ backgroundColor: '#4CAF50', width: 10, height: 10, borderRadius: '50%' }}
          />
          <p className="mb-0 fw-semibold text-body lh-sm flex-1">
            Deal Won
          </p>
          <h5 className="mb-0 text-body">{dealWon}</h5>
        </div>
      </Col>
    </Card>
  );
};

export default IssuesDiscovered;

