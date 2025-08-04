import React, { useState, useEffect } from 'react';

import editIcon from '../../../assets/img/newIcons/feildedit.png';

import CustomerDetails from "../inquiryRecived/CustomerDetails";
import Contactperson from "../inquiryRecived/Contactperson";
import ConsigneeDetails from "../inquiryRecived/ConsigneeDetails";
import ContactDirectory from "../inquiryRecived/ContactDirectory";
import ConsigneeDirectory from "../inquiryRecived/ConsigneeDirectory";
import Complaintform from "../inquiryRecived/Complaintform";
import FeedbackForm from "../inquiryRecived/FeedbackModal";

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

    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showContactPerson, setShowContactPerson] = useState(false);
    const [showConsigneeDetails, setShowConsigneeDetails] = useState(false);
    const [showContactDirectory, setShowContactDirectory] = useState(false);
    const [showConsigneeDirectory, setShowConsigneeDirectory] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);

    useEffect(() => {
        if (selectedStageIndex !== undefined) {
            setActiveStage(selectedStageIndex);
        } else {
            setActiveStage(0);
        }
    }, [selectedStageIndex]);

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
                        style={{
                            flex: '1',
                            minWidth: 0,
                            background: index <= activeStage
                                ? "linear-gradient(90deg, #111A2E 0%, #375494 100%)"
                                : "#d8dadfff",
                            color: index <= activeStage ? "white" : "#345294ff",
                            padding: "8px 15px",
                            position: "relative",
                            display: "flex",
                            fontFamily: "Nunito Sans",
                            fontSize: "clamp(10px, 1.9vw, 13px)",
                            fontWeight: "600",
                            cursor: "pointer",
                            height: "40px",
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            clipPath: 'polygon(10px 50%, 0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)',
                            marginLeft: '10px',
                            marginRight: '10px',
                            zIndex: stages.length - index,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
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

                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }

                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    max-height: 90vh;
                    overflow-y: auto;
                    width: 90%;
                    max-width: 800px;
                } 
                   .directory-modal {
  max-width: 1300px;
  width: 1629px;
  height: 88vh;
  background: white;
  padding: 20px;
  border-radius: 10px;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
}

 .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.modal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2E467A;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  color: #555;
}
                 .complaint-modal{
    width: 465px;
    height: 454px;
                 }


.feedback-modal {
width: 900px;
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  overflow-y: auto;
  max-height: 90vh;
  position: relative;
  box-sizing: border-box;
}

@media (max-width: 992px) {
  .feedback-modal {
    width: 95%;
  }
}


            `}</style>

            <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                overflowX: 'auto',
                padding: '10px 0',
                gap: '30px',
                fontFamily: 'Nunito Sans',
                fontSize: '14px',
                fontWeight: 700,
                color: '#2E467A',
                margin: '0 10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            }}>

                {/* Each section below */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Customer Details</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowCustomerDetails(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Contact Person</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowContactPerson(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Contact Directory</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowContactDirectory(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Consignee Details</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowConsigneeDetails(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Consignee Directory</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowConsigneeDirectory(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Feedback form</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowFeedbackForm(true)} style={iconStyle} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>Complaint form</span>
                    <img src={editIcon} alt="Edit" onClick={() => setShowComplaintForm(true)} style={iconStyle} />
                </div>
            </div>

            {/* MODALS */}
            {showCustomerDetails && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <CustomerDetails onClose={() => setShowCustomerDetails(false)} />
                    </div>
                </div>
            )}

            {showContactPerson && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <Contactperson onClose={() => setShowContactPerson(false)} />
                    </div>
                </div>
            )}

            {showConsigneeDetails && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <ConsigneeDetails onClose={() => setShowConsigneeDetails(false)} />
                    </div>
                </div>
            )}

            {showContactDirectory && (
                <div className="modal-backdrop">
                    <div className="modal-content directory-modal">
                        <div className="modal-header">
                            <h4>Contact Directory</h4>
                            <button className="modal-close-btn" onClick={() => setShowContactDirectory(false)}>×</button>
                        </div>
                        <ContactDirectory onClose={() => setShowContactDirectory(false)} />
                    </div>
                </div>
            )}

            {showConsigneeDirectory && (
                <div className="modal-backdrop">
                    <div className="modal-content directory-modal">
                        <div className="modal-header">
                            <h4>Contact Directory</h4>
                            <button className="modal-close-btn" onClick={() => setShowConsigneeDirectory(false)}>×</button>
                        </div>
                        <ConsigneeDirectory onClose={() => setShowConsigneeDirectory(false)} />
                    </div>
                </div>
            )}


            {showFeedbackForm && (
                <div className="modal-backdrop">
                    <div className="modal-content feedback-modal">
                        
                        <FeedbackForm onClose={() => setShowFeedbackForm(false)} />
                    </div>
                </div>
            )}

            {showComplaintForm && (
                <div className="modal-backdrop">
                    <div className="modal-content complaint-modal">
                        <Complaintform onClose={() => setShowComplaintForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable icon style
const iconStyle = {
    marginLeft: '5px',
    width: '14px',
    height: '14px',
    objectFit: 'contain',
    cursor: 'pointer'
};

export default SectionMenu;
