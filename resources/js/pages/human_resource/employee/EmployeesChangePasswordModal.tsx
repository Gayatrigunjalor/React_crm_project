import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { EmployeeListData } from './Employees';
import { ToastContainer, toast } from "react-toastify";

interface FormData {
    id?: number;
    new_password: string;
    confirm_password: string;
}

export interface EntityData {
    id: number;
    name: string;
}

interface EmployeesModalProps {
    userId: number;
    onHide: () => void;
    onSuccess: () => void;
}

const EmployeesChangePasswordModal: React.FC<EmployeesModalProps> = ({ userId, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, new_password: '', confirm_password: ''});
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions
    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch employees data for editing
            axiosInstance.get(`/editEmployeePassword`,{
                params: { id: userId }
            })
            .then(response => {
                setUserData({ ...custData, id: response.data});
            })
            .catch(error => console.error('Error fetching employees data:', error));
        }
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
        if(name === 'confirm_password' && custData.new_password == ''){
            toast('Add new password first!');
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

        if(custData.new_password !== custData.confirm_password){
            toast('Passwords doesn\'t match');
            setValidated(true);
            return;
        }
        setLoading(true);
        setValidated(true);
        const apiCall =  axiosInstance.post('/updateEmployeePassword', custData );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => {
            if (!error || !error.data) return "An unknown error occurred"

            // Collect all unique error messages
            const uniqueMessages = new Set<string>()

            Object.values(error.data).forEach((fieldErrors: any) => {
                if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((message) => uniqueMessages.add(message))
                }
            })

            // Convert to bulleted list
            const errorMsgs = Array.from(uniqueMessages)
                .map((message) => `• ${message}`)
                .join("\n")
            console.log(error);
            swal("Error!", errorMsgs, "error");
        })
        .finally(() => { setLoading(false); });
    };

    return (
        <>
            <Modal show onHide={onHide} size="sm" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{'Change Password'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group className="mb-3" controlId="new_password">
                                <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter new password" name="new_password" value={custData.new_password} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter new password.</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} className="mb-3" controlId="confirm_password">
                                <Form.Label>Confirm Password  <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Confirm password" name="confirm_password" value={custData.confirm_password} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please Re-enter password to confirm .</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">{isEditing ? 'Update' : 'Add'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default EmployeesChangePasswordModal;
