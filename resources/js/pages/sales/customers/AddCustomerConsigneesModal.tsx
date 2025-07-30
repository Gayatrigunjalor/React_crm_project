import { faCirclePlus, faEdit, faTrash, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { CountriesData } from './Customers';
import ReactSelect from '../../../components/base/ReactSelect';
import { useNavigate } from 'react-router-dom';

interface Params {
    customerId: number;
}

interface CustomerData {
    id: number;
    name: string;
    cust_id: string;
}

export interface ConsigneeData {
    id: number;
    name: string;
    contact_person: string;
    customer_id: number;
    mobile: string;
    email: string;
    designation: string;
    address: string;
    city: string;
    pin_code: number;
    country: number;
    state: number;
}

interface CustomerConsigneesModalProps {
    id: number;
    onHide: () => void;
    leadId?: string;
    cusId?: string;
}

interface FormData {
    id?: number;
    name: string;
    cust_id: string;
    contact_person: string;
    phone: string;
    contact_no: string;
    email: string;
    designation: string;
    address: string;
    city: string;
    pin_code: string;
    country: number;
    country_name: {
        id: number;
        name: string;
    } | null
    state: number;
    state_name: {
        id: number;
        name: string;
    } | null
}

const AddCustomerConsigneesModal: React.FC<CustomerConsigneesModalProps> = ({ id, onHide, leadId, cusId }) => {
    console.log('customer_id', cusId);
    console.log('leadId', leadId);
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        name: '',
        cust_id: '',
        contact_person: '',
        phone: '',
        contact_no: '',
        email: '',
        designation: '',
        address: '',
        city: '',
        pin_code: '',
        country: 0,
        country_name: null,
        state: 0,
        state_name: null
    });

    const [originalCustomerData, setOriginalCustomerData] = useState<FormData | null>(null);
    const [validated, setValidated] = useState<boolean>(false);
    const [stateData, setStateData] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [countriesData, setCountriesData] = useState<CountriesData[]>([]);
    const [loading, setLoading] = useState(false);
    const [sameAsCustomer, setSameAsCustomer] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axiosInstance.get(`/customers/${id}`);
                if (response.status !== 200) throw new Error('Failed to fetch customer');
                setOriginalCustomerData(response.data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCustomer();
    }, [id]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axiosInstance.get('/countryListing');
                if (response.status !== 200) throw new Error('Failed to fetch countries');
                setCountriesData(response.data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if (fieldName === 'state_name') {
                setUserData({
                    ...custData,
                    state_name: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    },
                    state: selectedOption.value
                });
            }
            if (fieldName === 'country_name') {
                setUserData({
                    ...custData,
                    country_name: {
                        id: selectedOption.value,
                        name: selectedOption.label
                    },
                    country: selectedOption.value,
                    state_name: null, state: 0
                });
                axiosInstance.get(`/getStates?country_id=${selectedOption.value}`)
                    .then(response => {
                        setStateData(response.data);
                    });
            }
        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };

    const handleSameAsCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSameAsCustomer(isChecked);

        if (isChecked && originalCustomerData) {
            setUserData(prev => ({
                ...prev,
                name: originalCustomerData.name || '',
                contact_person: originalCustomerData.contact_person || '',
                phone: originalCustomerData.phone || '',
                contact_no: originalCustomerData.contact_no || '',
                email: originalCustomerData.email || '',
                designation: originalCustomerData.designation || '',
                address: originalCustomerData.address || '',
                city: originalCustomerData.city || '',
                pin_code: originalCustomerData.pin_code || ''
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                name: '',
                contact_person: '',
                phone: '',
                contact_no: '',
                email: '',
                designation: '',
                address: '',
                city: '',
                pin_code: ''
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);

        axiosInstance.post('/consignees', {
            ...custData,
            mobile: custData.contact_no,
            customer_id: id
        })
            .then((response) => {
                swal("Success!", response.data.message, "success");
                navigate(`/sales/quotations/create/0/${leadId}/${cusId}`);
            })
            .catch(error => swal("Error!", error.response?.data?.message || "Something went wrong", "error"))
            .finally(() => { setLoading(false); });
    };

    return (
        <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add Customer Consignee</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Control type="hidden" name="id" value={custData.id} />
                    <h5 className="mb-3"> Customer Name : {originalCustomerData?.name} ({originalCustomerData?.cust_id})</h5>

                    <Form.Group controlId="sameAsCustomerCheckbox" className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Same as Customer"
                            checked={sameAsCustomer}
                            onChange={handleSameAsCustomerChange}
                        />
                    </Form.Group>

                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="name">
                            <Form.Label>Name <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Name" name="name" value={custData.name} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter name.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="contact_person">
                            <Form.Label>Contact Person <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter contact person.</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="address">
                            <Form.Label>Address</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Address" name="address" value={custData.address} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter address.</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="city">
                            <Form.Label>City <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="City" name="city" value={custData.city} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter city.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="pin_code">
                            <Form.Label>Pincode</Form.Label>
                            <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code} onChange={handleChange} maxLength={12} required />
                            <Form.Control.Feedback type="invalid">Please enter pincode.</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="mobile">
                            <Form.Label>Mobile <span className="danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Mobile"
                                name="contact_no"
                                value={custData.contact_no}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Please enter mobile.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="email">
                            <Form.Label>Email <span className="danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                        </Form.Group>
                    </Row>

                    <Row className="g-3">
                        <Form.Group as={Col} className="mb-3" controlId="country_name">
                            <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options={countriesData.map((option: CountriesData) => (
                                    { value: option.id, label: option.name }
                                ))}
                                placeholder="Select Country" name="country_name"
                                value={custData.country_name ? { value: custData.country_name.id, label: custData.country_name.name } : null}
                                onChange={(selectedOption) => handleRSelect(selectedOption, 'country_name')}
                                required
                            />
                            <Form.Control type="hidden" name="country" value={custData.country} />
                            {validated && !custData.country && (
                                <div className="invalid-feedback d-block">Please enter country</div>
                            )}
                        </Form.Group>
                        <Form.Group as={Col} className="mb-3" controlId="state_name">
                            <Form.Label>State <span className="text-danger">*</span></Form.Label>
                            <ReactSelect
                                options={stateData.map((option: CountriesData) => (
                                    { value: option.id, label: option.name }
                                ))}
                                placeholder="Select State" name="state_name"
                                value={custData.state_name ? { value: custData.state_name.id, label: custData.state_name.name } : null}
                                onChange={(selectedOption) => handleRSelect(selectedOption, 'state_name')}
                                required
                            />
                            <Form.Control type="hidden" name="state" value={custData.state} />
                            {validated && !custData.state && (
                                <div className="invalid-feedback d-block">Please enter state</div>
                            )}
                        </Form.Group>
                    </Row>

                    <Form.Group className="mb-3" controlId="designation">
                        <Form.Label>Designation <span className="danger">*</span></Form.Label>
                        <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} required />
                        <Form.Control.Feedback type="invalid">Please enter designation.</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                    <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Add</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddCustomerConsigneesModal;
