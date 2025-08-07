import React, { useState, useEffect } from "react";
import LeftColumn from "../leftNavBar/LeftColumn";
import RightColumn from "../rightNavbar/RightColumn";
import Navbar from "../TopNavBar/Navbar";
import SectionMenu from "../SectionMenu/sectionMenu";
import SecondMain from "../leadAcknowlegement/SecondMain";
import ThirdMain from "../productSourcing/productSourcing";
import ProductSourcing from "../productSourcing/productSourcing";
import PriceShared from "../PriceShared/PriceShared";
import FifthMain from "../QuotationSend/QuotationSend";
import DecisionAwaited from "../DecisionAwaited/DecisionAwaited";
import VictoryStage from "../VictoryStage/VictoryStage";
import { useParams } from "react-router-dom";
import { FaPlus, FaDownload } from "react-icons/fa";
import axiosInstance from "../../../axios";
import { ToastContainer, toast } from "react-toastify";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import main from '../../../assets/img/icons/doc_download.svg';
import { useAuth } from '../../../AuthContext';
import Rightcard from "./Rightcard";
import { useNavigate } from 'react-router-dom';

import {
    DropdownButton,
    Form,
    Button,
    Col,
    Dropdown,
    Nav,
    Row,
    Tab,
    Table,
    Modal,
    Spinner,
} from "react-bootstrap";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { OpportunityProvider, useOpportunity } from "../../../context/OpportunityContext";
import Select from "react-select";

const InquiredData = (props) => {
    const { productData, onFormCompletionUpdate } = props;
    const [inputGroups, setInputGroups] = useState([0]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [productDirectory, setProductDirectory] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [attachmentFields, setAttachmentFields] = useState([{ id: 1 }]);
    const navigate = useNavigate();
    const [files, setFiles] = useState({});
    const [customerNeedRecord, setCustomerNeedRecord] = useState("");
    const [inorbvictCommitmentRecord, setInorbvictCommitmentRecord] =
        useState("");
    const [remarkRecord, setRemarkRecord] = useState("");
    const { leadId, customerId } = useParams();
    // const customer_id = localStorage.getItem("cst_id");
    const customer_id = customerId;
    localStorage.setItem("lead_id", leadId);
    const OpportunityId = localStorage.getItem("OpportunityId");
    const [customerSpecificNeed, setCustomerSpecificNeed] = useState("");
    const [inorbvictCommitment, setInorbvictCommitment] = useState("");
    const [remark, setRemark] = useState("");
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productList, setProductList] = useState([]);
    const [currencyTableData, setCurrencyTableData] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const { onNextStage, onPrevStage } = props;

    const [opportunityDetails, setOpportunityDetails] = useState({
        id: null,
        cust_id: "",
        lead_id: "",
        buying_plan: "",
        name: "",
        mo_no: "",
        email: "",
        customer_specific_need: "",
        extra_chatboat_notes: "",
        inorbvict_commitment: "",
        key_opportunity: 0,
        remark: "",
        lead_ack_status: "",
        attachments: [],
    });

    const [formData, setFormData] = useState({
        buying_plan: "",
        name: "",
        mo_no: "",
        email: "",
        attachments: [],
        orderval: "",
        customer_specific_need: "",
        inorbvict_commitment: "",
        remark: "",
    });
    const [opportunityData, setOpportunityData] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const { updateOpportunityData, triggerOpportunityRefresh } = useOpportunity();

    const handleInput_Change = (e) => {
        const { name, value } = e.target;

        // If the field is 'name', allow letters, numbers and spaces
        if (name === "name") {
            const alphabetRegex = /^[a-zA-Z0-9\s]*$/;

            // For paste events
            if (e.type === 'paste') {
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                if (alphabetRegex.test(pastedText)) {
                    setFormData(prev => ({
                        ...prev,
                        [name]: pastedText
                    }));
                }
                e.preventDefault();
                return;
            }

            // For normal input
            if (alphabetRegex.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
            return;
        }

        // For other fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addAttachment_Field = (event) => {
        event.preventDefault();
        setAttachmentFields((prev) => [
            ...prev,
            { id: Date.now(), file: null },
        ]);
    };

    const handleFile_Change = (e, id) => {
        const file = e.target.files[0];
        setFiles({ ...files, [id]: file });
        setAttachmentFields((prev) =>
            prev.map((field) => (field.id === id ? { ...field, file } : field))
        );
    };

    const saveCustomerSpecificNeed = (value) => {
        if (
            !formData.buying_plan ||
            !formData.name ||
            !formData.mo_no ||
            !formData.email ||
            !productDirectory ||
            productDirectory.length === 0
        ) {
            toast.error("Please fill Opportunity Details first!");
            return;
        }
        axiosInstance
            .post("/storeCustomerSpecificNeed", {
                id: OpportunityId,
                customer_specific_need: value,
            })
            .then((response) => {
                toast("Customer specific need saved");
                showOpportunity();
                // fetchCustomerSpecificNeed(); // Refresh the record
            })
            .catch((error) =>
                toast("Error saving customer specific need:", error)
            );
    };

    const saveInorbvictCommitment = (value) => {
        axiosInstance
            .post("/storeInorbvictCommitment", {
                id: OpportunityId,
                inorbvict_commitment: value,
            })
            .then((response) => {
                toast("Inorbvict Commitment Saved");
                // fetchInorbvictCommitment();
                showOpportunity(); // Refresh the record
            })
            .catch((error) =>
                toast("Error saving Inorbvict Commitment:", error)
            );
    };

    const saveRemark = (value) => {
        axiosInstance
            .post("/storeRemark", { id: OpportunityId, remark: value })
            .then((response) => {
                toast(response.message);
                showOpportunity(); // Refresh the record
            })
            .then((response) => toast("Record Saved"))
    };

    const showOpportunity = async () => {
        console.log("Called");
        try {

            const response = await axiosInstance.post(
                '/showOpportunityDetails',
                {
                    lead_id: leadId,
                    cust_id: customer_id,
                }
            ).then((res) => {
                setFormData({
                    ...res,
                    buying_plan: res.data.opportunity.buying_plan,
                    name: res.data.opportunity.name,
                    mo_no: res.data.opportunity.mo_no,
                    email: res.data.opportunity.email,
                    overval: res.data.opportunity.order_value,
                    //attachments: [res.data.opportunity.attachments],
                    customer_specific_need: res.data.opportunity.customer_specific_need || "",
                    inorbvict_commitment: res.data.opportunity.inorbvict_commitment || "",
                    remark: res.data.opportunity.remark || "",
                });

                console.log("Order val %%%", formData.orderval);

                // setOpportunityData(response.data.opportunity);

            });
        } catch (error) {
        }
    };
    useEffect(() => {
        // fetchCustomerSpecificNeed();
        // fetchInorbvictCommitment();
        // fetchRemark();
        showOpportunity();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, []);

    // Initialize product dropdown with breadcrumb product name when data is available
    useEffect(() => {
        if (productData?.query_product_name && inputGroups.length > 0) {
            // Set the initial product value in the first group (index 0)
            setFormValues(prevValues => ({
                ...prevValues,
                [0]: {
                    ...prevValues[0],
                    product: productData.query_product_name
                }
            }));
        }
    }, [productData?.query_product_name]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await axiosInstance.get('/products'); // Replace with your API endpoint
            if (response.data) {
                setProductList(response.data.map(product => ({
                    value: product.product_name,
                    label: product.product_name,
                    model: product.model_name,
                    make: product.make,
                    no_of_product_vendor: product.vendor_count_count,
                    product_code: product.product_code,
                })));
                setLoadingProducts(false);
            } else {
                console.error('Failed to fetch products');
                setLoadingProducts(false);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoadingProducts(false);
        }
    };

    // Add new input group
    const addInputGroup = () => {
        setInputGroups([...inputGroups, inputGroups.length]);
    };

    // Remove an input group by index
    const removeInputGroup = (index) => {
        setInputGroups(
            inputGroups.filter((groupIndex) => groupIndex !== index)
        );
        delete formValues[index];
        setFormValues({ ...formValues });
    };

    // remove attachment group
    const removeAttachmentField = (event, id) => {
        event.preventDefault();
        setAttachmentFields((prevFields) =>
            prevFields.filter((field) => field.id !== id)
        );
        const newFiles = { ...files };
        delete newFiles[id];
        setFiles(newFiles);
    };

    // attachment Filed
    const addAttachmentField = () => {
        setAttachmentFields((prev) => [...prev, { id: prev.length + 1 }]);
    };

    const saveGroup = (groupIndex) => {
        const savedProduct = formValues[groupIndex];
        if (savedProduct) {
            setProductDirectory([...productDirectory, savedProduct]);
            delete formValues[groupIndex];
            setFormValues({ ...formValues });
        }
    };
    const lead_id = leadId;

    const handleCurrencyChange = (selectedOption, groupIndex) => {
        setFormValues((prevValues) => {
            // Find the label (like "$ - USD")
            const fullLabel = currencyOptions.find(option => option.value === selectedOption.value)?.label || selectedOption.value;

            // Extract only the symbol part (before " - ")
            const currencySymbol = fullLabel.split(" - ")[0];

            // console.log("Currency Symbol:", currencySymbol);

            const existingTargetPrice = prevValues[groupIndex]?.target_price || "";

            // Remove existing symbol if already added
            const priceWithoutSymbol = existingTargetPrice.replace(/^[^\d]+/, "").trim();

            const updatedValues = {
                ...prevValues,
                [groupIndex]: {
                    ...prevValues[groupIndex],
                    currency: selectedOption.value, // Store the currency value
                    target_price: priceWithoutSymbol ? `${currencySymbol} ${priceWithoutSymbol}` : "", // Re-add symbol cleanly
                }
            };

            // console.log("Updated Values:", updatedValues);

            return updatedValues;
        });
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isSaving) return; // Prevent multiple rapid clicks
        setIsSaving(true);
        console.log("Form Values:", formValues);

        for (let i = 0; i < inputGroups.length; i++) {
            const group = formValues[i];
            console.log(`Group ${i} validation:`, {
                product: group?.product,
                make: group?.make,
                model: group?.model,
                target_price: group?.target_price,
                quantity: group?.quantity,
                currency: group?.currency
            });

            if (
                !group?.product ||
                !group?.make ||
                !group?.model ||
                !group?.quantity ||
                Number(group.quantity) <= 0
            ) {
                toast.error(`Please fill all required fields (Product, Make, Model, and Quantity)`);
                setIsSaving(false);
                return;
            }
        }
        const requestData = {
            lead_id: lead_id,
            customer_id: customer_id,
            status: "1",

            product: formValues,
            // product : processedFormValues,
        };
        try {
            const response = await axiosInstance.post(
                "/inquiry_recive",
                requestData
            );
            fetchProductDirectory();
            toast("Inquiry Submitted");
        } catch (error) {
            toast(error.message || "Error submitting inquiry");
        } finally {
            setIsSaving(false);
        }
    };
    const fetchProductDirectory = async () => {
        try {
            const response = await axiosInstance.get("/showProductsDirectory", {
                params: {
                    lead_id: leadId,
                    customer_id: customer_id,
                },
            });

            const products = response.data.products;

            if (Array.isArray(products)) {
                setProductDirectory(products);
            } else {
                console.error("Fetched products is not an array", products);
            }
            setLoadingProducts(false);

            console.log("Fetched product directory:", products);
        } catch (error) {
            console.error("Error fetching product directory:", error);
        }
    };
    useEffect(() => {
        fetchProductDirectory();
    }, [customer_id, leadId]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            console.log("Selected file:", file.name);
        }
    };

    const handleProductChange = (selectedOption, groupIndex) => {
        setFormValues({
            ...formValues,
            [groupIndex]: {
                ...formValues[groupIndex],
                product: selectedOption.value,
                make: selectedOption.make,
                model: selectedOption.model,
                no_of_product_vendor: selectedOption.no_of_product_vendor,
                product_code: selectedOption.product_code,
            },
        });
    };

    const handleInputChange = (e, groupIndex, field) => {
        setFormValues((prevValues) => {
            const updatedValues = {
                ...prevValues,
                [groupIndex]: {
                    ...prevValues[groupIndex],
                    [field]: e.target.value,
                },
            };

            // Ensure currency is appended when target_price is updated
            if (field === "target_price" && updatedValues[groupIndex]?.currency) {
                // Find the currency symbol from currencyOptions
                const currencyOption = currencyOptions.find(option => option.value === updatedValues[groupIndex].currency);
                if (currencyOption) {
                    const currencySymbol = currencyOption.label.split(" - ")[0];
                    // Remove any existing currency symbol from the input
                    const valueWithoutSymbol = e.target.value.replace(/^[^\d\-\.]+/, '').trim();
                    updatedValues[groupIndex].target_price = `${currencySymbol} ${valueWithoutSymbol}`;
                }
            }

            return updatedValues;
        });
    };

    const handle_InputChange = (e, id, field) => {
        const { value } = e.target;

        const updatedProductDirectory = productDirectory.map((product) =>
            product.id === id ? { ...product, [field]: value } : product
        );

        setProductDirectory(updatedProductDirectory);
    };

    const handleSaveOpportunity = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (!productDirectory || productDirectory.length === 0) {
            toast.error("Please fill your product details first!");
            return;
        }

        const payload = new FormData();
        console.log(formData);
        // if (formData.buying_plan === null || formData.buying_plan === "null" || formData.buying_plan === "") {
        //     toast.error("Please select a buying plan.");
        //     return;
        // }
        payload.append("lead_id", leadId);
        payload.append("cust_id", customer_id);
        payload.append("buying_plan", formData.buying_plan);
        payload.append("name", formData.name);
        payload.append("mo_no", formData.mo_no);
        payload.append("email", formData.email);

        attachmentFields.forEach((field, index) => {
            if (field.file) {
                payload.append(`attachment_${index + 1}`, field.file);
            }
        });

        try {
            const response = await axiosInstance.post(
                "/storeOpportunityDetails",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            localStorage.setItem("OpportunityId", response.data.opportunity.id);

            // Update context instead of dispatching event
            updateOpportunityData({
                buying_plan: formData.buying_plan,
                name: formData.name,
                mo_no: formData.mo_no,
                email: formData.email
            });

            toast("Opportunity details saved successfully", true);

            if (response.message) {
                toast("Opportunity details saved successfully", true);
            }
            const update = await showOpportunity();
            triggerOpportunityRefresh();
        } catch (error) {
            toast("Error saving opportunity details:", error);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditProduct(null);
    };

    const handleChange = (e, field) => {
        const { value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: value,
        }));

        console.log("Form Data on Change:", { ...formData, [field]: value });
    };

    const handleEdit = (product) => {
        setShowModal(true);
        setEditProduct({ ...product });
        setFormData({ ...product });
    };
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [useDropdownForProduct, setUseDropdownForProduct] = useState({});

    const handleToggleProductInputType = (groupIndex) => {
        setUseDropdownForProduct((prev) => ({
            ...prev,
            [groupIndex]: !prev[groupIndex],
        }));
    };

    const handleDeletePopup = (id) => {
        setProductToDelete(id); // Store product ID
        setShowDeleteModal(true);
    };

    const handleRemove = async () => {
        if (!productToDelete) return;

        try {
            await axiosInstance.post("/deleteProduct_directory_id", {
                lead_id: leadId,
                customer_id: customer_id,
                id: productToDelete, // Pass stored ID
            });

            // Remove the deleted product from state
            setProductDirectory((prevProducts) =>
                prevProducts.filter((product) => product.id !== productToDelete)
            );

            toast("Product deleted successfully");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast("Error deleting product");
        } finally {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleProductUpdate = async () => {
        // Add validation for all required fields
        if (!formData.product || !formData.make || !formData.model || !formData.quantity) {
            toast.error("Please fill all required fields (Product, Make, Model, and Quantity) before saving");
            return;
        }

        try {
            const updatedProductData = {
                lead_id: leadId,
                customer_id: customer_id,
                status: "1",
                id: formData.id,
                product: formData.product,
                model: formData.model,
                make: formData.make,
                quantity: formData.quantity,
                target_price: formData.target_price,
            };
            const response = await axiosInstance.post(
                "/updateproduct_directory_id",
                updatedProductData
            );

            const updatedProductDirectory = productDirectory.map((product) =>
                product.id === formData.id
                    ? { ...product, ...formData }
                    : product
            );

            setProductDirectory(updatedProductDirectory);
            if (response) {
                toast("Product updated successfully");
            }

            handleClose();
        } catch (error) {
            console.error("Error updating product:", error);
            toast("Error updating product");
        }
    };

    const downloadFile = (id) => {
        if (files[id]) {
            const file = files[id];
            const url = window.URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name); // Set the filename
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object
        } else {
            toast.error("No file selected for download.");
        }
    };

    // Responsive styles without scrollbars
    const placeholderStyle = `
    .productTable {
        background-color: rgb(42, 107, 172);
        min-width: 200px;
    }

    .input-responsive {
        min-width: 6rem;
        font-size: clamp(0.75rem, 1vw, 1rem);
        padding: 4px 8px;
    }

    .btnResponsive {
        min-width: 6rem;
        font-size: clamp(0.5rem, 1vw, 1rem);
        padding: 4px 6px;
    }

    .inputfield {
        width: 100%;
        min-width: 0;
    }

    .customerbtn {
        max-width: 9rem;
        min-width: 6rem;
    }

    /* Responsive adjustments */
    @media (max-width: 1630px) {
        .productTable {
            min-width: 300px;
        }
    }

    @media (max-width: 1360px) {
        .inputfield {
            width: 90%;
        }
    }

    @media (max-width: 1233px) {
        .customerbtn {
            max-width: 7rem;
        }
        .inputfield {
            width: 85%;
        }
    }

    @media (max-width: 768px) {
        .input-responsive {
            font-size: 0.75rem;
            padding: 3px 6px;
        }
        .btnResponsive {
            font-size: 0.65rem;
            padding: 3px 5px;
        }
    }

    /* Prevent scrollbars */
    .no-scrollbar {
        overflow: hidden !important;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    `;

    //my code

    const [tableWidth, setTableWidth] = useState("100%");

    useEffect(() => {
        const updateWidth = () => {
            if (window.innerWidth < 1309) {
                setTableWidth("90%");
            } else if (window.innerWidth < 1621) {
                setTableWidth("95%");
            } else {
                setTableWidth("100%");
            }
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                const response = await axiosInstance.get(`/currencyListing`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const options = response.data.map((currency) => ({
                    value: currency.name,
                    label: `${currency.symbol} - ${currency.name}`,
                }));

                setCurrencyOptions(options); // ✅ Now currencyOptions is dynamic!
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCurrencyData();
    }, []);

    // Modify areRequiredFieldsFilled function to be more strict
    const areRequiredFieldsFilled = () => {
        // Check if all sections are filled
        const isProductDetailsFilled = productDirectory && productDirectory.length > 0;

        // Opportunity Details section
        const isOpportunityDetailsFilled = formData.buying_plan !== "";

        // Purchase Decision Maker section
        const isPurchaseDecisionMakerFilled = formData.name !== "" &&
            formData.mo_no !== "" &&
            formData.email !== "";

        // Return true only if ALL sections are filled
        return isProductDetailsFilled &&
            isOpportunityDetailsFilled &&
            isPurchaseDecisionMakerFilled;
    };

    // Modify the useEffect to be more explicit about section completion
    useEffect(() => {
        // Product Details section
        const hasProducts = productDirectory && productDirectory.length > 0;

        // Opportunity Details section
        const hasBuyingPlan = formData.buying_plan !== "";

        // Purchase Decision Maker section
        const hasName = formData.name !== "";
        const hasMobile = formData.mo_no !== "";
        const hasEmail = formData.email !== "";

        // Update form completion status
        onFormCompletionUpdate({
            hasProducts,
            hasBuyingPlan,
            hasName,
            hasMobile,
            hasEmail
        });
    }, [productDirectory, formData, onFormCompletionUpdate]);

    return (
        <>
            <style>{placeholderStyle}</style>
            {/* Responsive container without fixed dimensions */}
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
                {/* Left Card */}
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
                    <h5 style={{
                        color: "#000000",
                        fontWeight: "700",
                        marginBottom: "1rem",
                        fontFamily: "Nunito Sans",
                        fontSize: "16.5px"
                    }}>
                        Opportunity Details
                    </h5>

                    <div className="row" style={{ marginBottom: "2rem" }}>
                        {[
                            { label: "Opportunity Details:", value: "673273474" },
                            { label: "Opportunity Date:", value: "11/09/2025" },
                            { label: "Customer Name:", value: "Avneesh Kumar" },
                            { label: "Buying Plan:", value: "23/07/2025" },
                            { label: "Order Value:", value: "Not yet given" },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="col-md-4 mb-3 d-flex align-items-center"
                                style={{ minWidth: "224px" }}
                            >
                                <label
                                    style={{
                                        color: "#2E467A",
                                        marginRight: "8px",
                                        fontSize: "14px",
                                        // minWidth: "120px",
                                    }}
                                >
                                    {item.label}
                                </label>
                                <span style={{ color: "rgba(46, 70, 122, 0.6)" }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <h5 style={{
                        color: "#000000",
                        fontWeight: "700",
                        marginBottom: "1rem",
                        fontFamily: "Nunito Sans",
                        fontSize: "16.5px"
                    }}>                        Purchase Decision Maker
                    </h5>

                    <div className="row">
                        <div
                            className="col-md-4 mb-3 d-flex align-items-center"
                            style={{ minWidth: "275px" }}
                        >
                            <label
                                style={{
                                    color: "#2E467A",
                                    marginRight: "8px",
                                    fontSize: "14px",
                                    minWidth: "150px",
                                }}
                            >
                                Decision Maker Name:
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleInput_Change}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "rgba(46, 70, 122, 0.6)",
                                    padding: 0,
                                    flex: 1,
                                }}
                            />
                        </div>

                        <div
                            className="col-md-4 mb-3 d-flex align-items-center"
                            style={{ minWidth: "224px" }}
                        >
                            <label
                                style={{
                                    color: "#2E467A",
                                    marginRight: "8px",
                                    fontSize: "14px",
                                    minWidth: "120px",
                                }}
                            >
                                Mobile Number:
                            </label>
                            <input
                                type="text"
                                name="mo_no"
                                placeholder="Mobile"
                                value={formData.mo_no}
                                onChange={handleInput_Change}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "rgba(46, 70, 122, 0.6)",
                                    padding: 0,
                                    flex: 1,
                                }}
                            />
                        </div>

                        <div
                            className="col-md-4 mb-3 d-flex align-items-center"
                            style={{ minWidth: "305px", marginLeft: "10px" }}
                        >
                            <label
                                style={{
                                    color: "#2E467A",
                                    marginRight: "8px",
                                    fontSize: "14px",
                                    minWidth: "30px",
                                }}
                            >
                                Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="E-mail"
                                value={formData.email}
                                onChange={handleInput_Change}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "rgba(46, 70, 122, 0.6)",
                                    padding: 0,
                                    flex: 1,
                                }}
                            />
                        </div>

                        {/* <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "auto",
                            paddingTop: "1rem"
                        }}>
                            <button
                                style={{
                                    backgroundColor: "#E5E7EB",
                                    color: "#374151",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 20px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#D1D5DB"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#E5E7EB"}
                            >
                                Previous
                            </button>
                            <button
                    style={{
                        background: "linear-gradient(90deg, #111A2E 0%, #375494 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onClick={onNextStage}
                    disabled={!areRequiredFieldsFilled()}
                >
                    Next
                </button>
                        </div> */}
                    </div>

                </div>


                {/* Right Card */}
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

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div
                        className="modal show"
                        style={{
                            display: "block",
                            background: "rgba(0,0,0,0.5)",
                            alignContent: "center",
                        }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title setFont">Confirm Delete</h5>
                                </div>
                                <div className="modal-body">
                                    <p className="setFont">
                                        Are you sure you want to delete this product?
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="setFont btn btn-outline-secondary"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        No
                                    </button>
                                    <button
                                        className="setFont btn btn-danger"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleRemove();
                                        }}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Edit Modal - Responsive */}
            <div>
                {showModal && (
                    <>
                        <div
                            className="modal show"
                            style={{
                                display: "block",
                                background: "rgba(0,0,0,0.5)",
                                alignContent: "center",
                                zIndex: 1050,
                            }}
                        >
                            <div
                                className="modal-dialog"
                                style={{
                                    maxWidth: "90vw",
                                    width: "600px",
                                    margin: "auto",
                                }}
                            >
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title setFont">
                                            Edit Product
                                        </h5>
                                        <button
                                            type="button"
                                            className="setFont btn-close"
                                            onClick={handleClose}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="row g-2 mb-3">
                                            {[
                                                "product",
                                                "make",
                                                "model",
                                                "quantity",
                                                "target_price",
                                            ].map((field, index) => (
                                                <div
                                                    key={index}
                                                    className="col-12 col-md-6 col-lg-4"
                                                >
                                                    <label
                                                        className="form-label setFont"
                                                        style={{
                                                            textTransform: "capitalize",
                                                            fontSize: "clamp(12px, 1.5vw, 14px)",
                                                        }}
                                                    >
                                                        {field.replace("_", " ")}
                                                    </label>
                                                    <input
                                                        type={field === "quantity" ? "number" : "text"}
                                                        placeholder={field.replace("_", " ").toUpperCase()}
                                                        className="setFont form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                        style={{
                                                            fontSize: "clamp(12px, 1.5vw, 14px)",
                                                        }}
                                                        value={formData[field] || ""}
                                                        onChange={(e) =>
                                                            handleChange(e, field)
                                                        }
                                                    />
                                                </div>
                                            ))}
                                            <hr />
                                            <br />
                                            <div className="col-6 d-flex justify-content-center">
                                                <button
                                                    className="setFont btn btn-sm btn-outline-danger"
                                                    type="button"
                                                    onClick={handleClose}
                                                    style={{
                                                        fontSize: "clamp(12px, 1.5vw, 14px)",
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="col-6 d-flex justify-content-center">
                                                <button
                                                    className="setFont btn btn-sm btn-success"
                                                    type="button"
                                                    onClick={handleProductUpdate}
                                                    style={{
                                                        backgroundColor: "#0292E3",
                                                        fontSize: "clamp(12px, 1.5vw, 14px)",
                                                    }}
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedFile && (
                <div className="mt-2">
                    <p style={{ fontSize: "clamp(12px, 1.5vw, 14px)" }}>
                        Selected file: {selectedFile.name}
                    </p>
                </div>
            )}
        </>
    );
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

const MainSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { leadId } = useParams();
    const { uniqueQueryId } = useParams();
    const [productData, setProductData] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarOpen2, setIsSidebarOpen2] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isPiDetailsValid, setIsPiDetailsValid] = useState(true);
    const [hasFollowUpDetails, setHasFollowUpDetails] = useState(false);
    const [hasPriceSharedData, setHasPriceSharedData] = useState(false);
    const [hasProductSourcingData, setHasProductSourcingData] = useState(false);
    const [formCompletionStatus, setFormCompletionStatus] = useState({
        hasProducts: false,
        hasBuyingPlan: false,
        hasName: false,
        hasMobile: false,
        hasEmail: false
    });
    const [hasLeadAcknowledgment, setHasLeadAcknowledgment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { userPermission } = useAuth();

    // Fetch lead details on component mount
    useEffect(() => {
        const fetchLeadDetails = async () => {
            if (!leadId) {
                console.error("Lead ID is missing");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axiosInstance.get("/showlead", {
                    params: { id: leadId },
                });

                if (response.data && response.data.lead) {
                    setProductData(response.data.lead);

                    if (response.data.lead.salesperson_id) {
                        localStorage.setItem("productData.sender_name", response.data.lead.sender_name);
                    }
                }
            } catch (err) {
                console.error("Error fetching leads:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeadDetails();
    }, [leadId]);

    // This function only handles stage 0 (Inquired Data) validation
    const areRequiredFieldsFilled = () => {
        return formCompletionStatus.hasProducts &&
            formCompletionStatus.hasBuyingPlan &&
            formCompletionStatus.hasName &&
            formCompletionStatus.hasMobile &&
            formCompletionStatus.hasEmail;
    };

    // Add handler for form completion status updates
    const handleFormCompletionUpdate = (status) => {
        setFormCompletionStatus(prev => ({
            ...prev,
            ...status
        }));
    };

    // Add handler for PI validation
    const handlePiValidation = (isValid) => {
        setIsPiDetailsValid(isValid);
    };

    // Add handler for lead acknowledgment validation
    const handleLeadAcknowledgmentValidation = (isValid) => {
        setHasLeadAcknowledgment(isValid);
    };

    // Add handler for price shared validation
    const handlePriceSharedValidation = (isValid) => {
        setHasPriceSharedData(isValid);
    };

    const handleProductSourcingValidation = (isValid) => {
        setHasProductSourcingData(isValid);
    };

    // Modify isStageValid to include price shared validation
    const isStageValid = () => {
        switch (currentIndex) {
            case 0: // Inquired Data
                return areRequiredFieldsFilled();
            case 1: // Lead Acknowledgment
                return hasLeadAcknowledgment;
            case 2: // Product Sourcing
                return hasProductSourcingData;
            case 3: // Price Shared
                return hasPriceSharedData;
            case 4: // Quotation Send
                return isPiDetailsValid;
            case 5: // Follow Up
                return hasFollowUpDetails;
            default:
                return true; // Other stages don't need validation
        }
    };


    // Modify handleStageSelect to include price shared validation message
    const handleStageSelect = (index) => {
        // Only check validation when moving forward
        if (index > currentIndex) {
            if (!isStageValid()) {
                // Show appropriate error message based on stage
                switch (currentIndex) {
                    case 0:
                        toast.error("Please complete all required fields");
                        break;
                    case 1:
                        // Check if there are any entries at all
                        if (!hasLeadAcknowledgment) {
                            toast.error("Please complete lead acknowledgment first");
                        } else {
                            toast.error("Cannot proceed: Lead has been disqualified or marked as clarity pending");
                        }
                        break;
                    case 2:
                        toast.error("Please do Sourcing");
                        break;
                    case 3:
                        toast.error("Please add at least one quoted price");
                        break;
                    case 4:
                        toast.error("Please fill in PI Number and Date");
                        break;
                    case 5:
                        toast.error("Please complete follow-up details");
                        break;
                }
                return;
            }
        }
        setCurrentIndex(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Add effect to sync with localStorage
    useEffect(() => {
        const savedIndex = localStorage.getItem(`currentPageIndex_${leadId}`);
        if (savedIndex) {
            setCurrentIndex(parseInt(savedIndex, 10));
        } else {
            // Reset to 0 if no saved index for this lead
            setCurrentIndex(0);
        }
    }, [leadId]); // Add leadId as dependency

    // Add effect to update localStorage when currentIndex changes
    useEffect(() => {
        localStorage.setItem(`currentPageIndex_${leadId}`, currentIndex);
    }, [currentIndex, leadId]);

    const CurrentComponent = components[currentIndex].component;

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const styles = `
        .custom-file-input::file-selector-button {
            font-size: clamp(0.7rem, 1.5vw, 0.8rem);
            padding: 2px 8px;
        }

        .backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }

        /* Show backdrop only when sidebar is open on small screens */
        @media (max-width: 767px) {
            .backdrop {
                display: block;
            }
        }

        /* Responsive container adjustments */
        .responsive-container {
            max-width: 100vw;
            overflow-x: hidden;
        }

        /* Prevent horizontal scrolling */
        body {
            overflow-x: hidden;
        }
    `;

    const handleFollowUpDetailsChange = (hasDetails) => {
        setHasFollowUpDetails(hasDetails);
    };
    return (
        <OpportunityProvider>
            <div className="d-flex flex-column dark:bg-gray-800" style={{ margin: "0px -16px" }}>
                <Navbar
                    currentIndex={currentIndex}
                    onStageSelect={handleStageSelect}
                    unique_query_id={productData.unique_query_id}
                    created_at={productData.created_at}
                    query_product_name={productData.query_product_name}
                    sender_name={productData.sender_name}
                    customer_id={productData.customer_id}
                    lead_id={leadId}
                />



                <div className="d-flex mt-1 flex-grow-1" style={{ overflow: "hidden", height: "600px" }}>
                    {isSidebarOpen && (
                        <div className="backdrop" onClick={() => setIsSidebarOpen(false)}></div>
                    )}



                    <div className="flex-grow-1 overflow-auto" style={{ padding: "0rem 1rem", width: "100%", overflowY: "auto", scrollbarWidth: 'thin' }}>
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <div className="dynamic-section">
                                {currentIndex === 4 ? (
                                    <FifthMain onPiValidation={handlePiValidation} />
                                ) : currentIndex === 5 ? (
                                    <DecisionAwaited onFollowUpDetailsChange={handleFollowUpDetailsChange} />
                                ) : currentIndex === 1 ? (
                                    <SecondMain onValidationChange={handleLeadAcknowledgmentValidation} />
                                ) : currentIndex === 3 ? (
                                    <PriceShared onPriceSharedValidation={handlePriceSharedValidation} />
                                ) : currentIndex === 2 ? (
                                    <ThirdMain onProductSourcingValidation={handleProductSourcingValidation} />
                                ) : (
                                    <CurrentComponent
                                        productData={productData}
                                        onFormCompletionUpdate={handleFormCompletionUpdate}
                                        onNextStage={() => handleStageSelect(currentIndex + 1)}
                                        onPrevStage={() => handleStageSelect(currentIndex - 1)}
                                        {...(currentIndex === 4 && { onPiValidation: handlePiValidation })}
                                        {...(currentIndex === 5 && { onFollowUpDetailsChange: handleFollowUpDetailsChange })}
                                        {...(currentIndex === 1 && { onValidationChange: handleLeadAcknowledgmentValidation })}
                                        {...(currentIndex === 3 && { onPriceSharedValidation: handlePriceSharedValidation })}
                                        {...(currentIndex === 2 && { onProductSourcingValidation: handleProductSourcingValidation })}
                                    />
                                )}
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-2 mb-2">
                            <button
                                className="setFont p-1 btn"
                                onClick={() => handleStageSelect(currentIndex - 1)}
                                disabled={currentIndex === 0} // Only disable on first stage
                                style={{
                                    width: "9rem",
                                    height: "2rem",
                                    fontSize: "1rem",
                                    backgroundColor: "#0292E3",
                                    color: 'white'
                                }}
                            >
                                Prev
                            </button>
                            {currentIndex < components.length - 1 && (
                                <button
                                    className="setFont p-1 btn"
                                    onClick={() => handleStageSelect(currentIndex + 1)}
                                    style={{
                                        width: "9rem",
                                        height: "2rem",
                                        fontSize: "1rem",
                                        backgroundColor: "#0292E3",
                                        color: 'white'
                                    }}
                                    disabled={!isStageValid()} // <-- Disable if not valid
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>

                    {isSidebarOpen2 && (
                        <div className="backdrop" onClick={() => setIsSidebarOpen2(false)}></div>
                    )}


                </div>
            </div>
        </OpportunityProvider>
    );
};

export default MainSection;
