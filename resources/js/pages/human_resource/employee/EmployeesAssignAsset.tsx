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
interface AssignFormData {
    id?: number;
    asset: { id: number; name: string; } | null;
    asset_id: number;
    remarks: string;
}

export interface AssetsListingData {
    id: number;
    asset_id: string;
    asset_name: string;
    asset_desc: string;
}
interface AssetsData {
    id: number;
    asset_id: string;
    asset_name: string;
    asset_desc: string;
    assigned_date: string;
}

const EmployeesAssignAsset = () => {
    const {empId} = useParams();
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '' });
    const [assetFormData, setAssetFormData] = useState<AssignFormData>({ id: 0, asset: null, asset_id: 0, remarks: '' });
    const [assetsListingData, setAssetsListingData] = useState<AssetsListingData[]>([]);
    const [empAssetsData, setEmpAssetsData] = useState<AssetsData[]>([]);
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
            axiosInstance.get(`/asset/list_asset/${empId}`)
            .then(response => {
                setUserData({ ...custData, id: response.data.id, name: response.data.name });
            })
            .catch(error => console.error('Error fetching employees data:', error));
        } else {
            console.log('Incorrect Emp Id');
            
        }
    }, []);

    useEffect(() => {        
        const fetchUnassignedAssets = async () => {
            try {
                const response = await axiosInstance.get(`/fetchUnassignedAssets`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AssetsListingData[] = response.data;
                setAssetsListingData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        
        const fetchEmployeeAssetsData = async () => {
            try {
                const response = await axiosInstance.get(`/fetchAssignedAssetsToEmp`,{
                    params: { emp_id: empId }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: AssetsData[] = response.data;
                setEmpAssetsData(data);
            } catch (err: any) {
                setError(err.data.message);
            }
        };
        fetchUnassignedAssets();
        fetchEmployeeAssetsData();
    }, [refreshData]);

    const handleEmployeeList = () => {
        navigate('/employees');
    };
    
    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAssetFormData({ ...assetFormData, [name]: value });
    };
    
    const handleIncoSelect = (selectedOption: any) => {
        if (selectedOption) {
            setAssetFormData(prev => ({
                ...prev,
                asset: { id: selectedOption.value, name: selectedOption.label },
                asset_id: selectedOption.value
            }));
        }
    };

    const handleUnassignAsset = (contactId: number) => {
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
                axiosInstance.post(`/unAssignAsset`, {
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
        const apiCall =  axiosInstance.post('/assignAssetToEmployee', {
            employee_id: empId,
            ...assetFormData
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
                <Col><h3 className='px-4 mb-4'>Assets</h3></Col>
            </Row>
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col className="d-flex gap-3 justify-content-end mb-2">
                            <Button size='sm' variant="info" className="" startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />} onClick={() => handleShow()}>Assign Asset</Button>
                            <Button size='sm' variant="primary" className="" startIcon={<FontAwesomeIcon icon={faCaretLeft} className="me-2" />} onClick={() => handleEmployeeList()}>Employee List</Button>
                        </Col>
                    </Row>
                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col className="d-flex justify-content-center mb-2">
                            <h5>Employee Name : {custData.name}</h5>
                        </Col>
                    </Row>

                    <Row className='border-bottom border-gray-200 mb-3'>
                        <Col md={12}>
                            <table className='fs-8 table striped bordered mb-4'>
                                <thead>
                                    <tr>
                                        <th className='p-2 border border-secondary'>Asset Id</th>
                                        <th className='p-2 border border-secondary'>Asset Name</th>
                                        <th className='p-2 border border-secondary'>Asset Description</th>
                                        <th className='p-2 border border-secondary'>Assigned Date</th>
                                        <th className='p-2 border border-secondary'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empAssetsData.length > 0 ? empAssetsData.map((empAsset, index) => (
                                        <tr key={index}>
                                            <td className='p-2 border border-secondary'>{empAsset.asset_id}</td>
                                            <td className='p-2 border border-secondary'>{empAsset.asset_name}</td>
                                            <td className='p-2 border border-secondary'>{empAsset.asset_desc}</td>
                                            <td className='p-2 border border-secondary'>{empAsset.assigned_date}</td>
                                            <td className='p-2 border border-secondary'><Button size='sm' variant="primary" className="" onClick={() => handleUnassignAsset(empAsset.id,)}>Unassign</Button></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className='p-2 border border-secondary text-center' colSpan={5}> No record found</td>
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
                    <Modal.Title>Assign asset to {custData.name}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3">
                                <Form.Label>Select asset to assign <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {assetsListingData.map((option: AssetsListingData) => (
                                        { value: option.id, label: option.asset_id + ' - ' + option.asset_name + ' - ' + option.asset_desc }
                                    ))}
                                    placeholder="Select Asset" name="asset" value={assetFormData.asset ? { value: assetFormData.asset.id, label: assetFormData.asset.name } : null} onChange={(selectedOption) => handleIncoSelect(selectedOption)} />
                                <Form.Control type="hidden" name="asset_id" value={assetFormData.asset_id} />
                                {validated && !assetFormData.asset_id && (
                                    <div className="invalid-feedback d-block">Please select asset</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="remarks">
                                <Form.Label>Remarks <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Add remarks here" name="remarks" value={assetFormData.remarks} onChange={handleChange} required />
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

export default EmployeesAssignAsset;
