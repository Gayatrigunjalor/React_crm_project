import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';

interface FormData {
    id?: number;
    name: string;
    segment_id: number;
    description: string;
}
// Define the component props, ensuring segmentData is typed as SegmentDataType[]
interface CategoryModalProps {
    userId?: number;
    segmentData: SegmentDataType[]; // Correctly define segmentData as an array of SegmentDataType
    onHide: () => void;
    onSuccess: () => void;
}
export interface SegmentDataType {
    id: number;
    name: string;
};
const CategoryModal: React.FC<CategoryModalProps> = ({ userId, segmentData, onHide, onSuccess }) => {
    const [categoryData, setCategoryData] = useState<FormData>({ id: 0, name: '', segment_id: 0, description: '' });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);


    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch category data for editing
            axiosInstance.get(`/category/${userId}`)
            .then(response => {
                setCategoryData(response.data);
            })
            .catch(error => console.error('Error fetching category data:', error));
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
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
            ? axiosInstance.put(`/category/${categoryData.id}`,  {
                name: categoryData.name,
                segment_id: categoryData.segment_id,
                description: categoryData.description,
            })
            : axiosInstance.post('/category', categoryData);

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => console.error('Error saving category data:', error));
    };

    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Category' : 'Add Category'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control
                            type="hidden"
                            name="id"
                            value={categoryData.id}
                        />
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category"
                                name="name"
                                value={categoryData.name}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">Please enter category name.</Form.Control.Feedback>
                            <Form.Control.Feedback></Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="segment_id">
                            <Form.Label>Segment <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="segment_id"
                                value={categoryData.segment_id}
                                onChange={handleChange}
                                required
                                aria-label="Default select example"
                            >
                                <option>Please select segment</option>
                                {segmentData.map((option: SegmentDataType) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please enter category name.</Form.Control.Feedback>
                            <Form.Control.Feedback></Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control as="textarea" name="description" value={categoryData.description} rows={3} onChange={handleChange} placeholder="Description" required />
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

export default CategoryModal;
