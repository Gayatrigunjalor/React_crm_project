import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { ToastContainer, toast } from "react-toastify";

interface FormData {
    id?: number;
    order: string;
    terms_and_conditions: string;
}

const TermsConditionModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, order: '0', terms_and_conditions:'' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch designation data for editing
            axiosInstance.get(`/terms-and-conditions/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching designation data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
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

        if(custData.order == '0'){
            setValidated(true);
            toast('Please select Order');
            return;
        }

        setValidated(true);
        setLoading(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/terms-and-conditions/${custData.id}`,  {
                order: custData.order,
                terms_and_conditions: custData.terms_and_conditions,
            })
            : axiosInstance.post('/terms-and-conditions', custData);

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
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Designation' : 'Add Designation'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={custData.id}
                        />
                        <Form.Group as={Col} className="mb-3" controlId="order">
                            <Form.Label>Order <span className="text-danger">*</span></Form.Label>
                            <Form.Select name="order" value={custData.order} onChange={handleChange}>
                                <option value="0">Select Order Name</option>
                                <option value="Domestic Purchase Order">Domestic Purchase Order</option>
                                <option value="International Purchase Order">International Purchase Order</option>
                                <option value="Domestic Proforma Invoice">Domestic Proforma Invoice</option>
                                <option value="International Proforma Invoice">International Proforma Invoice</option>
                                <option value="International Sales Invoice">International Sales Invoice</option>
                                <option value="FFD Purchase Order">FFD Purchase Order</option>
                                <option value="Service Purchase Order">Service Purchase Order</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please enter Order</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId={`terms_and_conditions`}>
                            <Form.Label>Terms And Conditions <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" rows={10} placeholder="Terms And Conditions" name="terms_and_conditions" value={custData.terms_and_conditions} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter Terms And Conditions.</Form.Control.Feedback>
                        </Form.Group>
                            
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <ToastContainer className='py-0' />
        </>
    );
};

export default TermsConditionModal;
