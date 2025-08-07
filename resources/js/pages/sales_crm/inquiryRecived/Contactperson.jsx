import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import EditIcon from "../../../assets/img/newIcons/edit.svg";
import { toast } from 'react-toastify'; // Assuming you're using react-toastify
import axiosInstance from '../../../axios'; // Update with your axios instance path

const Contactperson = ({ onClose, lead_id, customer_id, setSections, fetchCustomerContacts, setIsEdit }) => {
    const [formData, setFormData] = useState({
        contact_person_name: "",
        designation: "",
        mobile_no: "",
        email: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        address: "", // Added address field as it's required in validation
    });
    
    const [sameAsCustomer, setSameAsCustomer] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        setSameAsCustomer(e.target.checked);
        // You can add logic here to populate fields from customer data if needed
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
            lead_id: lead_id,
            lead_cust_id: customer_id,
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
                fetchCustomerContacts();
            }
            setIsEdit(false);
        } catch (error) {
            toast.error("Error saving customer details");
        }
    };

    return (
        <>
            <style>{`
        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: #2E467A;
        }

        .form-container {
          border-radius: 15px;
          padding: 1.5rem;
          background: #fff;
          height: auto;
          max-width: 800px;
          margin: auto;
        }

        .form-heading {
          text-align: center;
          font-size: 20px;
          font-weight: 600; 
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-heading::before,
        .form-heading::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 35%;
          height: 1px;
          background-color: #ccc;
        }

        .form-heading::before {
          left: 0;
        }

        .form-heading::after {
          right: 0;
        }
          .compact-field {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          gap: 4px; /* tighter gap */
        }

        .compact-label {
          margin-bottom: 0;
          font-size: 14px;
          font-weight: 600;
          color: #2E467A;
          white-space: nowrap;
          min-width: 100px; /* decreased to reduce space between label and input */
        }

        .input-wrapper {
          position: relative;
          flex: 1;
          margin-bottom: 0; /* remove default margin */
        }

        .input-field {
          border: none;
          border-bottom: 1px solid #aaa;
          border-radius: 0;
          padding-right: 28px;
          padding-left: 2px; /* slightly tighter padding */
          padding-bottom: 2px;
          color: #000;
          background-color: transparent;
          font-size: 14px;
          height: 30px;
          width: 100%;
        }

        .form-icon {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 1.5rem;
        }

        .btn-cancel {
          background: linear-gradient(to right, #a30707, #720101);
          color: #fff;
          border: none;
          padding: 6px 24px;
          border-radius: 15px;
        }

        .btn-save {
          background: linear-gradient(to right, #111A2E, #375494);
          color: #fff;
          border: none;
          padding: 12px 34px;
          border-radius: 15px;
        }

        .checkbox-label {
          font-size: 16px;
          font-weight: 600;
          color:  #111A2E;
          margin-left: 10px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
      `}</style>

            <div className="form-container">
                <div className="form-heading">Contact Person</div>

                <div className="checkbox-container">
                    <Form.Check 
                        type="checkbox" 
                        checked={sameAsCustomer}
                        onChange={handleCheckboxChange}
                    />
                    <label className="checkbox-label">Same As Customer </label>
                </div>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Contact Person Name:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="contact_person_name"
                                    value={formData.contact_person_name}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Designation:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Phone:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="number" 
                                    className="input-field"
                                    name="mobile_no"
                                    value={formData.mobile_no}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Email:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="email" 
                                    className="input-field"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">City:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">State:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>
                
                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">PinCode:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Country:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Added Address field since it's required in validation */}
                <Row>
                    <Col md={12}>
                        <div className="compact-field">
                            <label className="compact-label">Address:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="action-buttons">
                    <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
                    <Button className="btn-save" onClick={handleSave}>Save</Button>
                </div>
            </div>
        </>
    );
};

export default Contactperson;