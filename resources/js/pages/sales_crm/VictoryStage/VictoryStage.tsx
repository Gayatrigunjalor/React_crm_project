import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../axios";
import Button from "../../../components/base/Button";
import Badge from "../../../components/base/Badge";
import ReactSelect from '../../../components/base/ReactSelect';
import { Form as Form, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useParams } from "react-router-dom";
import swal from 'sweetalert';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Dropzone from '../../../components/base/Dropzone';
import { is } from "date-fns/locale";
import { bt } from "@fullcalendar/core/internal-common";
import Rightcard from "../inquiryRecived/Rightcard";


const Seventhmain = () => {
    const [showCreateBtPopup, setShowCreateBtPopup] = useState(false);
    const [segments, setSegments] = useState([]);
    const [sdeTeams, setSdeTeams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [selectedSdeTeam, setSelectedSdeTeam] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState("");
    const [dealWon, setDealWon] = useState(false);
    const [btCreated, setBTCreated] = useState(false);
    // const [customerName, setCustomerName] = useState(localStorage.getItem("productData.sender_name") || "");
    const [customerName, setCustomerName] = useState("");
    const [products, setProducts] = useState([]);
    const { leadId } = useParams();
    const { uniqueQueryId } = useParams();
    // const customer_id = localStorage.getItem("cst_id");
    const { customerId } = useParams();
    console.log('lead and customer ids', leadId, customerId);
    const [selectedDate, setSelectedDate] = useState("");
    // const savedQueryId = localStorage.getItem('unique_query_id');
    const savedOppDate = localStorage.getItem('opp_date');
    const dateOnly = savedOppDate?.split('T')[0];
    const [loading, setLoading] = useState(false);
    // console.log(btCreated, "btCreated");
    // console.log(uniqueQueryId, "uniqueQueryId");

    interface CustData {
        date: string;
        customer_name: string;
        segment_id: number | null;
        segment: {
            id: number | null;
            name: string;
        };
        category_id: number | null;
        category: {
            id: number | null;
            name: string;
        };
        enquiry: string;
        sde_team_id: number | null;
        sde_team: {
            sde: number | null;
            employee_sde: {
                user_id: number | null;
                name: string;
            };
        };
    }

    interface Product {
        product: string;
    }

    interface IncoTerm {
        id: number;
        inco_term: string;
    }

    interface SelectOption {
        value: number | string;
        label: string;
    }

    const [custData, setCustData] = useState<CustData>({
        date: selectedDate || '',
        customer_name: customerName,
        segment_id: selectedSegment?.value || null,
        segment: {
            id: selectedSegment?.value || null,
            name: selectedSegment?.label || ''
        },
        category_id: selectedCategory?.value || null,
        category: {
            id: selectedCategory?.value || null,
            name: selectedCategory?.label || ''
        },
        enquiry: products.length > 0 ? (products as Product[]).map(product => product.product).join(", ") : '',
        sde_team_id: selectedSdeTeam?.value || null,
        sde_team: {
            sde: selectedSdeTeam?.value || null,
            employee_sde: {
                user_id: selectedSdeTeam?.value || null,
                name: selectedSdeTeam?.label || ''
            }
        }
    });
    const [showCreateBTButton, setShowCreateBTButton] = useState(false);

    const [oppId, setOppId] = useState("");
    const [oppDate, setOppDate] = useState("");
    const [btId, setBtId] = useState("");
    const [btDate, setBtDate] = useState("");

    // Already existing:
    const [piNumber, setPiNumber] = useState("");
    const [piId, setPiId] = useState("");
    const [piDate, setPiDate] = useState("");
    const [shippingLiability, setShippingLiability] = useState("");
    const [coldChain, setColdChain] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [freightCost, setFreightCost] = useState("");
    const [shipmentMode, setShipmentMode] = useState("");
    const [incoTerms, setIncoTerms] = useState([]);
    const [selectedIncoTerm, setSelectedIncoTerm] = useState("");
    const [finalDestination, setFinalDestination] = useState("");
    const [portOfUnloading, setPortOfUnloading] = useState("");
    const [attachmentName, setAttachmentName] = useState("");
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [procurementAttachments, setProcurementAttachments] = useState({
        files: [] as File[],
    });
    const [errors, setErrors] = useState<{ files?: string }>({});
    const shipmentOptions = [
        { value: 'Air', label: 'Air' },
        { value: 'Water', label: 'Water' },
        { value: 'Road', label: 'Road' },
        { value: 'Train', label: 'Train' },
    ];

    const [selectedIncoTermId, setSelectedIncoTermId] = useState(""); // store the ID of selected term

    // const handleIncoTermChange = (e) => {
    //     const selectedId = e.target.value;
    //     setSelectedIncoTermId(selectedId);
    // };
    const handleIncoTermChange = (selectedOption) => {
        setSelectedIncoTermId(selectedOption ? selectedOption.value : null);
    };

    useEffect(() => {
        const savedPiNumber = localStorage.getItem('piNumber');
        const savedPiDate = localStorage.getItem('piDate');
        const savedPiId = localStorage.getItem('quotationId');

        if (savedPiNumber) {
            setPiNumber(savedPiNumber);
        }

        if (savedPiDate) {
            setPiDate(savedPiDate);
        }
        if (savedPiId) {
            setPiId(savedPiId);
        }
    }, []);
    const handleFileUpload = (e) => {
        setAttachmentFile(e.target.files[0]);
    };
    const [attachments, setAttachments] = useState([
        { file: null, name: '' }
    ]);

    useEffect(() => {
        const fetchIncoTerm = async () => {
            try {
                const response = await axiosInstance.get('/incoTermsListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                setIncoTerms(response.data);
            } catch (err) {
                setError(err.message);
            } finally {

            }
        };

        fetchIncoTerm();
    }, []);


    useEffect(() => {
        const fetchSender = async () => {
            try {
                const response = await axiosInstance.get('/getSender', {
                    params: {
                        lead_id: leadId
                    }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                setCustomerName(response.data.sender_name);
            } catch (err) {
                setError(err.message);
            } finally {

            }
        };

        fetchSender();
    }, [leadId]);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const handleModeChange = (selectedOptions) => {
        setSelectedOptions(selectedOptions);
    };

    // useEffect(() => {
    //     // Fetch Segment data
    //     const fetchSegment = async () => {
    //         try {
    //             const response = await axiosInstance.get("/segmentListing");
    //             if (response.status !== 200) {
    //                 throw new Error("Failed to fetch segment data");
    //             }
    //             const segmentOptions = response.data.map((segment) => ({
    //                 value: segment.id,
    //                 label: segment.name,
    //             }));
    //             setSegments(segmentOptions);
    //         } catch (err) {
    //             setError(err.message);
    //         }
    //     };

    //     // Fetch SDE Team data
    //     const fetchSDEteam = async () => {
    //         try {
    //             const response = await axiosInstance.get("/getBTteamByName/Sde");
    //             if (response.status !== 200) {
    //                 throw new Error("Failed to fetch SDE team data");
    //             }
    //             const sdeOptions = response.data.map((sde) => ({
    //                 value: sde.employee_sde.id,
    //                 label: sde.employee_sde.name,
    //             }));
    //             setSdeTeams(sdeOptions);
    //         } catch (err) {
    //             setError(err.message);
    //         }
    //     };

    //     // Fetch Product Directory data
    //     const fetchProductDirectory = async () => {
    //         try {
    //             const response = await axiosInstance.get("/showProductsDirectory", {
    //                 params: {
    //                     lead_id: leadId,
    //                     customer_id: customer_id,
    //                 },
    //             });

    //             const fetchedProducts = response.data.products;

    //             if (Array.isArray(fetchedProducts)) {
    //                 setProducts(fetchedProducts);
    //             } else {
    //                 console.error("Fetched products is not an array", fetchedProducts);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching product directory:", error);
    //         }
    //     };

    //     fetchSegment();
    //     fetchSDEteam();
    //     fetchProductDirectory();
    // }, [customer_id, leadId]);


    // // Function to fetch categories based on selected segment
    // const fetchCategories = async (segmentId) => {
    //     try {
    //         const response = await axiosInstance.get(`/getCategories?segment_id=${segmentId}`);
    //         if (response.status === 200) {
    //             const categoryOptions = response.data.map((category) => ({
    //                 value: category.id,
    //                 label: category.name,
    //             }));
    //             setCategories(categoryOptions);
    //         }
    //     } catch (err) {
    //         setError(err.message);
    //     }
    // };

    // // Update categories when segment is changed
    // const handleSegmentChange = (selectedOption) => {
    //     setSelectedSegment(selectedOption);
    //     setSelectedCategory(null);
    //     if (selectedOption) {
    //         fetchCategories(selectedOption.value);
    //     }
    // };

    // Concatenate the product names into a comma-separated list
    const productNames = products.map(product => product.product).join(", ");
    const handleDrop = (acceptedFiles: File[]) => {
        // Instead of creating a FileList, just update the files array
        setProcurementAttachments((prevState) => ({
            ...prevState,
            files: acceptedFiles, // acceptedFiles is already an array of File objects
        }));

        setErrors((prevErrors) => ({ ...prevErrors, files: undefined }));
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = procurementAttachments.files.filter((_, i) => i !== index);

        setProcurementAttachments((prevState) => ({
            ...prevState,
            files: updatedFiles, // Update the files with the new array
        }));
    };


    const handleAddButtonClick = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        // Grab values from form elements
        const shippingLiability = document.querySelector('select[name="shipping_liabelity"]')?.value || '';

        // Basic Validation
        if (
            // !savedQueryId ||
            !uniqueQueryId ||
            !dateOnly ||
            !customerName ||
            !piNumber ||
            !piDate ||
            !shippingLiability ||
            !coldChain ||
            !selectedIncoTermId ||
            !portOfUnloading ||
            !finalDestination ||
            !zipCode ||
            !freightCost ||
            !selectedOptions.length ||
            !procurementAttachments.files.length
        ) {
            swal("Missing Fields", "Please fill in all required fields before submitting.", "warning");
            setLoading(false);
            return; // Stop the API call
        }

        const requestData = {
            date: new Date().toISOString().split('T')[0],
            // opportunity_id: savedQueryId,
            opportunity_id: uniqueQueryId,
            opportunity_date: dateOnly,
            customer_name: customerName,
            enquiry: products.length > 0 ? products.map(product => product.product).join(", ") : '',
            sde_team_id: selectedSdeTeam?.value || '',
            shipping_liabelity: shippingLiability,
            cold_chain: coldChain,
            inco_term_id: selectedIncoTermId,
            port_of_unloading: portOfUnloading,
            final_destination: finalDestination,
            destination_code: zipCode,
            shipment_mode: selectedOptions,
            freight_target_cost: freightCost,
            proforma_invoice_id: piId,
            proforma_invoice: procurementAttachments
        };

        try {
            const response = await axiosInstance.post(
                "/createBTfromSalesMatrix",
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data.success) {
                swal("Success!", response.data.message, "success").then(() => {
                    setShowCreateBtPopup(false);
                    setAttachments([{ file: null, name: '' }]);
                    isBtCreated();
                });
            } else {
                swal("Error!", response.data.message || "Something went wrong", "error");
            }
        } catch (error) {
            console.error('Error creating BT:', error);
            swal("Error!", "Failed to create Business Task. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const { width, height } = useWindowSize();



    // const handleDealWon = async () => {
    //     const token = localStorage.getItem('token');
    //     const cleanToken = token && token.split('|')[1];

    //     try {
    //         const response = await axiosInstance.post(
    //             "/deal_won",
    //             {
    //                 lead_id: leadId,
    //                 customer_id: customer_id,
    //                 deal_won: 1,
    //                 status: 1
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${cleanToken}`,
    //                 }
    //             }
    //         );

    //         if (response) {

    //             setIsCelebration(true);


    //             swal("Success!", response.data.message, "success").then(() => {

    //                 setIsCelebration(false);


    //                 swal("Next Step", "Now, Create BT", "info").then(() => {
    //                     setShowCreateBTButton(true);
    //                 });
    //             });

    //         } else {
    //             swal("Error!", "Something went wrong!", "error");
    //         }
    //     } catch (error) {
    //         swal("Error!", "Failed to mark deal as won. Please try again.", "error");
    //     }
    // };

    const handleDealWon = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        try {
            const response = await axiosInstance.post(
                "/deal_won",
                {
                    lead_id: leadId,
                    customer_id: customerId,
                    deal_won: 1,
                    status: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    }
                }
            );

            // setDealWon(response.data.victory.status);
            isDealWon();
            if (response) {
                setIsCelebration(true);

                swal("Success!", response.data.message, "success");

                setTimeout(() => {
                    setIsCelebration(false);


                }, 10000);
                swal("Next Step", "Now, Create BT", "info").then(() => {
                    setShowCreateBTButton(true);
                });
            } else {
                swal("Error!", "Something went wrong!", "error");
            }
        } catch (error) {
            swal("Error!", "Failed to mark deal as won. Please try again.", "error");
        }
    };


    const isDealWon = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        try {
            const response = await axiosInstance.get("/is_deal_won", {
                params: {
                    lead_id: leadId,
                    customer_id: customerId,
                },
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
            });


            setDealWon(response.data.isDealWon);
        } catch (error) {
            console.error("Error checking deal status:", error);
        }
    };
    useEffect(() => {
        isDealWon();
    }, []);


    const isBtCreated = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        try {
            const response = await axiosInstance.get("/checkBTcreated", {
                params: {
                    //   opportunity_id: savedQueryId,
                    opportunity_id: uniqueQueryId,
                },
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
            });


            setBTCreated(response.data.success);
        } catch (error) {
            console.error("Error checking deal status:", error);
        }
    };

    useEffect(() => {
        isBtCreated();
    }, []);


    const handleFileChange = (e, index) => {
        const files = [...attachments];
        files[index].file = e.target.files[0];
        files[index].name = e.target.files[0]?.name || '';
        setAttachments(files);
    };

    const handleNameChange = (e, index) => {
        const updated = [...attachments];
        updated[index].name = e.target.value;
        setAttachments(updated);
    };

    const addAttachmentField = () => {
        setAttachments([...attachments, { file: null, name: '' }]);
    };




    const [isCelebration, setIsCelebration] = useState(false);
    const confetti = useRef(null);


    const celebrationBanner = (
        <div
            style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',

                color: 'green',
                padding: '1rem 2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                textAlign: 'center',
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: '1.1rem',
            }}
        >
            🎉 You've just won the deal!
        </div>
    );



    return (
        <>
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row", // keep them horizontal
                        justifyContent: "space-between",
                        alignItems: "stretch", // same height
                        gap: "20px", // space between cards
                        width: "100%", // take full container width
                    }}
                >
                    {/* Left Card */}
                    <div
                        className="left-card shadow-sm"
                        style={{
                            width: "50%", // half width
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            borderRadius: "20px",
                            padding: "1.5rem",
                            overflow: "hidden",
                            fontSize: "14px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h6
                            style={{
                                fontFamily: "Nunito Sans, sans-serif",
                                fontSize: "18px",
                                fontWeight: "700",
                                textAlign: "left",
                            }}
                        >
                            Victory Stage
                        </h6>
                        <hr style={{ border: "1px solid #777", width: "100%" }} />
                        <p>Your left card content here...</p>
                    </div>

                    {/* Right Card */}
                    <div
                        className="right-card shadow-sm"
                        style={{
                            width: "50%", // half width
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            borderRadius: "20px",
                            padding: "1.5rem",
                            fontSize: "14px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h6
                            style={{
                                fontFamily: "Nunito Sans, sans-serif",
                                fontSize: "18px",
                                fontWeight: "700",
                                textAlign: "left",
                            }}
                        >
                            Second Card
                        </h6>
                        <hr style={{ border: "1px solid #777", width: "100%" }} />
                        <p>Your right card content here...</p>
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
        </>



    );
};

export default Seventhmain;
