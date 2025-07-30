import React from 'react';
import AnalyticsEmailCampaignChart from '../../../charts/e-charts/AnalyticsEmailCampaignChart';

const EmailCampaign = () => {
  return (
    <div className="scrollbar">
      <h3>Email Campaign Reports</h3>
      <p className="text-body-tertiary">
        Paid and Verified for each piece of content
      </p>
      <AnalyticsEmailCampaignChart className="echart-contacts-width" />
    </div>
  );
};

export default EmailCampaign;
