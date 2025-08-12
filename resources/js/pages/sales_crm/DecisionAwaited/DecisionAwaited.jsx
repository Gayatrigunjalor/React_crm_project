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
import Rightcard from "../inquiryRecived/Rightcard";

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
            <div
                className="card-main  d-flex justify-content-between"
                style={{
                    width: "1200px",
                    maxWidth: '1200px',

                    padding: "12px 16px",
                    fontFamily: "Nunito Sans",
                    display: "flex",
                    flexDirection: "row",
                    marginLeft: "-28px",
                    flexWrap: "nowrap",
                    gap: "16px",
                    position: "relative",
                }}
            >
                <div className="container mt-4" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>

                    <h6 style={{ fontSize: '18px', fontWeight: '700', textAlign: 'left' }}>Victory Stage</h6>
                    <hr style={{ border: "1px solid #777" }} />

                    {/* Top Row - Two Cards Side by Side */}
                    <div className="row g-4 mb-4">

                        {/* Card 1 - Follow-up Status */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm p-3 h-100">
                                <h6 className="mb-3">Select Follow up status:</h6>
                                <div className="d-flex flex-column gap-2">
                                    <Form.Check type="checkbox" label="Re - Engage the lead:" />
                                    <Form.Check type="checkbox" label="Buyer is Thinking Internally:" />
                                    <Form.Check type="checkbox" label="Ready to Close - Awaiting Payment:" />
                                    <Form.Check type="checkbox" label="Offer Under Final Review:" />
                                    <Form.Check type="checkbox" label="Follow up after price sharing:" />
                                </div>
                                <div className="mt-3">
                                    <Button variant="primary" className="w-100">Submit</Button>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 - Follow-up Details */}
                        <div className="col-lg-7">
                            <div className="card shadow-sm p-3 h-100">
                                <h6 className="mb-3">Follow Up Details</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div>
                                        <strong>Re-Engage The Lead:</strong>
                                        <p className="mb-1 small">The Buyer Has Received All Necessary Information...</p>
                                        <span className="text-muted small">13/05/2025 10:30</span>
                                    </div>
                                    <div>
                                        <strong>Buyer Is Thinking Internally:</strong>
                                        <p className="mb-1 small">The Lead Has Gone Cold Or Hasn't Responded...</p>
                                        <span className="text-muted small">13/05/2025 10:30</span>
                                    </div>
                                    <div>
                                        <strong>Offer Under Final Review:</strong>
                                        <p className="mb-1 small">The Proposal Has Been Submitted...</p>
                                        <span className="text-muted small">13/05/2025 10:30</span>
                                    </div>
                                    <div>
                                        <strong>Active Discussion & Objections:</strong>
                                        <p className="mb-1 small">The Buyer Is Engaged And Asking Questions...</p>
                                        <span className="text-muted small">13/05/2025 10:30</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row - Note Card Full Width */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm p-3 d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <div>
                                    <strong>Note:</strong>
                                    <span className="ms-2 text-muted">Once your follow up is done you can move forward.</span>
                                </div>
                                <div className="d-flex gap-2 mt-3 mt-md-0">
                                    <Button variant="secondary">Previous</Button>
                                    <Button variant="primary">Next</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div
                    className="right-card shadow-sm"
                    style={{
                        flex: "0 0 485px",
                        height: "500px", // fixed height to match left
                        borderRadius: "20px",
                        backgroundColor: "#fff",
                        margin: "10px 0 10px 0px",
                        padding: "30px",
                        overflow: "hidden", // prevent scrollbars
                    }}
                >
                    <Rightcard />
                </div>

            </div>
        </div>
    );
};

export default Sixthmain;