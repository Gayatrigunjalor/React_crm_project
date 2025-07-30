import React, { useEffect, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    name: string;
}

const EntityTypeModal: React.FC<{ userId?: number; onHide: () => void; onSuccess: () => void }> = ({ userId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);


    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch entity-type data for editing
            axiosInstance.get(`/entity-type/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => console.error('Error fetching entity-type data:', error));
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
            ? axiosInstance.put(`/entity-type/${custData.id}`,  {
                name: custData.name,
            })
            : axiosInstance.post('/entity-type', custData);

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => console.error('Error saving entity-type data:', error));
    };

    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Entity Type' : 'Add Entity Type'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={custData.id}
                        />
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter entity type"
                                name="name"
                                value={custData.name}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Please enter entity type name.</Form.Control.Feedback>
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

export default EntityTypeModal;
