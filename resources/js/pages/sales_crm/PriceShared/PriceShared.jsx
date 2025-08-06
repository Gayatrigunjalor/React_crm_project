import React, { useState, useEffect } from "react";
import { FaEye, FaPen, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Button from "../../../components/base/Button";
import axiosInstance from "../../../axios";
import { Form } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { useOpportunity } from "../../../context/OpportunityContext";
// import { cu } from "@fullcalendar/core/internal-common";
import { useParams } from "react-router-dom";
import Rightcard from "../inquiryRecived/Rightcard";



const Fourthmain = ({ onPriceSharedValidation }) => {
    // const leadId = localStorage.getItem("lead_id");
    //  const customer_id = localStorage.getItem("cst_id");
    const { leadId } = useParams();
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    const [productData, setProductData] = useState([]);
    const [quotationtData, setquotationtData] = useState([]);
    const [editedProductData, setEditedProductData] = useState([]);
    const [editIndex, setEditIndex] = useState(null); // Tracks which row is being edited
    const [updatedPrice, setUpdatedPrice] = useState("");
    const [quoteddPrice, setquoteddPrice] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quotedPrice, setQuotedPrice] = useState("");
    const [loading, setLoading] = useState(true);
    const [priceSharedData, setpriceSharedData] = useState([]);
    const { triggerProductPriceRefresh } = useOpportunity();
    const [currencyTableData, setCurrencyTableData] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('sharePrices');

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


            const dateOnly = date.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });


            return dateOnly;

        } catch (error) {
            console.error("Error formatting date:", error);
            return "N/A";
        }
    };
    useEffect(() => {
        if (!leadId) {
            console.log("Lead ID is missing.");
            return;
        }

        const fetchLeadDetails = async () => {
            try {
                const request = {
                    lead_id: leadId,
                    customer_id: customerId,
                };

                const response = await axiosInstance.get(
                    "/showProductsDirectory",
                    {
                        params: {
                            lead_id: leadId,
                            customer_id: customerId,
                        },
                    }
                );

                const data = response.data.products;
                setLoading(false);
                if (Array.isArray(data)) {
                    setquotationtData(data);
                    setEditedProductData(data.map((item) => ({ ...item })));
                } else {
                    setProductData([data]);
                    setEditedProductData([{ ...data }]);
                }
            } catch (err) {
                console.log("Error fetching Data: " + err.message);
            }
        };

        // const fetchQDetails = async () => {
        //     try {
        //         setLoading(true);
        //         const response = await axiosInstance.get("/price_shared_show", {
        //             params: {
        //                 lead_id: leadId,
        //                 customer_id: customer_id,
        //             },
        //         });

        //         const data = response.data;
        //         console.log(data.data);
        //         setLoading(false);
        //         setpriceSharedData(data.data);
        //     } catch (err) {
        //         console.log("Error fetching Data: " + err.message);
        //     }
        // };
        fetchLeadDetails();
        // fetchQDetails();
    }, [leadId, customerId]);

    const fetchQDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/price_shared_show", {
                params: {
                    lead_id: leadId,
                    customer_id: customerId,
                },
            });

            const data = response.data;
            console.log(data.data);
            setLoading(false);
            setpriceSharedData(data.data);
            triggerProductPriceRefresh();
        } catch (err) {
            console.log("Error fetching Data: " + err.message);
        }
    };
    useEffect(() => {
        fetchQDetails();
    }, [leadId, customerId]);

    // Add effect to notify parent about validation status
    useEffect(() => {
        if (onPriceSharedValidation) {
            onPriceSharedValidation(priceSharedData && priceSharedData.length > 0);
        }
    }, [priceSharedData, onPriceSharedValidation]);

    const handleInputChange = (index, field, value) => {
        const updatedData = [...editedProductData];
        updatedData[index][field] = value;
        setEditedProductData(updatedData);
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setUpdatedPrice(editedProductData[index].quoted_price || "");
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        // If there's a selected currency, keep its symbol
        if (selectedCurrency[editIndex]) {
            const symbol = selectedCurrency[editIndex].symbol;
            // Remove any existing symbol and keep only numbers
            const numericValue = value.replace(/[^\d]/g, '');
            setUpdatedPrice(`${symbol} ${numericValue}`);
        } else {
            // If no currency selected, just keep numbers
            setUpdatedPrice(value.replace(/[^\d]/g, ''));
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setQuotedPrice(product.target_price);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const handleSubmit = async () => {
        if (!quotedPrice) {
            alert("Please enter a quoted price");
            return;
        }

        try {
            const response = await axiosInstance.post(
                "/showProductsDirectory",
                {
                    lead_id: leadId,
                    customer_id: customerId,
                    product_id: selectedProduct.id,
                    quoted_price: quotedPrice,
                },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                setLoading(false);
                const updatedProducts = productData.map((product) =>
                    product.id === selectedProduct.id
                        ? { ...product, target_price: quotedPrice }
                        : product
                );
                setProductData(updatedProducts);
                setShowModal(false);
            } else {
                alert("Failed to update quoted price. Please try again.");
            }
        } catch (error) {
            console.error("Error updating quoted price:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const handleUpdateClick = async () => {
        // Extract only the numeric value for quoted_price
        const numericPrice = updatedPrice.replace(/[^\d]/g, '');

        // Validate that quoted price is not empty
        if (!numericPrice || numericPrice.trim() === '' || parseInt(numericPrice) <= 0) {
            toast("Please enter a valid quoted price (greater than 0) before updating", "error");
            return;
        }

        // Validate that currency is selected
        if (!selectedCurrency[editIndex] || !selectedCurrency[editIndex].name) {
            toast("Please select a currency before updating", "error");
            return;
        }

        const updatedData = [...editedProductData];
        updatedData[editIndex].quoted_price = parseInt(numericPrice);
        // Send the currency symbol instead of name
        updatedData[editIndex].currency = selectedCurrency[editIndex]?.symbol || "";
        try {
            const response = await axiosInstance.post("/price-shared", {
                ...updatedData[editIndex],
                make: updatedData[editIndex].make || "DefaultMake",
                customer_id: parseInt(updatedData[editIndex].customer_id),
                status: "1"
            });
            if (response.data) {
                toast(response.data.message, "success");
                setUpdatedPrice("");
                setSelectedCurrency(prev => {
                    const newCurrencies = [...prev];
                    newCurrencies[editIndex] = null;
                    return newCurrencies;
                });
                setEditIndex(null);
                fetchQDetails();
                triggerProductPriceRefresh();
            }
            else {
                toast(response.data.message, "error");
            }
        } catch (error) {
            console.log('error', error);
            toast("Error updating price.", "error");
        }
    };

    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                const response = await axiosInstance.get(`/currencyListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                setCurrencyTableData(response.data);
            } catch (err) {
                setError(err.message); // fixed to `err.message` instead of `err.data.message`
            }
        };

        fetchCurrencyData();
    }, []);



    const [selectedCurrency, setSelectedCurrency] = useState([]);

    const handleCurrencyChange = (index, selectedName) => {
        const selected = currencyTableData.find(c => c.name === selectedName);
        if (!selected) return;

        const updated = [...selectedCurrency];
        updated[index] = selected;
        setSelectedCurrency(updated);

        // Update the input value with the new currency symbol
        if (updatedPrice) {
            const priceWithoutSymbol = updatedPrice.replace(/^[^\d]+/, "").trim();
            setUpdatedPrice(`${selected.symbol} ${priceWithoutSymbol}`);
        }
    };


    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];

            const response = await axiosInstance.delete('/price-shared', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                data: { id },
            });

            if (response.data.success) {
                toast("Item deleted successfully", "success");
                fetchQDetails();
            } else {
                toast("Failed to delete item", "error");
            }
        } catch (error) {
            toast("Error deleting item", "error");
        }
    };

    return (
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
            <div
                className="card shadow-sm"
                style={{
                    flex: "0 0 700px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    margin: "10px 0 0 0",
                    overflow: "hidden",
                    height: "500px",
                    fontSize: "14px"
                }}
            >
                <div className="p-1">
                    <div
                        className="mb-1"
                        style={{
                            fontSize: "0.85rem",
                            color: "#6c757d",
                            textAlign: "left",
                        }}
                    >
                        {/* <h5 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Product List</h5> */}
                    </div>
                    <form className="d-grid gap-1">
                        <div style={{
                            width: "100%",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            padding: "5px",
                            scrollbarWidth: 'thin',
                        }}>
                            <div style={{ width: '100%' }}>
                                {/* Tab Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid #ccc',
                                    marginBottom: '20px'
                                }}>

                                    <button
                                        onClick={() => setActiveTab('sharePrices')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            padding: '10px 20px',
                                            color: activeTab === 'sharePrices' ? '#111A2E' : '#999',
                                            borderBottom: activeTab === 'sharePrices' ? '3px solid #111A2E' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Share Prices
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pricedShared')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            padding: '10px 20px',
                                            color: activeTab === 'pricedShared' ? '#111A2E' : '#999',
                                            borderBottom: activeTab === 'pricedShared' ? '3px solid #111A2E' : 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Priced Shared
                                    </button>


                                </div>
                                {/* Tab Content */}
                                {activeTab === 'sharePrices' && (
                                    <div>
                                        {/* Your existing "Share Prices" table here */}
                                    </div>
                                )}

                                {activeTab === 'pricedShared' && (
                                    <div>
                                        <table className="table table-striped"
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                                textAlign: "center",
                                                border: "1px solid #ccc",
                                                borderStyle: "none",
                                                fontFamily: 'Nunito Sans'
                                            }}>
                                            <thead >
                                                <tr>
                                                    {/* <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)",color: "#fff", fontWeight: "bold"
                                        }}>Sr No</th> */}
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Product Name</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Make</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Model</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Quality</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Target Price</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Quoted Price</th>
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Currency</th>
                                                    {/* <th>Symbol</th> */}
                                                    <th style={{
                                                        fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                                    }}>Submit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center" style={{ border: "1px solid #ccc" }}>
                                                            <Spinner animation="border" /> {/* Loader */}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    editedProductData.map((item, index) => (
                                                        <tr key={index}>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{index + 1}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.product || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.make || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.model || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.quantity || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.target_price || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>
                                                                {editIndex === index ? (
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={updatedPrice}
                                                                        // placeholder={priceSharedData[index]?.quoted_price || "N/A"}
                                                                        placeholder="Enter Quoted Price"
                                                                        onChange={handlePriceChange}
                                                                        style={{ width: '110px' }}
                                                                        required
                                                                    />
                                                                ) : (
                                                                    <span style={{ width: '110px' }}>
                                                                        {item.quoted_price ? `${selectedCurrency[index]?.symbol || ""} ${item.quoted_price}` : "Click Edit to add quoted price"}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>

                                                                {editIndex === index ? (
                                                                    <Form.Select
                                                                        style={{ width: '200px' }}
                                                                        value={selectedCurrency[index]?.name || ""}
                                                                        onChange={(e) => handleCurrencyChange(index, e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Select Currency</option>
                                                                        {currencyTableData.map((currency, idx) => (
                                                                            <option key={currency.id} value={currency.name}>
                                                                                {currency.name} - {currency.symbol}
                                                                            </option>
                                                                        ))}
                                                                    </Form.Select>


                                                                ) : (
                                                                    <span style={{ width: '110px', fontFamily: 'Nunito Sans, sans-serif' }}>
                                                                        {"Click Edit to add currency"}
                                                                    </span>
                                                                )}


                                                            </td>
                                                            <td>
                                                                {editIndex === index ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-success"
                                                                        onClick={handleUpdateClick}
                                                                        style={{ backgroundColor: '#0097EB', fontFamily: 'Nunito Sans, sans-serif' }}
                                                                    >
                                                                        Update
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-primary"
                                                                        onClick={() =>
                                                                            handleEditClick(index)
                                                                        }
                                                                        style={{ backgroundColor: '#25B003', fontFamily: 'Nunito Sans, sans-serif' }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </td>

                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <table className="table table-striped"
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    textAlign: "center",
                                    border: "1px solid #ccc",
                                    borderStyle: "none",
                                    fontFamily: 'Nunito Sans'
                                }}>
                                <thead >
                                    <tr>
                                        {/* <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)",color: "#fff", fontWeight: "bold"
                                        }}>Sr No</th> */}
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Product Name</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Make</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Model</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Quality</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Target Price</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Quoted Price</th>
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Currency</th>
                                        {/* <th>Symbol</th> */}
                                        <th style={{
                                            fontFamily: 'Nunito Sans', fontWeight: '700', padding: "10px", border: "1px solid #ccc", borderStyle: "none", background: "linear-gradient(#111A2E, #375494)", color: "#fff", fontWeight: "bold"
                                        }}>Submit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="text-center" style={{ border: "1px solid #ccc" }}>
                                                <Spinner animation="border" /> {/* Loader */}
                                            </td>
                                        </tr>
                                    ) : (
                                        editedProductData.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{index + 1}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.product || "N/A"}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.make || "N/A"}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.model || "N/A"}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.quantity || "N/A"}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.target_price || "N/A"}</td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>
                                                    {editIndex === index ? (
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={updatedPrice}
                                                            // placeholder={priceSharedData[index]?.quoted_price || "N/A"}
                                                            placeholder="Enter Quoted Price"
                                                            onChange={handlePriceChange}
                                                            style={{ width: '110px' }}
                                                            required
                                                        />
                                                    ) : (
                                                        <span style={{ width: '110px' }}>
                                                            {item.quoted_price ? `${selectedCurrency[index]?.symbol || ""} ${item.quoted_price}` : "Click Edit to add quoted price"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>

                                                    {editIndex === index ? (
                                                        <Form.Select
                                                            style={{ width: '200px' }}
                                                            value={selectedCurrency[index]?.name || ""}
                                                            onChange={(e) => handleCurrencyChange(index, e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Currency</option>
                                                            {currencyTableData.map((currency, idx) => (
                                                                <option key={currency.id} value={currency.name}>
                                                                    {currency.name} - {currency.symbol}
                                                                </option>
                                                            ))}
                                                        </Form.Select>


                                                    ) : (
                                                        <span style={{ width: '110px', fontFamily: 'Nunito Sans, sans-serif' }}>
                                                            {"Click Edit to add currency"}
                                                        </span>
                                                    )}


                                                </td>
                                                <td>
                                                    {editIndex === index ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={handleUpdateClick}
                                                            style={{ backgroundColor: '#0097EB', fontFamily: 'Nunito Sans, sans-serif' }}
                                                        >
                                                            Update
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={() =>
                                                                handleEditClick(index)
                                                            }
                                                            style={{ backgroundColor: '#25B003', fontFamily: 'Nunito Sans, sans-serif' }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Modal show={showModal} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Quoted Price</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="quotedPrice">
                                        <Form.Label>Quoted Price</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={quotedPrice}
                                            onChange={(e) =>
                                                setQuotedPrice(e.target.value)
                                            }
                                            placeholder="Enter new quoted price"
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={handleSubmit}>
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <br />

                        <div className="productdirectory rounded" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                            <div
                                className="mb-2 mt-1"
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#6c757d",
                                    textAlign: "left",
                                }}
                            >
                                <h5 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Activity Report</h5>
                            </div>
                            <div style={{ overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'thin', }}>
                                <table className="table table-striped" style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    textAlign: "center",
                                    border: "1px solid #ccc",
                                    fontFamily: 'Nunito Sans, sans-serif'
                                }}>
                                    <thead>

                                        <tr>
                                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", fontWeight: "bold", border: "1px solid #ccc" }}>Product Name</th>
                                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", fontWeight: "bold", border: "1px solid #ccc" }}>Updated Date</th>
                                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", fontWeight: "bold", border: "1px solid #ccc" }}>Quoted Price</th>
                                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", fontWeight: "bold", border: "1px solid #ccc" }}>Currency</th>
                                            <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', padding: "10px", fontWeight: "bold", border: "1px solid #ccc" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="text-center" style={{ padding: "8px", border: "1px solid #ccc" }}>
                                                    <Spinner animation="border" /> {/* Loader */}
                                                </td>
                                            </tr>
                                        ) : (
                                            priceSharedData.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.product || "N/A"}</td>
                                                    <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{formatDate(item.updated_at || "N/A")}</td>
                                                    <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>
                                                        {item.quoted_price || "N/A"}
                                                        {item.currency === "USD" ? "$" : item.currency}
                                                    </td>
                                                    <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>{item.currency || "N/A"}</td>
                                                    <td style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc" }}>
                                                        <FaTrash
                                                            style={{ cursor: "pointer", color: "red" }}
                                                            onClick={() => handleDelete(item.id)} // assuming `item.id` is the identifier
                                                            title="Delete"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </form>
                    <ToastContainer />
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
    );
};

export default Fourthmain;
