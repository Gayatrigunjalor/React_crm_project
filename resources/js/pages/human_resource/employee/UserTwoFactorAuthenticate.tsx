import { faPlus, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Modal, Form, Tab } from 'react-bootstrap';
import EmployeesTable, { employeesTableColumns } from './EmployeesTable';
import EmployeesDisabledTable, { disabledEmployeesColumns } from './EmployeesDisabledTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import EmployeesModal  from './EmployeesModal';
import EmployeesPermissionsModal  from './EmployeesPermissionsModal';
import EmployeesChangePasswordModal  from './EmployeesChangePasswordModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";

export interface TwoFactorData {
    id: number;
    employee_detail: { name: string; emp_id: string; }
    two_factor_secret: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_confirmed_at: string | null;
    twoFAQrImg: string;
    recovery_codes: [];
}

const UserTwoFactorAuthenticate = () => {
    const { userId } = useParams();
    const [userTwoFactorData, setUserTwoFactorData] = useState<TwoFactorData>({
        id: 0,
        employee_detail: { name: '', emp_id: '' },
        two_factor_secret: null,
        two_factor_recovery_codes: null,
        two_factor_confirmed_at: null,
        twoFAQrImg: '',
        recovery_codes: []
    });
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false); //modal

    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState<boolean>(false);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = () => {
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleSuccess = () => setRefreshData(prev => !prev); // Toggle state to trigger re-fetch

    const handleDisableMfa = () => {
        swal({
            title: "",
            text: `Are you sure you want to disable MFA for ${userTwoFactorData.employee_detail.name}?`,
            icon: "info",
            buttons: {
                confirm: {
                    text: "Disable",
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
        .then((onceConfirmed) => {
            if (onceConfirmed) {
                axiosInstance.post('/disableEmployeeMfa', {
                    id: userId
                })
                .then((response) => {
                    swal("Success!", response.data.message, "success");
                    handleSuccess();
                })
                .catch(error => swal("Error!", error.data.message, "error"))
                .finally(() => {
                    setLoading(false);
                });
            }
        });
    };

    const handleEmployeeList = () => {
        navigate('/employees');
    };
    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchUserMfaDetails = async () => {
            try {
                const response = await axiosInstance.get(`/showEmpMFA/${userId}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setUserTwoFactorData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchUserMfaDetails();
    }, [refreshData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentPassword( value );
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
        const apiCall =  axiosInstance.post('/enableEmpMFA', {
            id: userId,
            current_password: currentPassword
        });

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
                handleClose();
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
                    .join("\n");
                swal("Error!", errorMsgs, "error");
            })
            .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Two Factor Authentication</h2>

            <Card style={{ width: '100%' }}>
                <Card.Title>
                    <Row className='mt-4 px-4'>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Employee Name : { userTwoFactorData.employee_detail.name }</h5></Col>
                        <Col className='d-flex align-items-center justify-content-start'><h5>Emp Code : { userTwoFactorData.employee_detail.emp_id } </h5></Col>
                        <Col className='d-flex justify-content-end'>
                            <Button
                                size='sm'
                                variant="primary"
                                className=""
                                startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />}
                                onClick={() => handleEmployeeList()}
                            >
                                Employee List
                            </Button>
                        </Col>
                    </Row>
                    <hr />
                </Card.Title>
                <Card.Body className='pt-0'>
                    {userTwoFactorData.two_factor_confirmed_at && (
                        <>
                            <Row className='text-center'>
                                <Col md={12}>
                                    <h4> You have enabled two factor authentication For <span className="text-danger">{userTwoFactorData.employee_detail.name}</span>.</h4>
                                </Col>
                                <Col md={12} className='mb-3'>
                                    <hr />
                                    <h5>Two factor authentication is now enabled. Scan the following QR code using your phone's</h5>
                                </Col>
                                <Col md={12} className='mb-4'>
                                    {userTwoFactorData.twoFAQrImg && <div dangerouslySetInnerHTML={{ __html: userTwoFactorData.twoFAQrImg }} />}
                                </Col>
                                <Col md={12} className='mb-4'>
                                    <h4>Store these recovery codes in a secure password manager. <br />They can be used to recover access to your account if your two factor authentication device is lost.</h4>
                                </Col>
                                <Col md={12} className='mb-4'>
                                    {userTwoFactorData.recovery_codes.length > 0 && (
                                        userTwoFactorData.recovery_codes.map((codes, index) => (
                                            <span key={index} className='fw-semibold'>{codes}<br /></span>
                                        ))
                                    )}
                                </Col>
                                <Col md={12} className='mb-4'>
                                    <Button variant="primary" className='mt-3' onClick={() => handleDisableMfa()}>
                                        Disable
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}
                    {
                        (!userTwoFactorData.two_factor_confirmed_at) && (
                            <>
                                <Row>
                                    <Col md={12}>
                                        <h4> You have not enabled two factor authentication for <span className="text-danger">{userTwoFactorData.employee_detail.name}</span>.</h4>
                                    </Col>
                                    <Col md={12}>
                                        <hr />
                                        <h5>Add additional security to User account using two factor authentication.</h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12} className='text-center'>
                                        <Button variant="success" className='mt-3' onClick={() => handleShow()}>
                                            Enable
                                        </Button>
                                        <Modal show={showModal} onHide={() => handleClose()} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                                            <Modal.Header closeButton>
                                                <Modal.Title id="contained-modal-title-vcenter">Confirm Password</Modal.Title>
                                            </Modal.Header>
                                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                                <Modal.Body>
                                                    <Row className="mb-3 g-3">
                                                        <Col md={2}></Col>
                                                        <Col md={8}>
                                                            <Form.Control type="hidden" name="id" value={userId} />
                                                            <Form.Group className="mb-3" controlId="currentPassword">
                                                                <Form.Label>For your security, please confirm your password to continue <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control type="password" placeholder="Enter your password" name="currentPassword" value={currentPassword} onChange={handleChange} required />
                                                                <Form.Control.Feedback type="invalid">Please enter your password.</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button onClick={() => handleClose()}>Close</Button>
                                                    <Button variant="success" loading={loading} loadingPosition="start" type="submit">Confirm</Button>
                                                </Modal.Footer>
                                            </Form>
                                        </Modal>
                                    </Col>
                                </Row>
                            </>
                        )
                    }

                </Card.Body>
            </Card>
            <ToastContainer className='py-0' />

        </>
    )
};

export default UserTwoFactorAuthenticate;
