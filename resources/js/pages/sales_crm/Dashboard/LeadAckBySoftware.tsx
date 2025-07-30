import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';





const LeadsChart = ({leadAckBySoftware}) => {
  const leadStats = [
    { type: 'Software Qualified Leads', value: leadAckBySoftware ? leadAckBySoftware.qualified : 0 , color: '#1E90FF' },
    { type: 'Software Disqualified Leads', value: leadAckBySoftware ? leadAckBySoftware.disqualified : 0 , color: '#7CB342' }
  ];
  const totalLeads = leadStats.reduce((acc, lead) => acc + lead.value, 0);
  return (
     <Card className="d-flex  shadow-sm border-0  p-3 mt-3">
    <Row className="g-3 mb-3">
      <h4 className='mb-3'>Lead Acknowledgment Dashboard By Software</h4>
      <Col xs={12} md={6}>
        <h5 className="text-body-emphasis text-nowrap">Total leads in Software {totalLeads}</h5>
        {/* <p className=" fw-bold" style={{fontSize:"1rem"}}></p> */}
        <hr className="bg-body-secondary mb-2 mt-2" />

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
      <Col xs={12} md={6} className="d-flex justify-content-center align-items-center" style={{marginTop:"-2rem"}}>
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
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#555' }}>Total Leads</span>
          </div>
        </div>
      </Col>
    </Row>
    </Card>
  );
};

export default LeadsChart;
