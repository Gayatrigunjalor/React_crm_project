import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Tab, Card } from 'react-bootstrap';
import EmployeesTable, { employeesTableColumns } from './EmployeesTable';
import EmployeesDisabledTable, { disabledEmployeesColumns } from './EmployeesDisabledTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import EmployeesModal  from './EmployeesModal';
import EmployeesPermissionsModal  from './EmployeesPermissionsModal';
import EmployeesDashboardModal  from './EmployeesDashboardModal';
import EmployeesDeleteTaskModal  from './EmployeesDeleteTaskModal';
import EmployeesChangePasswordModal  from './EmployeesChangePasswordModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';

export interface EmployeesDataType {
    id: number;
    user_id: number;
    name: string;
    emp_id: string;
    department: {
        id: number;
        name: string;
    };
    designation: {
        id: number;
        name: string;
    };
    role: {
        id: number;
        name: string;
    };
    is_under: {
        id: number;
        name: string;
    };
    emp_user: {
        id: number;
        email: string;
        two_factor_secret: string;
        two_factor_recovery_codes: string;
        two_factor_confirmed_at: string;
    };
    status: string;
    is_click_up_on: boolean;
}
interface DepartmentData {
    id: number;
    name: string;
}
export interface EmployeeListData {
    id: number;
    user_id: number;
    name: string;
    emp_id: string;
}

const Employees = () => {
    const [enabledEmployeesData, setEnabledEmployeesData] = useState<EmployeesDataType[]>([]);
    const [disabledEmployeesData, setdisabledEmployeesData] = useState<EmployeesDataType[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
    const [designationData, setDesignationData] = useState<DepartmentData[]>([]);
    const [employeesList, setEmployeesList] = useState<EmployeeListData[]>([]);
    const [roleData, setRoleData] = useState<DepartmentData[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false); //modal
    const [showDashboardPermissionsModal, setShowDashboardPermissionsModal] = useState<boolean>(false); //modal
    const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false); //modal
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState<boolean>(false); //modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [selectedChangePasswordUserId, setSelectedChangePasswordUserId] = useState<number>(0);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (userId?: number) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function
    const handlePermissionsClose = () => setShowPermissionsModal(false); //close modal function
    const handleDeleteTaskClose = () => setShowDeleteTaskModal(false); //close modal function
    const handleDashboardPermissionsClose = () => setShowDashboardPermissionsModal(false); //close modal function
    const handleChangePasswordClose = () => setShowChangePasswordModal(false); //close modal function

    const handleTaskCheckbox = (empId: number, empName: string, currentState: boolean) => {
        // Determine if we're enabling or disabling
    const action = currentState ? "disable" : "enable"
        swal({
            title: "",
            text: `Are you sure you want to ${action} click up for ${empName}?`,
            icon: "info",
            buttons: {
                confirm: {
                    text: currentState ? "Disable" : "Enable",
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
            dangerMode: currentState,
        })
        .then((onceConfirmed) => {
            if (onceConfirmed) {
                console.log("action - " +action+ ' state - ' +currentState);
                axiosInstance.post('/changeIsClickUpOn', {
                    id: empId,
                    is_click_up_on: !currentState
                })
                .then((response) => {
                    swal("Success!", response.data.message, "success");
                    handleSuccess();
                })
                .catch(error => swal("Error!", error.data.message, "error"))
                .finally(() => { });
            }
        });
    };

    const handlePermissionsModal = (empId: number) => {
        setSelectedUserId(empId);
        setShowPermissionsModal(true);
    };

    const handleDashboardPermissions = (user_id: number, name: string) => {
        setSelectedChangePasswordUserId(user_id);
        setSelectedUserName(name);
        setShowDashboardPermissionsModal(true);
    };

    const handleDeleteEmployeeTask = (user_id: number, name: string) => {
        setSelectedChangePasswordUserId(user_id);
        setSelectedUserName(name);
        setShowDeleteTaskModal(true);
    };
    const handleChangePassword = (userId: number) => {
        setSelectedChangePasswordUserId(userId);
        setShowChangePasswordModal(true);
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleTwoFactorAuthentication = (userId: number) => {
        navigate(`/two-factor-authenticate/${userId}`)
    };

    const handleAssignAsset = (empId: number) => {
        navigate(`/assign-asset/${empId}`)
    }

    const handleAssignCredentials = (empId: number) => {
        navigate(`/assign-credentials/${empId}`)
    }


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const table = useAdvanceTable({
        data: enabledEmployeesData,
        columns: employeesTableColumns(handleShow, handleTaskCheckbox, handlePermissionsModal, handleDashboardPermissions, handleChangePassword, handleTwoFactorAuthentication, handleDeleteEmployeeTask, handleAssignAsset, handleAssignCredentials),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {}
        }
    });

    const disabled_table = useAdvanceTable({
        data: disabledEmployeesData,
        columns: disabledEmployeesColumns(handleShow, handleTaskCheckbox, handlePermissionsModal, handleDashboardPermissions, handleChangePassword, handleTwoFactorAuthentication, handleDeleteEmployeeTask, handleAssignAsset, handleAssignCredentials),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {}
        }
    });

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchEmployeesData = async () => {
            try {
                const response = await axiosInstance.get('/employees'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data: EmployeesDataType[] = await response.data;
                const enableEmpList: EmployeesDataType[] = [];
                const disableEmpList: EmployeesDataType[] = [];
                data.forEach((emp: EmployeesDataType) => {
                    if (emp.is_click_up_on) {
                        enableEmpList.push(emp);
                    } else {
                        disableEmpList.push(emp);
                    }
                });
                setEnabledEmployeesData(enableEmpList);
                setdisabledEmployeesData(disableEmpList);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchEmployeesData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await axiosInstance.get('/departmentListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setDepartmentData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
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
        const fetchDesignation = async () => {
            try {
                const response = await axiosInstance.get('/designationListing');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                setDesignationData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        const fetchEmployeesList = async () => {
            try {
                const response = await axiosInstance.get('/employees_list');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.data;
                data.unshift({"id": 1, "name": "Admin", "emp_id": "EMP-000", "user_id": 1});
                setEmployeesList(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };

        fetchDepartment();
        fetchRole();
        fetchDesignation();
        fetchEmployeesList();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <h2 className="mb-5">Employees</h2>
            <Card>
                <Card.Body>
                    <Tab.Container id="basic-tabs-example" defaultActiveKey="enabled">
                        <Row>
                            <Col>
                                <Nav variant="underline">
                                    <Nav.Item>
                                        <Nav.Link eventKey="enabled" className='fs-8'>Enabled Employees</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="disabled" className='fs-8'>Disabled Employees</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <Button
                                    variant="primary"
                                    className=""
                                    startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                    onClick={() => handleShow()}
                                >
                                    Add New Employees
                                </Button>
                            </Col>
                        </Row>

                        <Tab.Content>
                            <Tab.Pane eventKey="enabled">
                                <AdvanceTableProvider {...table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search employee"
                                                    className="me-2"
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <EmployeesTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>
                            <Tab.Pane eventKey="disabled">
                                <AdvanceTableProvider {...disabled_table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search employee"
                                                    className="me-2"
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <EmployeesDisabledTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {showModal && (
                <EmployeesModal userId={selectedUserId} onHide={handleClose} onSuccess={handleSuccess} departmentData={departmentData} designationData={designationData} employeesList={employeesList} roleData={roleData} />
            )}

            {showPermissionsModal && (
                <EmployeesPermissionsModal userId={selectedUserId} onHide={handlePermissionsClose} onSuccess={handleSuccess} checkers={employeesList} />
            )}


            {showDashboardPermissionsModal && (
                <EmployeesDashboardModal userId={selectedChangePasswordUserId} userName={selectedUserName} onHide={handleDashboardPermissionsClose} onSuccess={handleSuccess} />
            )}

            {showDeleteTaskModal && (
                <EmployeesDeleteTaskModal userId={selectedChangePasswordUserId} userName={selectedUserName} onHide={handleDeleteTaskClose} onSuccess={handleSuccess} />
            )}

            {showChangePasswordModal && (
                <EmployeesChangePasswordModal userId={selectedChangePasswordUserId} onHide={handleChangePasswordClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default Employees;
