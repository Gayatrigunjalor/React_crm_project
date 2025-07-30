import React, { useEffect, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    warehouse_name: string;
    rack_number: string;
    floor: string;
}

const LocationDetailModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0,
        warehouse_name: '',
        rack_number: '',
        floor: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);


    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch location-detail data for editing
            axiosInstance.get(`/location-detail/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching Location Detail data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
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
            ? axiosInstance.put(`/location-detail/${custData.id}`,  {
                id: custData.id,
                warehouse_name: custData.warehouse_name,
                rack_number: custData.rack_number,
                floor: custData.floor,
            })
            : axiosInstance.post('/location-detail', custData);

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => console.error('Error saving Location Detail data:', error));
    };

    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Location Detail' : 'Add Location Detail'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={custData.id}
                        />
                        <Form.Group className="mb-3" controlId="warehouse_name">
                            <Form.Label>Warehouse Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Warehouse Name" name="warehouse_name" value={custData.warehouse_name} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter Warehouse Name.</Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="rack_number">
                            <Form.Label>Rack Number <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Rack Number" name="rack_number" value={custData.rack_number} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter Rack Number.</Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="floor">
                            <Form.Label>Floor <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Floor" name="floor" value={custData.floor} onChange={handleChange} required />
                            <Form.Control.Feedback type="invalid">Please enter Floor.</Form.Control.Feedback>
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit">{isEditing ? 'Update' : 'Add '}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default LocationDetailModal;
