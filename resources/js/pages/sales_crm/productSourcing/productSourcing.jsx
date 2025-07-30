import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axios";
import { FaEye, FaPen, FaEdit, FaPlus } from "react-icons/fa";
import Button from "../../../components/base/Button";
import ProcurementsModal from "../../purchase/procurements/ProcurementsModal";
import { ToastContainer, toast } from "react-toastify";
import { Spinner, Tab, Nav, Row, Col } from "react-bootstrap";
import { useOpportunity } from "../../../context/OpportunityContext";
import swal from 'sweetalert';
import { id } from "date-fns/locale";
import { useParams } from "react-router-dom";
import { set } from "date-fns";

const ThirdMain = ({ onProductSourcingValidation }) => {
    const [productDetails, setProductDetails] = useState([]);
    const { leadId } = useParams();
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    // const leadId = localStorage.getItem("lead_id");
    // const customer_id = localStorage.getItem("cst_id");
    const [productData, setProductData] = useState([]);
    const [Producshow, setProducshow] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const { triggerProductPriceRefresh } = useOpportunity();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [productWithVendors, setProductWithVendors] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedProductCode, setSelectedProductCode] = useState("");
    const [selectedVendorCount, setSelectedVendorCount] = useState(0);
    const [markedId, setMarkedProductId] = useState("");
    const [markedIdFromTable, setMarkedProductIdFromTable] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    console.log("productShow", Producshow);

    useEffect(() => {
        if (onProductSourcingValidation) {
            const hasProducts = Producshow && Producshow.length > 0;
            const allProductsHaveCode = Producshow && Producshow.every(product => product.product_code);
            onProductSourcingValidation(hasProducts && allProductsHaveCode);
        }
    }, [Producshow, onProductSourcingValidation]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get('/productList');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setProductsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!leadId) {
            return;
        }

        const fetchLeadDetails = async () => {
            try {
                const response = await axiosInstance.get("/procurement_show", {
                    params: {
                        lead_id: leadId,
                        lead_customer_id: customerId,
                    },
                });

                const data = response.data;
                if (data == "") {
                    // toast("No Procurement Data Available");
                } else {
                    if (data) {
                        setProductData([data]);
                        setLoading(false);
                    } else {
                        setProductData([data]);
                        setLoading(false);
                    }
                }
            } catch (err) {
                setLoading(false);
            }
        };

        const show_product_sourcing = async () => {
            const params = {
                lead_id: leadId,
                customer_id: customerId,
            };
            try {
                setLoading(true);
                const response = await axiosInstance.post(
                    "/show_product_sourcing",
                    params
                );

                const data = response.data;

                if (data && Object.keys(data).length > 0) {
                    setProducshow(data.data);
                } else {
                    toast("No Data Available");
                    setProducshow([]);
                }
            } catch (err) {
                console.error("Error fetching product sourcing data:", err);
                toast("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchLeadDetails();
        show_product_sourcing();
    }, [leadId, customerId, refreshData]);

    const show_product_sourcing = async () => {
        console.log("called");
        const params = {
            lead_id: leadId,
            customer_id: customerId,
        };
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                "/show_product_sourcing",
                params
            );

            const data = response.data;

            if (data && Object.keys(data).length > 0) {
                setProducshow(data.data);
            } else {
                toast("No Data Available");
                setProducshow([]);
            }
        } catch (err) {
            console.error("Error fetching product sourcing data:", err);
            toast("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const fetchProductDirectory = async () => {
        try {
            const response = await axiosInstance.get(
                "/showProductsDirectory",
                {
                    params: {
                        lead_id: leadId,
                        customer_id: customerId,
                    },
                }
            );

            const products = response.data.products;

            if (Array.isArray(products)) {
                setProductDetails(products);
            } else {
            }
        } catch (error) { }
    };

    useEffect(() => {
        if (!leadId) {
            return;
        }
        fetchProductDirectory();
    }, [customerId, leadId]);

    // Handle input changes for editable fields

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedProducts = [...productDetails];
        updatedProducts[index] = { ...updatedProducts[index], [name]: value };
        setProductDetails(updatedProducts);
    };



    const saveProduct = async (product, index) => {
        if (isSaving) return;

        console.log(product);
        if (product.product_sourcing === "no" && product.no_of_product_vendor === "0") {
            swal("Warning", "Number of Product Vendor must be grater than 0", "warning");
            return;
        }
        const newStatus = product.product_sourcing === "no" ? "0" : "1";

        try {
            setIsSaving(true);
            const payload = {
                prodId: product.id,
                lead_id: leadId,
                status: newStatus,
                customer_id: customerId,
                product_sourcing: product.product_sourcing,
                product_name: product.product,
                make: product.make,
                model: product.model,
                quantity: product.quantity,
                target_price: product.target_price,
                // Only include these fields if product_sourcing is "no"
                ...(product.product_sourcing === "no" ? {
                    product_code: product.product_code,
                    no_of_product_vendor: product.no_of_product_vendor
                } : {
                    product_code: "",
                    no_of_product_vendor: ""
                }),
                procurement_id: product.procurement_id
            };

            const response = await axiosInstance.post(
                "/product-sourcings",
                payload
            );

            toast("Product sourcing created successfully");
            show_product_sourcing();
            fetchProductDirectory();
            triggerProductPriceRefresh();
        } catch (error) {
            toast.error("Error saving product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        show_product_sourcing(); // Refresh data after modal closes
        triggerProductPriceRefresh(); // Trigger refresh after data is updated
    };

    const handleSuccess = async () => {
        try {
            show_product_sourcing(); // Wait for data to refresh
            setRefreshData((prev) => !prev); // Toggle refresh state
            handleClose(); // Close modal and trigger additional refreshes
        } catch (error) {
            console.error("Error in handleSuccess:", error);
            toast.error("Error updating data");
        }
    };

    const handleShow = () => {
        setShowModal(true);
    };

    const handleInputChange_show = (e, index) => {
        const { name, value } = e.target;
        const updatedProducts = [...productDetails];
        updatedProducts[index] = { ...updatedProducts[index], [name]: value };
        setProductDetails(updatedProducts);
    };
    const handleSelectProduct = (product) => {
        setSelectedProducts((prevSelected) => {
            const isAlreadySelected = prevSelected.find((p) => p.id === product.id);
            if (isAlreadySelected) {
                // Remove product
                return prevSelected.filter((p) => p.id !== product.id);
            } else {
                // Add product
                return [...prevSelected, product];
            }
        });
    };
    const handleProductCodeChange = (e, index) => {
        const selectedCode = e.target.value;
        const selectedProduct = productsData.find(
            (product) => product.product_code === selectedCode
        );

        console.log('count is', selectedProduct?.vendor_count_count);

        setProductDetails(prevDetails => {
            const updatedDetails = [...prevDetails];
            updatedDetails[index] = {
                ...updatedDetails[index],
                product_code: selectedCode,
                no_of_product_vendor: selectedProduct?.vendor_count_count || "0"
            };
            return updatedDetails;
        });
    };

    const setProductSourcing = (index, isRequired) => {
        setProductDetails((prevDetails) => {
            const updatedDetails = [...prevDetails];
            updatedDetails[index] = {
                ...updatedDetails[index],
                product_sourcing: isRequired ? "yes" : "no",
                sourcing_required: isRequired,
                // Clear product_code and no_of_product_vendor when switching to required
                product_code: isRequired ? "" : updatedDetails[index].product_code,
                no_of_product_vendor: isRequired ? "0" : updatedDetails[index].no_of_product_vendor
            };
            return updatedDetails;
        });
    };




    const handleMarkAsDone = (item) => {
        setSelectedItem(item);
        fetchProductVendors(item.id); // Call API
        setShowMarkModal(true);
    };

    const fetchProductVendors = async (id) => {
        setMarkedProductIdFromTable(id);
        try {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            const response = await axiosInstance.get("/productWithVendors", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cleanToken}`,
                },
            });
            const data = response.data;
            setProductWithVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendor data", error);
        }
    };



    // Assuming productWithVendors is available
    const handleUpdateCode = async () => {

        if (!markedId) {
            alert("Please select a product.");
            return;
        }
        console.log("markedId", markedId);



        const params = {
            lead_id: leadId,
            customer_id: customerId,
            id: markedIdFromTable,
            product_code: selectedProductCode,
            no_of_product_vendor: selectedVendorCount,
        };
        try {
            const response = await axiosInstance.post(
                "/updateProductCode",
                params
            );
            show_product_sourcing();
            triggerProductPriceRefresh();
            setShowMarkModal(false);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save product.");
        }
    };

    const placeholderStyle = `
    ::placeholder {
      font-size: 0.9rem;
      color: #9CA3AF;
    }
    
  
    .tableWidth {
      width: 16rem;
    }
    
    @media screen and (max-width: 1307px) {
      .tableWidth {
        width: 14rem;
      }
    }
    @media screen and (max-width: 1146px) {
      .tableWidth {
        width: 29rem;
      }
    }
      @media screen and (max-width: 1058px) {
      .tableWidth {
        width: 10rem;
      }
    }
    //   .tabs{
    //     width: 10rem;
    //   }
         @media screen and (max-width: 1276px) {
      .tab1 {
        width: 10rem;
      }
        .tab2{
         width: 9rem;
        }
    }
         @media screen and (max-width: 1276px) {
      .tab1 {
        width: 9rem;
      }
}
        .btnstyle{
           color: '#3874FF';
        }
        .btnstyle:hover {
        background-color: #0292E3 !important;
        color: white !important;
    }
    `;

    return (
        <>
            <style>
                {`
           *{
            font-family: Nunito Sans, sans-serif;
        //    color:red;
           }
        .setFont{
     font-family: Nunito Sans, sans-serif;

    }
       `}
            </style>

            <style>{placeholderStyle}</style>
            <form className="d-grid gap-3">
                <Tab.Container id="product-sourcing-tabs" defaultActiveKey="required">
                    <Row>
                        <Col>
                            <Nav variant="underline">
                                <Nav.Item className="tab1">
                                    <Nav.Link
                                        eventKey="required"
                                        className="text-wrap setFont"
                                        style={{
                                            fontFamily: 'Nunito Sans, sans-serif',
                                            // fontSize: '0.5rem' // Default size
                                        }}
                                    >
                                        Product Sourcing Required
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="tab2">
                                    <Nav.Link
                                        eventKey="not-required"
                                        className="text-wrap setFont"
                                        style={{
                                            fontFamily: 'Nunito Sans, sans-serif',
                                            // fontSize: '0.5rem' // Default size
                                        }}
                                    >
                                        Product Sourcing Not Required
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>


                    <Tab.Content>
                        <Tab.Pane eventKey="required">
                            {/* <legend className="h6 d-flex align-items-center" style={{ gap: "8px", marginBottom: "5px" }}>
                                <Button
                                    variant="subtle-primary"
                                    className="btnstyle setFont"
                                    onClick={() => handleShow()} 
                                    style={{
                                        width: "10rem",
                                        height: "40px",
                                        backgroundColor: 'transparent',
                                        border: '1px solid #3874FF',
                                        fontFamily: 'Nunito Sans, sans-serif',
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                   Create Procurement
                                </Button>
                               
                            </legend> */}

                            <div className="product-details" style={{ border: "1px solid #ddd", height: "fit-content" }}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center setFont">
                                            <Spinner animation="border" />
                                        </td>
                                    </tr>
                                ) : (
                                    // productDetails.filter(product => product.no_of_product_vendor === "0" || product.no_of_product_vendor === null)
                                    productDetails
                                        .map((productDetail, index) => (
                                            productDetail.isRequired === null && (
                                                <div key={index} className="product-entry p-3 mb-2 rounded">
                                                    <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
                                                        <h6 className="setFont" style={{ margin: 0, marginRight: "1rem" }}>
                                                            Product {index + 1}
                                                        </h6>
                                                        <div>
                                                            <h6>Procurement ID:</h6> {productDetail.procuremnt_id}
                                                        </div>
                                                    </div>


                                                    <div className="row g-3 mb-3 setFont">
                                                        {["product", "make", "model", "quantity", "target_price"].map((field) => (
                                                            <div key={field} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                                <label className="form-label setFont" htmlFor={field}>
                                                                    {field.replace("_", " ")}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name={field}
                                                                    value={productDetail[field] || ""}
                                                                    onChange={(e) => handleInputChange(e, index)}
                                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white w-100 input-responsive setFont"
                                                                    placeholder={field.replace(/([A-Z])/g, " $1")}
                                                                    style={{ fontSize: "0.85rem" }}
                                                                    readOnly={field !== "product_code" && field !== "procurement_id"}
                                                                />
                                                            </div>
                                                        ))}
                                                        {productDetail.product_sourcing === "no" && (
                                                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                                <label className="form-label setFont" htmlFor="product_code">
                                                                    Product Code
                                                                </label>
                                                                <select
                                                                    name="product_code"
                                                                    value={productDetail.product_code || ""}
                                                                    onChange={(e) => handleProductCodeChange(e, index)}
                                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white w-100 input-responsive setFont"
                                                                    style={{ fontSize: "0.85rem" }}
                                                                >
                                                                    <option value="">Select Product Code</option>
                                                                    {productsData.map((product) => (
                                                                        <option key={product.id} value={product.product_code}>
                                                                            {product.product_code}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {productDetail.product_sourcing === "no" && (
                                                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                                <label className="form-label setFont" htmlFor="no_of_product_vendor">
                                                                    Product Vendor
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="no_of_product_vendor"
                                                                    value={productDetail.no_of_product_vendor || ""}
                                                                    readOnly
                                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white w-100 input-responsive setFont"
                                                                    placeholder="No Of Product Vendor"
                                                                    style={{ fontSize: "0.85rem" }}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                            <label className="form-label setFont" htmlFor={`product_sourcing_${index}`}>
                                                                Product Sourcing
                                                            </label>
                                                            <select
                                                                id={`product_sourcing_${index}`}
                                                                className="form-select form-select-sm dark:bg-gray-700 dark:text-white w-100 input-responsive setFont"
                                                                value={productDetail.product_sourcing || "yes"}
                                                                placeholder="Select"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    const isRequired = value === "yes";
                                                                    setProductSourcing(index, isRequired);
                                                                }}
                                                                style={{ fontSize: "0.85rem" }}
                                                            >

                                                                <option value="">Select</option>
                                                                <option value="yes">Required</option>
                                                                <option value="no">Not Required</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="col-3 d-flex justify-content-center align-items-center">
                                                        <button
                                                            className="btn p-1 setFont"
                                                            style={{
                                                                borderColor: "#333",
                                                                backgroundColor: isSaving ? "#ccc" : "#0292E3",
                                                                color: "white",
                                                                transition: "all 0.3s",
                                                                width: "9rem",
                                                                height: "2rem",
                                                                fontSize: "1rem",
                                                            }}
                                                            disabled={isSaving}
                                                            onMouseEnter={(e) => !isSaving && (e.target.style.backgroundColor = "#0056b3")}
                                                            onMouseLeave={(e) => !isSaving && (e.target.style.backgroundColor = "#007bff")}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (isSaving) return;
                                                                // Pass the product_sourcing value from the current productDetail
                                                                const updatedProduct = {
                                                                    ...productDetail,
                                                                    product_sourcing: productDetail.product_sourcing || "yes"
                                                                };
                                                                saveProduct(updatedProduct, index);
                                                            }}
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        ))

                                )}
                            </div>

                            <h5 className="setFont mb-2" style={{ marginTop: "2.5rem" }}>Product Sourcing Required</h5>
                            <form className="d-grid gap-1">
                                <div style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    whiteSpace: "nowrap",
                                    border: "1px solid #ddd",
                                    scrollbarWidth: 'thin',
                                    // padding: "10px",
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
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', width: "50px", border: "1px solid #ddd", }}></th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', width: "50px", border: "1px solid #ddd", }}>Mark as Done</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', width: "50px", border: "1px solid #ddd", }}>Sr No</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Procurement ID</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Product Name</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Make</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Model</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Quantity</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Target Price</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Product Code</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>No of Product Vendors</th>
                                                {/* <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>TAT</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Assignee Name</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Attachments</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Status</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center" style={{ border: "1px solid #ddd", }}>
                                                        <Spinner animation="border" />
                                                    </td>
                                                </tr>
                                            ) : !Producshow || Producshow.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="text-center" style={{ border: "1px solid #ddd", }}>
                                                        No Data Available
                                                    </td>
                                                </tr>
                                            ) : (

                                                Producshow.flat().filter(item => item.product_sourcing === "yes").map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd" }}>
                                                            {(!item.proc_number || item.proc_number === "N/A") && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedProducts.some(p => p.id === item.id)}
                                                                    onChange={() => handleSelectProduct(item)}
                                                                />
                                                            )}

                                                        </td>
                                                        <td style={{ border: "1px solid #ddd" }}>
                                                            <button
                                                                type="button"
                                                                disabled={!item.proc_number}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    backgroundColor: item.proc_number ? '#0292E3' : '#ccc',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    cursor: item.proc_number ? 'pointer' : 'not-allowed'
                                                                }}
                                                                onClick={() => handleMarkAsDone(item)}

                                                            >
                                                                Mark as Done
                                                            </button>
                                                        </td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd" }} >{index + 1}</td>

                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.proc_number || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.product_name || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.make || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.model || "N/A"}</td>
                                                        <td style={{ border: "1px solid #ddd", }}>{item.quantity}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.target_price || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>
                                                            {item.product_code}
                                                        </td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>
                                                            {item.no_of_product_vendor}
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </form>
                            <legend
                                className="h6 d-flex align-items-center"
                                style={{
                                    gap: "8px",
                                    marginTop: "20px", // space from form
                                    marginBottom: "5px",
                                    whiteSpace: "nowrap", // keep text in single line
                                    display: "flex", // ensure flexbox styling applies
                                    alignItems: "center",
                                }}
                            >
                                <Button
                                    variant="subtle-primary"
                                    className="btnstyle setFont"
                                    onClick={() => handleShow()}
                                    style={{
                                        width: "10rem",
                                        height: "40px",
                                        backgroundColor: 'transparent',
                                        border: '1px solid #3874FF',
                                        fontFamily: 'Nunito Sans, sans-serif',
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Create Procurement
                                </Button>
                            </legend>

                            {/* <form className="d-grid gap-1">
                                <div style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    whiteSpace: "nowrap",
                                    border: "1px solid #ddd",
                                    scrollbarWidth: 'thin',
                                    // padding: "10px",
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
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', width: "50px", border: "1px solid #ddd", }}>Sr No</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Procurement ID</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Product/Service Name</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Model</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Target Cost</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>TAT</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Assignee Name</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Attachments</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700', border: "1px solid #ddd", }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center" style={{ border: "1px solid #ddd", }}>
                                                        <Spinner animation="border" />
                                                    </td>
                                                </tr>
                                            ) : !productData || productData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="text-center" style={{ border: "1px solid #ddd", }}>
                                                        No Data Available
                                                    </td>
                                                </tr>
                                            ) : (
                                                productData.flat().map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd" }} >{index + 1}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.proc_number || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.product_service_name || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.description || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.target_cost || "N/A"}</td>
                                                        <td style={{ border: "1px solid #ddd", }}>{item.tat || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.assignee.name || "N/A"}</td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>
                                                            {item.uploads && item.uploads.length > 0
                                                                ? item.uploads.map((upload, idx) => (
                                                                    <span key={idx}>
                                                                        {upload.name || "N/A"}
                                                                        {idx < item.uploads.length - 1 && ", "}
                                                                    </span>
                                                                ))
                                                                : "N/A"}
                                                        </td>
                                                        <td style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>{item.status || "N/A"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </form> */}
                        </Tab.Pane>

                        <Tab.Pane eventKey="not-required">
                            {/* <div className="product-details">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center" style={{ border: "1px solid #ddd", }}>
                                            <Spinner animation="border" />
                                        </td>
                                    </tr>
                                ) : (
                                    productDetails.map((product, index) => (
                                        <div key={index} className="product-entry p-3 mb-2 rounded" style={{ border: "1px solid #ddd", }}>
                                            <h6 className="setFont">Product {index + 1}</h6>
                                            <div className="row g-3 mb-3" >
                                                {["product", "product_code", "no_of_product_vendor"].map((field) => (
                                                    <div key={field} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                        <label className="setFont form-label" htmlFor={field}>
                                                            {field.replace("_", " ")}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name={field}
                                                            value={product[field] || ""}
                                                            onChange={(e) => handleInputChange_show(e, index)}
                                                            className=" setFont form-control form-control-sm"
                                                            readOnly={field !== "product_code" && field !== "no_of_product_vendor" && field !== "product_name"}
                                                            placeholder={field.replace(/([A-Z])/g, " $1")}
                                                            style={{ fontSize: "0.85rem", flex: "1" }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="col-3 d-flex justify-content-center align-items-center">
                                                <button
                                                    className="btn p-1 setFont"
                                                    style={{

                                                        borderColor: "#333",
                                                        backgroundColor: " #0292E3",
                                                        color: "white",
                                                        transition: "all 0.3s",
                                                        width: "9rem", height: "2rem", fontSize: "1rem"
                                                    }}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                                                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleSave(product, index);
                                                    }}
                                                >
                                                    Save
                                                </button>

                                            </div>
                                        </div>
                                    ))
                                )}
                            </div> */}

                            <h5 className="setFont mb-2" style={{ marginTop: "0.5rem" }}>Product Details</h5>
                            <form className="d-grid gap-1">
                                <div style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    whiteSpace: "nowrap",
                                    border: "1px solid #ddd",
                                    scrollbarWidth: 'thin',
                                    // padding: "10px",
                                }}>
                                    <table className="table tableWidth" style={{
                                        size: "sm",
                                        borderCollapse: "collapse",
                                        width: "100%", // Force full width
                                        minWidth: "100%", // Ensures it stretches on all screens
                                        maxWidth: "100%", // Prevents it from overflowing
                                        // border: "1px solid #ddd",
                                        //  minWidth: "300px",
                                    }}>
                                        <thead>
                                            <tr>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc", fontWeight: '700' }}>Sr No</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc", fontWeight: '700' }}>Product Code</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc", fontWeight: '700' }}>Product Name</th>
                                                <th style={{ fontFamily: 'Nunito Sans, sans-serif', padding: "8px", border: "1px solid #ccc", fontWeight: '700' }}>No of Product Vendor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center" style={{ border: "1px solid #ddd", }} >
                                                        <Spinner animation="border" />
                                                    </td>
                                                </tr>
                                            ) : !Producshow || Producshow === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center" style={{ fontFamily: 'Nunito Sans, sans-serif', border: "1px solid #ddd", }}>
                                                        No Data Available
                                                    </td>
                                                </tr>
                                            ) : (
                                                Producshow.filter(product => product.product_sourcing === "no")
                                                    .map((item, index) => (
                                                        <tr key={item.id || index}>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', width: "10%", border: "1px solid #ddd", }}>{index + 1}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', width: "20%", border: "1px solid #ddd", }}>{item.product_code || "N/A"}</td>
                                                            <td style={{ fontFamily: 'Nunito Sans, sans-serif', width: "20%", border: "1px solid #ddd", }}>{item.product_name || "N/A"}</td>
                                                            <td style={{ width: "20%", border: "1px solid #ddd", fontFamily: 'Nunito Sans, sans-serif' }}>{item.no_of_product_vendor || "N/A"}</td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </form>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </form>
            {showModal && (
                <ProcurementsModal
                    quoteId={selectedQuoteId}
                    lead_id={leadId}
                    lead_customer_id={customerId}
                    selectedProducts={selectedProducts}
                    onHide={handleClose}
                    onSuccess={handleSuccess}
                />
            )}

            {showMarkModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered"> {/* Center vertically */}
                        <div className="modal-content">
                            <div className="modal-body">
                                <label style={{ marginBottom: '8px' }}>Select Product Info</label>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search product vendor details..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    />
                                    {isDropdownOpen && (
                                        <div
                                            className="position-absolute w-100 bg-white border rounded mt-1"
                                            style={{
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                top: '100%',
                                                left: 0
                                            }}
                                        >
                                            <div
                                                className="p-2 border-bottom cursor-pointer"
                                                onClick={() => {
                                                    setMarkedProductId("");
                                                    setSelectedProductCode("");
                                                    setSelectedVendorCount(0);
                                                    setSearchTerm("");
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Select product vendor details
                                            </div>
                                            {productWithVendors
                                                .filter(product =>
                                                    product.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    product.vendor_count_count?.toString().includes(searchTerm)
                                                )
                                                .map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="p-2 border-bottom cursor-pointer"
                                                        onClick={() => {
                                                            setMarkedProductId(product.id.toString());
                                                            setSelectedProductCode(product.product_code);
                                                            setSelectedVendorCount(product.vendor_count_count);
                                                            setSearchTerm(`${product.product_code} / ${product.product_name} / ${product.vendor_count_count} vendors`);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {product.product_code} / {product.product_name} / {product.vendor_count_count} vendors
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowMarkModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleUpdateCode}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}

            <ToastContainer />
        </>
    );
};

export default ThirdMain;
