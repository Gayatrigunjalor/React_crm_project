import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    hsn_code: number;
}

const HsnCodeModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [hsnData, setHsnData] = useState<FormData>({ id: 0, hsn_code: 0 });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch hsnCode data for editing
            axiosInstance.get(`/hsn-code/${userId}`)
            .then(response => {
                setHsnData(response.data);
            })
            .catch(error => console.error('Error fetching HSN code data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHsnData({ ...hsnData, [name]: value });
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        if(hsnData.hsn_code.toString().length !== 8 || isNaN(hsnData.hsn_code)){
            alert("HSN must be exactly 8 digits. Only numbers will be accepted.");
            return;
        }

        setValidated(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/hsn-code/${hsnData.id}`,  {
                hsn_code: hsnData.hsn_code,
            })
            : axiosInstance.post('/hsn-code', hsnData);

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
                    <Modal.Title>{isEditing ? 'Edit HSN code' : 'Add HSN code'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={hsnData.id}
                        />
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>HSN code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter HSN code"
                                name="hsn_code"
                                value={hsnData.hsn_code}
                                onChange={handleChange}
                                minLength={8} // Set the minimum length
                                maxLength={8} // Set the maximum length
                                required
                            />
                            <Form.Control.Feedback type="invalid">Please enter 8 digits for HSN code.</Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
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

export default HsnCodeModal;
