import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import Button from '../../components/base/Button';
import axiosInstance from '../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../AuthContext';

interface FormData {
    id: number;
    company_name: string;
    services: string;
    address: string;
    company_email: string;
    website: string;
    current_status: string;
    business_card: File | null;
    any_disputes: string;
    contact_person: string;
    designation: string;
    contact_number: string;
    email: string;
    alternate_contact_number: string;
    brand_name: string;
    collaboration_interest: string;
}

interface DirectoryModalProps {
    dirId?: number;
    viewPurpose: boolean;
    onHide: () => void;
    onSuccess: () => void;
}

const DirectoryModal: React.FC<DirectoryModalProps> = ({ dirId, viewPurpose, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        id: 0,
        company_name: '',
        services: 'Products',
        address: '',
        company_email: '',
        website: '',
        current_status: 'In Service',
        business_card: null,
        any_disputes: '',
        contact_person: '',
        designation: '',
        contact_number: '',
        email: '',
        alternate_contact_number: '',
        brand_name: '',
        collaboration_interest: ''

    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ files?: string }>({});
    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {

        if (dirId) {
            setIsEditing(true);
            // Fetch customer data for editing
            axiosInstance.get(`/directories/${dirId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching customer data:', error));
        }
    }, [dirId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    // Handler function for the file input change event
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setUserData({ ...custData, business_card: file });
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

        const apiCall = isEditing
            ? axiosInstance.post(`/updateDirectories`,  {
                ...custData
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            : axiosInstance.post('/directories', {
                ...custData
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    return (
        <>
            <Modal show onHide={onHide} size='xl' backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? `Edit Directory : ${custData.id}` : `Add Directory`} </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />

                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="company_name">
                                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter Company Name" name="company_name" value={custData.company_name} onChange={handleChange} required disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please Enter Company Name</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="services">
                                <Form.Label>Products Or Services Or Both<span className="text-danger">*</span></Form.Label>
                                <Form.Select name="services" value={custData.services} onChange={handleSelectChange} disabled={viewPurpose}>
                                    <option value="Products">Products</option>
                                    <option value="Services">Services</option>
                                    <option value="Both">Both</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter services</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row  className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Enter address" name="address" value={custData.address} onChange={handleChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter address.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="brand_name">
                                <Form.Label>Brand Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="brand_name" placeholder='Brand Name' value={custData.brand_name} onChange={handleChange} required disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Brand name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="company_email">
                                <Form.Label>Company Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Company Email" name="company_email" value={custData.company_email} onChange={handleChange} required disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Company Email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="website">
                                <Form.Label>Website</Form.Label>
                                <Form.Control type="text" placeholder="Website" name="website" value={custData.website} onChange={handleChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Website.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3 px-4">
                            <Form.Group as={Col} className="mb-3" controlId="current_status">
                                <Form.Label>Current Status</Form.Label>
                                <Form.Select name="current_status" value={custData.current_status} onChange={handleSelectChange} disabled={viewPurpose}>
                                    <option value="In Service">In Service</option>
                                    <option value="Blacklisted">Blacklisted</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="business_card">
                                <Form.Label>Business Card</Form.Label>
                                <Form.Control type="file" name='business_card' onChange={handleFileChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Business card.</Form.Control.Feedback>
                                {(isEditing || viewPurpose) && (
                                    <span className='text-danger py-2'>{(custData.business_card != null) ? String(custData.business_card) : 'N/A'}</span>
                                )}
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-4'>
                            <Form.Group as={Col} className="mb-3" controlId="any_disputes">
                                <Form.Label>Any Disputes</Form.Label>
                                <Form.Control type="text" placeholder="Any Disputes" name="any_disputes" value={custData.any_disputes} onChange={handleChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Any Disputes.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="contact_person">
                                <Form.Label>Contact Person</Form.Label>
                                <Form.Control type="text" placeholder="Contact Person" name="contact_person" value={custData.contact_person} onChange={handleChange} required disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Any Disputes.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-4'>
                            <Form.Group as={Col} className="mb-3" controlId="contact_number">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control type="number" placeholder="Contact Number" name="contact_number" value={custData.contact_number} onChange={handleChange} minLength={10} maxLength={20} required disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Contact Number.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="designation">
                                <Form.Label>Designation</Form.Label>
                                <Form.Control type="text" placeholder="Designation" name="designation" value={custData.designation} onChange={handleChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Designation.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className='g-3 px-4'>
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="text" placeholder="Email" name="email" value={custData.email} onChange={handleChange} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="alternate_contact_number">
                                <Form.Label>Alternate Contact No</Form.Label>
                                <Form.Control type="number" placeholder="Alternate Contact No" name="alternate_contact_number" value={custData.alternate_contact_number} onChange={handleChange} minLength={10} maxLength={20} disabled={viewPurpose}/>
                                <Form.Control.Feedback type="invalid">Please enter Alternate Contact No.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className='g-3 px-4'>
                            <Form.Group as={Col} className="mb-3 col-md-6" controlId="collaboration_interest">
                                <Form.Label>Collabration Interest</Form.Label>
                                <Form.Select name="collaboration_interest" value={custData.collaboration_interest} onChange={handleSelectChange} disabled={viewPurpose}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        {!viewPurpose && (
                            <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default DirectoryModal;
