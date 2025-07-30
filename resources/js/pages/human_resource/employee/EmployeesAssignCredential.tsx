import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row, Card } from 'react-bootstrap';
import { faPlus, faCaretLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { EmployeeListData } from './Employees';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from 'react-router-dom';

interface FormData {
    id?: number;
    name: string;
}
interface CredentialFormData {
    id?: number;
    cred: { id: number; name: string; } | null;
    credential_id: number;
    remarks: string;
}

export interface CredListingData {
    id: number;
    cred_id: string;
    website_name: string;
    website_fxn: string;
    username: string;
    mfa_by: string;
}
interface CredentialsData {
    id: number;
    cred_id: string;
    website_name: string;
    website_fxn: string;
    username: string;
    mfa_by: string;
    email_regd: string;
    subscription_type: string;
    assigned_date: string;
}

const EmployeesAssignCredential = () => {
    const {empId} = useParams();
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '' });
    const [credentialFormData, setCredentialFormData] = useState<CredentialFormData>({ id: 0, cred: null, credential_id: 0, remarks: '' });
    const [credListingData, setCredListingData] = useState<CredListingData[]>([]);
    const [empCredentialsData, setEmpCredentialsData] = useState<CredentialsData[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();


    const handleShow = () => {
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    useEffect(() => {
        if (empId) {
            setIsEditing(true);
            // Fetch employees data for editing
            axiosInstance.get(`/credential/list_credential/${empId}`)
            .then(response => {
                setUserData({ ...custData, id: response.data.id, name: response.data.name });
            })
            .catch(error => console.error('Error fetching employees data:', error));
        } else {
            console.log('Incorrect Emp Id');

        }
    }, []);

    useEffect(() => {
        const fetchUnassignedCred = async () => {
            try {
                const response = await axiosInstance.get(`/fetchUnassignedCredential`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CredListingData[] = response.data;
                setCredListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };

        const fetchEmployeeCredentialsData = async () => {
            try {
                const response = await axiosInstance.get(`/fetchAssignedCredentialToEmp`,{
                    params: { emp_id: empId }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: CredentialsData[] = response.data;
                setEmpCredentialsData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchUnassignedCred();
        fetchEmployeeCredentialsData();
    }, [refreshData]);

    const handleEmployeeList = () => {
        navigate('/employees');
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
        setCredentialFormData({id: 0, cred: null, credential_id: 0, remarks: ''});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialFormData({ ...credentialFormData, [name]: value });
    };

    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setCredentialFormData(prev => ({
                ...prev,
                cred: { id: selectedOption.value, name: selectedOption.label },
                credential_id: selectedOption.value
            }));
        }
    };

    const handleUnassignCredentials = (contactId: number) => {
        swal({
            title: "Are you sure?",
            text: "Once unassigned, you will not be able to recover this record!",
            icon: "warning",
            buttons: {
                confirm: {
                    text: "Unassign",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                },
                cancel: {
                    text: "Cancel",
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true,
                }
            },
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                axiosInstance.post(`/unAssignCredential`, {
                    id: contactId
                })
                .then(response => {
                    swal("Success!", response.data.message, "success");
                    handleSuccess();
                })
                .catch(error => {
                    swal("Error!", error.data.message, "error");
                });
            } else {
                swal("Your record is safe!");
            }
        });
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
        const apiCall =  axiosInstance.post('/assignCredentialsToEmployee', {
            employee_id: empId,
            ...credentialFormData
        } );

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            handleSuccess();
            handleClose();
        })
        .catch(error => {

            swal("Error!", error.data.message, "error");
        })
        .finally(() => { setLoading(false); });
    };

    return (
        <>
            <Row>
                <Col><h3 className='px-4 mb-4'>Credentials</h3></Col>
            </Row>
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col className="d-flex gap-3 justify-content-end mb-2">
                            <Button size='sm' variant="info" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleShow()}>Assign Credential</Button>
                            <Button size='sm' variant="primary" className="" startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />} onClick={() => handleEmployeeList()}>Employee List</Button>
                        </Col>
                    </Row>
                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col className="d-flex justify-content-center mb-2">
                            <h5>Employee Name : {custData.name}</h5>
                        </Col>
                    </Row>

                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col md={12} style={{ overflowX: 'auto', width: '100%' }}>
                            <table className='fs-8 table striped bordered mb-4'>
                                <thead>
                                    <tr>
                                        <th className='p-2 border border-secondary'>Credential Id</th>
                                        <th className='p-2 border border-secondary'>Website Name</th>
                                        <th className='p-2 border border-secondary'>Website Functioning</th>
                                        <th className='p-2 border border-secondary'>Username</th>
                                        <th className='p-2 border border-secondary'>Reg. Email</th>
                                        <th className='p-2 border border-secondary' title="Multi Factor Authentication">MFA</th>
                                        <th className='p-2 border border-secondary'>Subscription Type</th>
                                        <th className='p-2 border border-secondary'>Assigned Date</th>
                                        <th className='p-2 border border-secondary' data-orderable="false">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empCredentialsData.length > 0 ? empCredentialsData.map((empCred, index) => (
                                        <tr key={index}>
                                            <td className='p-2 border border-secondary'>{empCred.cred_id}</td>
                                            <td className='p-2 border border-secondary'>{empCred.website_name}</td>
                                            <td className='p-2 border border-secondary'>{empCred.website_fxn}</td>
                                            <td className='p-2 border border-secondary'>{empCred.username}</td>
                                            <td className='p-2 border border-secondary'>{empCred.email_regd}</td>
                                            <td className='p-2 border border-secondary'>{empCred.mfa_by}</td>
                                            <td className='p-2 border border-secondary'>{empCred.subscription_type}</td>
                                            <td className='p-2 border border-secondary'>{empCred.assigned_date}</td>
                                            <td className='p-2 border border-secondary'><Button size='sm' variant="primary" className="" onClick={() => handleUnassignCredentials(empCred.id,)}>Unassign</Button></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className='p-2 border border-secondary text-center' colSpan={9}> No record found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign credential to {custData.name}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Select credential to assign <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {credListingData.map((option: CredListingData) => (
                                        { value: option.id, label: option.cred_id + ' - ' + option.website_name + ' - ' + option.website_fxn + ' - ' + option.username + ' - ' + option.mfa_by }
                                    ))}
                                    placeholder="Select credential" name="inco_term" value={credentialFormData.cred ? { value: credentialFormData.cred.id, label: credentialFormData.cred.name } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} />
                                <Form.Control type="hidden" name="credential_id" value={credentialFormData.credential_id} />
                                {validated && !credentialFormData.credential_id && (
                                    <div className="invalid-feedback d-block">Please select credential</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="remarks">
                                <Form.Label>Remarks <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Add remarks here" name="remarks" value={credentialFormData.remarks} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter remarks.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" loading={loading} loadingPosition="start" type="submit">Assign</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default EmployeesAssignCredential;
