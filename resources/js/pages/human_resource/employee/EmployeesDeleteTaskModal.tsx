import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import { ToastContainer, toast } from "react-toastify";

interface FormData {
    user_id: number;
    delete_emp_tasks: number | undefined;
    month_from: string;
    month_to: string;
}

interface EmployeesModalProps {
    userId: number;
    userName: string;
    onHide: () => void;
    onSuccess: () => void;
}

const EmployeesDeleteTaskModal: React.FC<EmployeesModalProps> = ({ userId, userName, onHide, onSuccess }) => {
    const [custData, setUserData] = useState<FormData>({
        user_id: 0,
        delete_emp_tasks: undefined,
        month_from: '',
        month_to: '',
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions

    useEffect(() => {
        setUserData({...custData, user_id: userId});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };

    const handleInspectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserData({
            ...custData,
            [name]: value === "1" ? 1 : 0
        });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if(custData.delete_emp_tasks === undefined){
            toast.error('Select radio control before updating');
            setValidated(true);
            return;
        }
        if(custData.delete_emp_tasks === 0){
            const minDate = '2022-12'; // Minimum allowed date
            if (custData.month_from <= minDate) {
                toast.error("Selected month from must be greater than the Dec 2023.");
                setValidated(true);
                return;
            }
            if (custData.month_to <= minDate) {
                toast.error("Selected month to must be greater than the Dec 2023.");
                setValidated(true);
                return;
            }
        }
        setLoading(true);
        setValidated(true);
        const apiCall = axiosInstance.post('/deleteEmployeeTasks', custData );

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
                    <Modal.Title>Delete Project Navigator Task's for {userName}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Control type="hidden" name="user_id" value={custData.user_id} />
                    <Modal.Body>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Label>Delete employee's tasks <span className="text-danger">*</span></Form.Label>
                                <Form.Check type="radio" id="inspection-yes" label="All tasks" name="delete_emp_tasks" value="1" checked={custData.delete_emp_tasks === 1} onChange={handleInspectionChange} />
                                <Form.Check type="radio" id="inspection-no" label="Select month" name="delete_emp_tasks" value="0" checked={custData.delete_emp_tasks === 0} onChange={handleInspectionChange} />
                            </Col>
                            <hr />
                            {custData.delete_emp_tasks === 0 && (
                                <>
                                    <Col md={4}>
                                        <Form.Group as={Col} className="mb-3" controlId="month_from">
                                            <Form.Label>Select Month From <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="month" name="month_from" value={custData.month_from} min={'12-2022'} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please select month from.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group as={Col} className="mb-3" controlId="month_to">
                                            <Form.Label>Select Month To <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="month" name="month_to" value={custData.month_to} min={'12-2022'} onChange={handleChange} required />
                                            <Form.Control.Feedback type="invalid">Please select month to.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                            {custData.delete_emp_tasks === 1 && (
                                <>
                                <Col md={12} className="mt-3">
                                    <h5>Employee's all task will be deleted</h5>
                                </Col>
                                </>
                            )}
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
            <ToastContainer className='py-0' />
        </>
    );
};

export default EmployeesDeleteTaskModal;
