import React, { useState, useEffect } from "react";
import Button from "../../../components/base/Button";
import axiosInstance from "../../../axios";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import swal from 'sweetalert';
import main from '../../../assets/img/icons/doc_download.svg';
import AddNewCustomerModal from "../../sales/customers/AddNewCustomerModal";
import { useParams } from "react-router-dom";
import Rightcard from "../inquiryRecived/Rightcard";

const FifthMain = ({ onPiValidation }) => {
    const [tableData, setTableData] = useState([]);
    const [decisionMakerName, setDecisionMakerName] = useState("");
    const [date, setDate] = useState("DDMMYYYY");
    const [productData, setProductData] = useState([]);
    const [piNumber, setPiNumber] = useState('');
    const [piDate, setPIDate] = useState('');
    const [id, setQuotationId] = useState('');
    // const leadId = localStorage.getItem("lead_id");
    // const customer_id = localStorage.getItem("cst_id");
    const { leadId } = useParams();
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    let rowIndex = 1;

    // Add validation check
    const isPiDetailsValid = piNumber && piDate;

    // Notify parent component about validation state changes
    useEffect(() => {
        if (onPiValidation) {
            onPiValidation(isPiDetailsValid);
        }
    }, [isPiDetailsValid, onPiValidation]);

    useEffect(() => {
        if (piNumber) {
            localStorage.setItem('piNumber', piNumber);
        }
        if (piDate) {
            localStorage.setItem('piDate', piDate);
        }
        if (id) {
            localStorage.setItem('quotationId', id);
        }
    }, [piNumber, piDate, id]);
    // Load data on component mount
    useEffect(() => {
        const fetchQuationsent = async () => {

            // quotation_sent_show
            try {
                const response = await axiosInstance.get("/price_shared_show", {
                    params: {
                        lead_id: leadId,
                        customer_id: customerId,
                    },
                });

                const data = response.data;
                setLoading(false);
                setProductData(data.data);
            } catch (error) {
                return [];
            }
        };

        fetchQuationsent();
    }, []);

    const handleDecisionMakerNameChange = (e) => {
        setDecisionMakerName(e.target.value);
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const handleQuotedPriceChange = (e, index) => {
        const updatedData = [...tableData];
        updatedData[index].quotedPrice = e.target.value;
        setTableData(updatedData);
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "N/A";
        }

        try {
            const date = new Date(dateString);

            if (isNaN(date)) {
                console.error("Invalid date string:", dateString);
                return "N/A";
            }

            // Option 1: toLocaleDateString with options (Recommended for flexibility)
            const dateOnly = date.toLocaleDateString('en-CA', { // 'en-CA' for YYYY-MM-DD
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });

            // Option 2: toISOString and slice (Good for consistent YYYY-MM-DD)
            // const dateOnly = date.toISOString().slice(0, 10);

            return dateOnly;

        } catch (error) {
            console.error("Error formatting date:", error);
            return "N/A";
        }
    };

    const handleClose = () => setShowModal(false);

    useEffect(() => {
        const fetchPiData = async () => {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            try {
                const response = await axiosInstance.get('/get_pi_number', {
                    params: {
                        lead_id: leadId,
                        lead_customer_id: customerId,
                    },
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });

                const data = response.data;

                if (data.success) {
                    setPiNumber(data.pi_number);
                    setPIDate(data.pi_date);
                    setQuotationId(data.id);
                    //  setQuotationId(data.quotation_id);
                } else {
                    console.error("API returned success: false. Check your lead_id and lead_customer_id.");
                    setPiNumber("");
                    setPIDate("");
                }
            } catch (error) {
                console.error("Error fetching PI data:", error);
                setPiNumber("");
                setPIDate("");
            }
        };

        fetchPiData();
    }, []);

    const handlePDFclicked = async (quoteId, path) => {
        try {
            console.log("called");
            // Fetch the file from the server using the ID
            const response = await axiosInstance.get(`/${path}/${quoteId}`, {
                method: 'GET',
                responseType: 'blob',
            });
            if (response.status !== 200) {
                throw new Error('Failed to download the file');
            }
            // Create a Blob from the response data
            const blob = response.data;
            // Retrieve the filename from the response headers or construct it
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded-file' : 'downloaded-file';

            // Call downloadFile function from utils
            downloadFile(blob, filename); // pass blob data and filename
        } catch (error) {
            if (error.status === 404) {
                swal("Error!", 'File not found', "error");
            }
            console.error('Error downloading the file:', error);
        }
    };


    const handleSuccess = () => {
        setShowModal(false);
    };


    // The downloadFile function definition
    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url); // Clean up the object URL
    };

    // const handleCreateQuotation = () => {
    //     swal({
    //         title: "Customer Not Added",
    //         text: "Please add the customer before creating a quotation.",
    //         icon: "warning",
    //         buttons: {
    //             addCustomer: {
    //                 text: "Add Customer",
    //                 value: "add_customer",
    //             },
    //             createPi: {
    //                 text: "Create PI",
    //                 value: "create_pi",
    //             }
    //         },
    //     }).then((value) => {
    //         switch (value) {
    //             case "add_customer":
    //                 setShowModal(true);
    //                 break;
    //             case "create_pi":
    //                 window.open(`/sales/quotations/create/0/${leadId}/${customer_id}`, '_blank');
    //                 break;
    //             default:
    //                 // Do nothing
    //                 break;
    //         }
    //     });
    // };
    const handleCreateQuotation = () => {
        swal({
            title: "Customer Not Added",
            text: "Please add the customer before creating a quotation.",
            icon: "warning",
            buttons: {
                addCustomer: {
                    text: "Add Customer",
                    value: "add_customer",
                    className: 'custom-btn',
                },
                createPi: {
                    text: "Create PI",
                    value: "create_pi",
                    className: 'custom-btn',
                }
            },
        }).then((value) => {
            switch (value) {
                case "add_customer":
                    setShowModal(true);
                    break;
                case "create_pi":
                    window.open(`/sales/quotations/create/0/${leadId}/${customerId}`, '_blank');
                    break;
                default:
                    break;
            }
        });
    };
    const placeholderStyle = `
    .btnstyle {
        color: #0292E3;
    }
    .btnstyle:hover {
        background-color: #0292E3 !important;
        color: white !important;
    }

    /* Target the swal footer where buttons are placed */
    .swal-footer {
        text-align: center;
    }

    /* Optional: adjust spacing and appearance of buttons */
   .custom-btn {
    margin: 0 6px;
    min-width: 100px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 4px;
    background-color: #0292E3;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.custom-btn:hover {
    background-color: #0279bb;
}

`;

    return (
        <>
            <style>{placeholderStyle}</style>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* First Card - Latest Quoted Prices */}
                    <div
                        className="card shadow-sm"
                        style={{
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            borderRadius: "20px",
                            padding: "1.5rem",
                            fontSize: "14px",
                        }}
                    >
                        <h5 style={{ fontFamily: "Nunito Sans, sans-serif", marginBottom: "1rem" }}>
                            Latest Quoted Prices:
                        </h5>

                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontFamily: "Nunito Sans, sans-serif",
                                    textAlign: "center",
                                }}
                            >
                                <thead>
                                    <tr >
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold", borderTopLeftRadius: "20px", borderBottom: "1px solid #ddd"
                                            }}
                                        >Product Name</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}
                                        >Date</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}                                        >Make</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}                                         >Model</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}                                         >Quantity</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}                                        >Target Price</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                            }}
                                        >Quoted Price</th>
                                        <th
                                            style={{
                                                padding: "7px", fontFamily: 'Nunito Sans', fontWeight: '700', border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold", borderTopRightRadius: "20px", borderBottom: "1px solid #ddd"
                                            }}     >Currency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productData.map((data) => (
                                        <tr key={data.id} style={{ borderBottom: "1px solid #ddd" }}>
                                            <td style={{ padding: "8px" }}>{data.product || "N/A"}</td>
                                            <td style={{ padding: "8px" }}>{formatDate(data.created_at || "N/A")}</td>
                                            <td style={{ padding: "8px" }}>{data.make || "N/A"}</td>
                                            <td style={{ padding: "8px" }}>{data.model || "N/A"}</td>
                                            <td style={{ padding: "8px" }}>{data.quantity || "N/A"}</td>
                                            <td style={{ padding: "8px" }}>{data.target_price || "N/A"}</td>
                                            <td style={{ padding: "8px" }}>
                                                {data.quoted_price || "N/A"}
                                                {data.currency === "USD" ? " USD" : ` ${data.currency}`}
                                            </td>
                                            <td style={{ padding: "8px" }}>{data.currency || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Second Card - PI Details */}
                    <div
                        className="card shadow-sm"
                        style={{
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            borderRadius: "20px",
                            padding: "1.5rem",
                            fontSize: "14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.8rem",
                        }}
                    >
                        {/* Row 1: Create Quotation */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.95rem" }}>Create Quotation:</strong>
                            <button
                                style={{
                                    background: "linear-gradient(90deg, #0b1d4f, #2e4782)",
                                    color: "#fff",
                                    padding: "0.4rem 1rem",
                                    border: "none",
                                    borderRadius: "20px",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                }}
                            >
                                Create Proforma Invoice
                            </button>
                        </div>

                        {/* Row 2: Note */}
                        <p
                            style={{
                                margin: 0,
                                color: "#6c7a94",
                                fontSize: "0.85rem",
                            }}
                        >
                            <strong>Note:</strong> Once you Shared quotation with customer, then you can
                            move forward.
                        </p>

                        {/* Row 3: Buttons */}
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                                style={{
                                    backgroundColor: "#f0f0f0",
                                    color: "#2e4782",
                                    padding: "0.4rem 1rem",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                }}
                            >
                                Previous
                            </button>
                            <button
                                style={{
                                    backgroundColor: "#0b1d4f",
                                    color: "#fff",
                                    padding: "0.4rem 1rem",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                }}
                            >
                                Next
                            </button>
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

export default FifthMain;
