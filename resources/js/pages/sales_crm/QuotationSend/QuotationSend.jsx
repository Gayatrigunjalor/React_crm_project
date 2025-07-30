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
            <div className="p-1">
                <div
                    className="mb-1"
                    style={{
                        fontSize: "0.85rem",
                        color: "#6c757d",
                        textAlign: "left",
                    }}
                >
                    <h5 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Product List</h5>
                </div>

                {/* Form Section */}

                <form className="d-grid gap-1">
                    <div className="productdirectory p-1 rounded"
                        style={{
                            width: "100%",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            padding: "5px",
                            scrollbarWidth: 'thin',
                        }}>
                        <table className="table table-striped"
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                fontFamily: 'Nunito Sans, sans-serif'
                            }}>
                            <thead>
                                <tr>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Sr No</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Product Name</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Make</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Model</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Quantity</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Target Price</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Quoted Price</th>
                                    <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            <Spinner animation="border" />{" "}
                                            {/* Loader */}
                                        </td>
                                    </tr>
                                ) : (

                                    productData.map((data) => (
                                        <tr key={data.id}>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{rowIndex++}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.product || "N/A"}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.make || "N/A"}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.model || "N/A"}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.quantity || "N/A"}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.target_price || "N/A"}</td>
                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{data.quoted_price || "N/A"}{data.currency === "USD" ? "$" : data.currency}</td>

                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{formatDate(data.created_at || "N/A")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <h5>Quotation Details</h5>
                    <div>
                        {/* <Button
                            variant="subtle-primary"
                            className="btnstyle"
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #3874FF',
                                // color: '#3874FF',
                                fontFamily: 'Nunito Sans, sans-serif',
                                fontSize: "0.9rem",
                            }}
                        >
                            <a
                                // href={`/sales/quotations/create`}
                                 href={`/sales/quotations/create/0/${leadId}/${customer_id}/lead_customers`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btnstyle"
                                style={{
                                    textDecoration: 'none',
                                    fontFamily: 'Nunito Sans, sans-serif',
                                }}
                            >
                                Create Quotation
                            </a>
                        </Button> */}
                        <Button
                            variant="subtle-primary"
                            className="btnstyle"
                            onClick={handleCreateQuotation}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #3874FF',
                                fontFamily: 'Nunito Sans, sans-serif',
                                fontSize: "0.9rem",
                            }}
                        >
                            Create Quotation
                        </Button>


                        <div className="form-group d-flex align-items-center gap-2 mt-1">
                            <div className="d-flex align-items-center gap-2">  {/* Added this to ensure the inputs and icon align */}
                                <div>
                                    <label className="form-label">PI Number</label>
                                    <input
                                        type="text"
                                        className="form-control small-input"
                                        placeholder="PI Number"
                                        value={piNumber}
                                        onChange={handleDecisionMakerNameChange}
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Date</label>
                                    <input
                                        type="text"
                                        className="form-control small-input"
                                        placeholder="Date"
                                        value={piDate}
                                        onChange={handleDateChange}
                                    />
                                </div>

                                {/* Align the icon inside the same flex container */}
                                {piDate && piNumber && (
                                    <img
                                        className="mt-3"
                                        src={main}
                                        alt="phoenix"
                                        width={32}
                                        height={32}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handlePDFclicked(id, 'pdfWithSignatureQuotation')}
                                    />
                                )}

                            </div>
                        </div>

                    </div>
                </form>
                <ToastContainer />
                {showModal && (
                    <AddNewCustomerModal onHide={handleClose} onSuccess={handleSuccess} leadId={leadId} customer_id={customerId} />
                )}
            </div>
        </>

    );
};

export default FifthMain;
