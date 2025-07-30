import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';

interface FormData {
    id?: number;
    name: string;
    vender_type_id: string;
    employee_name: string;
    entity_type_id: string;
    segment_id: string;
    address: string;
    phone: string;
    vendor_behavior_id: string;
    contact_person: string;
    contact_person_number: string;
    designation: string;
    email: string;
    country_id: string;
    state_id: StateData[];
    city: string;
    pin_code: string;
    website: string;
    rating: number;
    collaboration_interest: string;
}

export interface EntityData {
    id: number;
    name: string;
}

export interface CountryData {
    id: number;
    name: string;
    sortname: string;
    phonecode: number;
}

export interface StateData {
    id: number;
    name: string;
    country_id: number;
}
interface VendorsModalProps {
    userId?: number;
    entityTypeData: EntityData[]; // Correctly define segmentData as an array of SegmentDataType
    segmentsData: EntityData[];
    vendorBehaviorsData: EntityData[];
    vendorTypesData: EntityData[];
    countriesData: CountryData[];
    onHide: () => void;
    onSuccess: () => void;
}

const VendorsModal: React.FC<VendorsModalProps> = ({ userId, onHide, onSuccess, entityTypeData, segmentsData, vendorBehaviorsData, vendorTypesData, countriesData }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', vender_type_id: '', employee_name: '', entity_type_id: '', segment_id: '', address: '', phone: '', vendor_behavior_id: '', contact_person: '', contact_person_number: '', designation: '', email: '', country_id: '', state_id: [], city: '', pin_code: '', website: '', rating: 0,
        collaboration_interest: '1' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [stateData, setStateData] = useState([]);
    const { empData } = useAuth(); //check userRole & permissions
    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch vendors data for editing
            axiosInstance.get(`/vendors/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching vendors data:', error));
        }
    }, [userId]);

    const handleRSelect = (selectedOption: { value: string; label: string } | null, name: string) => {
        if (selectedOption) {
            setUserData({ ...custData, [name]: selectedOption.value });
        } else {
            setUserData({ ...custData, [name]: null });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
        if(name == 'country_id' && value != ""){
            axiosInstance.get(`/getStatesByName?country_id=${value}`)
            .then(response => {
                setStateData(response.data);
            });
        }
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }

        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/vendors/${custData.id}`,  {
                name: custData.name,
                vender_type_id: custData.vender_type_id,
                entity_type_id: custData.entity_type_id,
                segment_id: custData.segment_id,
                address: custData.address,
                country_id: custData.country_id,
                state_id: custData.state_id,
                city: custData.city,
                pin_code: custData.pin_code,
                phone: custData.phone,
                website: custData.website,
                vendor_behavior_id: custData.vendor_behavior_id,
                rating: custData.rating,
                contact_person: custData.contact_person,
                contact_person_number: custData.contact_person_number,
                designation: custData.designation,
                email: custData.email,
                collaboration_interest: custData.collaboration_interest,
            })
            : axiosInstance.post('/vendors', {
                    ...custData,
                    employee_name: empData.name
                }
            );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"));
    };

    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Vendors' : 'Add Vendors'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />

                        <Row className="mb-3 g-3">
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Vendor Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Vendor name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter vendor name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="vender_type_id">
                                <Form.Label>Vendor Type <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="vender_type_id" value={custData.vender_type_id} onChange={handleSelectChange}>
                                    <option value="">Choose vendor type</option>
                                    {vendorTypesData.map((option: EntityData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Vendor Type</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="employee_name">
                                <Form.Label>PVV Head</Form.Label>
                                <Form.Control type="text" name="employee_name" value={custData.employee_name ? custData.employee_name : empData.name} readOnly style={{backgroundColor: 'whitesmoke'}} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="entity_type_id">
                                <Form.Label>Entity Type <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="entity_type_id" value={custData.entity_type_id} onChange={handleSelectChange} required>
                                    <option value="">Choose entity type</option>
                                    {entityTypeData.map((option: EntityData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter entity type</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {segmentsData.map((option: EntityData) => (
                                        { value: option.name, label: option.name }
                                    ))}
                                    placeholder="Choose segment" name="segment_id" value={custData.segment_id ? { value: custData.segment_id, label: custData.segment_id } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'segment_id')} required
                                />
                                <Form.Control.Feedback type="invalid">Please enter segment</Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="address" name="address" value={custData.address} onChange={handleChange} required/>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="country_id">
                                <Form.Label>Country </Form.Label>
                                <Form.Select name="country_id" value={custData.country_id} onChange={handleSelectChange}>
                                    <option value="">Select Country</option>
                                    {countriesData.map((option: CountryData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter country</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state_id">
                                <Form.Label>State </Form.Label>
                                <Form.Select name="state_id" value={custData.state_id} onChange={handleSelectChange}>
                                    <option value="">Select State</option>
                                    {stateData.map((option: StateData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter state</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="city">
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" placeholder="City" name="city" value={custData.city ? custData.city : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter city</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="pin_code">
                                <Form.Label>Pin Code</Form.Label>
                                <Form.Control type="text" placeholder="Pincode" name="pin_code" value={custData.pin_code} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter pincode.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="phone">
                                <Form.Label>Phone  <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Phone" name="phone" value={custData.phone} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter vendor name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="website">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" placeholder="Website" name="website" value={custData.website} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter website.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="vendor_behavior_id">
                                <Form.Label>Vendor Behaviour </Form.Label>
                                <Form.Select name="vendor_behavior_id" value={custData.vendor_behavior_id} onChange={handleSelectChange}>
                                    <option value="">Select Vendor Behaviour</option>
                                    {vendorBehaviorsData.map((option: EntityData) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter vendor behaviour</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="rating">
                                <Form.Label>Rating </Form.Label>
                                <Form.Select name="rating" value={custData.rating} onChange={handleSelectChange}>
                                    <option value="">Select Rating</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter rating</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person">
                                <Form.Label>Contact Person <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Contact Person.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="contact_person_number">
                                <Form.Label>Contact Person Number<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Contact Person Number" name="contact_person_number" value={custData.contact_person_number} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter Contact Person.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="designation">
                                <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter designation.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter email.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} sm={4} className="mb-3">
                                <Form.Label>Collabration Interest</Form.Label>
                                <ReactSelect
                                    options={[
                                        { value: '1', label: '1' },
                                        { value: '2', label: '2' },
                                        { value: '3', label: '3' },
                                        { value: '4', label: '4' },
                                        { value: '5', label: '5' }
                                    ]}
                                    placeholder="Select collabration interest" name="collaboration_interest" value={custData.collaboration_interest ? { value: custData.collaboration_interest, label: custData.collaboration_interest } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'collaboration_interest')}
                                />
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default VendorsModal;
