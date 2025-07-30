import React, { useEffect, useState } from "react";
import Button from "../../../components/base/Button";
import Modal from "react-bootstrap/Modal";
import axiosInstance from '../../../axios';
import AceFeatureTargetChart from '../../../components/charts/e-charts/AceFeatureTargetChart';
import { Card, Col, Row } from 'react-bootstrap';


const AceFeaturesReport = () => {
    return (
        <div className="card mb-4 ">
            <div className="ace-features-report container px-0">
                <Card className="h-100">
                    <Card.Body>
                        <h3>AceFeature Report</h3>
                        <AceFeatureTargetChart style={{ height: 250, width: '100%' }} />
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default AceFeaturesReport;
