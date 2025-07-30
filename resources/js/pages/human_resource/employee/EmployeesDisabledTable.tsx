import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap, faParking, faKey, faUserShield, faChartLine, faEraser } from '@fortawesome/free-solid-svg-icons';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { Form } from 'react-bootstrap';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import { EmployeesDataType } from './Employees';
import Button from '../../../components/base/Button';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const disabledEmployeesColumns = (handleShow: (userId?: number) => void, handleTaskCheckbox: (empId: number, empName: string, currentState: boolean) => void, handlePermissionsModal: (userId: number) => void, handleDashboardPermissions: (userId: number, name: string) => void, handleChangePassword: (userId: number) => void, handleTwoFactorAuthentication: (userId: number) => void, handleDeleteEmployeeTask: (userId: number, name: string) => void, handleAssignAsset: (empId: number) => void, handleAssignCredentials: (empId: number) => void): ColumnDef<EmployeesDataType>[] => [
    {
        accessorKey: 'emp_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Employee Id</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { emp_id } = original;
            return (
                <span>{emp_id}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ name }) => name
    },
    {
        id: 'email',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Email</span>
                </div>
            );
        },
        cell: ({ row: {original} }) => {
            const { emp_user } = original;
            return (
                <span>{emp_user ? emp_user.email : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        accessorKey: 'department',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Department</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { department } = original;
            return (
                <span>{department ? department.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'designation',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Designation</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { designation } = original;
            return (
                <span>{designation ? designation.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'role',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Role</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { role } = original;
            return (
                <span>{role ? role.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'is_under',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Is Under</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { is_under } = original;
            return (
                <span>{is_under ? is_under.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Status</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ status }) => status
    },
    {
        id: 'task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Task</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id,name,is_click_up_on } = original;
            return (
                <>
                    <Form.Group>
                        <Form.Check type="checkbox" label="" checked={is_click_up_on} onChange={() => handleTaskCheckbox(id,name,is_click_up_on)} />
                    </Form.Group>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
    },
    // {
    //     id: 'contact_person',
    //     header: () => {
    //         return (
    //             <div className="d-inline-flex flex-center">
    //                 <span>Company</span>
    //             </div>
    //         );
    //     },
    //     meta: {
    //         headerProps: {
    //             className: 'ps-2 pe-2 border-end border-translucent'
    //         },
    //         cellProps: {
    //             className:
    //             'ps-2 border-end border-translucent'
    //         }
    //     },
    //     accessorFn: ({ contact_person }) => contact_person
    // },

    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Actions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id, user_id, name, emp_user } = original;
            const { userPermission, empData } = useAuth(); //check userRole & permissions
            return (
                <div className="d-flex align-items-center gap-1">
                    {userPermission.employee_edit == 1 && (
                        <Button variant='link' title='Edit Employeed details' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {empData.emp_user.user_role == 0 && (
                        <>
                            <Button variant='link' title='Edit permissions' onClick={() => handlePermissionsModal(id)} startIcon={<FontAwesomeIcon icon={faParking} />}></Button>
                            <Button variant='link' title='Dashboard permissions' onClick={() => handleDashboardPermissions(user_id, name)} startIcon={<FontAwesomeIcon icon={faChartLine} />}></Button>
                            <Button variant='link' title='Change password' onClick={() => handleChangePassword(user_id)} startIcon={<FontAwesomeIcon icon={faKey} />}></Button>
                            <Button variant='link' title={ (emp_user.two_factor_confirmed_at == null) ? 'Enable Two Factor' : 'Disable Two Factor'} onClick={() => handleTwoFactorAuthentication(user_id)} className={ (emp_user.two_factor_confirmed_at == null) ? 'text-danger' : 'text-primary'} startIcon={<FontAwesomeIcon icon={faUserShield} />}></Button>
                            {/* <Button variant='link' title='Edit dashboard permissions' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faChartLine} />}></Button>*/}
                            <Button variant='link' title='Delete Employee Task' onClick={() => handleDeleteEmployeeTask(user_id, name)} startIcon={<FontAwesomeIcon icon={faEraser} />}></Button>
                        </>
                    )}
                    {userPermission.assets_list == 1 && (
                        <Button variant='link' title='Assign Assets' onClick={() => handleAssignAsset(id)} startIcon={<FontAwesomeIcon icon={faComputer} />}></Button>
                    )}
                    {userPermission.credentials_list == 1 && (
                        <Button variant='link' title='Assign Credentials' onClick={() => handleAssignCredentials(id)} startIcon={<FontAwesomeIcon icon={faSitemap} />}></Button>
                    )}
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
];

const EmployeesDisabledTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};

export default EmployeesDisabledTable;
