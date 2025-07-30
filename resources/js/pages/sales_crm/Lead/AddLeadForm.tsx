import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import { er } from '@fullcalendar/core/internal-common';
import Swal from 'sweetalert';

interface AddLeadFormProps {
    show: boolean;
    onClose: () => void;
    onLeadAdded?: () => void;
}

export interface CustomerDataType {
    id: number;
    cust_id: string;
    name: string;
    address: string;
    city: string;
    pin_code: string;
    state: string;
    email: string;
    customer_type: {
        id: string;
        name: string;
    };
    country: CountriesData;
    segment: {
        id: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
    };
    contact_person: string;
    contact_no: string;
}

export interface CountriesData {
    id: string;
    name: string;
    sortname: string;
};

const AddLeadForm: React.FC<AddLeadFormProps> = ({ show, onClose, onLeadAdded }) => {

    const initialLeadState = {
        sender_name: '',
        sender_mobile: '',
        sender_email: '',
        sender_address: '',
        sender_city: '',
        sender_pincode: '',
        sender_state: '',
        sender_company: '',
        sender_country_iso: '',
        sender_country_id: '',
        // query_product_name: '',
    };

    const initialErrorState = {
        sender_name: false,
        sender_mobile: false,
        sender_email: false,
        sender_address: false,
        sender_city: false,
        sender_pincode: false,
        sender_state: false,
        sender_company: false,
        sender_country_iso: false,
        sender_country_id: false,
        // query_product_name: false,
    };

    const [newLead, setNewLead] = useState(initialLeadState);
    const [errors, setErrors] = useState(initialErrorState);
    const [customerTableData, setCustomerTableData] = useState<CustomerDataType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [useCustomerFromSales, setUseCustomerFromSales] = useState(false);

    const fetchStates = async (countryId: string) => {
        try {
            const response = await
                axiosInstance.get(`/getStates?country_id=${countryId}`); // Replace with your API URL
            console.log('States response:', response.data);
            if (response.status !== 200) {
                throw new Error('Failed to fetch states');
            }
            setStates(response.data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'sender_mobile') {
            newValue = value.slice(0, 20); // Just limit to 10 characters
        } else if (name === 'sender_pincode') {
            newValue = value.slice(0, 12); // Allow alphanumeric, max 12 characters
        }

        // When country changes, fetch states and clear the state field
        if (name === 'sender_country_iso') {
            const selectedCountry = countries.find(country => country.sortname === value);
            if (selectedCountry) {
                fetchStates(selectedCountry.id);
                setNewLead({
                    ...newLead,
                    sender_country_iso: selectedCountry.sortname,
                    sender_country_id: selectedCountry.id,
                    sender_state: '', // Clear state when country changes
                });
            }
        } else {
            setNewLead({ ...newLead, [name]: newValue });
        }
        setErrors({ ...errors, [name]: false });
    };

    const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = e.target.value;
        const selectedCustomer = customerTableData.find(cust => cust.id.toString() === customerId);

        if (selectedCustomer) {
            setNewLead({
                ...newLead,
                sender_name: selectedCustomer.name,
                sender_mobile: selectedCustomer.contact_no || '',
                sender_email: selectedCustomer.email,
                sender_address: selectedCustomer.address,
                sender_city: selectedCustomer.city,
                sender_pincode: selectedCustomer.pin_code,
                sender_state: '',
                sender_company: selectedCustomer.name,
                sender_country_iso: selectedCustomer.country?.sortname || '',
                sender_country_id: selectedCustomer.country?.id || '',
                // query_product_name: '',
            });

            if (selectedCustomer.country?.id) {
                fetchStates(selectedCustomer.country.id);
            }
        }
    };

    const validateInputs = () => {
        const newErrors = { ...initialErrorState };
        let hasError = false;

        // Validate required fields
        for (const key in newLead) {
            const value = (newLead as any)[key];
            if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                (newErrors as any)[key] = true;
                hasError = true;
            }
        }

        // Validate email format
        if (!/.+@.+\..+/.test(newLead.sender_email)) {
            newErrors.sender_email = true;
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const [countries, setCountries] = useState<CountriesData[]>([]);
    const [states, setStates] = useState<CountriesData[]>([]);

    useEffect(() => {
        if (show) {
            const fetchCustomer = async () => {
                try {
                    const response = await axiosInstance.get('/customers'); // Replace with your API URL
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch data');
                    }
                    const data: CustomerDataType[] = await response.data;
                    setCustomerTableData(data);
                } catch (err: any) {
                    setError(err.message);
                }
            };
            const fetchCountries = async () => {
                try {
                    const response = await axiosInstance.get('/countryListing'); // Use your actual countries API
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch countries');
                    }
                    setCountries(response.data);
                } catch (err: any) {
                    setError(err.message);
                }
            };

            fetchCustomer();
            fetchCountries();
        }
    }, [show]);

   const handleSaveLead = async () => {
    console.log('Saving lead:', newLead);
    if (!validateInputs()) return;

    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    try {
        const response = await axiosInstance.post('/leads/qualified', newLead, {
            headers: {
                Authorization: `Bearer ${cleanToken}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Lead saved successfully:', response.data);

        Swal({
            icon: 'success', 
            title: 'Lead Saved',
            text: 'Your lead has been added successfully!'
        });

        if (onLeadAdded) onLeadAdded();
        handleClose();
    } catch (error: any) {
        console.error('Error saving lead:', error);

        const errorMessage = error?.response?.data?.message || 'Failed to save lead, The mobile number ${newLead.sender_mobile} is already registered';

        // Check if API returns specific duplicate mobile number message
        if (errorMessage.toLowerCase().includes('mobile') && errorMessage.toLowerCase().includes('already')) {
            Swal({
            icon: 'error',
            title: 'Duplicate Mobile Number',
            text: `The mobile number ${newLead.sender_mobile} is already registered.`
            });
        } else {
            Swal({
            icon: 'error',
            title: 'Error',
            text: errorMessage
            });
        }
    }
};


    const handleClose = () => {
        setNewLead(initialLeadState);
        setErrors(initialErrorState);
        onClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Lead</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>

                    <Row className="mt-3">
                        <Col md={12}>
                            <Form.Check
                                type="checkbox"
                                label="Take Customer from Sales"
                                checked={useCustomerFromSales}
                                onChange={() => setUseCustomerFromSales(!useCustomerFromSales)}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        {useCustomerFromSales ? (
                            <Col md={6}>
                                <Form.Group controlId="formSelectCustomer">
                                    <Form.Label>Select Customer</Form.Label>
                                    <Form.Select onChange={handleCustomerSelect} defaultValue="">
                                        <option value="" disabled>Select a customer</option>
                                        {customerTableData.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        ) : (
                            <Col md={6}>
                                <Form.Group controlId="formSenderName">
                                    <Form.Label>Customer Name<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="sender_name"
                                        placeholder="Enter sender's name"
                                        value={newLead.sender_name}
                                        onChange={handleInputChange}
                                    />
                                    {errors.sender_name && <Form.Text className="text-danger">please enter the name.</Form.Text>}

                                </Form.Group>
                            </Col>
                        )}
                        <Col md={6}>
                            <Form.Group controlId="formSenderMobile">
                                <Form.Label> Customer Mobile<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sender_mobile"
                                    placeholder="Enter mobile number"
                                    value={newLead.sender_mobile}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_mobile && <Form.Text className="text-danger">Please enter mobile number.</Form.Text>}

                            </Form.Group>
                        </Col>
                    </Row>


                    <Row className="mt-3">

                        <Col md={6}>
                            <Form.Group controlId="formSenderEmail">
                                <Form.Label>Customer Email<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    name="sender_email"
                                    placeholder="Enter email address"
                                    value={newLead.sender_email}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_email && <Form.Text className="text-danger">Please enter a valid email address.</Form.Text>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formSenderAddress">
                                <Form.Label>Customer Address<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sender_address"
                                    placeholder="Enter address"
                                    value={newLead.sender_address}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_address && <Form.Text className="text-danger">Please enter the address.</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={6}>
                            <Form.Group controlId="formSenderCity">
                                <Form.Label>Customer City<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sender_city"
                                    placeholder="Enter city"
                                    value={newLead.sender_city}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_city && <Form.Text className="text-danger">Please enter the city.</Form.Text>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formSenderPincode">
                                <Form.Label>Customer Pincode<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sender_pincode"
                                    placeholder="Enter pincode"
                                    value={newLead.sender_pincode}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_pincode && <Form.Text className="text-danger">Please enter pincode.</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-3">
{/* 
                        <Col md={6}>
                            <Form.Group controlId="formQueryProductName">
                                <Form.Label>Product Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="query_product_name"
                                    placeholder="Enter product name"
                                    value={newLead.query_product_name}
                                    onChange={handleInputChange}
                                />
                                {errors.query_product_name && <Form.Text className="text-danger">Please enter the product name.</Form.Text>}
                            </Form.Group>
                        </Col> */}
                        <Col md={6}>
                            <Form.Group controlId="formCompanyName">
                                <Form.Label>Company Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sender_company"
                                    placeholder="Enter company name"
                                    value={newLead.sender_company}
                                    onChange={handleInputChange}
                                />
                                {errors.sender_company && <Form.Text className="text-danger">Please enter the company name.</Form.Text>}
                            </Form.Group>
                        </Col>

                    </Row>

                    <Row className="mt-3">
                            <Col md={6}>
                            <Form.Group controlId="formCountry">
                                <Form.Label>Country<span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="sender_country_iso"
                                    value={newLead.sender_country_iso}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(country => (
                                        <option key={country.id} value={country.sortname}>
                                            {country.name} ({country.sortname})
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.sender_country_iso && <Form.Text className="text-danger">Please select a country.</Form.Text>}

                                {errors.sender_country_iso && <Form.Text className="text-danger">Please select a country.</Form.Text>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formSenderState">
                                <Form.Label>Customer State<span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="sender_state"
                                    value={newLead.sender_state}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select State</option>
                                    {states.map(state => (
                                        <option key={state.id} value={state.name}>
                                            {state.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors.sender_state && <Form.Text className="text-danger">Please select the state.</Form.Text>}
                            </Form.Group>
                        </Col>

                    

                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSaveLead}>
                    Save Lead
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddLeadForm;
