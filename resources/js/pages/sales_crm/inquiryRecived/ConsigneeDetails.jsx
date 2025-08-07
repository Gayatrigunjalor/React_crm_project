import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import EditIcon from "../../../assets/img/newIcons/edit.svg";
import axiosInstance from "../../../axios";

const ConsigneeDetails = ({ 
    onClose, 
    lead_id, 
    customer_id, 
    toast, 
    fetchConsigneesData, 
    setConsigneeSection, 
    setIsEdit 
}) => {
    // Form state
    const [consignee_form_Data, setConsignee_form_Data] = useState({
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

    const [sameAsContactPerson, setSameAsContactPerson] = useState(false);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setConsignee_form_Data(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    // Handle checkbox change
    const handleCheckboxChange = (checked) => {
        setSameAsContactPerson(checked);
        // You can implement logic here to populate form with contact person details
        // if you have access to contact person data
    };

    const handleConsigneeSave = async () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(consignee_form_Data.consignee_email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Validate other required fields
        if (!consignee_form_Data.contact_person_name || 
            !consignee_form_Data.consignee_address || 
            !consignee_form_Data.consignee_city || 
            !consignee_form_Data.consignee_pincode || 
            !consignee_form_Data.consignee_country || 
            !consignee_form_Data.consignee_state || 
            !consignee_form_Data.consignee_mobile_number) {
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
            cust_id: customer_id,
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
            }
            setIsEdit(false);
        } catch (error) {
            toast.error("Error saving consignee details");
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
                <div className="form-heading">Consignee Details</div>

                <div className="checkbox-container">
                    <Form.Check 
                        type="checkbox" 
                        checked={sameAsContactPerson}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                    />
                    <label className="checkbox-label">Same As Contact Person </label>
                </div>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Name:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.contact_person_name}
                                    onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
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
                                    value={consignee_form_Data.consignee_country}
                                    onChange={(e) => handleInputChange('consignee_country', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Email:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="email" 
                                    className="input-field"
                                    value={consignee_form_Data.consignee_email}
                                    onChange={(e) => handleInputChange('consignee_email', e.target.value)}
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
                                    value={consignee_form_Data.consignee_state}
                                    onChange={(e) => handleInputChange('consignee_state', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Address:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.consignee_address}
                                    onChange={(e) => handleInputChange('consignee_address', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">City:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.consignee_city}
                                    onChange={(e) => handleInputChange('consignee_city', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Mobile:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.consignee_mobile_number}
                                    onChange={(e) => handleInputChange('consignee_mobile_number', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Pincode:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.consignee_pincode}
                                    onChange={(e) => handleInputChange('consignee_pincode', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <div className="compact-field">
                            <label className="compact-label">Designation:</label>
                            <div className="input-wrapper">
                                <Form.Control 
                                    type="text" 
                                    className="input-field"
                                    value={consignee_form_Data.consignees_designation}
                                    onChange={(e) => handleInputChange('consignees_designation', e.target.value)}
                                />
                                <img src={EditIcon} alt="Edit" className="form-icon" />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="action-buttons">
                    <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
                    <Button className="btn-save" onClick={handleConsigneeSave}>Save</Button>
                </div>
            </div>
        </>
    );
};

export default ConsigneeDetails;