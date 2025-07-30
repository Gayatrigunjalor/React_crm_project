import AceFeatureTargetChart from '../../charts/e-charts/AceFeatureTargetChart';
import React from 'react';
import { Card } from 'react-bootstrap';

const AceFeatureTarget = () => {
  return (
    <Card className="h-100">
      <Card.Body>
        <h3>AceFeature Report</h3>
        {/* <p className="text-body-tertiary mb-0">
          Country-wise target fulfilment
        </p> */}
        <AceFeatureTargetChart style={{ height: 250, width: '100%' }} />
      </Card.Body>
    </Card>
  );
};

export default AceFeatureTarget;
