import React, { useEffect, useState } from 'react';
import { Form, Modal, Row, Col } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    website_name?: string;
    website_fxn?: string;
    username?: string;
    email_regd?: string;
    phone_regd?: string;
    mfa_by?: string;
    subscription_type?: string;
    purchase_date?: string;
    renew_date?: string;
}

const CredentialsModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [credentialData, setCredentialData] = useState<FormData>({ id: 0, website_name: '', website_fxn: '', username: '', email_regd: '', phone_regd: '', mfa_by: '', subscription_type: '', purchase_date: '', renew_date: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);


    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch credentials data for editing
            axiosInstance.get(`/credentials/${userId}`)
            .then(response => {
                setCredentialData(response.data);
            })
            .catch(error => console.error('Error fetching credentials data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialData({ ...credentialData, [name]: value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCredentialData({ ...credentialData, [name]: value });
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
            ? axiosInstance.put(`/credentials/${credentialData.id}`,  {
                website_name: credentialData.website_name,
                website_fxn: credentialData.website_fxn,
                username: credentialData.username,
                email_regd: credentialData.email_regd,
                phone_regd: credentialData.phone_regd,
                mfa_by: credentialData.mfa_by,
                subscription_type: credentialData.subscription_type,
                purchase_date: credentialData.purchase_date,
                renew_date: credentialData.renew_date,
            })
            : axiosInstance.post('/credentials', credentialData);

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
                    <Modal.Title>{isEditing ? 'Edit Credential' : 'Add Credential'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={credentialData.id} />
                        <Form.Group className="mb-3" controlId="website_name">
                            <Form.Label>Website Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Website Name" name="website_name" value={credentialData.website_name} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter website name.</Form.Control.Feedback>
                        </Form.Group>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="website_fxn">
                                <Form.Label>Website Functioning</Form.Label>
                                <Form.Control type="text" placeholder="Website Functioning / Website used for" name="website_fxn" value={credentialData.website_fxn ? credentialData.website_fxn : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter website functioning.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="username">
                                <Form.Label>Username / Login ID</Form.Label>
                                <Form.Control type="text" placeholder="Username/loginId" name="username" value={credentialData.username ? credentialData.username : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter username/loginId.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="email_regd">
                                <Form.Label>Registered Email</Form.Label>
                                <Form.Control type="text" placeholder="Registered email" name="email_regd" value={credentialData.email_regd ? credentialData.email_regd : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter registered email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="phone_regd">
                                <Form.Label>Registered Phone</Form.Label>
                                <Form.Control type="text" placeholder="Registered phone" name="phone_regd" value={credentialData.phone_regd ? credentialData.phone_regd : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter registered phone</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="mfa_by">
                                <Form.Label>MFA By</Form.Label>
                                <Form.Control type="text" placeholder="Multifactor Authentication" name="mfa_by" value={credentialData.mfa_by ? credentialData.mfa_by : ''} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">Please enter multifactor authentication.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="subscription_type">
                                <Form.Label>Subscription Type</Form.Label>
                                <Form.Select name="subscription_type" value={credentialData.subscription_type} onChange={handleSelectChange}>
                                    <option value="">Choose subscription type</option>
                                    <option value="One time purchase">One time purchase</option>
                                    <option value="Own">Own</option>
                                    <option value="Free">Free</option>
                                    <option value="Per user/ per month">Per user/ per month</option>
                                    <option value="Monthly renewal">Monthly renewal</option>
                                    <option value="Yearly renewal">Yearly renewal</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter subscription_type</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="purchase_date">
                                <Form.Label>Purchase Date</Form.Label>
                                <Form.Control type="date" name="purchase_date" value={credentialData.purchase_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter purchase date</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="renew_date">
                                <Form.Label>Renewal Date</Form.Label>
                                <Form.Control type="date" name="renew_date" value={credentialData.renew_date} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter renewal date</Form.Control.Feedback>
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

export default CredentialsModal;
