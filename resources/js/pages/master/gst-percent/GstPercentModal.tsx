import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    percent: number;
}

const GstPercentModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [gstData, setGstData] = useState<FormData>({ id: 0, percent: 0 });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);

    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch gstPercent data for editing
            axiosInstance.get(`/gst-percent/${userId}`)
            .then(response => {
                setGstData(response.data);
            })
            .catch(error => console.error('Error fetching gst-percent data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGstData({ ...gstData, [name]: value });
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
            ? axiosInstance.put(`/gst-percent/${gstData.id}`,  {
                percent: gstData.percent,
            })
            : axiosInstance.post('/gst-percent', gstData);

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
                    <Modal.Title>{isEditing ? 'Edit Gst Percent' : 'Add Gst Percent'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={gstData.id}
                        />
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>Gst Percent (numbers only without % sign)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter gst-percent"
                                name="percent"
                                value={gstData.percent}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Please enter Gst Percent.</Form.Control.Feedback>
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

export default GstPercentModal;
