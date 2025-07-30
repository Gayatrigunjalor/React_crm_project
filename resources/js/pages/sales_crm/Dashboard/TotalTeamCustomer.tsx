import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import IssuesDiscoveredChart from '../../../components/charts/e-charts/IssuesDiscoveredChart';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const issueStats = [

  { type: 'VIP Customers', value: 36, bg: 'success-light' },
  { type: 'Customers', value: 24, bg: 'primary' },
  { type: 'Blacklisted Customers', value: 56, bg: 'danger-light' },
];

const IssuesDiscoveredTeam = () => {
  return (
     <Card className="d-flex  shadow-sm border-0  p-3"> 
    <Row className="g-3 mb-3">
      <Col xs={12} md={6}>
      <h4 className='mb-3 text-body-emphasis text-nowrap'>Total Customers of Team</h4>
        {/* <p className="text-body-tertiary mb-md-7">
          Newly found and yet to be solved
        </p> */}
        <div className="d-flex align-items-center justify-content-between mt-1 mb-1">
          <p className="mb-0 fw-bold">Total count </p>
          <p className="mb-0 fs-9">
            <span className="fw-bold">257</span>
          </p>
        </div>
        <hr className="bg-body-secondary mb-4 mt-2" />

        {issueStats.map(issue => (
          <div className="d-flex align-items-center mb-1" key={issue.type}>
            <span
              className={`d-inline-block bg-${issue.bg} bullet-item me-2`}
            />
            <p className="mb-0 fw-semibold text-body lh-sm flex-1">
              {issue.type}
            </p>
            <h5 className="mb-0 text-body">{issue.value}</h5>
          </div>
        ))}
        {/* <Button variant="outline-primary" className="mt-5">
          See Details
          <FontAwesomeIcon
            icon={faAngleRight}
            className="text-primary ms-2 fs-10"
          />
        </Button> */}
      </Col>
      <Col xs={12} md={6}>
      <div className="position-relative" >
          <IssuesDiscoveredChart />
        </div>
      </Col>
    </Row>
    </Card>
  );
};

export default IssuesDiscoveredTeam;
