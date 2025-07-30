import React, { useState, useEffect } from "react";
import SectionMenu from "../SectionMenu/sectionMenu";
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from "../../../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import swal from 'sweetalert';
import { useParams } from "react-router-dom";

const Sixthmain = ({ onFollowUpDetailsChange }) => {
    // const leadId = localStorage.getItem("lead_id");
    // const customer_id = localStorage.getItem("cst_id");
    const { leadId } = useParams();
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    const [dealStages, setDealStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editablePlaceholders, setEditablePlaceholders] = useState({})
    const [selectedStages, setSelectedStages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [selectedDate, setSelectedDate] = useState({});
    const [followUpDetails, setFollowUpDetails] = useState([]);
    const savedSalespersonId = localStorage.getItem('salesperson_id');


    const [salesPersons, setSalesPersons] = useState([]);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState(null);

    useEffect(() => {
        const fetchSalesPersons = async () => {
            try {
                const response = await axiosInstance.get("/Salesperson_List");
                const data = response.data;


                // const savedSalespersonId = localStorage.getItem('salesperson_id');

                if (savedSalespersonId) {

                    const selectedSalesperson = data.employee_list.find(
                        (employee) => employee.id.toString() === savedSalespersonId
                    );


                    if (selectedSalesperson) {
                        setSalesPersons([selectedSalesperson]);
                        setSelectedSalespersonId(selectedSalesperson.id);
                    }
                } else {
                    console.log("No salesperson ID found in localStorage.");
                }
            } catch (error) {
                console.error("Error fetching salesperson data:", error);
            }
        };

        fetchSalesPersons();
    }, []);
    const fetchDealStages = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        setLoading(true);
        try {
            const response = await axiosInstance.get('/follow-ups', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`
                }
            });
            setDealStages(response.data);
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealStages();
    }, []);

    useEffect(() => {
        if (dealStages.length > 0) {
            const initialPlaceholders = {};
            dealStages.forEach(stage => {
                initialPlaceholders[stage.id] = stage.placeholder;
            });
            setEditablePlaceholders(initialPlaceholders);
        }
    }, [dealStages]);

    const handlePlaceholderChange = (id, value) => {
        setEditablePlaceholders(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleModalShow = () => {
        setShowModal(true);
    };

    const handleModalClose = () => setShowModal(false);


    // Handle the change in the textarea
    const handleStatusChange = (event) => {
        setStatusText(event.target.value);
    };


    const handleNewStatusSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            const response = await axiosInstance.post(
                'follow-ups',
                { status: statusText },
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`
                    },
                }
            );
            // console.log('Status added:', response.data);
            fetchDealStages();
            handleModalClose();

        } catch (error) {
            console.error('Error adding status:', error);
        }
    };

    // const handleDateChange = (id, date) => {
    //     setSelectedDate(prev => ({
    //         ...prev,
    //         [id]: date
    //     }));
    // };
    const handleDateChange = (stageId, date) => {
        setSelectedDate(prevState => ({
            ...prevState,
            [stageId]: date
        }));

        // Don't automatically populate the placeholder - let user enter their own content
        // setEditablePlaceholders(prevState => ({
        //     ...prevState,
        //     [stageId]: ` ${date.toLocaleString()} and reason :`
        // }));
    };


    // Handle checkbox selection
    const handleStageSelection = (id) => {
        setSelectedStages((prev) => {
            // If the clicked stage is already selected, deselect it
            if (prev.includes(id)) {
                return [];
            } else {
                // If a different stage is selected, replace it with the new one
                return [id];
            }
        });
    };

    const fetchFollowUpDetails = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        try {
            const response = await axiosInstance.get('/getFollowupDetails', {
                params: { lead_id: leadId, customer_id: customerId },
                headers: {
                    Authorization: `Bearer ${cleanToken}`
                }
            });
            setFollowUpDetails(response.data.details);
            // Notify parent component about the followUpDetails state
            if (onFollowUpDetailsChange) {
                onFollowUpDetailsChange(response.data.details.length > 0);
            }
        } catch (err) {
            console.error("Error fetching follow-up details", err);
            if (onFollowUpDetailsChange) {
                onFollowUpDetailsChange(false);
            }
        }
    };

    useEffect(() => {
        fetchFollowUpDetails();
    }, []);

    // Submit the selected stages data
    const handleSubmit = async () => {
        // Validation: Check if any stage is selected
        if (selectedStages.length === 0) {
            swal("Error!", "Please select at least one follow-up status", "error");
            return;
        }

        // Validation: Check if the selected stage has meaningful content in its placeholder
        const selectedStageId = selectedStages[0]; // Since only one can be selected
        const placeholder = editablePlaceholders[selectedStageId] || '';
        const stage = dealStages.find(stage => stage.id === selectedStageId);
        const isFirstStage = dealStages.indexOf(stage) === 0;
        
        let isEmpty = false;
        if (isFirstStage) {
            // For first stage, check if there's content beyond just the date
            const selectedDateString = selectedDate[selectedStageId]?.toLocaleString() || '';
            const contentWithoutDate = placeholder.replace(selectedDateString, '').replace('and reason :', '').trim();
            isEmpty = contentWithoutDate === '';
        } else {
            // For other stages, just check if there's any content
            isEmpty = placeholder.trim() === '';
        }

        if (isEmpty) {
            swal("Error!", "Please provide details/reasons for the selected follow-up status", "error");
            return;
        }

        const details = [{
            type: stage?.status,
            data: isFirstStage
                ? `Schedule next follow-up ${selectedDate[selectedStageId]?.toLocaleString() || ''} and reason : ${placeholder ? `\n${placeholder} ` : ''}`
                : placeholder
        }];

        try {
            const response = await axiosInstance.post(
                '/follow-up-details',
                {
                    lead_id: leadId,
                    customer_id: customerId,
                    details: details,
                    status: '1'
                }
            );
            // console.log('Follow-up details submitted:', response.data);
            fetchFollowUpDetails();
            swal("Success!", "Follow-up details submitted successfully", "success");
        } catch (error) {
            console.error('Error submitting follow-up details:', error);
            swal("Error!", "Failed to submit follow-up details", "error");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="d-flex ">
            {/* Left Side Content */}


            <div className="flex-grow-4">
                {/* <hr style={{ border: "1px solid #444" }} /> */}

                <div
                    className="mb-3"
                    style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', fontSize: "1rem", textAlign: "left", }}
                >
                    Follow Up
                </div>
                <hr style={{ border: "1px solid #777", width: '100%' }} />

                <div
                    className="p-2 mb-1"
                    style={{
                        fontSize: "1rem",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        fontFamily: 'Nunito Sans, sans-serif'

                    }}
                >
                    {salesPersons[0]?.name}

                </div>

                <Row className="mb-4" style={{ textAlign: "center" }}>
                    <Col xs={12} md={6} className="mb-2">
                        <Button
                            variant="success"
                            style={{
                                width: "100%",
                                maxWidth: "15rem",
                                backgroundColor: '#25B003',
                                fontFamily: 'Nunito Sans, sans-serif',

                            }}
                        >
                            Select Follow-up Status
                        </Button>
                    </Col>
                    <Col xs={12} md={6} className="mb-2">
                        <Button
                            style={{
                                width: "100%",
                                maxWidth: "15rem",
                                backgroundColor: "black",
                                color: "white",
                                fontFamily: 'Nunito Sans, sans-serif',
                                border: "none",
                            }}
                            onClick={() => window.open("http://3.108.53.235/sales/dashboard", "_blank")}
                        >
                            Open Interactive Panel
                        </Button>
                    </Col>

                </Row>
                <div className="d-flex" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    {/* First section: Deal Stages */}
                    <div
                        className="me-3"
                        style={{
                            padding: "12px 20px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            width: "50%",
                            textAlign: "left",
                            overflowY: "auto",
                            maxHeight: "400px",
                            border: "1px solid #ddd",
                            boxSizing: "border-box",
                            background: "#f9f9f9",
                            fontFamily: 'Nunito Sans, sans-serif', // Applied font family here
                        }}
                    >
                        {dealStages.map((stage, index) => (
                            <div key={stage.id} className="d-flex align-items-start flex-wrap mb-2" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                                <input
                                    type="checkbox"
                                    style={{ marginRight: "8px", cursor: "pointer" }}
                                    onChange={() => handleStageSelection(stage.id)}
                                    checked={selectedStages.includes(stage.id)}
                                />

                                <div style={{ width: "100%", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                                    <strong>{stage.status}:</strong>
                                    {index === 0 && (
                                        <div style={{
                                            marginTop: "10px",
                                            marginBottom: "10px",
                                            padding: "10px",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            backgroundColor: "#f9fafb",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                                        }}>
                                            <DatePicker
                                                selected={selectedDate[stage.id]}
                                                onChange={(date) => handleDateChange(stage.id, date)}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                placeholderText="📅 Select follow-up date & time"
                                                minDate={new Date()}
                                                minTime={(() => {
                                                    const today = new Date();
                                                    const selected = selectedDate[stage.id] || today;
                                                    return selected.toDateString() === today.toDateString() ? today : new Date(0, 0, 0, 0, 0, 0);
                                                })()}
                                                maxTime={new Date(0, 0, 0, 23, 59, 0)}
                                                timeIntervals={15}
                                                className="custom-datepicker"
                                                style={{
                                                    width: "100%",
                                                    fontSize: "0.9rem",
                                                    fontFamily: 'Nunito Sans, sans-serif',
                                                    border: "none",
                                                    outline: "none",
                                                    padding: "8px",
                                                    borderRadius: "6px"
                                                }}
                                            />
                                        </div>


                                    )}
                                    <textarea
                                        //  value={editablePlaceholders[stage.id]}
                                        onChange={(e) => handlePlaceholderChange(stage.id, e.target.value)}
                                        placeholder={selectedStages.includes(stage.id) ? "Please provide details for this follow-up status..." : "Select checkbox above to add details"}
                                        style={{
                                            width: "100%",
                                            minHeight: "60px",
                                            fontSize: "0.8rem",
                                            padding: "6px",
                                            boxSizing: "border-box",
                                            border: (() => {
                                                if (!selectedStages.includes(stage.id)) return "1px solid #ccc";
                                                
                                                const placeholder = editablePlaceholders[stage.id] || '';
                                                if (index === 0) {
                                                    // For first stage, check if there's content beyond just the date
                                                    const selectedDateString = selectedDate[stage.id]?.toLocaleString() || '';
                                                    const contentWithoutDate = placeholder.replace(selectedDateString, '').replace('and reason :', '').trim();
                                                    return contentWithoutDate === '' ? "2px solid #dc3545" : "1px solid #ccc";
                                                } else {
                                                    // For other stages, just check if there's any content
                                                    return placeholder.trim() === '' ? "2px solid #dc3545" : "1px solid #ccc";
                                                }
                                            })(),
                                            borderRadius: "4px",
                                            fontFamily: 'Nunito Sans, sans-serif',
                                            backgroundColor: (() => {
                                                if (!selectedStages.includes(stage.id)) return "white";
                                                
                                                const placeholder = editablePlaceholders[stage.id] || '';
                                                if (index === 0) {
                                                    // For first stage, check if there's content beyond just the date
                                                    const selectedDateString = selectedDate[stage.id]?.toLocaleString() || '';
                                                    const contentWithoutDate = placeholder.replace(selectedDateString, '').replace('and reason :', '').trim();
                                                    return contentWithoutDate === '' ? "#fff5f5" : "white";
                                                } else {
                                                    // For other stages, just check if there's any content
                                                    return placeholder.trim() === '' ? "#fff5f5" : "white";
                                                }
                                            })()
                                        }}
                                    />
                                    {(() => {
                                        if (!selectedStages.includes(stage.id)) return null;
                                        
                                        const placeholder = editablePlaceholders[stage.id] || '';
                                        let isEmpty = false;
                                        
                                        if (index === 0) {
                                            // For first stage, check if there's content beyond just the date
                                            const selectedDateString = selectedDate[stage.id]?.toLocaleString() || '';
                                            const contentWithoutDate = placeholder.replace(selectedDateString, '').replace('and reason :', '').trim();
                                            isEmpty = contentWithoutDate === '';
                                        } else {
                                            // For other stages, just check if there's any content
                                            isEmpty = placeholder.trim() === '';
                                        }
                                        
                                        return isEmpty ? (
                                            <small style={{ color: "#dc3545", fontSize: "0.7rem", fontFamily: 'Nunito Sans, sans-serif' }}>
                                                * Please provide details/reasons for this follow-up status
                                            </small>
                                        ) : null;
                                    })()}
                                    <br />
                                    {/* <span style={{ color: "#777", fontSize: "0.75rem" }}>{stage.next_follow_up_date}</span> */}


                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second section: Follow Up Details */}
                    <div
                        style={{
                            padding: "12px 18px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            width: "45%",
                            textAlign: "left",
                            overflowY: "auto",
                            border: "1px solid #ddd",
                            maxHeight: "400px",
                            boxSizing: "border-box",
                            background: "#f9f9f9",
                            fontFamily: 'Nunito Sans, sans-serif', // Applied font family here
                        }}
                    >
                        {followUpDetails.length > 0 ? (
                            followUpDetails.map((detail) => (
                                <p key={detail.id} style={{ marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "6px", fontFamily: 'Nunito Sans, sans-serif' }}>
                                    <strong>{detail.type}:</strong> {detail.data}
                                    <br />
                                    <span style={{ color: "#777", fontSize: "0.75rem" }}>
                                        {new Date(detail.created_at).toLocaleString()}
                                    </span>
                                </p>
                            ))
                        ) : (
                            <p style={{ fontSize: "0.8rem", color: "#666", fontFamily: 'Nunito Sans, sans-serif' }}>No follow-up details available.</p>
                        )}
                    </div>
                </div>



                {/* Responsive Styling for Smaller Screens */}
                <div
                    style={{
                        display: "none",
                        "@media (max-width: 768px)": {
                            display: "block",
                        },
                    }}
                >
                    <script>
                        {`
        window.addEventListener('resize', function() {
            const elements = document.querySelectorAll('.me-3, div[style*="width: 40%"]');
            if (window.innerWidth <= 768) {
                elements.forEach(el => el.style.width = "100%");
            } else {
                elements[0].style.width = "55%";
                elements[1].style.width = "40%";
            }
        });
        `}
                    </script>
                </div>


                <br />
                {/* <Calendar /> */}
                <Row>
                    <Col>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            style={{
                                backgroundColor: '#0292E3',
                                fontFamily: 'Nunito Sans, sans-serif',

                            }}
                        >
                            Submit Follow-Up Status
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            variant="success"
                            onClick={() => handleModalShow()}
                            style={{
                                backgroundColor: '#25B003',
                                fontFamily: 'Nunito Sans, sans-serif',

                            }}
                        >
                            Add More Follow-Up Status
                        </Button>
                    </Col>

                </Row>


                {/* Modal for adding new opportunity */}
                <Modal show={showModal} onHide={handleModalClose} style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Follow-Up Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="statusText">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={statusText}
                                    onChange={handleStatusChange}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleNewStatusSubmit}>
                            Add Status
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Sixthmain;