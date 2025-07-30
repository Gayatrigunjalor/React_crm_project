import React, { useState, useEffect } from "react";
import { FaEye, FaPen, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faEye, faAdd } from "@fortawesome/free-solid-svg-icons";
import { FaDownload } from "react-icons/fa";
import Pagination from "react-bootstrap/Pagination";
import { IoMdCloseCircle } from "react-icons/io";
import { Link } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';
import {
    DropdownButton,
    Form,
    Button,
    Col,
    Nav,
    Row,
    Tab,
    Table,
    Modal,
    Spinner,
    InputGroup
} from "react-bootstrap";
import debounce from "lodash.debounce";
import axiosInstance from "../../../axios";
import { useParams } from "react-router-dom";
const LeftColumn = ({ leadId, isSidebarOpen, setIsSidebarOpen }) => {
    const { customerId } = useParams();
    const [isEditable, setIsEditable] = useState(false);
    const [isEditContact, setIsContact] = useState(false);
    const [isEditConsignee, setIsConsignee] = useState(false);
    const [customerDetails, setCustomerDetails] = useState([]);
    const [error, setError] = useState("");
    const [attachmentFields, setAttachmentFields] = useState([{ id: 1 }]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showConsigneePopup, setShowConsigneePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPages, setCurrentPages] = useState(1);
    const sectionsPerPage = 15;
    const [selectedOption, setSelectedOption] = useState("");
    const [loading, setLoading] = useState(true);
    const [showfbModal, setShowFBModal] = useState(false);
    const [feedbackForms, setFeedbackForms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [complaintForms, setComplaintForms] = useState([]);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [sameAsContact, setSameAsContact] = useState(false);
    const [sameAsCustomer, setSameAsCustomer] = useState(false);

    const [feedback, setFeedback] = useState({
        satisfaction: '',
        overallExperience: '',
        recommendation: '',
        expectationsMet: '',
        serviceQuality: '',
        concernsAddressed: '',
        supportSatisfaction: '',
        teamFriendly: '',
        feltHeard: '',
        serviceSpeed: '',
        delays: '',
        worthPrice: '',
        compareToCompetitors: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    //const [updatedContact, setUpdatedContact] = useState(null);
    const [updatedContact, setUpdatedContact] = useState({
        id: "",
        contact_person_name: "",
        address: "",
        city: "",
        pincode: "",
        country: "",
        state: "",
        mobile_no: "",
        email: "",
        designation: "",
    });

    const [updatedConsignee, setUpdatedConsignee] = useState({
        id: "",
        contact_person_name: "",
        consignee_address: "",
        consignee_city: "",
        consignee_pincode: "",
        consignee_country: "",
        consignee_state: "",
        consignee_mobile_number: "",
        consignee_email: "",
        consignees_designation: "",
    });

    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const addAttachmentField = () => {
        setAttachmentFields((prev) => [...prev, { id: prev.length + 1 }]);
    };
    const [selectedRowData, setSelectedRowData] = useState(null);

    const handleEditConsigneeClick = (row, event) => {
        event.preventDefault();
        setSelectedRowData(row);
        setIsEditPopupVisible(true);
    };

    const handleClosePopup = () => {
        setIsEditPopupVisible(false);
        setSelectedRowData(null);
        setShowPopup(false);
        setShowConsigneePopup(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveChanges = () => {
        const updatedTableData = tableData.map((row) =>
            row.id === selectedRowData.id ? selectedRowData : row
        );
        setTableData(updatedTableData);
        setIsEditPopupVisible(false);
    };
    const [formData, setFormData] = useState({
        lead_id: 1,
        communication_via: "",
        country_status: "",
        customer_status: "",
        designation: "",
        customer_id: "",
        sender_address: "",
        sender_city: "",
        sender_company: "",
        sender_country_iso: "",
        sender_email: "",
        sender_mobile: "",
        sender_name: "",
        sender_pincode: "",
        sender_state: "",
        specialty_industry_sector: "",
        website: "",
        country: "",
        city: "",
        pincode: "",
        mobile_no: "",
        state: "",
        email: "",
    });


    const [form_Data, setForm_Data] = useState({
        id: "",
        contact_person_name: "",
        address: "",
        city: "",
        pincode: "",
        country: "",
        state: "",
        mobile_no: "",
        email: "",
        designation: "",
    });

    const [consignee_form_Data, setconsigneeForm_Data] = useState({
        id: "",
        consignee: "",
        consignee_address: "",
        consignee_city: "",
        contact_person_name: "",
        consignee_country: "",
        consignees_designation: "",
        consignee_email: "",
        consignee_mobile_number: "",
        consignee_pincode: "",
        consignee_state: "",
    });
    const [isEdit, setIsEdit] = useState(false);
    const [sections, setSections] = useState([form_Data]);
    const [ContactFetch, setContactFetch] = useState([form_Data]);
    const [ConsigneeFetch, setConsigneeFetch] = useState([form_Data]);
    console.log('ConsigneeFetch', ConsigneeFetch);
    const [consigneeSection, setConsigneeSection] = useState([
        consignee_form_Data,
    ]);

    const itemsPerPage = 10;
    // for contact
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // for consignee
    const indexOfLastConsignee = currentPages * itemsPerPage;
    const indexOfFirstConsignee = indexOfLastItem - itemsPerPage;

    const currentSections = sections.slice(indexOfFirstItem, indexOfLastItem);

    const currentConsigneeSection = consigneeSection.slice(
        indexOfFirstConsignee,
        indexOfLastConsignee
    );
    const totalPagess = Math.ceil(consigneeSection.length / itemsPerPage);

    const totalPages = Math.ceil(sections.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePages = (pageNum) => {
        setCurrentPages(pageNum);
    };
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
        setUploadedFiles([]);
    };

    useEffect(() => {
        if (!leadId) {
            setError("Lead ID is missing.");
            return;
        }

        const fetchLeadDetails = async () => {
            try {
                const response = await axiosInstance.get("/showlead", {
                    params: { id: leadId },
                });
                localStorage.setItem("cst_id", response.data.lead.customer_id);

                setFormData({
                    customer_id: response.data.lead.customer_id,
                    communication_via:
                        response.data.lead.customer_lead.communication_via,
                    company_name:
                        response.data.lead.customer_lead.sender_company,
                    consignee:
                        response.data.lead.customer_lead.contact_person_name,
                    consignee_address:
                        response.data.lead.customer_lead.consignee_address,
                    consignee_city:
                        response.data.lead.customer_lead.consignee_city,
                    contact_person_name:
                        response.data.lead.customer_lead.contact_person_name,
                    consignee_country:
                        response.data.lead.customer_lead.consignee_country,
                    consignee_designation:
                        response.data.lead.customer_lead.consignee_designation,
                    consignee_email:
                        response.data.lead.customer_lead.consignee_email,
                    consignee_mobile_number:
                        response.data.lead.customer_lead
                            .consignee_mobile_number,
                    consignee_pincode:
                        response.data.lead.customer_lead.consignee_pincode,
                    consignee_state:
                        response.data.lead.customer_lead.consignee_state,
                    address:
                        response.data.lead.customer_lead.address,
                    city:
                        response.data.lead.customer_lead.city,
                    country:
                        response.data.lead.customer_lead.country,
                    designation:
                        response.data.lead.customer_lead
                            .designation,
                    email:
                        response.data.lead.customer_lead.email,
                    mobile_no:
                        response.data.lead.customer_lead
                            .mobile_no,
                    pincode:
                        response.data.lead.customer_lead.pincode,
                    state:
                        response.data.lead.customer_lead.state,
                    country_status:
                        response.data.lead.customer_lead.country_status,
                    created_at: response.data.lead.customer_lead.created_at,
                    customer_status:
                        response.data.lead.customer_lead.customer_status,
                    designation: response.data.lead.customer_lead.designation,
                    id: response.data.lead.customer_lead.id,
                    sender_address:
                        response.data.lead.sender_address,
                    sender_city: response.data.lead.sender_city,
                    sender_company:
                        response.data.lead.sender_company,
                    sender_country_iso:
                        // response.data.lead.customer_lead.sender_country_iso,
                        response.data.lead.sender_country_iso,
                    sender_email: response.data.lead.sender_email,
                    sender_mobile:
                        response.data.lead.sender_mobile,
                    sender_name: response.data.lead.sender_name,
                    sender_pincode:
                        response.data.lead.sender_pincode,
                    sender_state: response.data.lead.sender_state,
                    specialty_industry_sector:
                        response.data.lead.customer_lead
                            .specialty_industry_sector,
                    updated_at: response.data.lead.customer_lead.updated_at,
                    website: response.data.lead.customer_lead.website,
                });

                setCustomerDetails(response.data);
            } catch (err) {
                setError("Error fetching leads: " + err.message);
            }

        };

        fetchLeadDetails();
    }, [leadId]);

    //     const placeholderStyle = `
    //     ::placeholder {
    //       font-size: 0.9rem;
    //       color: #9CA3AF;
    //     }

    //     /* Mobile responsiveness */
    //     @media (max-width: 767px) {
    //       .form-control {
    //         font-size: 0.9rem;
    //       }

    //       .col-3 {
    //         padding-left: 1rem;
    //         padding-right: 1rem;
    //       }

    //       .customer-details-section {
    //         flex-direction: column;
    //         align-items: flex-start;
    //       }

    //       .form-control {
    //         font-size: 0.85rem;
    //       }
    //     }

    //     /* Tablet/Laptop responsiveness */
    //     @media (min-width: 768px) and (max-width: 1024px) {
    //       .col-3 {
    //         padding-left: 2rem;
    //         padding-right: 2rem;
    //       }

    //       .customer-details-section {
    //         flex-direction: row;
    //         justify-content: space-between;
    //       }

    //       .form-control {
    //         font-size: 1rem;
    //       }
    //     }

    //     .container {
    //     display: flex;
    //     justify-content: space-between;
    //     align-items: flex-start;
    //     padding: 20px;
    //   }

    //   .status, .name {
    //     flex: 1;
    //     padding: 10px;
    //     text-align: center;
    //      width: 150%;
    //   }

    //   .status {
    //     //background-color: rgba(222, 250, 99, 1);
    //     border-radius: 10%;
    //     margin-top: 10px;
    //     text-align: left;

    //   }

    //   .name {
    //  border-radius: 10%;
    //  margin-top: 10px;
    //  text-align: left;
    //   }

    // .dropdown {
    //   //position: relative;
    //   width: 100%;
    //   padding: 5px;
    //   margin-top: 1px;
    //   font-size: 16px;
    //  border-radius: 10px;
    //  }
    //   .container {
    //   display: flex;
    //   flex-direction: column;
    //   gap: 0;
    //   align-items: flex-start;
    //   margin-left: 0;
    // }
    // .uploaded-files-container {
    //   margin-top: 1rem;
    //   padding: 0.5rem;
    //   border: 1px solid #ccc;
    //   border-radius: 8px;
    //   background-color: #f9f9f9;
    // }

    // .uploaded-files-list {
    //   list-style-type: none;
    //   padding: 0;
    //   width:100%;
    // }

    // .uploaded-file-item {
    //   font-size: 14px;
    //   margin: 0.5rem 0;
    // }

    // .popup-content h4 {
    //     text-align: center;
    //     margin-bottom: 20px;
    //     font-size: 1.5em;
    //     color: #333;
    //   }

    //   .popup-content input {
    //     width: 100%;
    //     padding: 7px;
    //     margin-bottom: 15px;
    //     border: 1px solid #ccc;
    //     border-radius: 10px;
    //     font-size: 1rem;
    //     box-sizing: border-box;
    //   }

    //   .popup-content button {
    //     width: 30%;
    //     padding: 10px;
    //   }
    //   .form-grid {
    //     display: grid;
    //     grid-template-columns: 1fr 1fr;
    //     gap: 15px;
    //   }

    //   @media (max-width: 768px) {
    //     .form-grid {
    //       grid-template-columns: 1fr;
    //     }
    //   }
    //   `;

    const placeholderStyle = `
     *{
            font-family: Nunito Sans, sans-serif;
            // color:red;
           }

::placeholder {
  font-size: 0.9rem;
  color: #9CA3AF;
}
  .custom-header .accordion-button {
    font-size: 1.1rem !important;
    font-weight: 600 !important;
}

.leftcolumn {
  width: 27rem;
//    height: fit-content;
 height: 600px;
// max-height: 100vh; 
overflow-y: auto;  /* Scroll only within this section */
scrollbar-width: thin;

transition: all 0.3s ease-in-out;
// position: absolute; /* Instead of fixed */
//  top: -10px;
left: 0;

}

.contactTable {
//   width: 16rem;
width:100%;
}

@media screen and (max-width: 1307px) {
  .contactTable {
    // width: 14rem;
    width:100%;
  }
}
@media screen and (max-width: 1146px) {
  .contactTable {
    // width: 12rem;
    width:100%;
  }
}
  @media screen and (max-width: 1058px) {
  .contactTable {
    // width: 10rem;
    width:100%;
  }
}
@media (max-width: 1681px) {
  .leftcolumn {
    width: 41rem;
  }
}
@media (max-width: 1354px) {
  .leftcolumn {
    width: 43rem;
  }
}
  @media (max-width: 1229px) {
  .leftcolumn {
    width: 47rem;
  }
}
  @media (max-width: 1134px) {
  .leftcolumn {
    width: 72rem;
  }
}


/* For small screens, make it full-width */
@media (max-width: 640px) {
.leftcolumn {
    position: absolute; /* Instead of fixed */
    width: 100%; /* Full screen width */
    // max-height: 100%; /* Ensure it takes full height */
  background-color: #f3f3f3;
    z-index: 9999;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}
}
  @media (min-width: 640px) {
.closeBtn{
  display:none;
}
}
`;
    const fieldContainerStyle = {
        marginBottom: "0.18rem",
    };

    const handleClick = (index) => {
        setUpdatedContact({
            id: index.id,
            contact_person_name: index.contact_person_name,
            address: index.address,
            city: index.city,
            pincode: index.pincode,
            country: index.country,
            state: index.state,
            mobile_no: index.mobile_no,
            email: index.email,
            designation: index.designation,
        });
        setShowPopup(true);
    };

    const labelStyle = {
        fontWeight: "500",
        fontSize: "14px",
        marginBottom: "4px",
        display: "block",
        textAlign: "left",
    };
    
    //HANDLE DOWNLOAD
    const handleDownload = (file) => {
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleConsigneePopup = debounce((index) => {
        console.log(index);
        setUpdatedConsignee({
            id: index.id,
            contact_person_name: index.contact_person_name,
            consignee_address: index.consignee_address,
            consignee_city: index.consignee_city,
            consignee_pincode: index.consignee_pincode,
            consignee_country: index.consignee_country,
            consignee_state: index.consignee_state,
            consignee_mobile_number: index.consignee_mobile_number,
            consignee_email: index.consignee_email,
            consignees_designation: index.consignee_designation,
        });
        setShowConsigneePopup(true);
    }, 1000);

    const handleEditClick = () => {
        setIsEditable(!isEditable);
    };

    const handleContactPerson = () => {
        setIsContact(!isEditContact);
    };
    const handleConsignee = () => {
        setIsConsignee(!isEditConsignee);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleInput_Change = (e, index) => {
        const { name, value } = e.target;
        const updatedSections = [...sections];
        updatedSections[index][name] = value;
        setSections(updatedSections);
    };

    const handle_Input_Change = (e) => {
        const { name, value } = e.target;
        setconsigneeForm_Data({
            ...consignee_form_Data,
            [name]: value,
        });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (uploadedFiles.length + files.length > 3) {
            toast("You can only upload up to 3 files.");
        } else {
            setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.sender_email)) {

            toast.error("Please enter a valid email address.");
            return;
        }
        console.log("formData before submission:", formData);
        try {
            const leadInfo = {
                lead_id: leadId,
                communication_via: formData.communication_via,
                country_status: formData.country_status,
                customer_status: formData.customer_status,
                designation: formData.designation,
                customer_id: formData.customer_id,
                sender_address: formData.sender_address,
                sender_city: formData.sender_city,
                sender_company: formData.company_name,
                sender_country_iso: formData.sender_country_iso,
                sender_email: formData.sender_email,
                sender_mobile: formData.sender_mobile,
                sender_name: formData.sender_name,
                sender_pincode: formData.sender_pincode,
                sender_state: formData.sender_state,
                specialty_industry_sector: formData.specialty_industry_sector,
                website: formData.website,
                country: formData.country,
            };

            const response = await axiosInstance.post(
                "/update-lead-customer",
                leadInfo,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            toast("Lead Info Updated");

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const result = await response.json();
        } catch (error) { }
    };

    const lead_id = leadId;

    const addNewSection = () => {
        setSections([...sections, { ...formData }]);
    };

    const addConsigneeSection = () => {
        setConsigneeSection([...consigneeSection, { ...consignee_form_Data }]);
    };

    const fetchCustomerContacts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                "/showCustomerContactsDirectory",
                {
                    params: {
                        lead_id: leadId,
                        // lead_cust_id: formData.customer_id,
                        lead_cust_id: customerId,
                    },
                }
            );

            const sections = response.data.contacts || [];
            const contacts = sections.map((section) => ({
                id: section.id,
                contact_person_name: section.contact_person_name,
                city: section.city,
                country: section.country,
                mobile_no: section.mobile_no,
                address: section.address,
                pincode: section.pincode,
                state: section.state,
                email: section.email,
                designation: section.designation,
            }));

            setContactFetch(contacts);
            setLoading(false);
            return contacts;
        } catch (error) {
            throw new Error(
                "Error fetching customer contacts: " + error.message
            );
        }
    };

    const fetchConsigneesData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                "/showCustomerConsigneeDirectory",
                {
                    params: {
                        lead_id: leadId,
                        // cust_id: formData.customer_id,
                        cust_id: customerId,
                    },
                }
            );

            const consigneeSection = response.data.consignee || [];
            const consignees = consigneeSection.map((section) => ({
                id: section.id,
                consignee_address: section.add,
                consignee_city: section.city,
                contact_person_name: section.contact_person_name,
                consignee_country: section.country,
                consignee_designation: section.designation,
                consignee_email: section.email,
                consignee_mobile_number: section.mo_no,
                consignee_pincode: section.pincode,
                consignee_state: section.state,
            }));

            // toast("Customer Consignees Fetched Successfully")
            setConsigneeFetch(consignees);
            setLoading(false);
        } catch (error) {
            setError("Error fetching consignees data: " + error.message);
        }
    };


    useEffect(() => {
        const fetchFeedbackForms = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(
                    "/feedback_show",
                    {
                        params: {
                            lead_id: leadId,
                            customer_id: formData.customer_id,
                        },
                    }
                );


                setLoading(false);
                setFeedbackForms(response.data.data);

            } catch (error) {
                throw new Error(
                    "Error fetching customer feedbacks: " + error.message
                );
            }
        };
        if (leadId && formData.customer_id) {
            fetchFeedbackForms();
        }
    }, [leadId, formData.customer_id]);

    // Handle the modal open
    const handleShowModal = (feedback) => {
        setSelectedFeedback(feedback);
        setShowModal(true);
    };

    // Handle the modal close
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFeedback(null);
    };

    useEffect(() => {
        const fetchCompaintForms = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.post(
                    "/complaint_show",
                    {
                        lead_id: leadId,
                        customer_id: formData.customer_id
                    }
                );


                setLoading(false);
                setComplaintForms(response.data.data);

            } catch (error) {
                throw new Error(
                    "Error fetching customer complaints: " + error.message
                );
            }
        };
        if (leadId && formData.customer_id) {
            fetchCompaintForms();
        }
    }, [leadId, formData.customer_id]);


    // Handle the modal open
    const handleShowComplaintModal = (complaint) => {
        console.log(complaint);
        setSelectedComplaint(complaint);
        setShowComplaintModal(true);
    };

    // Handle the modal close
    const handleCloseComplaintModal = () => {
        setShowComplaintModal(false);
        setSelectedComplaint(null);
    };
    const handleSave = async () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Validate other required fields
        if (!formData.contact_person_name || !formData.address || !formData.city || !formData.pincode || !formData.country || !formData.state || !formData.mobile_no) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const contact = {
            contact_person_name: formData.contact_person_name,
            city: formData.city,
            country: formData.country,
            mobile_no: formData.mobile_no,
            address: formData.address,
            pincode: formData.pincode,
            state: formData.state,
            email: formData.email,
            designation: formData.designation,
        };

        const requestData = {
            lead_id: leadId,
            lead_cust_id: customerId,
            contacts: [contact],
        };

        try {
            const response = await axiosInstance.post(
                "/storeCustomerContacts",
                requestData
            );

            if (response) {
                toast.success("Customer Details Added Successfully");
                setSections((prevSections) => [...prevSections, formData]);
                // Don't clear the form data, just reset specific fields
                // setFormData(prevData => ({
                //     ...prevData,
                //     contact_person_name: "",
                //     address: "",
                //     city: "",
                //     pincode: "",
                //     country: "",
                //     state: "",
                //     mobile_no: "",
                //     email: "",
                //     designation: "",
                // }));
                fetchCustomerContacts();
            }
            setIsEdit(false);
        } catch (error) {
            toast.error("Error saving customer details");
        }
    };

    const handleConsigneeSave = async () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(consignee_form_Data.consignee_email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Validate other required fields
        if (!consignee_form_Data.contact_person_name || !consignee_form_Data.consignee_address || !consignee_form_Data.consignee_city || !consignee_form_Data.consignee_pincode || !consignee_form_Data.consignee_country || !consignee_form_Data.consignee_state || !consignee_form_Data.consignee_mobile_number) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const consignees = {
            add: consignee_form_Data.consignee_address,
            city: consignee_form_Data.consignee_city,
            contact_person_name: consignee_form_Data.contact_person_name,
            country: consignee_form_Data.consignee_country,
            designation: consignee_form_Data.consignees_designation,
            email: consignee_form_Data.consignee_email,
            mo_no: consignee_form_Data.consignee_mobile_number,
            pincode: consignee_form_Data.consignee_pincode,
            state: consignee_form_Data.consignee_state,
        };

        const requestData = {
            lead_id,
            cust_id: customerId,
            consignees: [consignees],
        };

        try {
            const response = await axiosInstance.post(
                "/storeCustomerConsignees",
                requestData
            );

            if (response) {
                toast.success("Customer Consignees Added Successfully");
                fetchConsigneesData();
                setConsigneeSection((prevSections) => [
                    ...prevSections,
                    consignee_form_Data,
                ]);
                // Don't clear the form data, just reset specific fields
                // setconsigneeForm_Data(prevData => ({
                //     ...prevData,
                //     contact_person_name: "",
                //     consignee_address: "",
                //     consignee_city: "",
                //     consignee_pincode: "",
                //     consignee_country: "",
                //     consignee_state: "",
                //     consignee_mobile_number: "",
                //     consignee_email: "",
                //     consignees_designation: "",
                // }));
            }
            setIsEdit(false);
        } catch (error) {
            toast.error("Error saving consignee details");
        }
    };

    const handleDropdownChange = (e, fieldName) => {
        const { value } = e.target;
        setFormData({ ...formData, [fieldName]: value });
    };

    const removeSection = async (index) => {
        try {
            const requestBody = {
                lead_id: leadId,
                lead_cust_id: formData.customer_id,
                id: index,
            };
            setLoading(true);
            const response = await axiosInstance.post(
                "/deleteCustomerContacts_directory_id",

                requestBody
            );
            if (response) {
                toast.success(response.data.message || "Delete successful");
                const updatedSections = sections.filter((_, i) => i != index);
                setConsigneeSection(updatedSections);
                fetchCustomerContacts();
            } else {
                toast.error("Failed to delete consignee");
            }
        } catch (e) {
            toast.error("Error deleting Contact");
        } finally {
            setLoading(false);
        }
    };

    const removeConsigneeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i != index);
        setConsigneeSection(updatedSections);
    };

    useEffect(() => {
        const fetchCustomerContacts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(
                    "/showCustomerContactsDirectory",
                    {
                        params: {
                            lead_id: leadId,
                            lead_cust_id: formData.customer_id,
                        },
                    }
                );

                const sections = response.data.contacts || [];
                const contacts = sections.map((section) => ({
                    id: section.id,
                    contact_person_name: section.contact_person_name,
                    city: section.city,
                    country: section.country,
                    mobile_no: section.mobile_no,
                    address: section.address,
                    pincode: section.pincode,
                    state: section.state,
                    email: section.email,
                    designation: section.designation,
                }));

                // toast("Customer Details Fetched Successfully")

                setContactFetch(contacts);
                setLoading(false);
                return contacts;
            } catch (error) {
                throw new Error(
                    "Error fetching customer contacts: " + error.message
                );
            }
        };
        if (leadId && formData.customer_id) {
            fetchCustomerContacts();
        }
    }, [leadId, formData.customer_id]);

    useEffect(() => {
        const fetchConsigneesData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(
                    "/showCustomerConsigneeDirectory",
                    {
                        params: {
                            lead_id: leadId,
                            cust_id: formData.customer_id,
                        },
                    }
                );

                const consigneeSection = response.data.consignee || [];
                const consignees = consigneeSection.map((section) => ({
                    id: section.id,
                    consignee_address: section.add,
                    consignee_city: section.city,
                    contact_person_name: section.contact_person_name,
                    consignee_country: section.country,
                    consignee_designation: section.designation,
                    consignee_email: section.email,
                    consignee_mobile_number: section.mo_no,
                    consignee_pincode: section.pincode,
                    consignee_state: section.state,
                }));

                // toast("Customer Consignees Fetched Successfully")
                setConsigneeFetch(consignees);
                setLoading(false);
            } catch (error) {
                setError("Error fetching consignees data: " + error.message);
            }
        };

        if (leadId && formData.customer_id) {
            fetchConsigneesData();
        }
    }, [leadId, formData.customer_id]);

    const updateCustomerConsignees = async (updatedConsignees) => {
        console.log('updatedConsignees', updatedConsignees);
        try {
            if (!updatedConsignees.id) {
                setError("Consignee ID is required.");
                return;
            }
            const response = await axiosInstance.post(
                "/updateCustomerConsignees_directory_id",
                {
                    lead_id: leadId,
                    cust_id: formData.customer_id,
                    id: updatedConsignees.id,
                    contact_person_name: updatedConsignees.contact_person_name,
                    add: updatedConsignees.consignee_address,
                    city: updatedConsignees.consignee_city,
                    pincode: updatedConsignees.consignee_pincode,
                    country: updatedConsignees.consignee_country,
                    state: updatedConsignees.consignee_state,
                    mo_no: updatedConsignees.consignee_mobile_number,
                    email: updatedConsignees.consignee_email,
                    designation: updatedConsignees.consignees_designation,
                    consignees: {
                        ...updatedConsignees,
                        contact_person_name:
                            updatedConsignees.contact_person_name, // Ensure this field is set
                    },
                }
            );

            if (response) {
                toast("Customer consignees updated successfully.");
                fetchConsigneesData();
            }
            setShowConsigneePopup(false);
        } catch (error) { }
    };

    const handleSaveConsignees = () => {
        const updatedConsignee = consigneeSection;
        updateCustomerConsignees(updatedConsignee);
    };

    const updateCustomerContacts = async () => {
        try {
            const response = await axiosInstance.post(
                "/updateCustomerContacts_directory_id",
                {
                    lead_id: leadId,
                    lead_cust_id: formData.customer_id,
                    id: updatedContact.id,
                    ...updatedContact,
                }
            );
            if (response) {
                toast("Customer contacts updated successfully.");
                fetchCustomerContacts();
                setShowModal(false);
                setShowPopup(false);
            }
        } catch (error) {
            setError("Error updating customer contacts: " + error);
        }
    };

    const handleUpdateContact = () => {
        const updatedContact = sections;
        updateCustomerContacts(updatedContact);
    };

    const handleRemoveConsignee = async (index) => {
        //const updatedConsignees = [...consigneeSection];
        // alert("consignee Delete");
        // Remove the consignee at the given index (optimistic update)
        const requestBody = {
            lead_id: leadId,
            cust_id: formData.customer_id,
            id: index,
        };

        try {
            setLoading(true);

            const response = await axiosInstance.post(
                "/deleteCustomerConsignees_directory_id",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            fetchConsigneesData();
            if (response && response.data && response.data.success) {
                toast(response.data.message || "Delete successful", "success");
                updatedConsignees.splice(index, 1);
                setConsigneeSection(updatedConsignees);
                fetchConsigneesData();
            } else {
                // Revert if deletion failed (restore the previous state)
                setConsigneeSection(consigneeSection);
                toast(response.data.message || "Failed to delete consignee");
            }
        } catch (error) {
            // In case of error, revert the optimistic update
            setConsigneeSection(consigneeSection);
            toast.error("Error deleting consignee");
        } finally {
            setLoading(false);
        }
    };


    const handleFBModalShow = () => {
        setShowFBModal(true);
    };


    const handleSameAsContactToggle = (e) => {
        const checked = e.target.checked;
        setSameAsContact(checked);

        if (checked) {
            // Copy data from contact person form while preserving existing consignee data
            setconsigneeForm_Data(prevData => ({
                ...prevData,
                contact_person_name: formData.contact_person_name || prevData.contact_person_name,
                consignee_address: formData.address || prevData.consignee_address,
                consignee_city: formData.city || prevData.consignee_city,
                consignee_pincode: formData.pincode || prevData.consignee_pincode,
                consignee_country: formData.country || prevData.consignee_country,
                consignee_state: formData.state || prevData.consignee_state,
                consignee_mobile_number: formData.mobile_no || prevData.consignee_mobile_number,
                consignee_email: formData.email || prevData.consignee_email,
                consignees_designation: formData.designation || prevData.consignees_designation
            }));
        } else {
            // Reset only consignee fields when unchecked
            setconsigneeForm_Data(prevData => ({
                ...prevData,
                contact_person_name: '',
                consignee_address: '',
                consignee_city: '',
                consignee_pincode: '',
                consignee_country: '',
                consignee_state: '',
                consignee_mobile_number: '',
                consignee_email: '',
                consignees_designation: ''
            }));
        }
    };

    const handleSameAsCustomerToggle = (e) => {
        const checked = e.target.checked;
        setSameAsCustomer(checked);

        if (checked) {
            // Copy data from customer details while preserving existing form data
            setFormData(prevData => ({
                ...prevData,
                contact_person_name: prevData.sender_name || prevData.contact_person_name,
                address: prevData.sender_address || prevData.address,
                city: prevData.sender_city || prevData.city,
                pincode: prevData.sender_pincode || prevData.pincode,
                country: prevData.sender_country_iso || prevData.country,
                state: prevData.sender_state || prevData.state,
                mobile_no: prevData.sender_mobile || prevData.mobile_no,
                email: prevData.sender_email || prevData.email,
                designation: prevData.designation || prevData.designation
            }));
        } else {
            // Reset only contact person fields when unchecked, preserve customer fields
            setFormData(prevData => {
                const customerDesignation = prevData.sender_designation || prevData.designation;
                return {
                    ...prevData,
                    contact_person_name: '',
                    address: '',
                    city: '',
                    pincode: '',
                    country: '',
                    state: '',
                    mobile_no: '',
                    email: '',
                    designation: customerDesignation  // Preserve customer designation
                };
            });
        }
    };


    return (
        <>
            <style>{placeholderStyle}</style>
            <div
                className="d-flex leftcolumn"
                style={{

                    // overflow: "hidden",
                    // width: "65vh",
                }}
            >
                {/* <div
                    style={{
                        maxWidth: "1200px",
                        minWidth: "200px",
                        margin: "0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #ccc",
                        padding: "20px",
                    }}
                > */}


                <div
                    style={{
                        // maxWidth: "1200px",
                        // minWidth: "200px",
                        height: "fit-content",
                        width: "100%",
                        margin: "0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #ccc",
                        padding: "24px",
                    }}
                >
                    {/* style={{ marginBottom: "20px" }} */}
                    <div >
                        <button style={{ float: "right", cursor: "pointer", border: "none", }} onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="closeBtn"><IoMdCloseCircle size={24} />
                        </button>
                    </div>

                    {/* <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                marginBottom: "0.6rem",
                                marginRight: "0.5rem",
                            }}
                        >
                            Customer Details
                        </h3>
                        <FontAwesomeIcon
                            icon={faEye}
                            style={{
                                cursor: "pointer",
                                fontSize: "1rem",
                                marginLeft: "0.5rem",
                            }}
                            className="ms-2"
                            onClick={handleEditClick}
                        />
                        <FontAwesomeIcon
                            icon={faPencil}
                            className="ms-2"
                            style={{
                                cursor: "pointer",
                                fontSize: "1rem",
                                marginLeft: "0.5rem",
                            }}
                            onClick={handleEditClick}
                        />
                    </div> */}


                    <div>
                        <form className="d-grid gap-0">

                            <Accordion defaultActiveKey="1">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header className="custom-header">
                                        Customer Details
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <div className="row g-2">
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end", // Aligns items to the right
                                                    alignItems: "center",
                                                    gap: "0.5rem", // Adds space between icons
                                                    width: "100%",
                                                }}
                                            >
                                                {/* <FontAwesomeIcon
                                                    icon={faEye}
                                                    style={{

                                                        cursor: "pointer",
                                                        fontSize: "0.8rem", // Reduce the icon size
                                                        marginLeft: "0.5rem",
                                                    }}
                                                    className="ms-2"
                                                    size="10"
                                                    onClick={handleEditClick}
                                                /> */}
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                    className="ms-2"
                                                    style={{
                                                        cursor: "pointer",
                                                        fontSize: "0.8rem", // Reduce the icon size
                                                        marginLeft: "0.5rem",
                                                    }}
                                                    onClick={handleEditClick}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ paddingBottom: "10px" }}>
                                                    {/* <h6>Customer Status </h6> */}
                                                    <label style={{ marginBottom: "0.3rem" }}>Customer Status</label>
                                                    <select
                                                        className="form-control"
                                                        aria-label="Customer Status"
                                                        name="customer_status"
                                                        value={formData.customer_status}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    >
                                                        <option value="">
                                                            Select Customer Status
                                                        </option>
                                                        <option value="VIP">
                                                            VIP Customer
                                                        </option>
                                                        <option value="blacklist">
                                                            Blacklisted Customer
                                                        </option>
                                                        <option value="genuine">
                                                            Genuine Customer
                                                        </option>
                                                    </select>
                                                </div>

                                                <div >
                                                    {/* <h6>Country Status</h6> */}
                                                    <label style={{ marginBottom: "0.3rem" }}>Country Status</label>
                                                    <select
                                                        className="form-control"
                                                        aria-label="Country Status"
                                                        name="country_status"
                                                        value={formData.country_status}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    >
                                                        <option value="">
                                                            Select Country Status
                                                        </option>
                                                        <option value="1">
                                                            1st Preference
                                                        </option>
                                                        <option value="2">
                                                            2nd Preference
                                                        </option>
                                                        <option value="3">
                                                            3rd Preference
                                                        </option>
                                                        <option value="4">
                                                            4th Preference
                                                        </option>
                                                        <option value="preference service not available">
                                                            Preference Service Not Available
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>


                                            <div className="row g-1">
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Customer Id
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="customerId"
                                                        placeholder="Customer ID"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                        }}
                                                        value={formData.customer_id}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    />
                                                </div>
                                                <div
                                                //    col-md-6
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Customer Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="sender_name"
                                                        placeholder="Customer Name"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.9rem",
                                                        }}
                                                        value={formData.sender_name}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                        readOnly
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Designation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="designation"
                                                        placeholder="Designation"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.designation}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Company Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="company_name"
                                                        placeholder="Company Name"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.company_name}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                       
                                                    />
                                                </div>

                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Sender Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="sender_address"
                                                        placeholder="Address"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.sender_address}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                        
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Sender Pincode
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="sender_pincode"
                                                        placeholder="Post/Zip Code"
                                                        className="form-control fs-9"
                                                        maxLength="12"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.sender_pincode}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                       
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Sender Country Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="sender_country_iso"
                                                        placeholder="Country"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.sender_country_iso}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                       
                                                    />
                                                </div>
                                                {/* <div
                                    className="col-md-6"
                                    style={{ marginBottom: "1rem" }}
                                >
                                    <label className="form-label">
                                        Sender Country Code
                                    </label>
                                    <input
                                        type="text"
                                        name="sender_pincode"
                                        placeholder="Country Code"
                                        className="form-control fs-9"
                                        style={{
                                            padding: "0.4rem",
                                            fontSize: "0.300rem",
                                        }}
                                        value={formData.sender_country_iso}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </div> */}
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>Email</label>
                                                    <input
                                                        type="text"
                                                        name="sender_email"
                                                        placeholder="Sender Email"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.sender_email}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                        
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Industry Sector
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="specialty_industry_sector"
                                                        placeholder="Specialty Industry Sector"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            formData.specialty_industry_sector
                                                        }
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    />
                                                </div>
                                                <div
                                                // className="mb-2"
                                                // style={{ marginBottom: "1rem" }}
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Website
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="website"
                                                        placeholder="Website"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.website}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditable}
                                                    />
                                                </div>


                                                {/* Dropdown for selection */}
                                                <div>
                                                    <label
                                                        // htmlFor="file-type-dropdown"
                                                        // className="form-label"
                                                        style={{ marginBottom: "0.3rem" }}
                                                    >
                                                        Select Document Type:
                                                    </label>
                                                    <select
                                                        id="file-type-dropdown"
                                                        className="form-select"
                                                        value={selectedOption}
                                                        onChange={(e) =>
                                                            setSelectedOption(e.target.value)
                                                        }
                                                    >
                                                        <option value="" disabled>
                                                            -- Select an Option --
                                                        </option>
                                                        <option value="business-license">
                                                            Business License
                                                        </option>
                                                        <option value="owner-id">
                                                            Owner National ID
                                                        </option>
                                                        <option value="visiting-id">
                                                            Visiting ID
                                                        </option>
                                                    </select>

                                                    <p style={{ color: "red", fontSize: "0.6rem", fontWeight: "500" }}>
                                                        *Please select the document type and upload
                                                        the required file.
                                                    </p>
                                                </div>

                                                {selectedOption && (
                                                    <div
                                                        style={{
                                                            overflowX: "auto",
                                                            marginTop: "1rem",
                                                            scrollbarWidth: 'thin'
                                                        }}
                                                    >
                                                        <div className="col-19 d-flex align-items-center gap-1">
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                placeholder="Upload Selected Document"
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                onChange={handleFileChange}
                                                            />
                                                        </div>

                                                        {uploadedFiles.length > 0 && (
                                                            <div className="mt-3 uploaded-files-container">
                                                                <h6>Uploaded File:</h6>
                                                                <ul className="uploaded-files-list">
                                                                    {uploadedFiles.map(
                                                                        (file, index) => (
                                                                            <li
                                                                                key={index}
                                                                                className="uploaded-file-item"
                                                                            >
                                                                                <span style={{ marginRight: '8px' }}>{file.name}</span>
                                                                                <FaDownload style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }} onClick={() => handleDownload(file)} />
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}


                                                <div className="col-2 col-md-6 d-flex justify-content-center">
                                                    <button
                                                        className="btn p-1 mt-2"
                                                        type="button"
                                                        onClick={handleSubmit}
                                                        style={{ backgroundColor: "#0292E3", color: "white", width: "9rem", height: "2rem", fontSize: "1rem" }}
                                                    >

                                                        Update
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>

                            {/* {showPopup && (
                                <div
                                    style={{
                                        position: "fixed",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(10px)",
                                        padding: "30px",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                                        zIndex: "1000",
                                        width: "90%",
                                        maxWidth: "500px",
                                        color: "#333",
                                        textAlign: "center",
                                    }}
                                >
                                    <h4 style={{
                                        marginBottom: "15px",
                                        borderBottom: "2px solid #007bff",
                                        display: "inline-block",
                                        paddingBottom: "5px",
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        color: "#007bff"
                                    }}>
                                        Update Contact
                                    </h4>

                                    <div className="form-grid" style={{ display: "grid", gap: "10px" }}>
                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            name="contact_person_name"
                                            value={updatedContact.contact_person_name || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                contact_person_name: e.target.value,
                                            })}
                                            placeholder="Contact Person"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="address"
                                            value={updatedContact.address || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                address: e.target.value,
                                            })}
                                            placeholder="Contact Address"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="city"
                                            value={updatedContact.city || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                city: e.target.value,
                                            })}
                                            placeholder="Contact City"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="pincode"
                                            value={updatedContact.pincode || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                pincode: e.target.value,
                                            })}
                                            placeholder="Contact Pincode"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="country"
                                            value={updatedContact.country || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                country: e.target.value,
                                            })}
                                            placeholder="Contact Country"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="state"
                                            value={updatedContact.state || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                state: e.target.value,
                                            })}
                                            placeholder="Contact State"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="mobile_no"
                                            value={updatedContact.mobile_no || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                mobile_no: e.target.value,
                                            })}
                                            placeholder="Contact Mobile"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="email"
                                            name="email"
                                            value={updatedContact.email || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                email: e.target.value,
                                            })}
                                            placeholder="Contact Email"
                                        />

                                        <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                            type="text"
                                            name="designation"
                                            value={updatedContact.designation || ""}
                                            onChange={(e) => setUpdatedContact({
                                                ...updatedContact,
                                                designation: e.target.value,
                                            })}
                                            placeholder="Contact Designation"
                                        />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            // onClick={() => updateCustomerContacts(updatedContact)}
                                            onClick={() => handleUpdateContact()}
                                            style={{
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                backgroundColor: "#007bff",
                                                border: "none",
                                                color: "#fff"
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
                                        >
                                            Update
                                        </button>

                                        <button
                                            onClick={handleClosePopup}
                                            style={{
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                backgroundColor: "#dc3545",
                                                border: "none",
                                                color: "#fff"
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#b02a37"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )} */}
                            {showPopup && (
                                <div
                                    style={{
                                        position: "fixed",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(10px)",
                                        padding: "30px",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                                        zIndex: "1000",
                                        width: "90%",
                                        maxWidth: "500px",
                                        color: "#333",
                                        textAlign: "center",
                                        maxHeight: "90vh", // ⬅️ limits modal height to screen
                                        overflow: "hidden" // ⬅️ prevents outer scrollbars
                                    }}
                                >
                                    <h4 style={{
                                        marginBottom: "15px",
                                        borderBottom: "2px solid #007bff",
                                        display: "inline-block",
                                        paddingBottom: "5px",
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        color: "#007bff"
                                    }}>
                                        Update Contact
                                    </h4>

                                    {/* Scrollable content container */}
                                    <div style={{
                                        maxHeight: "60vh", // ⬅️ controls visible area
                                        overflowY: "auto",
                                        marginTop: "15px",
                                        paddingRight: "10px" // Optional: helps avoid scrollbar overlap
                                    }}>
                                        <div className="form-grid" style={{ display: "grid", gap: "10px", textAlign: "left" }}>
                                            <label htmlFor="contact_person_name">Contact Person</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                name="contact_person_name"
                                                value={updatedContact.contact_person_name || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    contact_person_name: e.target.value,
                                                })}
                                                placeholder="Contact Person"
                                            />

                                            <label htmlFor="address">Contact Address</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="address"
                                                value={updatedContact.address || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    address: e.target.value,
                                                })}
                                                placeholder="Contact Address"
                                            />

                                            <label htmlFor="city">Contact City</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="city"
                                                value={updatedContact.city || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    city: e.target.value,
                                                })}
                                                placeholder="Contact City"
                                            />

                                            <label htmlFor="pincode">Contact Pincode</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="pincode"
                                                value={updatedContact.pincode || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    pincode: e.target.value,
                                                })}
                                                placeholder="Contact Pincode"
                                            />

                                            <label htmlFor="country">Contact Country</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="country"
                                                value={updatedContact.country || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    country: e.target.value,
                                                })}
                                                placeholder="Contact Country"
                                            />

                                            <label htmlFor="state">Contact State</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="state"
                                                value={updatedContact.state || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    state: e.target.value,
                                                })}
                                                placeholder="Contact State"
                                            />

                                            <label htmlFor="mobile_no">Contact Mobile</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="mobile_no"
                                                value={updatedContact.mobile_no || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    mobile_no: e.target.value,
                                                })}
                                                placeholder="Contact Mobile"
                                            />

                                            <label htmlFor="email">Contact Email</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="email"
                                                name="email"
                                                value={updatedContact.email || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    email: e.target.value,
                                                })}
                                                placeholder="Contact Email"
                                            />

                                            <label htmlFor="designation">Contact Designation</label>
                                            <input className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                type="text"
                                                name="designation"
                                                value={updatedContact.designation || ""}
                                                onChange={(e) => setUpdatedContact({
                                                    ...updatedContact,
                                                    designation: e.target.value,
                                                })}
                                                placeholder="Contact Designation"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => handleUpdateContact()}
                                            style={{
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                backgroundColor: "#007bff",
                                                border: "none",
                                                color: "#fff"
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
                                        >
                                            Update
                                        </button>

                                        <button
                                            onClick={handleClosePopup}
                                            style={{
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                transition: "0.3s",
                                                backgroundColor: "#dc3545",
                                                border: "none",
                                                color: "#fff"
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = "#b02a37"}
                                            onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}


                            <style>
                                {`
    .accordion-button {
        color: #7a7b7d !important;
    }

    .accordion-button:not(.collapsed) {
        color: #7a7b7d !important;
       
    }
`}
                            </style>
                            <div>
                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header">
                                            Contact Person
                                            {/* <span className="icon-container" style={{ marginLeft: "1rem" }}>
                                            <FaPen
                                                className="ms-2"
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "1rem",
                                                    marginLeft: "0.5rem",
                                                }}
                                                onClick={handleContactPerson}
                                            />
                                        </span> */}


                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-check mb-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="sameAsCustomer"
                                                    checked={sameAsCustomer}
                                                    onChange={(e) => handleSameAsCustomerToggle(e)}
                                                />
                                                <label className="form-check-label" htmlFor="sameAsContact">
                                                    Same as Customer
                                                </label>
                                            </div>
                                            <div className="row g-2">
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person Name</label>
                                                    <input
                                                        type="text"
                                                        name="contact_person_name"
                                                        placeholder="Contact Person"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.contact_person_name || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person Address</label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        placeholder="Contact Address"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.address || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        placeholder="Contact City"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.city || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div >
                                                    <label style={{ marginBottom: "0.3rem" }}>Person PinCode</label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        placeholder="Contact Pincode"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.pincode || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person Country</label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        placeholder="Contact Country"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.country || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        placeholder="Contact State"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.state || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Phone Number</label>
                                                    <input
                                                        type="number"
                                                        name="mobile_no"
                                                        placeholder="Contact Mobile"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.mobile_no || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="Contact Email"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.email || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>Person designation</label>
                                                    <input
                                                        type="text"
                                                        name="designation"
                                                        placeholder="Contact Designation"
                                                        className="form-control fs-9"
                                                        style={{

                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={formData.designation || ""}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>

                                                <div>
                                                    <button
                                                        className="btn p-1"
                                                        type="button"
                                                        onClick={handleSave}
                                                        style={{ backgroundColor: "#0292E3", color: "white", width: "9rem", height: "2rem", fontSize: "1rem" }}>
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header">
                                            Contact Directory
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div style={{

                                                overflowX: 'auto',
                                                maxWidth: '100vw',
                                                scrollbarWidth: 'thin',

                                            }} className="contactTable">
                                                <div className="table-responsive">


                                                    <table className="table" style={{ border: "1px solid #ccc", borderCollapse: "collapse", }} >
                                                        <thead>
                                                            <tr style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Sr.No</h6>
                                                                </th>
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Name</h6>
                                                                </th>
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Designation</h6>
                                                                </th >
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Mobile Number</h6>
                                                                </th>
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Email</h6>
                                                                </th>
                                                                <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                    <h6>Action</h6>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan={10}
                                                                        className="text-center"
                                                                    >
                                                                        <Spinner animation="border" />
                                                                    </td>
                                                                </tr>
                                                            ) : ContactFetch.length > 0 ? (
                                                                ContactFetch.map(
                                                                    (section, index) => (
                                                                        <tr
                                                                            key={
                                                                                section.id || index
                                                                            }
                                                                        >
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                {indexOfFirstItem +
                                                                                    index +
                                                                                    1}
                                                                            </td >
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                {section.contact_person_name ||
                                                                                    "N/A"}
                                                                            </td>
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                {section.designation ||
                                                                                    "N/A"}
                                                                            </td>
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                {section.mobile_no ||
                                                                                    "N/A"}
                                                                            </td>
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                {section.email ||
                                                                                    "N/A"}
                                                                            </td>
                                                                            <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                                <div className="d-flex gap-2">
                                                                                    <Button
                                                                                        variant="subtle-success"
                                                                                        onClick={() =>
                                                                                            handleClick(
                                                                                                section)} >  Update
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="subtle-danger"
                                                                                        onClick={() =>
                                                                                            removeSection(
                                                                                                section.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Delete
                                                                                    </Button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="10">
                                                                        No data available
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>

                                                    {/* <Pagination>
                                    <Pagination.First
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                    />
                                    <Pagination.Prev
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                    />
                                    {Array.from(
                                        { length: totalPages },
                                        (_, idx) => idx + 1
                                    ).map((pageNumber) => (
                                        <Pagination.Item
                                            key={pageNumber}
                                            active={pageNumber === currentPage}
                                            onClick={() =>
                                                handlePageChange(pageNumber)
                                            }
                                        >
                                            {pageNumber}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                    />
                                    <Pagination.Last
                                        onClick={() =>
                                            handlePageChange(totalPages)
                                        }
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination> */}
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header" >
                                            Consignee Details
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="form-check mb-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="sameAsContact"
                                                    checked={sameAsContact}
                                                    onChange={(e) => handleSameAsContactToggle(e)}
                                                />
                                                <label className="form-check-label" htmlFor="sameAsContact">
                                                    Same as Contact Person
                                                </label>
                                            </div>

                                            <div className="row g-2">
                                                <div>
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="contact_person_name"
                                                        placeholder="Consignee Name"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.9rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.contact_person_name
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignee_address"
                                                        placeholder="Consignee Address"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_address
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignee_city"
                                                        placeholder="Consignee City"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_city
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Conginee Pincode
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignee_pincode"
                                                        placeholder="Consignee Pincode"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_pincode
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee Country
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignee_country"
                                                        placeholder="Consignee Country"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_country
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Conginee State
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignee_state"
                                                        placeholder="Consignee State"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_state
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee Mobile
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="consignee_mobile_number"
                                                        placeholder="Consignee Mobile"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_mobile_number
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div

                                                >
                                                    <label style={{ marginBottom: "0.3rem" }}>
                                                        Consignee Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="consignee_email"
                                                        placeholder="Consignee Email"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignee_email
                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <div
                                                >
                                                    <label style={{ marginBottom: "0.3rem" }} >
                                                        Consignee Designation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="consignees_designation"
                                                        placeholder="Consignee Designation"
                                                        className="form-control fs-9"
                                                        style={{
                                                            padding: "0.4rem",
                                                            fontSize: "0.300rem",
                                                        }}
                                                        value={
                                                            consignee_form_Data.consignees_designation

                                                        }
                                                        onChange={handle_Input_Change}
                                                    />
                                                </div>
                                                <bl />
                                                <div className="col-md-6 d-flex justify-content-center">
                                                    <button
                                                        className="btn btn-sm btn-success w-100"
                                                        style={{ backgroundColor: "#0292E3", color: "white", width: "9rem", height: "2rem", fontSize: "1rem" }}
                                                        type="button"
                                                        onClick={handleConsigneeSave}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>



                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header">
                                            Consignees Directory
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div style={{
                                                overflowX: 'auto',
                                                maxWidth: '100vw',
                                                scrollbarWidth: 'thin',
                                            }}
                                                className="contactTable"
                                            >
                                                <table className="table" style={{ borderCollapse: "collapse", border: "1px solid #ccc" }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>#</h6>
                                                            </th>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>Name</h6>
                                                            </th>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>Designation</h6>
                                                            </th>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>Mobile Number</h6>
                                                            </th>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>Email</h6>
                                                            </th>
                                                            <th style={{ fontWeight: '700', padding: "10px", border: "1px solid #ccc" }}>
                                                                <h6>Action</h6>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={10}
                                                                    className="text-center"
                                                                >
                                                                    <Spinner animation="border" />
                                                                </td>
                                                            </tr>
                                                        ) : ConsigneeFetch.length > 0 ? (
                                                            ConsigneeFetch.map(
                                                                (section, index) => (
                                                                    <tr key={index} style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            {indexOfFirstItem +
                                                                                index +
                                                                                1}
                                                                        </td>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            {section.contact_person_name ||
                                                                                "N/A"}
                                                                        </td>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            {section.consignee_designation ||
                                                                                "N/A"}
                                                                        </td>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            {section.consignee_mobile_number ||
                                                                                "N/A"}
                                                                        </td>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            {section.consignee_email ||
                                                                                "N/A"}
                                                                        </td>
                                                                        <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                                                                            <div className="d-flex gap-2">
                                                                                <Button
                                                                                    variant="subtle-success"
                                                                                    onClick={() =>
                                                                                        handleConsigneePopup(
                                                                                            section
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Update
                                                                                </Button>
                                                                                <Button
                                                                                    variant="subtle-danger"
                                                                                    onClick={() =>
                                                                                        handleRemoveConsignee(
                                                                                            section.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Delete
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6">
                                                                    No data available
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>

                                                {/* Pagination */}

                                                {/* <Pagination className="mt-3">
                                    <Pagination.First
                                        onClick={() => handlePages(1)}
                                        disabled={currentPages === 1}
                                    />
                                    <Pagination.Prev
                                        onClick={() =>
                                            handlePages(currentPages - 1)
                                        }
                                        disabled={currentPages === 1}
                                    />
                                    {Array.from(
                                        { length: totalPagess },
                                        (_, idx) => idx + 1
                                    ).map((pageNum) => (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={pageNum === currentPages}
                                            onClick={() => handlePages(pageNum)}
                                        >
                                            {pageNum}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() =>
                                            handlePages(currentPages + 1)
                                        }
                                        disabled={currentPages === totalPagess}
                                    />
                                    <Pagination.Last
                                        onClick={() => handlePages(totalPages)}
                                        disabled={currentPages === totalPagess}
                                    />
                                </Pagination> */}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/*popup start here */}
                            {showConsigneePopup && (
                                <div
                                    style={{
                                        position: "fixed",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        backgroundColor: "#F0F2F5FF",
                                        padding: "30px",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 4px 8px rgba(0, 0, 0, 0.1)",
                                        zIndex: "1000",
                                        width: "90%",
                                        maxWidth: "500px",
                                        color: "#333",
                                        textAlign: "center",

                                    }}
                                >
                                    <br />

                                    {/* <div className="container"  style={{
                                        position: "fixed",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(10px)",
                                        padding: "30px",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                                        zIndex: "1000",
                                        width: "90%",
                                        maxWidth: "500px",
                                        color: "#333",
                                        textAlign: "center",
                                        maxHeight: "90vh", // ⬅️ limits modal height to screen
                                        overflow: "auto" // ⬅️ prevents outer scrollbars
                                    }}>
                                        <div className="popup-content">
                                            <h4 style={{
                                                marginBottom: "15px",
                                                borderBottom: "2px solid #007bff",
                                                display: "inline-block",
                                                paddingBottom: "5px",
                                                fontSize: "20px",
                                                fontWeight: "600",
                                                color: "#007bff"
                                            }}>
                                                Update Consignees
                                            </h4>

                                            <div className="form-grid" style={{ display: "grid", gap: "10px" }}>
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    name="consignee_contact_person_name"
                                                    value={
                                                        updatedConsignee.contact_person_name ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            contact_person_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Person"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignee_address"
                                                    value={
                                                        updatedConsignee.consignee_address ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_address:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Address"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignee_city"
                                                    value={
                                                        updatedConsignee.consignee_city ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_city:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact City"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="number"
                                                    name="consignee_pincode"
                                                    value={
                                                        updatedConsignee.consignee_pincode ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_pincode:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Pincode"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignee_country"
                                                    value={
                                                        updatedConsignee.consignee_country ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_country:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Country"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignee_state"
                                                    value={
                                                        updatedConsignee.consignee_state ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_state:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact State"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignee_mobile_number"
                                                    value={
                                                        updatedConsignee.consignee_mobile_number ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_mobile_number:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Mobile"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="email"
                                                    name="consignee_email"
                                                    value={
                                                        updatedConsignee.consignee_email ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignee_email:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Email"
                                                />
                                                <input
                                                    className="form-control form-control-sm dark:bg-gray-700 dark:text-white"
                                                    type="text"
                                                    name="consignees_designation"
                                                    value={
                                                        updatedConsignee.consignees_designation ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setUpdatedConsignee({
                                                            ...updatedConsignee,
                                                            consignees_designation:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contact Designation"
                                                />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() =>
                                                        updateCustomerConsignees(
                                                            updatedConsignee
                                                        )
                                                    } // Fix onClick
                                                    style={{
                                                        padding: "8px 16px",
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        transition: "0.3s",
                                                        backgroundColor: "#007bff",
                                                        border: "none",
                                                        color: "#fff"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}

                                                >
                                                    Update
                                                </button>

                                                <Button
                                                    variant="outline-danger"
                                                    onClick={handleClosePopup}

                                                    style={{
                                                        padding: "8px 16px",
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        transition: "0.3s",
                                                        backgroundColor: "#dc3545",
                                                        border: "none",
                                                        color: "#fff"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = "#b02a37"}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}

                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </div>
                                    </div> */}
                                    <div className="container" style={{
                                        position: "fixed",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(255, 255, 255, 0.15)",
                                        backdropFilter: "blur(10px)",
                                        padding: "30px",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                                        zIndex: "1000",
                                        width: "90%",
                                        maxWidth: "500px",
                                        color: "#333",
                                        textAlign: "center",
                                        maxHeight: "70vh",
                                        overflow: "auto"
                                    }}>
                                        <div className="popup-content">
                                            <h4 style={{
                                                marginBottom: "15px",
                                                borderBottom: "2px solid #007bff",
                                                display: "inline-block",
                                                paddingBottom: "5px",
                                                fontSize: "20px",
                                                fontWeight: "600",
                                                color: "#007bff"
                                            }}>
                                                Update Consignees
                                            </h4>

                                            <div className="form-grid" style={{ display: "grid", gap: "10px" }}>
                                                <div>
                                                    <label htmlFor="consignee_contact_person_name" style={labelStyle}>Consignee Name</label>
                                                    <input id="consignee_contact_person_name" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" name="consignee_contact_person_name" value={updatedConsignee.contact_person_name || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, contact_person_name: e.target.value })} placeholder="Contact Person" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_address" style={labelStyle}>Consignee Address</label>
                                                    <input id="consignee_address" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" name="consignee_address" value={updatedConsignee.consignee_address || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_address: e.target.value })} placeholder="Contact Address" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_city" style={labelStyle}>Consignee City</label>
                                                    <input id="consignee_city" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" name="consignee_city" value={updatedConsignee.consignee_city || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_city: e.target.value })} placeholder="Contact City" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_pincode" style={labelStyle}>Consignee Pincode</label>
                                                    <input id="consignee_pincode" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="number" name="consignee_pincode" value={updatedConsignee.consignee_pincode || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_pincode: e.target.value })} placeholder="Contact Pincode" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_country" style={labelStyle}>Consignee Country</label>
                                                    <input id="consignee_country" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="text" name="consignee_country" value={updatedConsignee.consignee_country || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_country: e.target.value })} placeholder="Contact Country" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_state" style={labelStyle}>Consignee State</label>
                                                    <input id="consignee_state" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="text" name="consignee_state" value={updatedConsignee.consignee_state || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_state: e.target.value })} placeholder="Contact State" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_mobile_number" style={labelStyle}>Consignee Mobile</label>
                                                    <input id="consignee_mobile_number" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="text" name="consignee_mobile_number" value={updatedConsignee.consignee_mobile_number || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_mobile_number: e.target.value })} placeholder="Contact Mobile" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignee_email" style={labelStyle}>Consignee Email</label>
                                                    <input id="consignee_email" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="email" name="consignee_email" value={updatedConsignee.consignee_email || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignee_email: e.target.value })} placeholder="Contact Email" />
                                                </div>

                                                <div>
                                                    <label htmlFor="consignees_designation" style={labelStyle}>Consignee Designation</label>
                                                    <input id="consignees_designation" className="form-control form-control-sm dark:bg-gray-700 dark:text-white" type="text" name="consignees_designation" value={updatedConsignee.consignees_designation || ""} onChange={(e) => setUpdatedConsignee({ ...updatedConsignee, consignees_designation: e.target.value })} placeholder="Contact Designation" />
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "10px" }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => updateCustomerConsignees(updatedConsignee)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        transition: "0.3s",
                                                        backgroundColor: "#007bff",
                                                        border: "none",
                                                        color: "#fff"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
                                                >
                                                    Update
                                                </button>

                                                <Button
                                                    variant="outline-danger"
                                                    onClick={handleClosePopup}
                                                    style={{
                                                        padding: "8px 16px",
                                                        fontSize: "14px",
                                                        fontWeight: "500",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        transition: "0.3s",
                                                        backgroundColor: "#dc3545",
                                                        border: "none",
                                                        color: "#fff"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = "#b02a37"}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = "#dc3545"}
                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/*End Popup */}





                            <div className="mt-3">


                                {/* Accordion to list feedback forms, only one Accordion encompassing all forms */}
                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header" style={{ color: "#b5b7bd", }}>Feedback Forms</Accordion.Header>
                                        <Accordion.Body>
                                            {/* Check if feedbackForms has any data */}
                                            {feedbackForms.length > 0 ? (
                                                feedbackForms.map((feedback, index) => (
                                                    <div key={feedback.id} className="mb-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span>Feedback Form {feedback.id}</span>
                                                            <FontAwesomeIcon
                                                                icon={faEye}
                                                                style={{
                                                                    cursor: "pointer",
                                                                    fontSize: "1rem",
                                                                    marginLeft: "0.5rem",
                                                                }}
                                                                className="ms-2"
                                                                onClick={() => handleShowModal(feedback)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted">No feedback forms filled yet.</div>
                                            )}
                                        </Accordion.Body>

                                    </Accordion.Item>
                                </Accordion>

                                {/* Modal to display feedback details */}
                                {/* <Modal show={showModal} onHide={handleCloseModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Feedback Form Details</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {selectedFeedback && (
                                            <div>
                                                <p>
                                                    <strong>Service Satisfaction:</strong> {selectedFeedback.service_satisfaction}
                                                </p>
                                                <p>
                                                    <strong>Overall Experience:</strong> {selectedFeedback.overall_experience}
                                                </p>
                                                <p>
                                                    <strong>Recommend Services:</strong> {selectedFeedback.recommend_services}
                                                </p>
                                                <p>
                                                    <strong>Met Expectations:</strong> {selectedFeedback.met_expectations}
                                                </p>
                                                <p>
                                                    <strong>Service Quality:</strong> {selectedFeedback.service_quality}
                                                </p>
                                                <p>
                                                    <strong>Timely Address:</strong> {selectedFeedback.timely_address}
                                                </p>
                                                <p>
                                                    <strong>Support Satisfaction:</strong> {selectedFeedback.support_satisfaction}
                                                </p>
                                                <p>
                                                    <strong>Team Friendliness:</strong> {selectedFeedback.team_friendliness}
                                                </p>
                                                <p>
                                                    <strong>Felt Heard:</strong> {selectedFeedback.felt_heard}
                                                </p>
                                                <p>
                                                    <strong>Speed of Delivery:</strong> {selectedFeedback.speed_of_delivery}
                                                </p>
                                                <p>
                                                    <strong>Worth Price:</strong> {selectedFeedback.worth_price}
                                                </p>
                                                <p>
                                                    <strong>Compare Competitors:</strong> {selectedFeedback.compare_competitors}
                                                </p>
                                                <p>
                                                    <strong>Delay Description:</strong> {selectedFeedback.delay_description}
                                                </p>
                                            </div>
                                        )}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseModal}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal> */}
                                <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                                    <Modal.Header closeButton style={{ backgroundColor: "#2358eb", color: "white" }}>
                                        <Modal.Title>Feedback Form Details</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body style={{ padding: "25px", maxHeight: "70vh", overflowY: "auto", scrollbarWidth: 'thin' }}>

                                        {selectedFeedback && (
                                            <div className="container">
                                                <div className="row">
                                                    {/* Left Column */}
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Service Satisfaction</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.service_satisfaction} readOnly />
                                                        </div>

                                                        {/* Star Ratings for Overall Experience */}
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Overall Experience</strong></label>
                                                            <div>
                                                                {Array.from({ length: selectedFeedback.overall_experience }).map((_, index) => (
                                                                    <span key={index} style={{ color: "#FFD700", fontSize: "20px" }}> ★ </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Star Ratings for Service Quality */}
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Service Quality</strong></label>
                                                            <div>
                                                                {Array.from({ length: selectedFeedback.service_quality }).map((_, index) => (
                                                                    <span key={index} style={{ color: "#FFD700", fontSize: "20px" }}> ★ </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Recommend Services</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.recommend_services} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Met Expectations</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.met_expectations} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Timely Address</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.timely_address} readOnly />
                                                        </div>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Support Satisfaction</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.support_satisfaction} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Team Friendliness</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.team_friendliness} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Felt Heard</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.felt_heard} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Speed of Delivery</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.speed_of_delivery} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Worth Price</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.worth_price} readOnly />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Compare Competitors</strong></label>
                                                            <input type="text" className="form-control" value={selectedFeedback.compare_competitors} readOnly />
                                                        </div>
                                                    </div>

                                                    {/* Full-width input for Delay Description */}
                                                    <div className="col-12">
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Delay Description</strong></label>
                                                            <textarea className="form-control" value={selectedFeedback.delay_description} readOnly rows="3"></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Modal.Body>
                                    <Modal.Footer >
                                        <Button variant="secondary" onClick={handleCloseModal}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>


                            </div>




                            <div className="mt-3">


                                {/* Accordion to list feedback forms, only one Accordion encompassing all forms */}
                                <Accordion defaultActiveKey="1">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header className="custom-header">Complaint Forms</Accordion.Header>
                                        <Accordion.Body>
                                            {/* Check if complaintForms has any data */}
                                            {Array.isArray(complaintForms) && complaintForms.length > 0 ? (
                                                complaintForms.map((complaint, index) => (
                                                    <div key={complaint.id} className="mb-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span>Complaint Form {complaint.id}</span>
                                                            <FontAwesomeIcon
                                                                icon={faEye}
                                                                style={{
                                                                    cursor: "pointer",
                                                                    fontSize: "1rem",
                                                                    marginLeft: "0.5rem",
                                                                }}
                                                                className="ms-2"
                                                                onClick={() => handleShowComplaintModal(complaint)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted">No complaint forms filled yet.</div>
                                            )}
                                        </Accordion.Body>

                                    </Accordion.Item>
                                </Accordion>

                                {/* Modal to display feedback details */}
                                <Modal show={showComplaintModal} onHide={handleCloseComplaintModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Complaint Form Details</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {selectedComplaint && (
                                            <div>
                                                <p>
                                                    <strong>Interaction Point</strong> {selectedComplaint.interaction_point}
                                                </p>
                                                <p>
                                                    <strong>Issue Description</strong> {selectedComplaint.issue_description}
                                                </p>
                                                <p>
                                                    <strong>Occured At</strong> {selectedComplaint.occurred_at}
                                                </p>
                                            </div>
                                        )}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseComplaintModal}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                            <div className="mt-3 ml-4" style={{
                                fontSize: "1.1rem",
                                fontWeight: "600"
                            }}>
                                {[
                                    "Feedback Form",
                                ].map((form, index) => (
                                    <div
                                        key={index}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <p
                                            className="small"
                                            style={{
                                                fontSize: "1.1rem",
                                                fontWeight: "600",
                                                // color: "#4B5563",
                                                marginBottom: "0.5rem",
                                            }}
                                        >
                                            {form}
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#2563EB",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Link
                                                to={`/FeedbackForm/${leadId}/${customerId}`}
                                                className="btn btn-info btn-sm"
                                            >
                                                View
                                            </Link>

                                        </button>



                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 ml-4">
                                {[
                                    "Complaint Form",
                                ].map((form, index) => (
                                    <div
                                        key={index}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <p
                                            className="small"
                                            style={{
                                                fontSize: "1.1rem",
                                                fontWeight: "600",
                                                // color: "#4B5563",
                                                marginBottom: "0.5rem",
                                            }}
                                        >
                                            {form}
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#2563EB",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Link
                                                to={`/ComplainForm/${leadId}/${customerId}`}
                                                className="btn btn-info btn-sm"
                                            >
                                                View
                                            </Link>
                                        </button>



                                    </div>
                                ))}
                            </div>
                        </form>
                    </div>
                </div>
                <ToastContainer />
            </div>
            {/* </div> */}





        </>
    );
};

export default LeftColumn;
