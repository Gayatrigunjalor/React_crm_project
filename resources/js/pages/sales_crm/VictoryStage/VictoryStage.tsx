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
            {loading && <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', fontFamily: 'Nunito Sans, sans-serif' }}>
                <Spinner animation="border" variant="primary" />
            </div>}
            <div className="container mb-4" style={{ height: '400px' }}>
                {/* <h6 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Victory Stage</h6>

            <hr style={{ border: "1px solid #777" }} /> */}
                <h6 style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '18px', fontWeight: '700', textAlign: 'left' }}>
                    Victory Stage
                </h6>

                <hr style={{ border: "1px solid #777", width: '100%' }} />

                <div className="d-flex justify-content-center align-items-center" style={{ width: "100%" }}>
                    <div className="badgeContent d-flex gap-4">
                        {!dealWon && (
                            <Badge
                                bg="success"
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                className="px-3 py-2 cursor-pointer"
                                onClick={handleDealWon}
                            >
                                Deal Won
                            </Badge>
                        )}




                        {isCelebration && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    zIndex: 9999,
                                    pointerEvents: 'none', // so it doesn't block clicks behind
                                }}
                            >
                                <ReactConfetti
                                    width={width}
                                    height={height}
                                    numberOfPieces={1000} // increased from 600
                                    gravity={0.07}
                                    wind={0.01}
                                    initialVelocityY={10}
                                    recycle={false}
                                    colors={[
                                        '#ff3838', '#fff200', '#00e676',
                                        '#40c4ff', '#ff6d00', '#f50057', '#9c27b0',
                                        '#00bcd4', '#8bc34a', '#ffc107', '#795548',
                                        '#e91e63', '#3f51b5', '#4caf50', '#ff9800', '#607d8b' // 5 new colors
                                    ]}
                                // drawShape={(ctx) => {
                                //     const emojis = ['🎉', '🎊', '💥', '✨', '🔥'];
                                //     const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                                //     ctx.font = '20px serif';
                                //     ctx.fillText(emoji, 0, 10);
                                // }}
                                />

                                <div style={{ pointerEvents: 'auto' }}>
                                    {celebrationBanner}
                                </div>
                            </div>
                        )}


                        {((showCreateBTButton || dealWon) && !btCreated) && (
                            <Badge
                                style={{ backgroundColor: '#0097EB', fontFamily: 'Nunito Sans, sans-serif' }}
                                className="px-3 py-2 cursor-pointer"
                                onClick={() => setShowCreateBtPopup(true)}
                            >
                                Create BT
                            </Badge>
                        )}
                    </div>
                </div>



                {/* Modal for Create BT Form */}
                <Modal
                    show={showCreateBtPopup}
                    onHide={() => setShowCreateBtPopup(false)}
                    centered
                    size="lg"
                    className="me-3"
                >
                    <Modal.Header closeButton>
                        <Modal.Title style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Create BT</Modal.Title>
                    </Modal.Header>


                    <Modal.Body>
                        <Form className="mt-4" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>

                            <div className="row g-3">
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Opportunity ID</Form.Label>
                                        {/* <Form.Control type="text" value={savedQueryId} onChange={(e) => setOppId(e.target.value)} /> */}
                                        <Form.Control type="text" value={uniqueQueryId} onChange={(e) => setOppId(e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Opportunity Date</Form.Label>
                                        <Form.Control type="text" value={dateOnly} onChange={(e) => setOppDate(e.target.value)} readOnly />
                                    </Form.Group>
                                </div>
                            </div>




                            <h5 className="mt-4 mb-3">Inquiry Details</h5>
                            <div className="row g-3">
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Customer Name</Form.Label>
                                        <Form.Control type="text" value={customerName} readOnly />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>PI No(s)</Form.Label>
                                        <Form.Control type="text" placeholder="PI No" value={piNumber} onChange={(e) => setPiNumber(e.target.value)} readOnly />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>PI Date</Form.Label>
                                        <Form.Control type="text" placeholder="PI Date" value={piDate} onChange={(e) => setPiDate(e.target.value)} readOnly />
                                    </Form.Group>
                                </div>
                            </div>

                            <h5 className="mt-4 mb-3">Logistics Instructions</h5>
                            <div className="row g-3">
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Shipping Liability</Form.Label>
                                        {/* <Form.Control type="text" value={shippingLiability} onChange={(e) => setShippingLiability(e.target.value)} /> */}
                                        <Form.Select name="shipping_liabelity">
                                            <option value="">Select</option>
                                            <option value="Inorbvict">Inorbvict</option>
                                            <option value="Buyer">Buyer</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">Please enter shipping liability</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Cold Chain</Form.Label>
                                        {/* <Form.Control type="text" value={coldChain} onChange={(e) => setColdChain(e.target.value)} /> */}
                                        <Form.Select name="cold_chain" onChange={(e) => setColdChain(e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">Please enter cold chain</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Zip Code</Form.Label>
                                        <Form.Control type="text" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Freight Target Cost</Form.Label>
                                        <Form.Control type="number" placeholder="Freight Target Cost" value={freightCost} onChange={(e) => setFreightCost(e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Shipment Mode</Form.Label>
                                        <ReactSelect value={selectedOptions}
                                            options={shipmentOptions}
                                            isMulti
                                            placeholder="Select Shipment Mode"
                                            name="shipment_mode"
                                            onChange={handleModeChange}
                                        />
                                        {/* <Form.Control type="text" value={shipmentMode} onChange={(e) => setShipmentMode(e.target.value)} /> */}
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Inco Term</Form.Label>

                                        <Select
                                            value={incoTerms.find((term) => term.id === selectedIncoTermId) ? { value: selectedIncoTermId, label: incoTerms.find((term) => term.id === selectedIncoTermId).inco_term } : null}
                                            options={incoTerms.map((term) => ({
                                                value: term.id,
                                                label: term.inco_term,
                                            }))}
                                            placeholder="Select an Inco Term"
                                            name="Inco Term"
                                            onChange={handleIncoTermChange}
                                        />
                                        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                                        {/* {selectedIncoTermId && <p>Selected Inco Term ID: {selectedIncoTermId}</p>} */}
                                        {/* <Form.Control
                                            as="select"
                                            value={selectedIncoTermId} // Bind to selected ID
                                            onChange={handleIncoTermChange}
                                        >
                                            <option value="">Select an Inco Term</option>
                                            {incoTerms.map((term) => (
                                                <option key={term.id} value={term.id}> 
                                                    {term.inco_term} 
                                                </option>
                                            ))}
                                        </Form.Control> */}
                                    </Form.Group>

                                </div>

                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Final Destination</Form.Label>
                                        <Form.Control type="text" placeholder="Final Destination" value={finalDestination} onChange={(e) => setFinalDestination(e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <Form.Group>
                                        <Form.Label>Port of Unloading</Form.Label>
                                        <Form.Control type="text" placeholder="Port of Unloading" value={portOfUnloading} onChange={(e) => setPortOfUnloading(e.target.value)} />
                                    </Form.Group>
                                </div>
                            </div>


                            <h5 className="mt-4 mb-3">Attachment <span style={{ color: 'red' }}>*</span></h5>


                            <Dropzone onDrop={acceptedFiles => handleDrop(acceptedFiles)} onRemove={index => handleRemoveFile(index)} />
                            {errors.files && <div className="text-danger mt-1">{errors.files}</div>}


                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    variant="success"
                                    style={{ backgroundColor: '#004DFF', fontFamily: 'Nunito Sans, sans-serif' }}
                                    onClick={() => {
                                        if (!loading) {
                                            setLoading(true);
                                            handleAddButtonClick();
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                    ) : null}
                                    {loading ? "Processing..." : "Add"}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>


                </Modal>
            </div>
        </>



    );
};

export default Seventhmain;
