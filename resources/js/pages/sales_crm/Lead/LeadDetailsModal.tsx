import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Table, Alert } from "react-bootstrap";
import axiosInstance from "../../../axios";
import "./LeadDetailsModal.css";

const LeadDetailsModal = ({ show, onClose, leadId }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [customerDetails, setCustomerDetails] = useState(null);

    useEffect(() => {
        if (!leadId) {
            setError("Lead ID is missing.");
            return;
        }

        const fetchLeadDetails = async () => {
            try {
                setLoading(true);
                setError("");  // Clear previous errors
                const response = await axiosInstance.get("/showlead", {
                    params: { id: leadId },
                });

                if (response.data && response.data.lead) {
                    localStorage.setItem("cst_id", response.data.lead.customer_id);
                    setFormData({
                        customer_id: response.data.lead.customer_id,
                        communication_via: response.data.lead.customer_lead.communication_via,
                        company_name: response.data.lead.sender_company,
                        consignee: response.data.lead.consignee_contact_person_name,
                        consignee_address: response.data.lead.consignee_address,
                        consignee_city: response.data.lead.consignee_city,
                        consignee_contact_person_name: response.data.lead.consignee_contact_person_name,
                        consignee_country: response.data.lead.consignee_country,
                        consignee_designation: response.data.lead.consignee_designation,
                        consignee_email: response.data.lead.consignee_email,
                        consignee_mobile_number: response.data.lead.consignee_mobile_number,
                        consignee_pincode: response.data.lead.consignee_pincode,
                        consignee_state: response.data.lead.consignee_state,
                        contact_person_address: response.data.lead.contact_person_address,
                        contact_person_city: response.data.lead.contact_person_city,
                        contact_person_country: response.data.lead.contact_person_country,
                        contact_person_designation: response.data.lead.contact_person_designation,
                        contact_person_email: response.data.lead.contact_person_email,
                        contact_person_mobile_number: response.data.lead.contact_person_mobile_number,
                        contact_person_name: response.data.lead.contact_person_name,
                        contact_person_pincode: response.data.lead.contact_person_pincode,
                        contact_person_state: response.data.lead.contact_person_state,
                        country_status: response.data.lead.customer_lead.country_status,
                        created_at: response.data.lead.customer_lead.created_at,
                        customer_status: response.data.lead.customer_lead.customer_status,
                        designation: response.data.lead.customer_lead.designation,
                        id: response.data.lead.customer_lead.id,
                        sender_address: response.data.lead.sender_address,
                        sender_city: response.data.lead.sender_city,
                        sender_company: response.data.lead.customer_lead.sender_company,
                        sender_country_iso: response.data.lead.sender_country_iso,
                        sender_email: response.data.lead.sender_email,
                        sender_mobile: response.data.lead.sender_mobile,
                        sender_name: response.data.lead.sender_name,
                        sender_pincode: response.data.lead.customer_lead.sender_pincode,
                        sender_state: response.data.lead.sender_state,
                        specialty_industry_sector: response.data.lead.customer_lead.specialty_industry_sector,
                        updated_at: response.data.lead.customer_lead.updated_at,
                        website: response.data.lead.customer_lead.website,
                        platform: response.data.lead.platform,
                    });

                    setCustomerDetails(response.data);
                } else {
                    setError("No lead data available.");
                }
                setLoading(false);
            } catch (err) {
                setError("Error fetching lead details: " + (err?.message || "Unknown error"));
                setLoading(false);
            }
        };

        fetchLeadDetails();
    }, [leadId]);

    const getPlatformLabel = (platform) => {
        switch (platform) {
          case 'Purvee':
            return 'CH-i7PRV';
          case 'Vortex':
            return 'CH-i7VX';
          case 'Inorbvict':
            return 'CH-i7IRB';
          case 'TradeIndia':
            return 'TradeInquiry';
          default:
            return platform || 'N/A';
        }
      };
      
    return (
        <Modal
            show={show}
            onHide={onClose}
            size="lg"
            // centered
            className="lead-details-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Lead Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Loading lead details...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="mt-4 alert-message">
                        {error}
                    </Alert>
                ) : customerDetails ? (

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table striped bordered hover className="mt-4">
                      <tbody>
                        <tr><th>Customer Name</th><td>{formData.sender_name}</td></tr>
                        <tr><th>Customer Mobile</th><td>{formData.sender_mobile}</td></tr>
                        <tr><th>Customer Email</th><td>{formData.sender_email}</td></tr>
                        <tr><th>Company Name</th><td>{formData.sender_company}</td></tr>
                        <tr><th>Lead Source</th><td>{getPlatformLabel(formData.platform)}</td></tr>
                        <tr><th>Customer Status</th><td>{formData.customer_status}</td></tr>
                        <tr><th>Customer Address</th><td>{formData.sender_address}</td></tr>
                        <tr><th>Customer City</th><td>{formData.sender_city}</td></tr>
                        <tr><th>Customer Country ISO</th><td>{formData.sender_country_iso}</td></tr>
                        <tr><th>Sender Pincode</th><td>{formData.sender_pincode}</td></tr>
                        <tr><th>Customer State</th><td>{formData.sender_state}</td></tr>
                        <tr><th>Specialty Industry Sector</th><td>{formData.specialty_industry_sector}</td></tr>
                        <tr><th>Website</th><td>{formData.website}</td></tr>
                      </tbody>
                    </Table>
                  </div>
                  

                ) : (
                    <p className="mt-4">No details available for this lead.</p>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} className="close-btn">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LeadDetailsModal;
