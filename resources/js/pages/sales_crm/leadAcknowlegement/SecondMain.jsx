import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axios";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

const Popup = ({ onSelectOption, onClose }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#F0EBEBFF",
                padding: "30px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                zIndex: "1000",
                transition: "filter 0.3s ease",
            }}
        >
            <div>
                <h5 className="mt-1 mb-3" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', }}>Select an Option</h5>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onSelectOption("qualified")}
                    style={{
                        padding: "10px",
                        margin: "5px",
                        width: "10rem",
                        fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
                    }}
                >
                    Qualified Opportunity
                </button>

                <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => onSelectOption("clarityPending")}
                    style={{
                        padding: "10px",
                        margin: "5px",
                        width: "10rem",
                        fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
                    }}
                >
                    Clarity Pending
                </button>

                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onSelectOption("disqualified")}
                    style={{
                        padding: "10px",
                        margin: "5px",
                        color: "#fff",
                        width: "10rem",
                        fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
                    }}
                >
                    Disqualified
                </button>
            </div>
            {/* <button
                type="button"
                className="btn "
                onClick={onClose}
                style={{
                    float: "right",
                    width: "6rem",
                    marginTop: "15px",
                    padding: "7px 10px",
                    borderRadius: "5px",
                    backgroundColor: "#424240",
                    color: "white",
                    fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700',
                }}

            >
                Close
            </button> */}
        </div>
    );
};

const SecondMain = ({ lead_id, customer_id, onValidationChange }) => {
    const [qualifiedData, setQualifiedData] = useState([]);
    const [clarityPendingData, setClarityPendingData] = useState([]);
    const [disqualifiedData, setDisqualifiedData] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showSubmit, setSubmit] = useState(false);
    const [selectedData, setSelectedData] = useState([]);
    const [showButton, setShowButton] = useState(true);
    const [showPopup, setShowPopup] = useState(true);
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

    const { leadId } = useParams();
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
        setShowPopup(false);
        setShowButton(false);
        setSubmit(true);
        clearAllCheckboxStates();
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

        return (
            <div className="productdirectory p-3 rounded shadow" style={{ fontFamily: ' Nunito Sans, sans-serif', }}>
                <table
                    className="table table-striped"
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "center",
                        border: "1px solid #ddd",
                        fontFamily: ' Nunito Sans, sans-serif',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ddd" }}>
                                SR. NO.
                            </th>
                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ddd" }}>
                                DATE
                            </th>
                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ddd" }}>
                                STATUS
                            </th>
                            <th style={{ padding: "10px", fontWeight: '700', border: "1px solid #ddd", fontFamily: ' Nunito Sans, sans-serif' }}>
                                REASONS
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center" style={{ border: "1px solid #ddd" }}>
                                    <Spinner animation="border" />
                                </td>
                            </tr>
                        ) : (
                            allEntries.map((entry, index) => (
                                <tr key={`entry-${index}`}>
                                    <td style={{ padding: "8px", border: "1px solid #ddd", fontFamily: ' Nunito Sans, sans-serif' }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd", fontFamily: ' Nunito Sans, sans-serif' }}>
                                        {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : "N/A"}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd", fontFamily: ' Nunito Sans, sans-serif' }}>
                                        {entry.type}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd", fontFamily: ' Nunito Sans, sans-serif' }}>
                                        {entry.reason}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
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
                <Popup
                    onSelectOption={handleSelectOption}
                    onClose={() => setShowPopup(false)}
                />

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
