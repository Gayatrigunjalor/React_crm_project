import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Spinner, Modal } from "react-bootstrap";
import ProductSourcing from "../productSourcing/productSourcing";
import PriceShared from "../PriceShared/PriceShared";
import FifthMain from "../QuotationSend/QuotationSend";
import DecisionAwaited from "../DecisionAwaited/DecisionAwaited";
import VictoryStage from "../VictoryStage/VictoryStage";
import Rightcard from "../inquiryRecived/Rightcard";
import Qualified from "../leadAcknowlegement/Qualified";
import Disqualified from "../leadAcknowlegement/Disqualified";
import Claritypending from "../leadAcknowlegement/Claritypending";
// const Popup = ({ onSelectOption, onClose }) => {
//     return (
//         <div
//             style={{
//                 position: "fixed",
//                 top: "10%",
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 backgroundColor: "#F0EBEBFF",
//                 padding: "30px",
//                 borderRadius: "8px",
//                 boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                 zIndex: "1000",
//                 transition: "filter 0.3s ease",
//             }}
//         >
//             <div>
//                 <h5 className="mt-1 mb-3" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', }}>Select an Option</h5>
//                 <button
//                     type="button"
//                     className="btn btn-primary"
//                     onClick={() => onSelectOption("qualified")}
//                     style={{
//                         padding: "10px",
//                         margin: "5px",
//                         width: "10rem",
//                         fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
//                     }}
//                 >
//                     Qualified Opportunity
//                 </button>

//                 <button
//                     type="button"
//                     className="btn btn-warning"
//                     onClick={() => onSelectOption("clarityPending")}
//                     style={{
//                         padding: "10px",
//                         margin: "5px",
//                         width: "10rem",
//                         fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
//                     }}
//                 >
//                     Clarity Pending
//                 </button>

//                 <button
//                     type="button"
//                     className="btn btn-danger"
//                     onClick={() => onSelectOption("disqualified")}
//                     style={{
//                         padding: "10px",
//                         margin: "5px",
//                         color: "#fff",
//                         width: "10rem",
//                         fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
//                     }}
//                 >
//                     Disqualified
//                 </button>
//             </div>
//             {/* <button
//                 type="button"
//                 className="btn "
//                 onClick={onClose}
//                 style={{
//                     float: "right",
//                     width: "6rem",
//                     marginTop: "15px",
//                     padding: "7px 10px",
//                     borderRadius: "5px",
//                     backgroundColor: "#424240",
//                     color: "white",
//                     fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
//                 }}

//             >
//                 Close
//             </button> */}
//         </div>
//     );
// };

const SecondMain = ({ lead_id, customer_id, onValidationChange }) => {
    const [qualifiedData, setQualifiedData] = useState([]);
    const [clarityPendingData, setClarityPendingData] = useState([]);
    const [disqualifiedData, setDisqualifiedData] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showSubmit, setSubmit] = useState(false);
    const [selectedData, setSelectedData] = useState([]);
    const [showButton, setShowButton] = useState(true);
    const [showLeadqualified, setLeadqualified] = useState([]);
    const [showDateCreated, setDateCreated] = useState([]);
    const [showLeaddisqualified, setLeaddisqualified] = useState([]);
    const [showLeadclearitypending, setLeadclearitypending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStatus, setStatus] = useState([]);
    const [showLeadStatus, setLeadStatus] = useState([]);
    const [checkedClarityPendingItems, setCheckedClarityPendingItems] = useState({});
    const [checkedQualifiedItems, setCheckedQualifiedItems] = useState({}); // Separate state for qualified
    const [checkedDisqualifiedItems, setCheckedDisqualifiedItems] = useState({}); // Separate state for disqualified
    const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state for submit button
    const [hasProductSourcingData, setHasProductSourcingData] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const { leadId } = useParams();
    const [showQualified, setShowQualified] = useState(false);
    const [showDisqualified, setShowDisqualified] = useState(false);
    const [showClarityPending, setShowClarityPending] = useState(false);

    const [showPopup, setShowPopup] = useState(false); // State for popup visibility

    // const customerId = localStorage.getItem("cst_id");
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    let counter = 1;

    // Function to clear all checkbox states
    const clearAllCheckboxStates = () => {
        setCheckedQualifiedItems({});
        setCheckedDisqualifiedItems({});
        setCheckedClarityPendingItems({});
    };

    const components = [
        { id: 1, component: (props) => <InquiredData {...props} />, name: "Inquired Data" },
        { id: 2, component: SecondMain, name: "Lead Acknowledgement" },
        { id: 3, component: ProductSourcing, name: "Product Sourcing" },
        { id: 4, component: PriceShared, name: "Price Shared" },
        { id: 5, component: FifthMain, name: "Quotation Sent" },
        { id: 6, component: DecisionAwaited, name: "Follow Up" },
        { id: 7, component: VictoryStage, name: "Victory Stage" },
    ];

    // Function to check if any checkboxes are selected
    const hasAnySelections = () => {
        return Object.keys(checkedQualifiedItems).length > 0 ||
            Object.keys(checkedDisqualifiedItems).length > 0 ||
            Object.keys(checkedClarityPendingItems).length > 0;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [qualifiedRes, clarityPendingRes, disqualifiedRes] =
                    await Promise.all([
                        axiosInstance.get("qualified-opportunities", {
                            params: { lead_id, customer_id },
                        }),
                        axiosInstance.get("clarity-pending", {
                            params: { lead_id, customer_id },
                        }),
                        axiosInstance.get("disqualifiedopportunities", {
                            params: { lead_id, customer_id },
                        }),
                    ]);

                const putData = {
                    lead_id: leadId,
                    customer_id: customerId,
                };

                const response = await axiosInstance.get(
                    "/leadAcknowledgment_show",
                    {
                        params: { lead_id: leadId, customer_id: customerId },
                    }
                );

                if (response) {
                    //console.log("response", response);
                    const data = response.data.data;
                    console.log('MAIN DATA ', data);

                    const datesCreated = [];
                    const leadQualified = [];
                    const leadDisqualified = [];
                    const leadClarityPending = [];
                    const statuses = [];
                    const leadStatuses = [];

                    data.forEach(item => {
                        datesCreated.push(item.created_at);
                        leadQualified.push(item.qualified_data);
                        leadDisqualified.push(item.disqualified_data);
                        leadClarityPending.push(item.clarity_pending_data);
                        statuses.push(item.status);

                        if (item.disqualified === null && item.clarity_pending === null) {
                            leadStatuses.push("qualified");
                        } else if (item.qualified === null && item.clarity_pending === null) {
                            leadStatuses.push("disqualified");
                        } else {
                            leadStatuses.push("clarityPending");
                        }
                    });
                    // console.log('leadClarityPending', leadClarityPending);
                    console.log('statuses', statuses);
                    // Set the states with the full lists
                    setDateCreated(datesCreated);
                    setLeadqualified(leadQualified);
                    setLeaddisqualified(leadDisqualified);
                    setLeadclearitypending(leadClarityPending);
                    setStatus(statuses);
                    setLeadStatus(leadStatuses);
                    setLoading(false);
                }


                setQualifiedData(qualifiedRes.data.data || []);
                setClarityPendingData(clarityPendingRes.data.data || []);
                setDisqualifiedData(disqualifiedRes.data.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [lead_id, customer_id]);

    useEffect(() => {
        console.log("showStatus", showStatus);
        if (showStatus.length > 0 && showStatus[0] === '1') {
            setShowPopup(false);
        } else {
            setShowPopup(true);
        }
    }, [showStatus]);

    const handleSelectOption = (option) => {
        localStorage.setItem("SelectedItemOption", option);
        setSelectedOption(option);
        setShowButton(false);
        setSubmit(true);
        clearAllCheckboxStates();
    };
    const handleStatusClick = (status) => {
        setSelectedStatus(status);
    };

    const selectedMenuOption = localStorage.getItem("SelectedItemOption");

    const handleQualifiedCheckboxChange = (itemId) => {
        setCheckedQualifiedItems(prev => {
            const updated = { ...prev };
            updated[itemId] = !updated[itemId];
            return updated;
        });
    };

    const handleDisqualifiedCheckboxChange = (itemId) => {
        setCheckedDisqualifiedItems(prev => {
            const updated = { ...prev };
            updated[itemId] = !updated[itemId];
            return updated;
        });
    };

    const handleClarityPendingCheckboxChange = (itemId) => {
        setCheckedClarityPendingItems(prev => {
            const updated = { ...prev };
            updated[itemId] = !updated[itemId];
            return updated;
        });
    };

    const handleSubmit = async () => {
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        const selectedQualifiedIds = Object.keys(checkedQualifiedItems).filter(key => checkedQualifiedItems[key]);
        const selectedDisqualifiedIds = Object.keys(checkedDisqualifiedItems).filter(key => checkedDisqualifiedItems[key]);
        const selectedClarityPendingIds = Object.keys(checkedClarityPendingItems).filter(key => checkedClarityPendingItems[key]);

        const data = {
            lead_id: leadId,
            customer_id: customerId,
            status: "1",
            qualified: selectedQualifiedIds.join(","),
            disqualified: selectedDisqualifiedIds.join(","),
            clarity_pending: selectedClarityPendingIds.join(","),
        };

        console.log("Data Sent:", data); // Check the data being sent

        try {
            setIsSubmitting(true);
            const response = await axiosInstance.post("/lead_acknowledgment", data);
            if (response && response.data) {
                toast(response.data.message, "success");
                clearAllCheckboxStates(); // Clear checkbox states after successful submission
                fetchData();
            }
        } catch (error) {
            toast.error("An error occurred while sending the acknowledgment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [qualifiedRes, clarityPendingRes, disqualifiedRes] =
                await Promise.all([
                    axiosInstance.get("qualified-opportunities", {
                        params: { lead_id, customer_id },
                    }),
                    axiosInstance.get("clarity-pending", {
                        params: { lead_id, customer_id },
                    }),
                    axiosInstance.get("disqualifiedopportunities", {
                        params: { lead_id, customer_id },
                    }),
                ]);

            const response = await axiosInstance.get("/leadAcknowledgment_show", {
                params: { lead_id: leadId, customer_id: customerId },
            });

            if (response) {
                const data = response.data.data;
                console.log("MAIN DATA ", data);

                const datesCreated = [];
                const leadQualified = [];
                const leadDisqualified = [];
                const leadClarityPending = [];
                const statuses = [];
                const leadStatuses = [];


                data.forEach((item) => {
                    datesCreated.push(item.created_at);
                    leadQualified.push(item.qualified_data);
                    leadDisqualified.push(item.disqualified_data);
                    leadClarityPending.push(item.clarity_pending_data);
                    statuses.push(item.status);

                    if (item.disqualified === null && item.clarity_pending === null) {
                        leadStatuses.push("qualified");
                    } else if (item.qualified === null && item.clarity_pending === null) {
                        leadStatuses.push("disqualified");
                    } else {
                        leadStatuses.push("clarityPending");
                    }
                });

                setDateCreated(datesCreated);
                setLeadqualified(leadQualified);
                setLeaddisqualified(leadDisqualified);
                setLeadclearitypending(leadClarityPending);
                setStatus(statuses);
                setLeadStatus(leadStatuses);
                setLoading(false);
            }

            setQualifiedData(qualifiedRes.data.data || []);
            setClarityPendingData(clarityPendingRes.data.data || []);
            setDisqualifiedData(disqualifiedRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const renderTable = () => {
        // Create a combined array of all entries with their dates and types
        const allEntries = [];

        // Add qualified entries
        showLeadqualified?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Qualified',
                        reason: leadack?.qualified_opportunity || 'N/A'
                    });
                });
            }
        });

        // Add disqualified entries
        showLeaddisqualified?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Disqualified',
                        reason: leadack?.disqualified_opportunity || 'N/A'
                    });
                });
            }
        });

        // Add clarity pending entries
        showLeadclearitypending?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Clarity Pending',
                        reason: leadack?.clarity_pending || 'N/A'
                    });
                });
            }
        });

        // Sort entries by date
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        const badgeStyle = {
            backgroundColor: '#FFFFFF',
            color: '#2E467A',
            padding: '6px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            border: '1px solid #0000004D',
            minWidth: '110px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out'
        };

        const hoverOn = (e) => {
            e.target.style.background = 'linear-gradient(to right, #111A2E, #375494)';
            e.target.style.color = '#fff';
        };

        const hoverOff = (e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#2E467A';
        };

        return (
            <>
                <div
                    className="card-main  d-flex justify-content-between"
                    style={{
                        width: "1200px",
                        maxWidth: "100%",
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

                    <div style={{ padding: '20px', fontFamily: 'Nunito Sans', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* Lead Acknowledgment Status Card */}
                        <div className="card shadow-sm"
                            style={{
                                width: "650px",
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                borderRadius: "12px",
                                padding: "0.75rem 1rem",
                                marginBottom: "20px",
                                fontSize: "13px",
                                display: "flex",
                                alignItems: "center",
                                minHeight: "44px"
                            }}
                        >
                            <div style={{ width: "100%" }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h6 style={{
                                        margin: 0,
                                        fontWeight: '700',
                                        color: '#333',
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '0.2px',
                                        fontFamily: 'Nunito Sans',
                                    }}>
                                        Lead Acknowledgment Status:
                                    </h6>

                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginLeft: '16px',
                                        fontFamily: 'Nunito Sans',
                                    }}>
                                        {/* Qualified Lead */}
                                        <div>
                                            <span
                                                style={badgeStyle}
                                                onClick={() => setShowQualified(true)}
                                                onMouseEnter={(e) => hoverOn(e)}
                                                onMouseLeave={(e) => hoverOff(e)}
                                            >
                                                Qualified Lead
                                            </span>
                                        </div>

                                        {/* Disqualified Lead */}
                                        <div>
                                            <span
                                                style={badgeStyle}
                                                onClick={() => setShowDisqualified(true)}
                                                onMouseEnter={(e) => hoverOn(e)}
                                                onMouseLeave={(e) => hoverOff(e)}
                                            >
                                                Disqualified Lead
                                            </span>
                                        </div>

                                        {/* Clarity Pending */}
                                        <div>
                                            <span
                                                style={badgeStyle}
                                                onClick={() => setShowClarityPending(true)}
                                                onMouseEnter={(e) => hoverOn(e)}
                                                onMouseLeave={(e) => hoverOff(e)}
                                            >
                                                Clarity Pending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Activity Report Table Card */}
                        <div
                            className="card shadow-sm"
                            style={{
                                width: "650px",
                                height: "420px", // Increased height
                                backgroundColor: "#fff",
                                boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.35)", // Updated shadow
                                borderRadius: "20px",
                                padding: "1.5rem",
                                fontSize: "14px",
                                overflowY: "auto" // Add scroll if entries overflow
                            }}
                        >
                            <h4 style={{
                                fontFamily: 'Nunito Sans',
                                fontWeight: 600, fontSize: "14px",
                            }}
                            >Activity Report:</h4>

                            <div className="productdirectory" style={{
                                marginTop: "20px", borderRadius: "20px", overflow: "hidden", border: "1px solid #ddd",
                            }}>
                                <thead>
                                    <tr style={{
                                        background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                                    }}>
                                        <th style={{
                                            fontFamily: 'Nunito Sans',
                                            fontWeight: 600,
                                            padding: "8px 0",
                                            // background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                                            color: "#fff",
                                            border: "none",
                                            fontSize: "12.5px",
                                            letterSpacing: "0.3px",
                                            borderTopLeftRadius: "20px",
                                            width: "10%",
                                            textAlign: "center"
                                        }}>
                                            Sr.no                                        </th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans',
                                            fontWeight: 600,
                                            padding: "8px 0",
                                            // background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                                            color: "#fff",
                                            border: "none",
                                            fontSize: "12.5px",
                                            letterSpacing: "0.3px",
                                            width: "22%",
                                            textAlign: "center"
                                        }}>
                                            Date                                        </th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans',
                                            fontWeight: 600,
                                            padding: "8px 0",
                                            // background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                                            color: "#fff",
                                            border: "none",
                                            fontSize: "12.5px",
                                            letterSpacing: "0.3px",
                                            width: "20%",
                                            textAlign: "center"
                                        }}>
                                            Status                                        </th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans',
                                            fontWeight: 600,
                                            padding: "8px 0",
                                            // background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                                            color: "#fff",
                                            border: "none",
                                            fontSize: "12.5px",
                                            letterSpacing: "0.3px",
                                            borderTopRightRadius: "20px",
                                            width: "48%",
                                            textAlign: "center"
                                        }}>
                                            Reason
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>
                                    {allEntries.map((entry, index) => (
                                        <tr key={`entry-${index}`}>
                                            <td style={{
                                                padding: "10px 0",
                                                fontFamily: 'Nunito Sans',
                                                fontSize: "12px",
                                                border: "none",
                                                background: "#FFFFFF",
                                                textAlign: "center",
                                                color: "#2E467A",

                                                borderRadius: index === allEntries.length - 1 ? "0 0 0 20px" : "12px 0 0 12px"
                                            }}>
                                                {index + 1}
                                            </td>
                                            <td style={{
                                                padding: "10px 0",
                                                fontFamily: 'Nunito Sans',
                                                fontSize: "12px",
                                                border: "none",
                                                background: "#FFFFFF",
                                                width: "22%",
                                                textAlign: "center",
                                                color: "#2E467A",


                                            }}>
                                                {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : "N/A"}
                                            </td>
                                            <td style={{
                                                padding: "10px 0",
                                                fontFamily: 'Nunito Sans',
                                                fontSize: "12px",
                                                border: "none",
                                                background: "#FFFFFF",
                                                width: "20%",
                                                color: "#2E467A",

                                                textAlign: "center"
                                            }}>
                                                {entry.type}
                                            </td>
                                            <td style={{
                                                padding: "10px 10px",
                                                fontFamily: 'Nunito Sans',
                                                fontSize: "11.5px",
                                                border: "none",
                                                color: "#2E467A",

                                                background: "#FFFFFF",
                                                borderRadius: index === allEntries.length - 1 ? "0 0 20px 0" : "0 12px 12px 0",
                                                textAlign: "left",
                                                width: "48%",
                                                //   textAlign: "center"

                                            }}>
                                                {entry.reason}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </div>
                        </div>
                    </div>

                    <div
                        className="card shadow-sm"
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
            </>
        );
    };

    // Add validation check
    useEffect(() => {
        // Create a combined array of all entries with their dates and types (same logic as renderTable)
        const allEntries = [];

        // Add qualified entries
        showLeadqualified?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Qualified',
                        reason: leadack?.qualified_opportunity || 'N/A'
                    });
                });
            }
        });

        // Add disqualified entries
        showLeaddisqualified?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Disqualified',
                        reason: leadack?.disqualified_opportunity || 'N/A'
                    });
                });
            }
        });

        // Add clarity pending entries
        showLeadclearitypending?.forEach((item, index) => {
            if (item && item.length > 0) {
                item.forEach(leadack => {
                    allEntries.push({
                        date: showDateCreated[index],
                        type: 'Clarity Pending',
                        reason: leadack?.clarity_pending || 'N/A'
                    });
                });
            }
        });

        // Sort entries by date (newest first)
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Check if there are entries in disqualified or clarity pending
        const hasDisqualifiedOrClarityPending = (showLeaddisqualified?.some(item => item && item.length > 0) ||
            showLeadclearitypending?.some(item => item && item.length > 0));

        // Check if all arrays are empty
        const allArraysEmpty = (!showLeadqualified?.some(item => item && item.length > 0) &&
            !showLeaddisqualified?.some(item => item && item.length > 0) &&
            !showLeadclearitypending?.some(item => item && item.length > 0));

        // Check if the first entry (most recent) is "Qualified" or "qualified"
        const isFirstEntryQualified = allEntries.length > 0 &&
            (allEntries[0].type === 'Qualified' || allEntries[0].type === 'qualified');

        // Enable next button if:
        // 1. No disqualified/clarity pending entries AND not all arrays empty, OR
        // 2. First entry is qualified (regardless of other entries)
        const shouldEnableNext = (!hasDisqualifiedOrClarityPending && !allArraysEmpty) || isFirstEntryQualified;

        // Call the validation callback
        if (onValidationChange) {
            onValidationChange(shouldEnableNext);
        }
    }, [showLeadqualified, showLeaddisqualified, showLeadclearitypending, showDateCreated, onValidationChange]);

    return (
        <>
            <style>
                {`
           *{
            font-family: Nunito Sans, sans-serif;
            // color:red;
           }
       `}
            </style>
            <div>

                {/* {showStatus[0] !== '1'
                    ? (
                        <Popup
                            onSelectOption={handleSelectOption}
                            onClose={() => setShowPopup(false)}
                        />
                    )
                    : null} */}
                {/* <Popup
                    onSelectOption={handleSelectOption}
                    onClose={() => setShowPopup(false)}
                /> */}

                {/* Show selected option header */}
                {selectedOption && (
                    <div style={{
                        marginBottom: '15px',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px',
                        border: '1px solid #dee2e6'
                    }}>

                        <h5 style={{
                            margin: 0,
                            color: selectedOption === 'qualified' ? '#155724' :
                                selectedOption === 'clarityPending' ? '#856404' : '#721c24',
                            fontFamily: 'Nunito Sans, sans-serif',
                            fontWeight: '700'
                        }}>
                            Currently Selected: {
                                selectedOption === 'qualified' ? 'Qualified Opportunities' :
                                    selectedOption === 'clarityPending' ? 'Clarity Pending' :
                                        selectedOption === 'disqualified' ? 'Disqualified Opportunities' : ''
                            }
                            {selectedOption === 'qualified' && Object.keys(checkedQualifiedItems).length > 0 &&
                                ` (${Object.keys(checkedQualifiedItems).length} selected)`}
                            {selectedOption === 'clarityPending' && Object.keys(checkedClarityPendingItems).length > 0 &&
                                ` (${Object.keys(checkedClarityPendingItems).length} selected)`}
                            {selectedOption === 'disqualified' && Object.keys(checkedDisqualifiedItems).length > 0 &&
                                ` (${Object.keys(checkedDisqualifiedItems).length} selected)`}
                        </h5>
                    </div>
                )}

                {selectedOption === "qualified" && (
                    <div style={{ border: '1px solid #ddd', height: 'fit-content', borderRadius: '10px', fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', fontSize: '15px' }}>
                        <Section
                            title="Qualified Opportunities"
                            textColor="#155724"
                            points={qualifiedData}
                            checkedItems={checkedQualifiedItems}
                            onCheckboxChange={(itemId) => handleQualifiedCheckboxChange(itemId)} // Pass itemId directly
                            getItemId={(item) => item.id} // Function to get the ID
                        />
                    </div>
                )}

                {selectedOption === "clarityPending" && (
                    <div style={{ border: '1px solid #ddd', height: 'fit-content', borderRadius: '10px', fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', fontSize: '15px' }}>
                        <Section
                            title="Clarity Pending"
                            bgColor="#fff3cd"
                            textColor="#856404"
                            points={clarityPendingData}
                            checkedItems={checkedClarityPendingItems}
                            onCheckboxChange={handleClarityPendingCheckboxChange}
                            renderGrouped={true}
                            getItemId={(item) => item.id} // Function to get the ID
                        />
                    </div>
                )}

                {selectedOption === "disqualified" && (
                    <div style={{ border: '1px solid #ddd', height: 'fit-content', borderRadius: '10px', fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', fontSize: '15px' }}>
                        <Section
                            style={{
                                border: '2px solid black', // Increased border thickness for visibility
                                padding: '15px', // Ensures content doesn't overlap the border
                                margin: '10px', // Adds spacing to avoid overlap with other elements
                                borderRadius: '5px' // Optional for rounded corners
                            }}
                            title="Disqualified Opportunities"
                            bgColor="#f8d7da"
                            textColor="#721c24"
                            points={disqualifiedData}
                            checkedItems={checkedDisqualifiedItems}
                            onCheckboxChange={(itemId) => handleDisqualifiedCheckboxChange(itemId)} // Pass itemId directly
                            getItemId={(item) => item.id} // Function to get the ID
                        />
                    </div>
                )}
                <Modal show={showQualified} onHide={() => setShowQualified(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Qualified Opportunities</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Qualified onClose={() => setShowQualified(false)} />
                    </Modal.Body>
                </Modal>
                <Modal show={showDisqualified} onHide={() => setShowDisqualified(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Disqualified Opportunities</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Disqualified onClose={() => setShowDisqualified(false)} />
                    </Modal.Body>
                </Modal>
                <Modal show={showClarityPending} onHide={() => setShowClarityPending(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Clarity Pending</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Claritypending onClose={() => setShowClarityPending(false)} />
                    </Modal.Body>
                </Modal>
                {/* <style>
                    {`
        .modal-backdrop {
            background-color: rgba(255, 255, 255, 0.97); 
        }
        .modal-content {
            border-radius: 10px; 
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
        }
    `}
                </style> */}
                {/* <hr></hr> */}
                {showSubmit && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            type="button"
                            className="btn btn-primary p-1 mt-2"
                            onClick={handleSubmit}
                            style={{ backgroundColor: "#0292E3", width: "9rem", height: "2rem", fontSize: "1rem" }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary p-1 mt-2"
                            onClick={clearAllCheckboxStates}
                            style={{ width: "9rem", height: "2rem", fontSize: "1rem" }}
                            disabled={!hasAnySelections()}
                        >
                            Clear Selection
                        </button>
                    </div>
                )}

                {selectedMenuOption !== "" && renderTable()}

                {selectedMenuOption == "" && showButton && (
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowPopup(true)}
                        style={{
                            marginTop: "20px",
                            padding: "5px 10px",
                            borderRadius: "5px",
                        }}
                    >
                        Select Options
                    </button>
                )}
                <br />
            </div>
        </>
    );
};



const Section = ({
    title,
    bgColor,
    textColor,
    points,
    checkedItems,
    onCheckboxChange,
    renderGrouped,
    getItemId, // Receive getItemId
}) => {
    // ... (other parts of the Section component)

    return (
        <div style={{ marginBottom: "20px" }}>
            {/* ... (Title styling remains unchanged) */}

            <div className="p-2 mt-2" style={{ borderRadius: "10px", fontSize: "0.7rem", color: "#000" }}>
                {renderGrouped
                    ? points.map((group, index) => (
                        <div key={index} style={{ marginBottom: "15px" }}>
                            {/* ... (Group title remains unchanged) */}
                            {/* Group Title (Positive/Negative) */}
                            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                                <h5>
                                    {group.status_mode === "positive"
                                        ? "Positive"
                                        : "Negative"}{" "}
                                    Status
                                </h5>
                            </div>
                            {group.clarity_list.map((clarity, clarityIndex) => (
                                <div key={clarity.id} style={{ alignItems: "left", marginBottom: "3px", backgroundColor: "#f8f9fa", padding: "5px", borderRadius: "5px" }}>
                                    <input
                                        type="checkbox"
                                        checked={checkedItems[clarity.id] || false}
                                        onChange={() => onCheckboxChange(clarity.id)}
                                        style={{ marginRight: "10px" }}
                                    />
                                    <span>{clarityIndex + 1}. {clarity.clarity_pending || "No information available"}</span>
                                </div>
                            ))}
                        </div>
                    ))
                    : points.map((point, index) => (
                        <div key={point.id || index} style={{ alignItems: "left", marginBottom: "3px", backgroundColor: "#f8f9fa", padding: "5px", borderRadius: "5px" }}>
                            <input
                                type="checkbox"
                                checked={checkedItems[getItemId(point)] || false} // Use getItemId
                                onChange={() => onCheckboxChange(getItemId(point))} // Use getItemId
                                style={{ marginRight: "10px" }}
                            />
                            <span>{index + 1}. {point.qualified_opportunity || point.disqualified_opportunity || point.clarity_pending || ""}</span>
                        </div>
                    ))}
            </div>

            <ToastContainer />
        </div>
    );
};




export default SecondMain;
