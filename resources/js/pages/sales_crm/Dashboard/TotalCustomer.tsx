import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import IssuesDiscoveredChart from '../../../components/charts/e-charts/IssuesDiscoveredChart';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const TotalCustomer = ({ customerBreakdown }) => {
  const issueStats = [
    { type: 'VIP Customers', value: customerBreakdown ? customerBreakdown.vip : 0, bg: 'success-light' },
    { type: 'Genuine Customers', value: customerBreakdown ? customerBreakdown.genuine : 0, bg: 'primary' },
    { type: 'Blacklisted Customers', value: customerBreakdown ? customerBreakdown.blacklisted : 0, bg: 'danger-dark' },
   { type: 'Customer Status Not Assigned', value: customerBreakdown ? customerBreakdown.remaining : 0, bg: '#f18509ff' },
  ];

  return (
    <Card className="d-flex shadow-sm border-0 p-3" style={{ height: "23rem" }}>
      <Row className="g-3">
        <Col xs={12} md={6} className="d-flex flex-column justify-content-between">
          <div>
            <h4 className="mb-3 text-body-emphasis text-nowrap">Total Customers</h4>
            <div className="d-flex align-items-center justify-content-between mt-1 mb-2">
              <p className="mb-0 fw-bold">Total count</p>
              <p className="mb-0 fw-bold">
                <span className="fw-bold">
                  {(customerBreakdown ? customerBreakdown.vip : 0) +
                    (customerBreakdown ? customerBreakdown.genuine : 0) +
                    (customerBreakdown ? customerBreakdown.blacklisted : 0)+
                    (customerBreakdown ? customerBreakdown.remaining : 0)}
                </span>
              </p>
            </div>
            <hr className="bg-body-secondary mb-3 mt-2" />
            {issueStats.map((issue) => (
              <div className="d-flex align-items-center mb-2" key={issue.type}>
                {issue.bg.startsWith('#') ? (
                  <span
                    className="d-inline-block bullet-item me-2"
                    style={{ backgroundColor: issue.bg }}
                  />
                ) : (
                  <span className={`d-inline-block bg-${issue.bg} bullet-item me-2`} />
                )}
                <p className="mb-0 fw-semibold text-body lh-sm flex-1">{issue.type}</p>
                <h5 className="mb-0 text-body">{issue.value}</h5>
              </div>
            ))}
          </div>
        </Col>
        <Col xs={12} md={6} className="d-flex align-items-center justify-content-center">
          <div className="position-relative w-100 h-100 d-flex align-items-end justify-content-center" style={{marginBottom: "15rem"}}>
            <IssuesDiscoveredChart customerBreakdown={customerBreakdown} />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TotalCustomer;