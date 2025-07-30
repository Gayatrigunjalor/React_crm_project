import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Form, Modal, Col, Row } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import axiosInstance from '../../../axios';
import swal from 'sweetalert';
import ReactSelect from '../../../components/base/ReactSelect';

interface FormData {
    id?: number;
    kpi_name: string;
    roles: { id: number; name: string; } | null;
    role_id: number;
    users: EmployeeData[];
    user_ids: [];
    description: string;
    target_type: string;
    priority: string;
}
// Define the component props, ensuring assetTypeData is typed as AssetTypeDataType[]
interface AssetsModalProps {
    userId?: number;
    onHide: () => void;
    onSuccess: () => void;
}
export interface RoleDataType {
    id: number;
    name: string;
};
export interface EmployeeData {
    id: number;
    name: string;
    user_id: number;
};
const KpiListModal: React.FC<AssetsModalProps> = ({ userId, onHide, onSuccess }) => {
    const [kpiListData, setKpiListData] = useState<FormData>({
        id: 0,
        kpi_name: '',
        description: '',
        target_type: '',
        priority: '',
        roles: null,
        role_id: 0,
        users: [],
        user_ids: []
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roleData, setRoleData] = useState<RoleDataType[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await axiosInstance.get('/roleListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setRoleData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        const fetchEmployeesData = async () => {
            try {
                const response = await axiosInstance.get(`/employees_list`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const emp_data: EmployeeData[] = await response.data;
                setEmployeeData(emp_data);
            } catch (err: any) {
                // setError(err.message);
            } finally {

            }
        };

        fetchRole();
        fetchEmployeesData();
    }, []);

    useEffect(() => {

        if (userId) {
            setIsEditing(true);
            // Fetch assets data for editing
            axiosInstance.get(`/kpis/${userId}`)
            .then(response => {
                const apiData = response.data;
                const usersForSelect = apiData.users.map((user: any) => ({
                    value: user.user_id,
                    label: user.name
                }));
                setKpiListData({
                    id: apiData.id,
                    kpi_name: apiData.kpi_name,
                    description: apiData.description,
                    target_type: apiData.target_type ? apiData.target_type : '',
                    priority: apiData.priority,
                    roles: apiData.roles,
                    role_id: apiData.role_id,
                    users: usersForSelect,
                    user_ids: apiData.user_ids,
                });
            })
            .catch(error => console.error('Error fetching assets data:', error));
        }
    }, []);

    const handleUsersSelect = (selectedOptions: any) => {
        if (selectedOptions) {
            const selectedIds = selectedOptions.map((option: any) => option.value);
            setKpiListData(prev => ({
                ...prev,
                user_ids: selectedIds,
                users: selectedOptions
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setKpiListData({ ...kpiListData, [name]: value });
    };

    const handleRoleSelect = (selectedOption: any) => {
        if (selectedOption) {
            setKpiListData(prev => ({
                ...prev,
                roles: { id: selectedOption.value, name: selectedOption.label },
                role_id: selectedOption.value
            }));
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

        setValidated(true);
        setLoading(true);
        const apiCall = isEditing
            ? axiosInstance.put(`/kpis/${kpiListData.id}`,  {
                ...kpiListData
            })
            : axiosInstance.post('/kpis', kpiListData);

        apiCall
            .then((response) => {
                swal("Success!", response.data.message, "success");
            onSuccess();
            onHide();
        })
        .catch(error => swal("Error!", error.data.message, "error"))
        .finally(() => { setLoading(false); });
    };

    if (error) return <div>Error: {error}</div>;
    return (
        <>
            <Modal show onHide={onHide} size="lg" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit KPI' : 'Add KPI'}</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="kpi_name">
                                <Form.Label>KPI Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter KPI name" name="kpi_name" value={kpiListData.kpi_name} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter assets name.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="role_id">
                                <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                                <ReactSelect
                                    options= {roleData.map((option: RoleDataType) => (
                                        { value: option.id, label: option.name }
                                    ))}
                                    placeholder="Select Role" name="role" value={kpiListData.roles ? { value: kpiListData.roles.id, label: kpiListData.roles.name } : null} onChange={(selectedOption) => handleRoleSelect(selectedOption)}
                                />
                                <Form.Control type="hidden" name="role" value={kpiListData.role_id} />
                                {validated && !kpiListData.role_id && (
                                    <div className="invalid-feedback d-block">Please enter role</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group className="mb-3" controlId="user_ids">
                                <Form.Label>Users</Form.Label>
                                <ReactSelect
                                    options= {employeeData.map((option: EmployeeData) => (
                                        { value: option.user_id, label: option.name }
                                    ))}
                                    isMulti
                                    placeholder="Select Employees" name="users" value={kpiListData.users || [] } onChange={(selectedOption) => handleUsersSelect(selectedOption)} />
                                <Form.Control type="hidden" name="user_ids" value={kpiListData.user_ids} />

                                {validated && !kpiListData.user_ids && (
                                    <div className="invalid-feedback d-block">Please select users</div>
                                )}
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group className="mb-3" controlId='description'>
                                <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Description" name="description" value={kpiListData.description} onChange={handleChange} required />
                                <Form.Control.Feedback type="invalid">Please enter description.</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group className="mb-3" controlId='target_type'>
                                <Form.Label>Target Type <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="target_type" value={kpiListData.target_type} onChange={handleChange} required>
                                    <option value="">Please Select KPI target</option>
                                    <option value="currency">Currency</option>
                                    <option value="done_not_done">Done / Not Done</option>
                                    <option value="number">Number</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please select target type</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="g-3">
                            <Form.Group className="mb-3" controlId='priority'>
                                <Form.Label>Priority <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="priority" value={kpiListData.priority} onChange={handleChange} required>
                                    <option value="">Please Select Priority</option>
                                    <option value="Directors priority">Directors Priority</option>
                                    <option value="Salary Hold">Salary Hold</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">Please select target type</Form.Control.Feedback>
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

export default KpiListModal;
