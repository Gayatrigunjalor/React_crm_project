import React from "react";
import { Row, Col, Form } from "react-bootstrap";
import DownloadIcon from "../../../assets/img/newIcons/download.svg";
import AttachIcon from "../../../assets/img/newIcons/attach.svg";
import TrashIcon from "../../../assets/img/newIcons/delete.svg";
import EditIcon from "../../../assets/img/newIcons/edit.svg";
import CalendarIcon from "../../../assets/img/newIcons/calender.svg";
import CustomLeadStatusDropdown from "./leadeSelect"

const TaskManagerContent = () => { 
    
    return (
        <>
            <style>{`
                .form-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #2E467A;
                    margin-bottom: 0;
                    display: inline-block;
                    margin-right: 8px;
                    white-space: nowrap;
                }

                .sales-name {
                    font-weight: 700;
                    background: linear-gradient(135deg,rgb(111, 128, 164), #375494);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 13px;
                }

                .header-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #375494;
                    margin-bottom: 0;
                }

                .form-icon {
                    position: absolute;
                    top: 50%;
                    right: 8px;
                    transform: translateY(-50%);
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    filter: url(#gradient-filter);
                }

                .icon-btn {
                    width: 14px;
                    height: 14px;
                    cursor: pointer;
                    filter: url(#gradient-filter);
                }

                .input-field {
                    border: none;
                    border-bottom: 1px solid #00000066;
                    border-radius: 0;
                    padding-right: 25px;
                    padding-left: 4px;
                    padding-bottom: 2px;
                    color: #000000;
                    background-color: transparent;
                    font-size: 13px;
                    height: 28px;
                    box-shadow: none;
                    flex: 1;
                }

                .input-field:focus {
                    box-shadow: none;
                    border-color: #1743a2ff;
                    outline: none;
                }

                .section-title {
                    font-weight: 600;
                    margin-top: 1rem;
                    margin-bottom: 0.8rem;
                    font-size: 13px;
                    color: #000000;
                }

                .form-container {
                    border-radius: 15px;
                    padding: 1rem 1.2rem;
                    margin: 0;
                    height: 400px;
                }

                .header-row {
                    margin-bottom: 1rem;
                    align-items: center;
                }

                .icon-group {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .form-row {
                    margin-bottom: 0.8rem;
                }

                .field-container {
                    position: relative;
                    margin-bottom: 0.6rem;
                    display: flex;
                    align-items: center;
                }

                .input-wrapper {
                    position: relative;
                    flex: 1;
                    max-width: 200px;
                }

                /* SVG gradient filter */
                .svg-defs {
                    position: absolute;
                    width: 0;
                    height: 0;
                }

                .compact-field {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.6rem;
                }

                .compact-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #2E467A;
                    margin-right: 8px;
                    white-space: nowrap;
                    min-width: fit-content;
                }

                .lead-status-section {
                    margin-top: 0.5rem;
                }
            `}</style>

            {/* SVG gradient definition for icons */}
            <svg className="svg-defs">
                <defs>
                    <linearGradient id="gradient-filter" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#111A2E" />
                        <stop offset="100%" stopColor="#375494" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="form-container">
                <Row className="header-row">
                    <Col md={6}>
                        <span className="header-label">
                            Sales Person Name: <span className="sales-name">INT Vedant Sales</span>
                        </span>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end">
                        <div className="icon-group">
                            <span className="header-label">Choose File</span>
                            <img src={AttachIcon} alt="Choose File" className="icon-btn" />
                            <img src={DownloadIcon} alt="Download" className="icon-btn" />
                            <img src={TrashIcon} alt="Delete" className="icon-btn" />
                        </div>
                    </Col>
                </Row>

                <Row className="form-row">
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label" style={{ minWidth: "80px" }}>Order Value:</label>
                            <div className="input-wrapper" style={{ maxWidth: "180px" }}>
                                <Form.Control type="text" className="input-field" />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label" style={{ minWidth: "80px" }}>Buying Plan:</label>
                            <div className="input-wrapper" style={{ maxWidth: "180px" }}>
                                <Form.Control type="text" className="input-field" />
                                <img src={CalendarIcon} alt="Calendar" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="section-title">
                    <h5 style={{
                        color: "#000000",
                        fontWeight: "700",
                        marginBottom: "1rem",
                        fontFamily: "Nunito Sans",
                        fontSize: "14px"
                    }}>     Purchase Decision Maker</h5></div>

                <Row className="form-row">
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label" style={{ minWidth: "45px" }}>Name:</label>
                            <div className="input-wrapper" style={{ maxWidth: "200px" }}>
                                <Form.Control type="text" className="input-field" />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label" style={{ minWidth: "80px" }}>Mo.Number:</label>
                            <div className="input-wrapper" style={{ maxWidth: "220px" }}>
                                <Form.Control type="text" className="input-field" />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="form-row">
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label" style={{ minWidth: "55px" }}>E - Mail:</label>
                            <div className="input-wrapper" style={{ maxWidth: "190px" }}>
                                <Form.Control type="email" className="input-field" />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="lead-status-section">
                    <CustomLeadStatusDropdown/>
                </div>

            </div>
        </>
    );
};

export default TaskManagerContent;