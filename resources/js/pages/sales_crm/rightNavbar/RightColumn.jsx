import React, { useState, useEffect } from "react";
import Button from "../../../components/base/Button";
import axiosInstance from "../../../axios";
import { Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { IoMdCloseCircle } from "react-icons/io";
import { useOpportunity } from "../../../context/OpportunityContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSave } from '@fortawesome/free-solid-svg-icons';
import { useParams } from "react-router-dom";

const RightColumn = ({ isSidebarOpen2, setIsSidebarOpen2, onStageSelect, selectedStageIndex, forceRefresh }) => {
    const { leadId } = useParams();
    const { customerId } = useParams();
    // console.log('lead and customer ids in rightcolumn ', leadId, customerId);
    console.log('selectedStageIndex', selectedStageIndex);
    const [panelWidth, setPanelWidth] = useState(400);
    const [productData, setProductData] = useState([]);
    const [ShowProductData, setShowProductData] = useState([]);
    const [ShowProductData2, setShowProductData2] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatbotmsg, setChatbotMsg] = useState([]);
    const [piNumber, setPiNumber] = useState('');
    const [piDate, setPIDate] = useState('');
    // const customer_id = localStorage.getItem("cst_id");
    const savedSalespersonId = localStorage.getItem('salesperson_id');
    const [orderValue, setOrderValue] = useState('');
    const { opportunityData, refreshProductPriceData, shouldRefreshOpportunity } = useOpportunity();
    console.log('productData', ShowProductData);
    const [formData, setFormData] = useState({
        id: 0,
        buying_plan: "",
        name: "",
        mo_no: "",
        email: "",
        keyOpportunity: 0,
        orderval: ""
    });

    console.log('keyOpportunity', formData.keyOpportunity);
    console.log('keyOpportunity type:', typeof formData.keyOpportunity);
    console.log('keyOpportunity value:', formData.keyOpportunity);

    const [decisionMakerName, setDecisionMakerName] = useState(
        Math.floor(Math.random() * 1000000)
    );
    const [date, setDate] = useState("DDMMYYYY");
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
    const handleDecisionMakerNameChange = (e) => {
        setDecisionMakerName(e.target.value);
    };
    const handleOrderValueChange = (e) => {
        setOrderValue(e.target.value);
    };


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


    const handleLeadIdChange = (event) => {
        setLeadId(event.target.value);
    }

    const handleLeadCustomerIdChange = (event) => {
        setLeadCustomerId(event.target.value);
    }
    const handleDateChange = (e) => {
        setDate(e.target.value);
    };
    useEffect(() => {
    //     if (!leadId) {
    //         setError("Lead ID is missing.");
    //         return;
    //     }

    //     const fetchLeadDetails = async () => {
    //         try {
    //             const response = await axiosInstance.get("/showlead", {
    //                 params: { id: leadId },
    //             });
    //             setProductData(response.data.lead.qualified);
    //             setChatbotMsg(response.data.lead.query_message);

    //             setLoading(false);
    //         } catch (err) {
    //             setError("Error fetching leads: " + err.message);
    //         }
    //     };

        const fetchQDetails = async () => {
            console.log("Fetching Product Price Details");
            try {
                const response = await axiosInstance.get("/price_shared_show", {
                    params: {
                        lead_id: leadId,
                        customer_id: customerId,
                    },
                });

                const data = response.data;
                console.log(data);
                setLoading(false);
                setShowProductData(data);
            } catch (err) {
                console.log("Error fetching Data: " + err.message);
            }
        };

        const fetchProductPriceDetails = async () => {
            console.log("Fetching Product Price Details");
            try {
                setLoading(true);
                const response = await axiosInstance.get("/getProductPriceDetails", {
                    params: {
                        lead_id: leadId,
                        customer_id: customerId,
                    },
                });

                const data = response.data;
                console.log(data);
                setLoading(false);
                setShowProductData(data);
                setShowProductData2(data);
            } catch (err) {
                console.log("Error fetching Data: " + err.message);
                setLoading(false);
            }
        };
         fetchQDetails();
        // fetchLeadDetails();
        fetchProductPriceDetails();
    }, [leadId,selectedStageIndex,refreshProductPriceData]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!leadId || !isMounted) return;

            setLoading(true);
            try {
                // Fetch lead details
                const leadResponse = await axiosInstance.get("/showlead", {
                    params: { id: leadId },
                });

                if (isMounted && leadResponse.data && leadResponse.data.lead) {
                    setProductData(leadResponse.data.lead);
                    setChatbotMsg(leadResponse.data.lead.query_message || []);
                }

                // Fetch opportunity details
                const opportunityResponse = await axiosInstance.post("/showOpportunityDetails", {
                    lead_id: leadId,
                    cust_id: customerId,
                });

                console.log('Main useEffect - Full API response:', opportunityResponse.data);
                console.log('Main useEffect - key_opportunity:', opportunityResponse.data.opportunity.key_opportunity);

                if (isMounted && opportunityResponse.data && opportunityResponse.data.opportunity) {
                    setFormData({
                        id: opportunityResponse.data.opportunity.id,
                        buying_plan: opportunityResponse.data.opportunity.buying_plan,
                        name: opportunityResponse.data.opportunity.name,
                        mo_no: opportunityResponse.data.opportunity.mo_no,
                        email: opportunityResponse.data.opportunity.email,
                        keyOpportunity: opportunityResponse.data.opportunity.key_opportunity,
                        overval: opportunityResponse.data.opportunity.order_value,
                    });
                    setOrderValue(opportunityResponse.data.opportunity.order_value);
                }

                // Fetch product price details if needed
                // if (selectedStageIndex === 3 || selectedStageIndex === 4) {
                //     const priceResponse = await axiosInstance.get("/price_shared_show", {
                //         params: {
                //             lead_id: leadId,
                //             customer_id: customerId,
                //         },
                //     });

                //     setShowProductData(priceResponse.data);
                //     setShowProductData2(priceResponse.data);
                //     // if (isMounted) {
                //     //     setShowProductData(priceResponse.data);
                //     //     setShowProductData2(priceResponse.data);
                //     // }
                // }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [leadId, selectedStageIndex, forceRefresh, customerId]);


    const showOpportunity = async () => {
        try {
            const response = await axiosInstance
                .post("/showOpportunityDetails", {
                    lead_id: leadId,
                    cust_id: customerId,
                })
                .then((res) => {
                    console.log('Full API response:', res.data);
                    console.log('key_opportunity from response:', res.data.opportunity.key_opportunity);
                    console.log('opportunity object:', res.data.opportunity);
                    setFormData({
                        id: res.data.opportunity.id,
                        buying_plan: res.data.opportunity.buying_plan,
                        name: res.data.opportunity.name,
                        mo_no: res.data.opportunity.mo_no,
                        email: res.data.opportunity.email,
                        keyOpportunity: res.data.opportunity.key_opportunity,
                        overval: res.data.opportunity.order_value,

                        //attachments: [res.data.opportunity.attachments],
                    });
                    setOrderValue(res.data.opportunity.order_value)
                    // console.log("Res %%%",res.data.opportunity.order_value);
                });
            // console.log('Order val***',formData.orderval);
            // console.log('buying_plan', formData.buying_plan);

        } catch (error) {
        }
    };

    useEffect(() => {
        showOpportunity();
    }, [selectedStageIndex, shouldRefreshOpportunity]);

    const handleResize = (e) => {
        const newWidth = e.clientX;
        if (newWidth >= 100 && newWidth <= 1500) {
            setPanelWidth(newWidth);
        }
    };
    const save = () => {
        // console.log("hello");
    };

    const LeadAcknowledgeStatus = () => {
        // console.log("Lead Acknowledge Status");
    };
    const handleStatusChange = (value) => {
        setProductData(value);
    };

    const changeStatus = async () => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        // Define the body content for the API request
        const body = JSON.stringify({ id: leadId });

        try {
            setLoading(true);

            if (productData === '1') {
                // Call API for Qualified
                const response = await axiosInstance.post("/convert_to_qualified", body, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });
                toast("Lead successfully converted to qualified");
            } else if (productData === '0') {
                // Call API for Disqualified
                const response = await axiosInstance.post("/convert_to_disqualified", body, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cleanToken}`,
                    },
                });
                toast("Lead successfully converted to Disqualified");
                // Navigate to SecondMain component (index 1)
                onStageSelect(1);
            } else {
                toast("Please select a status.");
            }
        } catch (error) {
            console.error("Error :", error);
            alert("Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [salesPersons, setSalesPersons] = useState([]);
    // console.log("salesPersons", salesPersons);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState(null);

    useEffect(() => {
        const fetchSalesPersons = async () => {
            try {
                const response = await axiosInstance.get("/Salesperson_List");
                const data = response.data;


                // const savedSalespersonId = localStorage.getItem('salesperson_id');

                if (savedSalespersonId) {
                    // console.log("Salesperson ID:", savedSalespersonId);

                    const selectedSalesperson = data.employee_list.find(
                        (employee) => employee.id.toString() === savedSalespersonId
                    );


                    if (selectedSalesperson) {
                        setSalesPersons([selectedSalesperson]);
                        setSelectedSalespersonId(selectedSalesperson.id);
                    }
                } else {
                    // console.log("No salesperson ID found in localStorage.");

                }
            } catch (error) {
                console.error("Error fetching salesperson data:", error);

            }
        };

        fetchSalesPersons();
    }, []);

    const handleUpdateOrderValue = async () => {
        try {

            const payload = {
                id: formData.id,
                lead_id: leadId,
                cust_id: customerId,
                order_value: orderValue,
            };

            const response = await axiosInstance.post(
                "/update_order_value",
                payload
            );

            toast("Order Value Updated successfully");
            showOpportunity();
        } catch (error) {
            console.error("Error updating order value:", error);
            toast("Opportunity not found, Fill Opportunity Details First");
        }
    };

    const handleUpdateKeyOpportunity = async () => {
        try {
            const payload = {
                id: formData.id,
                lead_id: leadId,
                cust_id: customerId,
                key_opportunity: 1,
            };

            const response = await axiosInstance.post(
                "/updateKeyOpportunity",
                payload
            );

            toast("Key Opportunity Updated successfully");
            // Refresh the data to show checkmark immediately
            showOpportunity();
        } catch (error) {
            toast("Please fill Opportunity Details First");
        }
    };
    // console.log('productData', productData);
    const placeholderStyle = `
    ::placeholder {
      font-size: 0.9rem;
      color: #9CA3AF;
    }

.rightcolumn {
 ///height: fit-content;
 height: 600px;
  width: 43rem;
// max-height: 100vh; 
overflow-y: auto;  /* Scroll only within this section */
scrollbar-width: thin;
transition: all 0.3s ease-in-out;
// position: absolute; /* Instead of fixed */
//  top: -10px;
left: 0;

}

 @media screen and (max-width: 1310px) {
  .rightcolumn {
    width: 47rem;
  }
}
  @media screen and (max-width: 1219px) {
  .rightcolumn {
    width: 49rem;
  }
}
  @media screen and (max-width: 1179px) {
  .rightcolumn {
    width: 50rem;
  }
}
 @media screen and (max-width: 1110px) {
  .rightcolumn {
    width: 56rem;
  }
}
   @media screen and (max-width: 1087px) {
  .rightcolumn {
    width: 60rem;
  }
}

/* For small screens, make it full-width */
@media (max-width: 640px) {
    .rightcolumn {
        // top: 0;
        margin-top:-20px;
        position: absolute; 
        width: 100%; 
        // max-height: 100%; 
    //       background-color: #f3f3f3;
        z-index: 9999;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    }
}   
    @media (min-width: 640px) {
    .closeBtn{
      display:none;
    }
    }
    
    .contactTable {
  width: 15rem;
}

@media screen and (max-width: 1351px) {
  .contactTable {
    width: 14rem;
  }
}
  @media screen and (max-width: 1299px) {
  .contactTable {
    width: 13rem;
  }
}


  `;

    // Update formData when opportunityData changes
    useEffect(() => {
        setFormData(prevData => ({
            ...prevData,
            ...opportunityData
        }));
    }, [opportunityData]);

    return (
        <>
            <style>{placeholderStyle}</style>
            <div
                className="d-flex rightcolumn"
            // style={{
            //     overflow: "hidden",
            // }}
            >

                {/* Right Column Panel */}
                <div
                    style={{
                        // width: `${panelWidth}px`,
                        maxWidth: "1200px",
                        minWidth: "200px",
                        margin: "0 auto",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        transition: "width 0.2s ease", // Smooth transition when resizing
                    }}
                >
                    <div
                        style={{
                            // maxWidth: "1200px",
                            // minWidth: "200px",
                            margin: "0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #ccc",
                            padding: "15px",
                        }}
                    >
                        <Button style={{ float: "right", cursor: "pointer" }} onClick={() => setIsSidebarOpen2(!isSidebarOpen2)} className="closeBtn"><IoMdCloseCircle size={24} /></Button>
                        <br />
                        <h5 className="h5 fw-bold mb-4 text-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Task Manager</h5>
                        <h3 className="h6 fw-bold mb-4 text-center">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {formData.keyOpportunity === 1 && (
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        style={{ color: 'green', fontSize: '1.5em' }}
                                    />
                                )}
                                <Button
                                    style={{ background: '#25B003', color: 'white', fontFamily: 'Nunito Sans, sans-serif' }}
                                    variant="warning"
                                    onClick={handleUpdateKeyOpportunity}
                                    disabled={formData.keyOpportunity === 1}
                                >
                                    Key Opportunity 👑
                                </Button>
                            </div>
                        </h3>
                        <div className="Inquiry" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                            <input
                                type="text"
                                id="managerName"
                                className="form-control wide-input"
                                placeholder="Inquiry Response manager Name"
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                value={salesPersons.length > 0 ? salesPersons[0]?.name : "Admin"}
                                onChange={(e) => setManagerName(e.target.value)}
                            />
                        </div>
                        <br />
                        <div className="order">
                            <h6 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Order Value</h6>
                            <div className="input-container" style={{ position: 'relative', }}>
                                <input
                                    type="text"
                                    className="form-control small-input"
                                    placeholder="Order Value"
                                    id="order_value"
                                    name="order_value"
                                    // value={formData.orderval}
                                    value={orderValue}
                                    onChange={handleOrderValueChange}

                                    style={{
                                        fontFamily: 'Nunito Sans, sans-serif',
                                        paddingRight: '30px',  // Add space for the icon
                                    }}
                                />

                                <FontAwesomeIcon
                                    onClick={handleUpdateOrderValue}
                                    icon={faSave}
                                    style={{
                                        color: '#0292E3', marginRight: '8px', position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                    }}
                                />
                            </div>
                        </div>
                        <br />

                        <div className="buying">
                            <h6 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Buying Plan</h6>
                            <input
                                type="text"
                                className="form-control small-input"
                                placeholder="Buying Plan"
                                id="buying_plan"
                                name="buying_plan"
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                value={formData.buying_plan}
                                readOnly
                            />
                        </div>
                        <br />
                        <h6 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Purchase Decision Maker</h6>
                        <div className="form-group d-flex flex-wrap gap-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Name"
                                name="name"
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                readOnly
                            />
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Mobile Number"
                                id="mobile_number"
                                name="mo_no"
                                value={formData.mo_no}
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                onChange={(e) => setFormData({ ...formData, mo_no: e.target.value })}
                                readOnly
                            />

                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                readOnly
                            />
                        </div>
                        <br />

                        <h6 style={{ fontFamily: 'Nunito Sans, sans-serif' }}>Extra chatbot notes</h6>

                        {/* <div className="buying">
                    <textarea
                        className="form-control small mb-2"
                        style={{ color: "#333", height: "200px", }}
                        value={chatbotmsg}
                        readOnly
                    />
                    
                </div> */}


                        {/* <div className="buying">
                    <textarea
                        className="form-control small mb-2"
                        style={{ color: "#333", height: "200px" }}
                        value={String(chatbotmsg).replace(/<br\s*\/?>/g, '\n')}
                        readOnly
                    />
                </div> */}

                        <div className="buying" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                            <textarea
                                className="form-control small mb-1"
                                style={{ height: "200px" }}
                                value={String(chatbotmsg)
                                    .replace(/<br\s*\/?>/g, '\n')
                                    .replace(/<a[^>]*>([^<]+)<\/a>/g, '$1')
                                }
                                readOnly
                            />
                        </div>


                        <br />

                        {/* second page ui  */}

                        <div className="form-group">
                            <div className="d-flex justify-content-between align-items-center gap-4">


                                <div className="buying w-full" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">
                                        Lead Acknowledge Status
                                    </label>
                                    <div className="relative">
                                        {/* <select
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={productData === 1 ? "1" : "0"}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Qualified</option>
                                            <option value="0">Disqualified</option>
                                        </select> */}
                                        <select
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={productData} // Bind this to the productData state
                                            onChange={(e) => handleStatusChange(e.target.value)} // Update state on value change
                                            style={{ fontFamily: 'Nunito Sans, sans-serif' }}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Qualified</option>
                                            <option value="0">Disqualified</option>
                                        </select>

                                    </div>
                                </div>
                            </div>


                            {selectedStageIndex != 0 && (
                                <div className="mt-2" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                                    <Button
                                        variant="subtle-primary"
                                        onClick={changeStatus}
                                        style={{ float: "center" }}
                                    >
                                        Change Status
                                    </Button>

                                </div>
                            )}
                        </div>

                        {/* Product Sourcing 4th */}
                        {selectedStageIndex == 2 && (
                            <div className="productdirectory p-0 rounded mt-4">
                                <div style={{
                                    overflowY: 'auto',
                                    overflowX: 'auto',
                                    maxHeight: '300px',
                                    width: "100%",
                                    maxWidth: '100%',
                                    scrollbarWidth: 'thin',
                                    borderRadius: "8px",
                                    padding: "10px",
                                    border: "1px solid #ccc",
                                }}
                                    className="contactTable"
                                >
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <h6>Sr No</h6>
                                                </th>
                                                <th>
                                                    <h6>Product Code</h6>
                                                </th>
                                                <th>
                                                    <h6>Product Name</h6>
                                                </th>
                                                <th>
                                                    <h6>No of Product Vendor</h6>
                                                </th>

                                            </tr>
                                        </thead>
                                        <tbody>

                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center">
                                                        <Spinner animation="border" /> {/* Loader */}
                                                    </td>
                                                </tr>
                                            ) : ShowProductData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4">No Data Available</td>
                                                </tr>
                                            ) : (
                                                ShowProductData.data.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.product_code || "N/A"}</td>
                                                        <td>{item.product_name || "N/A"}</td>
                                                        <td>{item.no_of_product_vendor || "N/A"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {(selectedStageIndex === 3 || selectedStageIndex === 4) && (
                            <div className="productdirectory p-0 rounded mt-4">
                                <div style={{
                                    overflowX: 'auto',
                                    overflowY: 'auto',
                                    maxHeight: '300px',
                                    maxWidth: '100vw',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#888rgb(20, 19, 19)',
                                }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <h6>Sr No</h6>
                                                </th>
                                                <th>
                                                    <h6>Product Code</h6>
                                                </th>
                                                <th>
                                                    <h6>Product Name</h6>
                                                </th>
                                                <th>
                                                    <h6>No of Product Vendor</h6>
                                                </th>
                                                <th>
                                                    <h6>Quoted Price</h6>
                                                </th>
                                                <th>
                                                    <h6>Latest Price Shared Date</h6>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center">
                                                        <Spinner animation="border" /> {/* Loader */}
                                                    </td>
                                                </tr>
                                            ) : ShowProductData2.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6">No Data Available1</td>
                                                </tr>
                                            ) : (
                                                ShowProductData2.data.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.product_code || "N/A"}</td>
                                                        <td>{item.product_name || "N/A"}</td>
                                                        <td>{item.no_of_product_vendor || "N/A"}</td>
                                                        <td>{item.quoted_price || "N/A"} {item.currency || ""}</td>
                                                        <td>{formatDate(item.price_shared_date || "N/A")}</td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        <br />

                        {/* Quotation Send */}
                        {selectedStageIndex == 4 && (
                            <div className="form-group d-flex justify-content-between gap-3">
                                <div className="d-flex flex-column" style={{ flex: "1" }}>
                                    <label className="form-label" htmlFor="piNumber">
                                        PI Number
                                    </label>
                                    <input
                                        type="text"
                                        id="piNumber"
                                        className="form-control small-input"
                                        placeholder="PI Number"
                                        onChange={handleDecisionMakerNameChange}
                                        value={piNumber}
                                        readOnly
                                    />
                                </div>
                                <div className="d-flex flex-column" style={{ flex: "1" }}>
                                    <label className="form-label" htmlFor="date">
                                        Date
                                    </label>
                                    <input
                                        type="text"
                                        id="date"
                                        className="form-control small-input"
                                        placeholder="Date"
                                        onChange={handleDateChange}
                                        value={piDate}
                                        readOnly
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                    {/* <br /> */}




                    <br />

                    {/* Victory */}
                    {/* <div className="form-group d-flex justify-content-between gap-3">
                    <div className="d-flex flex-column" style={{ flex: "1" }}>
                        <label className="form-label" htmlFor="name">
                            BT ID
                        </label>
                        <input
                            type="text"
                            className="form-control small-input"
                            placeholder="BT ID"
                        />
                    </div>
                    <div className="d-flex flex-column" style={{ flex: "1" }}>
                        <label className="form-label" htmlFor="name">
                            Additional Input
                        </label>
                        <input
                            type="text"
                            className="form-control small-input"
                        />
                    </div>
                </div> */}

                    {/* <button type="button" class="btn btn-success">
            Follow up
       </button>
       <br/>
       <br/> */}

                    {/* <h6>Request</h6>
<div className="bg-white border p-2 rounded" style={{ border: "1px solid #ddd" }}>
      <div className="mb-3 row-overflow">
        <h5>Rule</h5>
        <input
            type="text"
            className="form-control me-4"
            placeholder="initial follow up template"
            style={{ width: "150px" }}
        />
        <br/>
        <button className="btn btn-outline-secondary me-3">Select Template</button>
        <button className="btn btn-outline-secondary">Create msg</button>
    </div>


      <div className="mb-3">
  <h5>When Do you want to send follow up</h5>
  <div className="row g-2">
    <div className="col-12 col-md-auto">
     <div className="form-group d-flex justify-content-between align-items-center gap-2">
            <input
                type="text"
                className="form-control small-input"
                placeholder="Hour"
                onChange={(e) => setHour(e.target.value)}
            />
            <input
                type="text"
                className="form-control small-input"
                placeholder="Days"
                onChange={(e) => setdays(e.target.value)}
            />
            <input
                type="text"
                className="form-control small-input"
                placeholder="Date (dd/mm/yyyy)"
                onChange={(e) => setDate(e.target.value)}
            />
        </div>
    </div>
  </div>
</div>

      <div className="mb-3">
        <h5>Whom you want to send this msg</h5>
        <div className="form-group d-flex justify-content-between align-items-center gap-1">
        <button className="btn btn-outline-secondary">
          All opportunities
        </button>
        <button className="btn btn-outline-secondary me-3">only this opp</button>
        </div>
    </div>

    <div className="text-center">
        <button className="btn btn-primary px-5" onClick={save}>Send</button>
    </div>
</div> */}

                    <br />
                    {/* <div className="text-center">
                    <button className="btn btn-primary px-5" onClick={save}>
                        Send
                    </button>
                </div> */}

                    {/* Resizable Handle */}
                    <div
                        className="resize-handle"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            document.addEventListener("mousemove", handleResize);
                            document.addEventListener("mouseup", () => {
                                document.removeEventListener(
                                    "mousemove",
                                    handleResize
                                );
                            });
                        }}
                        style={{
                            width: "2px",
                            backgroundColor: "#ccc",
                            cursor: "ew-resize",
                            height: "100%",
                            position: "absolute",
                            top: "0",
                            right: "0",
                            zIndex: "1",
                        }}
                    />
                </div>
                <ToastContainer />
            </div>
        </>
    );
};

export default RightColumn;
