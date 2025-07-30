import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row, InputGroup } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import Badge from '../../../components/base/Badge';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import { useAuth } from '../../../AuthContext';
import ReactSelect from '../../../components/base/ReactSelect';
import { EmployeeListData } from './Employees';

interface FormData {
    id?: number;
    name: string;
    department_id: number | undefined;
    is_under: {
        id: number | null;
        name: string;
    } | null;
    is_under_id: number;
    designation: {
        id: number | null;
        name: string;
    } | null;
    designation_id: number;
    role: {
        id: number | null;
        name: string;
    } | null;
    role_id: number;
    leadership_kpi?: { id: number; name: string; } | null;
    leadership_kpi_id?: number;
    address: string;
    email: string;
    official_mobile_number: string;
    status: string;
    emp_user: {
        email: string;
    };
    emp_id? : string;
    is_click_up_on? : number;
    isUnderKpiRoles : [];
}

export interface EntityData {
    id: number;
    name: string;
}

interface EmployeesModalProps {
    userId?: number;
    onHide: () => void;
    onSuccess: () => void;
    departmentData: EntityData[];
    designationData: EntityData[];
    employeesList: EmployeeListData[];
    roleData: EntityData[];
}

const EmployeesModal: React.FC<EmployeesModalProps> = ({ userId, onHide, onSuccess, departmentData, designationData, employeesList, roleData }) => {
    const [custData, setUserData] = useState<FormData>({ id: 0, name: '', department_id: undefined, is_under: null, is_under_id: 0, designation_id: 0, designation: null, role: null, role_id: 0, address: '', email: '', official_mobile_number: '', status: '', emp_user: {email : ''}, isUnderKpiRoles: [] });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { empData } = useAuth(); //check userRole & permissions
    const [selectedKpiOptions, setSelectedKpiOptions] = useState([]);
    const roleOptions = roleData.map((option: EntityData) => (
        { value: option.id, label: option.name }
    ));

    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch employees data for editing
            axiosInstance.get(`/employees/${userId}`)
            .then(response => {
                setUserData(response.data);
                if(response.data.ancillary_roles != null){
                    const kpiRoles = response.data.ancillary_roles.split(',').map(Number);

                    // Map the kpiRoles to the corresponding role options
                    const selected = roleOptions.filter(option => kpiRoles.includes(option.value));

                    // Set the selected options state
                    setSelectedKpiOptions(selected);
                }
            })
            .catch(error => console.error('Error fetching employees data:', error));
        }
    }, [userId]);

    const handleRSelect = (selectedOption: { value: number; label: string } | null, fieldName: string) => {
        if (selectedOption) {
            if(fieldName == 'is_under') {
                setUserData({ ...custData, is_under: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, is_under_id: selectedOption.value });
            }
            if(fieldName == 'designation') {
                setUserData({ ...custData, designation: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, designation_id: selectedOption.value });
            }
            if(fieldName == 'role') {
                setUserData({ ...custData, role: {
                    id: selectedOption.value,
                    name: selectedOption.label
                }, role_id: selectedOption.value });
            }

        } else {
            setUserData({ ...custData, [fieldName]: null });
        }
    };
    const handleModeChange = (selectedKpiOptions: any) => {
        setSelectedKpiOptions(selectedKpiOptions);
    };
    const handleAncillaryChange = (selectedAncillaryOptions: any) => {
        if (selectedAncillaryOptions) {
            setUserData(prev => ({
                ...prev,
                leadership_kpi: { id: selectedAncillaryOptions.value, name: selectedAncillaryOptions.label },
                leadership_kpi_id: selectedAncillaryOptions.value
            }));
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData({ ...custData, [name]: value });
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
        const apiCall = isEditing
            ? axiosInstance.put(`/employees/${custData.id}`,  {
                name : custData.name,
                department_id : custData.department_id,
                is_under_id : custData.is_under_id,
                designation_id : custData.designation_id,
                role_id : custData.role_id,
                address : custData.address,
                status : custData.status,
                official_mobile_number : custData.official_mobile_number,
                ancillary_roles: selectedKpiOptions,
                leadership_kpi_id: custData.leadership_kpi_id,
            })
            : axiosInstance.post('/employees', {
                ...custData,
                ancillary_roles: selectedKpiOptions
            } );

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
                    <Modal.Title>{isEditing ? (
                        <>
                            <div className="d-flex">
                                <div className="flex-grow-1">Edit Employee</div>
                                <div className=""><Badge className='mx-4' bg="secondary"> Employee ID : {custData.emp_id} </Badge></div>
                                <div className=""><Badge bg="secondary"> {custData.is_click_up_on == 1 ? 'Enabled' : 'Disabled' } </Badge></div>
                            </div>

                        </>) : 'Add Employee'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="hidden" name="id" value={custData.id} />
                        <p className="fs-8 mb-3 text-decoration-underline">Employee Details</p>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="name">
                                <Form.Label>Employee Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Employee Name" name="name" value={custData.name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter employee name.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="address">
                                <Form.Label>Employee Actual Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Employee Actual Name" name="address" value={custData.address} onChange={handleChange} required/>
                                <Form.Control.Feedback type="invalid">Please enter employee actual name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3" controlId="email">
                                <Form.Label>Official Email / Username  <span className="text-danger">*</span></Form.Label>
                                {isEditing ?
                                    <Form.Control type="text" value={custData.emp_user.email} readOnly style={{ backgroundColor: 'whitesmoke', pointerEvents: 'none' }}/>
                                    : <Form.Control type="text" placeholder="Official Email" name="email" value={custData.email} onChange={handleChange} required />
                                }

                                <Form.Control.Feedback type="invalid">Please enter official email.</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="official_mobile_number">
                                <Form.Label>Official Mobile Number  <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Phone" name="official_mobile_number" value={custData.official_mobile_number} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter official mobile number.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <hr />
                        <p className="fs-8 mb-3 text-decoration-underline">Organization Details</p>
                        <Row className="g-3">
                            <Form.Group as={Col} className="mb-3" controlId="is_under">
                                <Form.Label>Is Under <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {employeesList.map((option: EmployeeListData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Reporting Manager" name="is_under" value={custData.is_under ? { value: custData.is_under.id, label: custData.is_under.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'is_under')} required
                                    />
                                    <Form.Control type="hidden" name="is_under_id" value={custData.is_under_id} />
                                    {validated && !custData.is_under_id && (
                                        <div className="invalid-feedback d-block">Please select Reporting Manager for this employee</div>
                                    )}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3"  controlId="role">
                                <Form.Label>Roles <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {roleOptions}
                                    placeholder="Select Role" name="role" value={custData.role ? { value: custData.role.id, label: custData.role.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'role')} required
                                    />
                                    <Form.Control type="hidden" name="role_id" value={custData.role_id} />
                                    {validated && !custData.role_id && (
                                        <div className="invalid-feedback d-block">Please select primary role</div>
                                    )}
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">
                            <Form.Group as={Col} className="mb-3"  controlId="designation">
                                <Form.Label>Designation <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {designationData.map((option: EntityData) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Designation" name="designation" value={custData.designation ? { value: custData.designation.id, label: custData.designation.name } : null} onChange={(selectedOption) => handleRSelect(selectedOption, 'designation')} required
                                    />
                                    <Form.Control type="hidden" name="designation_id" value={custData.designation_id} />
                                <Form.Control.Feedback type="invalid">Please enter designation</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="department_id">
                                <Form.Label>Employee Department <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="department_id" value={custData.department_id} onChange={handleSelectChange}>
                                    <option value="">Select department</option>
                                    {departmentData.map((option: EntityData) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please enter Vendor Type</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 g-3">

                            <Form.Group as={Col} className="mb-3" controlId="ancillary_roles">
                                <Form.Label>Ancillary Role</Form.Label>
                                    <ReactSelect value={selectedKpiOptions}
                                        options= {roleOptions}
                                        isMulti
                                        placeholder="Select Ancillary Role (Multiple select)"
                                        name="ancillary_roles"
                                        onChange={handleModeChange}
                                    />
                                <Form.Control.Feedback type="invalid">Please enter Ancillary Role</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} className="mb-3" controlId="leadership_kpi">
                                <Form.Label>Leadership Role KPI(My KPI) </Form.Label>
                                    <ReactSelect value={custData.leadership_kpi ? { value: custData.leadership_kpi.id, label: custData.leadership_kpi.name } : null}
                                        options= {roleOptions}
                                        placeholder="Only one role (Target Non-transferable)"
                                        name="leadership_kpi"
                                        onChange={handleAncillaryChange}
                                    />
                                    <Form.Control type="hidden" name="leadership_kpi_id" value={custData.leadership_kpi_id} />
                                <Form.Control.Feedback type="invalid">Please enter Leadership KPI Role</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row>
                            {isEditing && (custData.isUnderKpiRoles.length > 0) && (
                                <div className="col">
                                    <Form.Label className='my-1 me-2 white-space-nowrap'>Is Under Roles : </Form.Label>
                                    { custData.isUnderKpiRoles.map((upload, index) => (
                                        <Badge key={index} bg="primary" variant="phoenix" className='me-1'>
                                            {upload}
                                        </Badge>
                                    ))}
                                </div>
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
        </>
    );
};

export default EmployeesModal;
