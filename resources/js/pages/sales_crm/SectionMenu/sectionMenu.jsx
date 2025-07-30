import React, { useState, useEffect } from 'react';
import MainSection from '../inquiryRecived/MainSection';
import SecondMain from "../leadAcknowlegement/SecondMain";
import productSourcing from "../productSourcing/productSourcing"
import PriceShared from "../PriceShared/PriceShared"
import FifthMain from "../QuotationSend/QuotationSend";
import DecisionAwaited from "../DecisionAwaited/DecisionAwaited"
import VictoryStage from "../VictoryStage/VictoryStage"
// import { useNavigate } from "react-router-dom";
import editIcon from '../../../assets/img/newIcons/feildedit.png';

const SectionMenu = ({ onStageSelect, selectedStageIndex, userStages = [] }) => {
    const stages = userStages.length > 0 ? userStages : [
        "Inquiry Received",
        "Lead Acknowledgment",
        "Product Sourcing",
        "Price Shared",
        "Quotation Sent",
        "Follow Up",
        "Victory Stage",
    ];

    const stageComponents = [
        null, // No component for "Inquiry Received"
    ];

    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        if (selectedStageIndex !== undefined) {
            setActiveStage(selectedStageIndex);
        } else {
            setActiveStage(0); // Reset to 0 if no stage is selected
        }
    }, [selectedStageIndex]);

    // const handleStageSelect = (index) => {
    //     setActiveStage(index);
    //     onStageSelect(index);
    // };

    // const navigate = useNavigate();
    // const handleStageSelect = (index) => {
    //     navigate(`/stage/${index}`); // Navigate to a new page dynamically
    // };

    return (
        <div className="container-fluid" style={{ padding: '0 20px' }}>
            <div style={{
                display: 'flex',
                width: '100%',
                position: 'relative',
                gap: '8px',
                overflow: 'hidden'
            }}>
                {stages.map((stage, index) => (
                    <div
                        key={index}
                        // onClick={() => handleStageSelect(index)}
                        style={{
                            flex: '1',
                            minWidth: 0,
                            background: index <= activeStage
                                ? "linear-gradient(90deg, #111A2E 0%, #375494 100%)"
                                : "#d8dadfff",
                            // color: index <= activeStage ? "black" : "#666",
                            color: index <= activeStage ? "white" : "#345294ff",
                            padding: "8px 15px",
                            position: "relative",
                            display: "flex",
                            // alignItems: "center",
                            // justifyContent: "center",
                            fontFamily: "Nunito Sans",
                            fontSize: "clamp(10px, 1.9vw, 13px)",
                            fontWeight: "600",
                            cursor: "pointer",
                            height: "40px",
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            clipPath: 'polygon(10px 50%, 0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)',
                            marginLeft: '10px',
                            marginRight: '10px', zIndex: stages.length - index,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            // fontFamily: 'Nunito Sans, sans-serif',
                        }}
                    // onClick={() => handleStageSelect(index)}
                    >
                        <span style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%'
                        }}>
                            {stage}
                        </span>
                    </div>
                ))}
            </div>

            <div className="stage-content mt-4">
                {activeStage !== 0 && stageComponents[activeStage]}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .container-fluid {
                        padding: 0 10px;
                    }
                }
            `}</style>
            <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                overflowX: 'auto',
                padding: '12px 0',
                gap: '30px',
                fontFamily: 'Nunito Sans',
                fontSize: '14px', 
                fontWeight: 700,
                color: '#2E467A',
                margin: '0 10px',
                whiteSpace: 'nowrap',
            }}>

                {[
                    "Customer Details",
                    "Contact Person",
                    "Contact Directory",
                    "Consignee Details",
                    "Consignee Directory",
                    "Feedback form",
                    "Complaint form"
                ].map((label, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{label}</span>
                        <img
                            src={editIcon}
                            alt="Edit"
                            style={{
                                marginLeft: '5px',
                                width: '14px',
                                height: '14px',
                                gap: '18px',
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                ))}
            </div>

        </div>

    );
};

export default SectionMenu;
