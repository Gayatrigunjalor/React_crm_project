import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';



const LeadsChart = ({leadAckByAgent}) => {
  const leadStats = [
    { type: 'Agent Qualified Leads', value: leadAckByAgent ? leadAckByAgent.qualified : 0, color: '#1E90FF' },
    { type: 'Agent Clarity Pending', value: leadAckByAgent ? leadAckByAgent.clarity_pending : 0, color: '#7CB342' },
    { type: 'Agent Disqualified', value: leadAckByAgent ? leadAckByAgent.disqualified : 0, color: '#FF4D4D' }
  ];
  
  const totalLeads = leadAckByAgent ? leadAckByAgent.qualified_by_software : 0;
  const qualified = leadAckByAgent ? leadAckByAgent.qualified : 0;
  const clarityPending = leadAckByAgent ? leadAckByAgent.clarity_pending : 0;
  const disqualified = leadAckByAgent ? leadAckByAgent.disqualified : 0;
  const leadAckNotDone = totalLeads - (qualified + clarityPending + disqualified);
  return (
     <Card className="d-flex  shadow-sm border-0  p-3 mt-3">
    <Row className="g-3 mb-3">
        <h4 className='mb-3'>Lead Acknowledgment Dashboard By Agent</h4>
      <Col xs={12} md={6}>
        <h5 className="text-body-emphasis text-nowrap">Software Qualified Leads {totalLeads}</h5>
        <hr className="bg-body-secondary mb-2 mt-2" />
        <div className="d-flex align-items-center mb-1">
          <span
            className="d-inline-block bullet-item me-2"
            style={{ backgroundColor: '#FFA500', width: 10, height: 10, borderRadius: '50%' }}
          />
          <p className="mb-0 fw-semibold text-body lh-sm flex-1">Lead Acknowledgment Not Done</p>
          <h5 className="mb-0 text-body">{leadAckNotDone}</h5>
        </div>
        {leadStats.map(lead => (
          <div className="d-flex align-items-center mb-1" key={lead.type}>
            <span
              className="d-inline-block bullet-item me-2"
              style={{ backgroundColor: lead.color, width: 10, height: 10, borderRadius: '50%' }}
            />
            <p className="mb-0 fw-semibold text-body lh-sm flex-1">{lead.type}</p>
            <h5 className="mb-0 text-body">{lead.value}</h5>
          </div>
        ))}
      </Col>
      <Col xs={12} md={6} className="d-flex justify-content-center align-items-center" style={{ marginTop: "-2rem" }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leadStats}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {totalLeads}
            <br />
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#555' }}>Software Qualified Leads</span>
          </div>
        </div>
      </Col>
    </Row>
    </Card>
  );
};

export default LeadsChart;