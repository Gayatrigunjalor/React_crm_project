import React, { useMemo, useState, useEffect, ChangeEvent } from 'react';
import DatePicker from 'react-datepicker';
import Badge from "../../components/base/Badge";
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../components/base/AdvanceTableFooter';
import useAdvanceTable from '../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../providers/AdvanceTableProvider';
import { FaArrowRight, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
import axiosInstance from '../../axios';
import swal from 'sweetalert';
import ReactSelect from '../../components/base/ReactSelect';
import { format } from 'date-fns';
import { Col, Row, Spinner } from 'react-bootstrap';
import { da } from 'date-fns/locale';
import { useAuth } from '../../AuthContext';
import SearchBox from '../../components/common/SearchBox';
import aceGoal from '../../assets/img/aceGoal.png';
import ControlPanel from './ControlPanel';
import KPIDistributionDashboard from './SummaryDashboard';
import FirstLineDashboard from '../acegoalsdashboards/FirstLineDashboard';
import LastuserDashboard from '../acegoalsdashboards/LastuserDashboard';
import { useNavigate } from 'react-router-dom';
interface Role {
    id: number;
    name: string;
}

interface KPI {
    id: number;
    kpi_name: string;
    role_id: number;
    user_ids: string;
    description: string;
    target_type: string;
    roles: Role;
    assigned_target: Array<{
        id: number;
        title: string;
        kpi_id: number;
        task_type: string;
        kpi_year: string;
        kpi_month: string;
        target_type: string;
        target_value: string;
        assigned_by: number;
        created_by: {
            id: number;
            user_id: number;
            name: string;
        };
    }>;
    current_month_target: Array<{
        target_value: string;
    }>;
    last_month_target: Array<{
        target_value: string;
    }>;
    second_last_month_target: Array<{
        target_value: string;
    }>;
    priority: string;
}

interface Goal {
    id: number;
    kpi: string;
    target_type: string;
    alreadyassignedTarget: number;
    currentMonthTarget: number;
    previousMonthTarget: number;
    secondLastMonthTarget: number;
    dividedTarget?: number;
    memberTargets?: { [key: string]: number };
}

interface Employee {
    value: number;
    label: string;
    id?: number;
    user_id: number;
    role?: string;
    kpiRoles?: number[];
    role_id: string;
    ancillary_roles?: string[];
    name: string;
    aceAndGoalPreference?: Array<{
        id: number;
        user_id: number;
        role_id: number;
        isHidden: number;
        isBypass: number;
    }>;
}



const SetaceGoals: React.FC = () => {
    const [selectedKPIs, setSelectedKPIs] = useState<Goal[]>([]);
    const [isGoalCreated, setIsGoalCreated] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<string>('');
    const [isSetGoalsClicked, setIsSetGoalsClicked] = useState<boolean>(false);
    const [isSendGoalsClicked, setIsSendGoalsClicked] = useState<boolean>(false);
    const [isAceCreated, setIsAceCreated] = useState<boolean>(false);
    const [kpiData, setKpiData] = useState<KPI[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isEditable, setIsEditable] = useState(false);
    const [sendActiveTab, setSendActiveTab] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const userRole = localStorage.getItem('user_role');
    const isUnderName = localStorage.getItem('isunder_name');
    // const empName = localStorage.getItem('employee_name');
    const userPermissions = localStorage.getItem('emp_data');
    // console.log(userPermissions?.emp_id, 'userPermissions');
    const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;
    const userId = parsedPermissions ? parsedPermissions.user_id : null;
    const userIdHierarchy = parsedPermissions ? parsedPermissions.id : null;
    const empName = parsedPermissions ? parsedPermissions.name : null;
    const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
    const [lockedTargets, setLockedTargets] = useState<{ [key: string]: boolean }>({});
    const [data, setData] = useState('');
    console.log(userRole, 'userRole');
    const { empData } = useAuth();
    const [showAssignedTargets, setShowAssignedTargets] = useState(false);
    const [showControlForm, setShowControlForm] = useState(false);
    const [activeDashboard, setActiveDashboard] = useState<'firstLine' | 'other'>('other');
    const [hasChildren, setHasChildren] = useState<boolean>(false);
    const [showLastuserDashboard, setShowLastuserDashboard] = useState(false);
    const [currentUserData, setCurrentUserData] = useState<any>(null);
    const [doneNotDoneSelections, setDoneNotDoneSelections] = useState<{ [key: string]: boolean }>({});
    const navigate = useNavigate();

    // ...existing code...
    const handleBack = () => {
        if (showControlForm) {
            setShowControlForm(false);
            setActiveDashboard('firstLine');
            setShowLastuserDashboard(false);
        } else if (showLastuserDashboard) {
            setShowLastuserDashboard(false);
            setActiveDashboard('firstLine');
        } else if (isGoalCreated && !selectedDate) {
            setIsGoalCreated(false);
        } else if (isGoalCreated && selectedDate) {
            setSelectedDate(null);
        } else {
            // Default: go to KPI Dashboard
            setIsGoalCreated(false);
            setShowControlForm(false);
            setShowLastuserDashboard(false);
            setActiveDashboard('other');
        }
    };
    const [assignedTargetsData, setAssignedTargetsData] = useState<Array<{
        kpi: string;
        targets: Array<{
            title: string;
            target_type: string;
            target_value: string;
            created_by: {
                name: string;
            };
        }>;
    }>>([]);


    const columns: ColumnDef<Goal>[] = [
        {
            accessorKey: 'kpi',
            header: 'KPI',
            meta: {
                cellProps: {
                    className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
                }
            },
            cell: ({ row }) => {
                const matchingKpi = kpiData.find(k => k.id === row.original.id);
                const isAssigned = row.original.target_type === 'done_not_done'
                    ? (matchingKpi?.assigned_target?.length || 0) > 0
                    : row.original.alreadyassignedTarget > 0;
                const className = isAssigned
                    ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                    : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                return <div className={className}>{row.original.kpi}</div>;
            }
        },
        {
            accessorKey: 'target_type',
            header: 'Target Type',
            meta: {
                cellProps: {
                    className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
                }
            },
            cell: ({ row, getValue }) => {
                const value = getValue() as string;
                const matchingKpi = kpiData.find(k => k.id === row.original.id);
                const isAssigned = row.original.target_type === 'done_not_done'
                    ? (matchingKpi?.assigned_target?.length || 0) > 0
                    : row.original.alreadyassignedTarget > 0;
                const className = isAssigned
                    ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                    : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                return <div className={className}>{value === 'done_not_done' ? 'Done/Not Done' : value}</div>;
            }
        },
        {
            accessorKey: 'currentMonthTarget',
            header: 'Current Month Target',
            meta: {
                cellProps: {
                    className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
                }
            },
            cell: ({ row: { original }, column }) => {
                const userRole = localStorage.getItem('user_role');
                const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
                const [isEditable, setIsEditable] = useState(false);
                const [editedValue, setEditedValue] = useState(original.currentMonthTarget);

                const matchingKpi = kpiData.find(k => k.id === original.id);
                const isAssigned = original.target_type === 'done_not_done'
                    ? (matchingKpi?.assigned_target?.length || 0) > 0
                    : original.alreadyassignedTarget > 0;

                if (original.target_type === 'done_not_done') {
                    const className = isAssigned
                        ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                        : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent bg-light-grey';
                    return <div className={className}>-</div>;
                }

                const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    setEditedValue(Number(e.target.value));
                };

                const handleSave = () => {
                    original.currentMonthTarget = editedValue;
                    setIsEditable(false);
                };

                const className = isAssigned
                    ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                    : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';

                // Disable editing if target is already assigned
                const canEdit = isAdmin && isEditable && !isAssigned;

                return canEdit ? (
                    <div className={className}>
                        <input
                            type="number"
                            min="0"
                            value={editedValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === '-') {
                                    e.preventDefault();
                                }
                            }}
                            style={{ padding: '5px 10px', width: '80px', marginRight: '10px' }}
                        />
                        <img
                            src="/assets/save.svg"
                            alt="Save"
                            onClick={handleSave}
                            style={{
                                cursor: 'pointer',
                                width: '20px',
                                height: '20px'
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className={className}
                        onClick={() => isAdmin && !isAssigned && setIsEditable(true)}
                        style={{ cursor: !isAssigned ? 'pointer' : 'default' }}
                    >
                        {`${original.currentMonthTarget}`}
                    </div>
                );
            },
        },
        {
            accessorKey: 'previousMonthTarget',
            header: 'Previous Month Target',
            meta: {
                cellProps: {
                    className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
                }
            },
            cell: ({ row: { original } }) => {
                const matchingKpi = kpiData.find(k => k.id === original.id);
                const isAssigned = original.target_type === 'done_not_done'
                    ? (matchingKpi?.assigned_target?.length || 0) > 0
                    : original.alreadyassignedTarget > 0;

                if (original.target_type === 'done_not_done') {
                    const className = isAssigned
                        ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                        : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                    return <div className={className}>-</div>;
                }
                const className = isAssigned
                    ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                    : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                return <div className={className}>{original.previousMonthTarget}</div>;
            }
        },
        {
            accessorKey: 'secondLastMonthTarget',
            header: 'Second Last Month Target',
            meta: {
                cellProps: {
                    className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
                }
            },
            cell: ({ row: { original } }) => {
                const matchingKpi = kpiData.find(k => k.id === original.id);
                const isAssigned = original.target_type === 'done_not_done'
                    ? (matchingKpi?.assigned_target?.length || 0) > 0
                    : original.alreadyassignedTarget > 0;

                if (original.target_type === 'done_not_done') {
                    const className = isAssigned
                        ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                        : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                    return <div className={className}>-</div>;
                }
                const className = isAssigned
                    ? 'white-space-nowrap fw-semibold ps-2 border-start bg-success border-end border-translucent text-white'
                    : 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent';
                return <div className={className}>{original.secondLastMonthTarget}</div>;
            }
        },
    ];

    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let isMyKPITab = false;

    useEffect(() => {
        console.log('ceeled');
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];


            const userRole = localStorage.getItem('user_role');
            const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

            // Construct the correct URL with dynamic values
            // const endpoint = `/tasks/employee_task/${userId}/${isAdmin ? 1 : 0}`;
            const endpoint = `/fetchTask?id=${userId}/${isAdmin ? 1 : 0}`;

            try {
                const response = await axiosInstance.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },

                });
                setData(response.data.reportsTo);

                console.log('DATA IS', response.data);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            }
        };

        fetchData();
    }, []);


    //FOR USER
    useEffect(() => {
        const fetchKPIData = async () => {
            if (isAdmin) return;
            console.log('callled');

            try {
                const token = localStorage.getItem('token');
                const cleanToken = token && token.split('|')[1];
                const userRole = localStorage.getItem('user_role');
                const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

                let month, year;

                if (isAdmin && selectedDate) {
                    // For admin, use selected date
                    month = format(selectedDate, 'M');
                    year = format(selectedDate, 'yyyy');
                } else {
                    // For non-admin, use current month and year
                    const currentDate = new Date();
                    month = format(currentDate, 'M');
                    year = format(currentDate, 'yyyy');
                }

                let url = `/kpiListing?userId=${userId}&isAdmin=${isAdmin ? 1 : 0}&month=${month}&year=${year}`;

                const response = await axiosInstance.get(url, {
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`
                    }
                });

                setKpiData(response.data);

                const uniqueRolesMap = new Map();
                response.data.forEach((kpi: KPI) => {
                    if (kpi.roles) {
                        uniqueRolesMap.set(kpi.roles.id, kpi.roles);
                    }
                });

                const uniqueRoles = Array.from(uniqueRolesMap.values());
                setRoles(uniqueRoles);
                if (uniqueRoles.length > 0 && (!activeTab || !uniqueRoles.find(role => role.name === activeTab))) {
                    setActiveTab(uniqueRoles[0].name);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch KPI data');
                setLoading(false);
            }
            setIsSetGoalsClicked(true);
        };


        const userRole = localStorage.getItem('user_role');
        const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

        if (isAdmin) {
            if (userId && selectedDate) {
                fetchKPIData();
            }
        } else {
            if (userId) {
                fetchKPIData();
            }
        }
    }, [userId]);


    //FOR ADMIN
    useEffect(() => {
        const fetchKPIData = async () => {
            if (!userId) return;
            if (!selectedDate) return;

            try {
                const token = localStorage.getItem('token');
                const cleanToken = token && token.split('|')[1];
                const userRole = localStorage.getItem('user_role');
                const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

                const month = selectedDate ? format(selectedDate, 'M') : null;
                const year = selectedDate ? format(selectedDate, 'yyyy') : null;

                let url = `/kpiListing?userId=${userId}&isAdmin=${isAdmin ? 1 : 0}&month=${month}&year=${year}`;

                const response = await axiosInstance.get(url, {
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`
                    }
                });

                setKpiData(response.data);

                const uniqueRolesMap = new Map();
                response.data.forEach((kpi: KPI) => {
                    if (kpi.roles) {
                        uniqueRolesMap.set(kpi.roles.id, kpi.roles);
                    }
                });

                const uniqueRoles = Array.from(uniqueRolesMap.values());
                setRoles(uniqueRoles);
                if (uniqueRoles.length > 0 && (!activeTab || !uniqueRoles.find(role => role.name === activeTab))) {
                    setActiveTab(uniqueRoles[0].name);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch KPI data');
                setLoading(false);
            }
            setIsSetGoalsClicked(true);
        };

        if (userId && selectedDate) {
            fetchKPIData();
        }
    }, [userId, selectedDate]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const cleanToken = token && token.split('|')[1];
                const response = await axiosInstance.get('/getHierarchyAceAndGoal', {
                    headers: {
                        Authorization: `Bearer ${cleanToken}`,
                    },
                    params: {
                        id: userIdHierarchy,
                    }
                });

                // Check if user has children
                setHasChildren(response.data.children && response.data.children.length >= 1);

                // Store current user's data (the main object, not children)
                setCurrentUserData(response.data["0"] || response.data);

                const employeeOptions = response.data.children.map((emp: any) => {
                    // Parse ancillary_roles string into array
                    let ancillaryRolesArray: string[] = [];
                    if (emp.ancillary_roles && typeof emp.ancillary_roles === 'string') {
                        ancillaryRolesArray = emp.ancillary_roles.split(',').map((role: string) => role.trim()).filter((role: string) => role !== '');
                    }

                    // Combine role_id and ancillary_roles into a single array
                    const allRoles = [
                        emp.role_id.toString(),
                        ...(emp.leadership_kpi_id != null ? [emp.leadership_kpi_id.toString()] : []),
                        ...ancillaryRolesArray
                    ];

                    // Debug: Log the raw employee data for Gaurav Jagtap
                    if (emp.name === "Gaurav Jagtap") {
                        console.log('Raw Gaurav Jagtap data:', emp);
                        console.log('ace_and_goal_preference field:', emp.ace_and_goal_preference);
                    }

                    return {
                        value: emp.user_id,
                        label: emp.name,
                        id: emp.id,
                        user_id: emp.user_id,
                        role: emp.role,
                        role_id: emp.role_id.toString(),
                        name: emp.name,
                        ancillary_roles: ancillaryRolesArray,
                        kpiRoles: allRoles,
                        aceAndGoalPreference: emp.ace_and_goal_preference || []
                    };
                });

                setEmployees(employeeOptions);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const goalSettingData = useMemo(() => {
        if (!activeTab) return [];
        const activeRole = roles.find(role => role.name === activeTab);
        if (!activeRole) return [];

        const kpisForRole = kpiData.filter(kpi => kpi.roles.id === activeRole.id);
        return kpisForRole.map((kpi) => ({
            id: kpi.id,
            kpi: kpi.kpi_name,
            target_type: kpi.target_type,

            alreadyassignedTarget: kpi.assigned_target ? kpi.assigned_target.length : 0,
            currentMonthTarget: kpi.current_month_target.reduce((acc, task) => {
                return acc + parseFloat(task.target_value || '0');
            }, 0),
            previousMonthTarget: kpi.last_month_target.reduce((acc, task) => {
                return acc + parseFloat(task.target_value || '0');
            }, 0),
            secondLastMonthTarget: kpi.second_last_month_target.reduce((acc, task) => {
                return acc + parseFloat(task.target_value || '0');
            }, 0),


        }));
    }, [activeTab, kpiData, roles]);

    const tableData = useMemo(() => goalSettingData, [goalSettingData]);

    const table = useAdvanceTable({
        data: tableData,
        columns,
        pageSize: 10,
        pagination: true,
        selection: true,
        sortable: true,
    });

    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        table.setGlobalFilter(value || undefined);
    };

    const handleCreateGoalClick = () => {
        setIsGoalCreated(true);
    };

    const handleSendGoalsClick = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedKPIsData = selectedRows.map(row => row.original);

        // Find KPIs that have assigned targets
        const kpisWithAssignedTargets = selectedKPIsData.filter(kpi => {
            const matchingKpi = kpiData.find(k => k.id === kpi.id);
            return matchingKpi && matchingKpi.assigned_target && matchingKpi.assigned_target.length > 0;
        });

        // Find KPIs that don't have assigned targets
        const kpisWithoutAssignedTargets = selectedKPIsData.filter(kpi => {
            const matchingKpi = kpiData.find(k => k.id === kpi.id);
            return !matchingKpi?.assigned_target || matchingKpi.assigned_target.length === 0;
        });

        if (kpisWithAssignedTargets.length > 0) {
            // Prepare data for assigned targets display
            const assignedTargets = kpisWithAssignedTargets.map(kpi => {
                const matchingKpi = kpiData.find(k => k.id === kpi.id);
                return {
                    kpi: kpi.kpi,
                    targets: matchingKpi?.assigned_target || []
                };
            });

            setAssignedTargetsData(assignedTargets);
            setShowAssignedTargets(true);
        }

        // If there are KPIs without assigned targets, proceed with the distribution interface
        if (kpisWithoutAssignedTargets.length > 0) {
            if (selectedKPIsData.length > 0) {
                const firstKpi = selectedKPIsData[0];
                const matchingKpi = kpiData.find(k => k.id === firstKpi.id);
                if (matchingKpi) {
                    setActiveTab(matchingKpi.roles.name);
                }
            }

            setSelectedKPIs(kpisWithoutAssignedTargets); // Only set unassigned KPIs for distribution
            setIsSendGoalsClicked(true);
        }
    };

    const handleSelectChange = (option: any) => {
        setSelectedEmployee(option);
        if (option) {
            console.log('Selected Employee ID:', option.id);
            console.log('Selected Employee User ID:', option.user_id);
            console.log('role is', option.role);
        }
    };

    const renderTabs = () => {
        if (!isSetGoalsClicked) return null;

        const activeRole = roles.find(role => role.name.toLowerCase() === activeTab.toLowerCase());
        const activeRoleId = activeRole?.id?.toString(); // Normalize to string for comparison

        console.log('Active Role ID:', activeRoleId);
        console.log('Active Role:', activeRole);

        const filteredEmployees = employees.filter(emp => {
            console.log('=== Checking employee:', emp.name, '===');
            console.log('Employee roles:', emp.kpiRoles);
            console.log('Employee preferences:', emp.aceAndGoalPreference);
            console.log('Active Role ID:', activeRoleId);
            console.log('Active Role Name:', activeRole?.name);

            // Check if employee has kpiRoles array
            if (!emp.kpiRoles || !Array.isArray(emp.kpiRoles)) {
                console.log('No kpiRoles found for:', emp.name);
                return false;
            }

            // Convert all role IDs to strings for comparison
            const normalizedRoles = emp.kpiRoles.map(roleId => roleId.toString());
            console.log('Normalized roles:', normalizedRoles);

            // Check if the active role ID exists in the employee's roles (both primary and ancillary)
            const hasRole = normalizedRoles.includes(activeRoleId || '');
            console.log('Has role:', hasRole);

            if (!hasRole) {
                console.log('Employee does not have required role:', emp.name);
                return false;
            }

            // Check aceAndGoalPreference for hide/bypass
            if (emp.aceAndGoalPreference && emp.aceAndGoalPreference.length > 0) {
                console.log('Checking preferences for employee:', emp.name);

                // Find preference for the current active role
                const preference = emp.aceAndGoalPreference.find(p => {
                    console.log('Checking preference:', p);
                    console.log('Comparing:', p.role_id.toString(), 'with', activeRoleId);
                    console.log('Types - preference.role_id:', typeof p.role_id, 'activeRoleId:', typeof activeRoleId);
                    return p.role_id.toString() === activeRoleId;
                });

                console.log('Found preference:', preference);

                // If there's a preference for this role and isHidden is 1, don't show the employee
                if (preference && preference.isHidden === 1) {
                    console.log('Employee is hidden for this role:', emp.name);
                    return false;
                }
            }

            console.log('Employee will be shown:', emp.name);
            return true;
        });

        console.log('Filtered employees:', filteredEmployees);

        isMyKPITab = empData.leadership_kpi_id == activeRole?.id;

        // Sort roles to put My KPI first
        const sortedRoles = [...roles].sort((a, b) => {
            if (a.id === empData.leadership_kpi_id) return -1;
            if (b.id === empData.leadership_kpi_id) return 1;
            return 0;
        });

        // Filter out roles where current user has isHidden: 1
        console.log('empData from AuthContext:', empData);
        console.log('currentUserData from API:', currentUserData);
        const currentUserPreferences = currentUserData?.ace_and_goal_preference || [];
        console.log('Current user preferences:', currentUserPreferences);
        console.log('All roles before filtering:', sortedRoles);

        const visibleRoles = sortedRoles.filter(role => {
            const userPreference = currentUserPreferences.find((pref: any) =>
                pref.role_id.toString() === role.id.toString()
            );
            console.log(`Checking role ${role.name} (ID: ${role.id}), preference:`, userPreference);

            // If no preference exists, show the role
            if (!userPreference) {
                return true;
            }

            // If isHidden=1, hide the role regardless of bypass status
            if (userPreference.isHidden === 1) {
                return false;
            }

            // If isHidden=0, show the role (it might be bypassed, but we'll handle that in the UI)
            return true;
        });

        console.log('Visible roles after filtering:', visibleRoles);

        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}
                    >
                        {visibleRoles.length === 0 ? (
                            <div style={{ color: 'gray', fontStyle: 'italic' }}>
                                No ACE & Goal records available
                            </div>
                        ) : (
                            visibleRoles.map(role => {
                                const userPreference = currentUserPreferences.find((pref: any) =>
                                    pref.role_id.toString() === role.id.toString()
                                );

                                // Check if role is bypassed (isHidden=0 and isBypass=1)
                                const isBypassed = userPreference && userPreference.isHidden === 0 && userPreference.isBypass === 1;

                                return (
                                    <div key={role.id} style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => {
                                                if (isBypassed) {
                                                    // Don't allow clicking if bypassed
                                                    return;
                                                }
                                                console.log('Role clicked:', role);
                                                setShowControlForm(false);
                                                setActiveTab(role.name);
                                                setSelectedEmployee(null);
                                                table.resetRowSelection();
                                                setIsSendGoalsClicked(false);
                                                setSearchInput('');
                                                table.setGlobalFilter('');
                                                setShowAssignedTargets(false);
                                                setAssignedTargetsData([]);
                                            }}
                                            style={{
                                                minWidth: '120px',
                                                maxWidth: 'fit-content',
                                                width: 'auto',
                                                padding: '10px 20px',
                                                border: '1px solid',
                                                borderRadius: '6px',
                                                background: empData.leadership_kpi_id == role.id
                                                    ? '#04BE19'
                                                    : isBypassed
                                                        ? '#e5e7eb'
                                                        : 'transparent',
                                                cursor: isBypassed ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold',
                                                borderColor: activeTab === role.name ? '#007bff' : 'lightgray',
                                                color: empData.leadership_kpi_id == role.id
                                                    ? '#ffffff'
                                                    : isBypassed
                                                        ? '#d1d5db'
                                                        : '#007bff',
                                                display: 'inline-block',
                                                fontSize: '12px',
                                                transition: '0.3s ease',
                                                textAlign: 'center',
                                                whiteSpace: 'normal',
                                                lineHeight: '1.4',
                                                height: 'auto',
                                                boxShadow: activeTab === role.name ? '0 0 0 2px rgba(0,123,255,0.25)' : 'none',
                                                opacity: isBypassed ? 0.7 : 1
                                            }}
                                            title={isBypassed ? `You are bypassed for this role` : role.name}
                                            disabled={isBypassed}
                                        >
                                            {empData.leadership_kpi_id == role.id ? "My KPI" : role.name}
                                        </button>
                                        {isBypassed && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                color: '#dc2626',
                                                fontSize: '10px',
                                                marginTop: '4px',
                                                textAlign: 'center',
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                (You are bypassed for this role)
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: 'auto',
                            gap: '10px',
                            height: '40px'
                        }}
                    >
                        <div style={{ width: '200px' }}>
                            <ReactSelect
                                options={filteredEmployees.length > 0 ? filteredEmployees : []}
                                value={selectedEmployee}
                                onChange={handleSelectChange}
                                placeholder={filteredEmployees.length > 0 ? "My Team Member" : "No team members"}
                                isDisabled={filteredEmployees.length === 0}
                            />
                        </div>
                    </div> */}
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>Error: {error}</div>
                ) : (
                    <div>
                        <AdvanceTableProvider {...table}>
                            {/* <Row className="g-3 justify-content-between my-2">
                                <Col xs="auto">
                                    <div className="d-flex">
                                        <SearchBox
                                            placeholder="Search KPI's"
                                            className="me-2"
                                            onChange={handleSearchInputChange}
                                            value={searchInput}
                                        />
                                    </div>
                                </Col>
                            </Row> */}
                            <AdvanceTable
                                tableProps={{
                                    className: 'phoenix-table fs-12',
                                    bordered: true,
                                    style: { cursor: 'pointer' }
                                }}
                                rowClassName="hover-actions-trigger btn-reveal-trigger"
                            />
                            <AdvanceTableFooter pagination />
                        </AdvanceTableProvider>
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (isSendGoalsClicked && selectedKPIs.length > 0) {

            const kpisByRole = selectedKPIs.reduce((acc, kpi) => {
                const matchingKpi = kpiData.find(k => k.id === kpi.id);
                const roleName = matchingKpi?.roles.name || 'Unknown';
                if (!acc[roleName]) {
                    acc[roleName] = [];
                }
                acc[roleName].push(kpi);
                return acc;
            }, {} as Record<string, Goal[]>);


            const firstRoleWithKPIs = Object.keys(kpisByRole)[0];
            if (firstRoleWithKPIs) {
                setSendActiveTab(firstRoleWithKPIs);
            }
        }
    }, [isSendGoalsClicked, selectedKPIs, kpiData]);

    const handleUnlock = (memberId: string, kpiId: number) => {
        setIsEditable(true);

        setLockedTargets(prev => {
            const newLockedTargets = { ...prev };
            delete newLockedTargets[`${memberId}_${kpiId}`];
            return newLockedTargets;
        });
    };

    const handleLock = (memberId: string, kpiId: number) => {
        setIsEditable(false);
        // Add this member to locked targets
        setLockedTargets(prev => ({
            ...prev,
            [`${memberId}_${kpiId}`]: true
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, kpiId: number, memberId: string) => {
        const newValue = e.target.value === "" ? 0 : Number(e.target.value);

        setSelectedKPIs(prevKPIs =>
            prevKPIs.map(kpi => {
                if (kpi.id === kpiId) {
                    const currentKPI = kpi;
                    const activeRole = roles.find(role => role.name.toLowerCase() === sendActiveTab.toLowerCase());
                    const activeRoleId = activeRole?.id?.toString();

                    const roleTeamMembers = employees.filter(emp => {
                        if (!emp.kpiRoles || !Array.isArray(emp.kpiRoles)) return false;
                        const normalizedRoles = emp.kpiRoles.map(roleId => roleId.toString());
                        const hasRole = normalizedRoles.includes(activeRoleId || '');

                        if (!hasRole) return false;

                        // Check aceAndGoalPreference for hide/bypass
                        if (emp.aceAndGoalPreference && emp.aceAndGoalPreference.length > 0) {
                            // Find preference for the current active role
                            const preference = emp.aceAndGoalPreference.find(p =>
                                p.role_id.toString() === activeRoleId
                            );

                            // If there's a preference for this role and isHidden is 1, don't show the employee
                            if (preference && preference.isHidden === 1) {
                                return false;
                            }
                        }

                        return true;
                    });

                    // Filter out bypassed members
                    const nonBypassedMembers = roleTeamMembers.filter(member => {
                        const isBypassed = member.aceAndGoalPreference?.some(
                            pref => pref.role_id.toString() === activeRoleId && pref.isBypass === 1
                        );
                        return !isBypassed;
                    });

                    const otherMembers = nonBypassedMembers.filter(member =>
                        member.user_id.toString() !== memberId
                    );

                    const unlockedMembers = otherMembers.filter(member =>
                        !lockedTargets[`${member.user_id}_${kpiId}`]
                    );

                    const lockedTargetSum = Object.entries(lockedTargets)
                        .filter(([key, isLocked]) => {
                            const [lockedMemberId, lockedKpiId] = key.split('_');
                            return isLocked && lockedKpiId === kpiId.toString() && lockedMemberId !== memberId;
                        })
                        .reduce((sum, [key]) => {
                            const [lockedMemberId] = key.split('_');
                            return sum + (currentKPI.memberTargets?.[lockedMemberId] || 0);
                        }, 0);

                    const remainingTarget = currentKPI.currentMonthTarget - lockedTargetSum;

                    if (newValue > remainingTarget) {
                        return kpi;
                    }

                    const newMemberTargets = { ...(currentKPI.memberTargets || {}) };
                    newMemberTargets[memberId] = newValue;

                    if (unlockedMembers.length > 0) {
                        const targetPerMember = (remainingTarget - newValue) / unlockedMembers.length;
                        unlockedMembers.forEach(member => {
                            newMemberTargets[member.user_id.toString()] = targetPerMember;
                        });
                    }

                    return {
                        ...kpi,
                        memberTargets: newMemberTargets,
                    };
                }
                return kpi;
            })
        );
    };

    const handleSaveKPIs = async (teamMembers: Employee[]) => {
        if (selectedKPIs.length === 0) {
            swal("Warning!", "Please select at least one KPI", "warning");
            return;
        }

        // Filter out bypassed members from the already filtered teamMembers
        const activeRole = roles.find(role => role.name.toLowerCase() === sendActiveTab.toLowerCase());
        const activeRoleId = activeRole?.id?.toString();

        const nonBypassedMembers = teamMembers.filter(member => {
            const isBypassed = member.aceAndGoalPreference?.some(
                pref => pref.role_id.toString() === activeRoleId && pref.isBypass === 1
            );
            return !isBypassed;
        });

        if (nonBypassedMembers.length === 0) {
            swal("Warning!", "No active team members available", "warning");
            return;
        }

        // Add validation for target distribution
        const validationErrors = [];
        for (const kpi of selectedKPIs) {
            if (kpi.target_type === 'done_not_done') continue;

            const totalDistributed = nonBypassedMembers.reduce((sum, member) => {
                const memberTarget = kpi.memberTargets?.[member.user_id.toString()] ?? (kpi.currentMonthTarget / nonBypassedMembers.length);
                return sum + memberTarget;
            }, 0);

            // Check if the total distributed target matches the original target
            if (Math.abs(totalDistributed - kpi.currentMonthTarget) > 0.01) { // Using 0.01 to account for floating point precision
                validationErrors.push(`Total distribution for "${kpi.kpi}" (${totalDistributed}) does not match target (${kpi.currentMonthTarget})`);
            }
        }

        if (validationErrors.length > 0) {
            swal("Validation Error!", validationErrors.join("\n"), "error");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];

            const createTaskPromises = nonBypassedMembers.flatMap(member => {
                // Determine if the role is primary or ancillary for this member
                const isPrimaryRole = member.role_id === activeRoleId;
                const isAncillaryRole = member.ancillary_roles?.includes(activeRoleId || '');
                const roleType = isPrimaryRole ? 'primary' : isAncillaryRole ? 'ancillary' : 'unknown';

                return selectedKPIs.flatMap(kpi => {
                    const key = `${member.user_id}_${kpi.id}`;

                    // For done/not done, only create if checked
                    if (kpi.target_type === 'done_not_done') {
                        if (!doneNotDoneSelections[key]) return [];
                        // Only create if checked
                        const kpimonth = isAdmin ? format(selectedDate || new Date(), 'M') : format(new Date(), 'M');
                        const kpiyear = isAdmin ? format(selectedDate || new Date(), 'yyyy') : format(new Date(), 'yyyy');
                        const matchingKpi = kpiData.find(k => k.id === kpi.id);
                        const kpiPriority = matchingKpi?.priority || "High";
                        const kpiDescription = matchingKpi?.description || "";
                        const payload = {
                            stage_id: 2,
                            title: kpi.kpi,
                            priority: kpiPriority,
                            task_type: "kpi",
                            created_by: member.user_id,
                            assigned_by: userId,
                            target_type: 'Done/Not Done',
                            target_value: '0',
                            kpi_id: kpi.id,
                            kpi_month: kpimonth,
                            kpi_year: kpiyear,
                            role_id: activeRoleId,
                            role_type: roleType,
                            description: kpiDescription
                        };
                        return axiosInstance.post('/createTask', payload, {
                            headers: { 'Authorization': `Bearer ${cleanToken}` }
                        });
                    } else {
                        // ...existing logic for other types...
                        let targetValue = (kpi.memberTargets?.[member.user_id.toString()] ?? (kpi.currentMonthTarget / nonBypassedMembers.length)).toString();
                        if (parseFloat(targetValue) === 0) return [];
                        const kpimonth = isAdmin ? format(selectedDate || new Date(), 'M') : format(new Date(), 'M');
                        const kpiyear = isAdmin ? format(selectedDate || new Date(), 'yyyy') : format(new Date(), 'yyyy');
                        const matchingKpi = kpiData.find(k => k.id === kpi.id);
                        const kpiPriority = matchingKpi?.priority || "High";
                        const kpiDescription = matchingKpi?.description || "";
                        const payload = {
                            stage_id: 2,
                            title: kpi.kpi,
                            priority: kpiPriority,
                            task_type: "kpi",
                            created_by: member.user_id,
                            assigned_by: userId,
                            target_type: kpi.target_type,
                            target_value: targetValue === '0' ? '0' : parseFloat(targetValue).toFixed(2),
                            kpi_id: kpi.id,
                            kpi_month: kpimonth,
                            kpi_year: kpiyear,
                            role_id: activeRoleId,
                            role_type: roleType,
                            description: kpiDescription
                        };
                        return axiosInstance.post('/createTask', payload, {
                            headers: { 'Authorization': `Bearer ${cleanToken}` }
                        });
                    }
                });
            });

            const responses = await Promise.all(createTaskPromises);

            if (responses.every(response => response?.data?.success)) {
                // Refresh KPI data based on user role
                const month = isAdmin ? format(selectedDate || new Date(), 'M') : format(new Date(), 'M');
                const year = isAdmin ? format(selectedDate || new Date(), 'yyyy') : format(new Date(), 'yyyy');

                const kpiListingUrl = `/kpiListing?userId=${userId}&isAdmin=${isAdmin ? 1 : 0}&month=${month}&year=${year}`;

                try {
                    const kpiResponse = await axiosInstance.get(kpiListingUrl, {
                        headers: {
                            'Authorization': `Bearer ${cleanToken}`
                        }
                    });

                    setKpiData(kpiResponse.data);

                    const uniqueRolesMap = new Map();
                    kpiResponse.data.forEach((kpi: KPI) => {
                        if (kpi.roles) {
                            uniqueRolesMap.set(kpi.roles.id, kpi.roles);
                        }
                    });

                    const uniqueRoles = Array.from(uniqueRolesMap.values());
                    setRoles(uniqueRoles);
                    if (uniqueRoles.length > 0 && (!activeTab || !uniqueRoles.find(role => role.name === activeTab))) {
                        setActiveTab(uniqueRoles[0].name);
                    }
                } catch (error) {
                    console.error('Error refreshing KPI data:', error);
                }

                swal("Success!", "KPI tasks created successfully", "success");
                setIsSendGoalsClicked(false);
                table.resetRowSelection();
                setLockedTargets({});
            } else {
                swal("Warning!", "Some KPI tasks failed to create", "warning");
            }
        } catch (error) {
            console.error('Error creating KPI tasks:', error);
            swal("Error!", "Failed to create KPI tasks", "error");
        } finally {
            setLoading(false);
        }
    };


    // const renderSendTabs = () => {
    //     if (!isSendGoalsClicked) return null;

    //     // Group KPIs by role
    //     const kpisByRole = selectedKPIs.reduce((acc, kpi) => {
    //         const matchingKpi = kpiData.find(k => k.id === kpi.id);
    //         const roleName = matchingKpi?.roles.name || 'Unknown';
    //         if (!acc[roleName]) {
    //             acc[roleName] = [];
    //         }
    //         acc[roleName].push(kpi);
    //         return acc;
    //     }, {} as Record<string, Goal[]>);

    //     const activeRole = roles.find(role => role.name.toLowerCase() === activeTab.toLowerCase());
    //     const activeRoleId = activeRole?.id?.toString();

    //     // Get team members for active tab/role (including both primary and ancillary roles)
    //     const roleTeamMembers = employees.filter(emp => {
    //         if (!emp.kpiRoles || !Array.isArray(emp.kpiRoles)) return false;
    //         const normalizedRoles = emp.kpiRoles.map(roleId => roleId.toString());
    //         const hasRole = normalizedRoles.includes(activeRoleId || '');

    //         if (!hasRole) return false;

    //         // Check aceAndGoalPreference for hide/bypass
    //         if (emp.aceAndGoalPreference && emp.aceAndGoalPreference.length > 0) {
    //             // Find preference for the current active role
    //             const preference = emp.aceAndGoalPreference.find(p =>
    //                 p.role_id.toString() === activeRoleId
    //             );

    //             // If there's a preference for this role and isHidden is 1, don't show the employee
    //             if (preference && preference.isHidden === 1) {
    //                 return false;
    //             }
    //         }

    //         return true;
    //     });

    //     // Calculate divided targets for each KPI based on non-bypassed members only
    //     const nonBypassedMembers = roleTeamMembers.filter(member => {
    //         const isBypassed = member.aceAndGoalPreference?.some(
    //             pref => pref.role_id.toString() === activeRoleId && pref.isBypass === 1
    //         );
    //         return !isBypassed;
    //     });

    //     const teamMemberCount = nonBypassedMembers.length;

    //     // Debug: Log the distribution calculation
    //     console.log('Target Distribution Debug:');
    //     console.log('Total team members (including bypassed):', roleTeamMembers.length);
    //     console.log('Non-bypassed members:', nonBypassedMembers.length);
    //     console.log('Bypassed members:', roleTeamMembers.length - nonBypassedMembers.length);
    //     console.log('Active role:', sendActiveTab);

    //     const dividedKPIs = kpisByRole[sendActiveTab]?.map(kpi => {
    //         const dividedTarget = teamMemberCount > 0 ? kpi.currentMonthTarget / teamMemberCount : kpi.currentMonthTarget;
    //         console.log(`KPI "${kpi.kpi}": Total target ${kpi.currentMonthTarget}, divided by ${teamMemberCount} members = ${dividedTarget} each`);
    //         return {
    //             ...kpi,
    //             dividedTarget: dividedTarget,
    //             memberTargets: kpi.memberTargets || {}
    //         };
    //     }) || [];

    //     return (
    //         <>
    //             {loading ? (
    //                 <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                     <Spinner animation="border" variant="primary" />
    //                 </div>
    //             ) : (
    //                 <div>
    //                     <div
    //                         style={{
    //                             display: 'flex',
    //                             flexWrap: 'wrap',
    //                             gap: '10px',
    //                             marginTop: '20px',
    //                             marginBottom: '20px',
    //                             fontFamily: 'Nunito Sans, sans-serif',
    //                         }}
    //                     >
    //                         {Object.keys(kpisByRole).map((roleName) => (
    //                             <button
    //                                 key={roleName}
    //                                 onClick={() => setSendActiveTab(roleName)}
    //                                 style={{
    //                                     padding: '8px 16px',
    //                                     borderRadius: '8px',
    //                                     border: sendActiveTab === roleName ? '2px solid #007bff' : '1px solid #ccc',
    //                                     backgroundColor: sendActiveTab === roleName ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
    //                                     color: sendActiveTab === roleName ? '#007bff' : '#333',
    //                                     fontWeight: sendActiveTab === roleName ? 'bold' : 'normal',
    //                                     cursor: 'pointer',
    //                                     transition: 'all 0.3s ease',
    //                                     boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    //                                     fontFamily: 'Nunito Sans, sans-serif',
    //                                 }}
    //                             >
    //                                 {roleName}
    //                             </button>
    //                         ))}
    //                     </div>

    //                     <div>
    //                         {sendActiveTab && roleTeamMembers.length > 0 && (
    //                             <div style={{ marginBottom: '20px', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                                     {roleTeamMembers.map(member => {
    //                                         const activeRole = roles.find(role => role.name.toLowerCase() === sendActiveTab.toLowerCase());
    //                                         const isPrimaryRole = member.role_id === activeRole?.id?.toString();
    //                                         const isAncillaryRole = member.ancillary_roles?.includes(activeRole?.id?.toString() || '');

    //                                         // Check if member is bypassed
    //                                         const isBypassed = member.aceAndGoalPreference?.some(
    //                                             pref => pref.role_id.toString() === activeRole?.id?.toString() && pref.isBypass === 1
    //                                         );

    //                                         return (
    //                                             <div
    //                                                 key={member.id}
    //                                                 style={{
    //                                                     border: '1px solid #ccc',
    //                                                     padding: '15px',
    //                                                     borderRadius: '5px',
    //                                                     width: 'calc(50% - 10px)',
    //                                                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    //                                                     backgroundColor: isBypassed ? '#ffebee' : 'white'
    //                                                 }}
    //                                             >
    //                                                 <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    //                                                         <span>{member.label} - {sendActiveTab}</span>
    //                                                         <span style={{
    //                                                             fontSize: '12px',
    //                                                             color: isPrimaryRole ? '#28a745' : '#ffc107',
    //                                                             fontWeight: 'normal'
    //                                                         }}>
    //                                                             {isPrimaryRole ? 'Primary' : isAncillaryRole ? 'Ancillary' : ''}
    //                                                             {isBypassed && ' (Bypassed)'}
    //                                                         </span>
    //                                                     </div>
    //                                                     <div>
    //                                                         <FaEdit
    //                                                             style={{ cursor: 'pointer', marginRight: '12px' }}
    //                                                             onClick={() => {
    //                                                                 dividedKPIs.forEach(kpi => {
    //                                                                     handleUnlock(member.user_id.toString(), kpi.id);
    //                                                                 });
    //                                                             }}
    //                                                             title="Edit All"
    //                                                         />
    //                                                     </div>
    //                                                 </div>
    //                                                 <div style={{ marginBottom: '15px', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                                                     {dividedKPIs.map((kpi, index) => (
    //                                                         <div
    //                                                             key={kpi.id}
    //                                                             style={{
    //                                                                 marginBottom: '10px',
    //                                                                 padding: '8px',
    //                                                                 backgroundColor: 'rgba(0, 0, 0, 0.03)',
    //                                                                 borderRadius: '4px',
    //                                                                 fontFamily: 'Nunito Sans, sans-serif'
    //                                                             }}
    //                                                         >
    //                                                             <div
    //                                                                 style={{
    //                                                                     display: 'flex',
    //                                                                     alignItems: 'center',
    //                                                                     justifyContent: 'space-between',
    //                                                                     fontFamily: 'Nunito Sans, sans-serif'
    //                                                                 }}
    //                                                             >
    //                                                                 <div style={{ fontWeight: '500' }}>{kpi.kpi}</div>
    //                                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //                                                                     {kpi.target_type === 'done_not_done' ? (
    //                                                                         <input
    //                                                                             type="checkbox"
    //                                                                             checked={!!doneNotDoneSelections[`${member.user_id}_${kpi.id}`]}
    //                                                                             onChange={e => {
    //                                                                                 setDoneNotDoneSelections(prev => ({
    //                                                                                     ...prev,
    //                                                                                     [`${member.user_id}_${kpi.id}`]: e.target.checked
    //                                                                                 }));
    //                                                                             }}
    //                                                                         />
    //                                                                     ) : (
    //                                                                         <input
    //                                                                             type="number"
    //                                                                             min="0"
    //                                                                             value={
    //                                                                                 isBypassed ? '0' :
    //                                                                                     kpi.target_type === 'done_not_done'
    //                                                                                         ? '-' // This branch is now handled by checkbox
    //                                                                                         : kpi.memberTargets?.[member.user_id.toString()] ?? kpi.dividedTarget.toFixed(2)
    //                                                                             }
    //                                                                             onChange={(e) => handleInputChange(e, kpi.id, member.user_id.toString())}
    //                                                                             disabled={
    //                                                                                 isBypassed ||
    //                                                                                 lockedTargets[`${member.user_id}_${kpi.id}`] ||
    //                                                                                 kpi.target_type === 'done_not_done'
    //                                                                             }
    //                                                                             style={{
    //                                                                                 padding: '5px 10px',
    //                                                                                 border: '1px solid #ccc',
    //                                                                                 borderRadius: '5px',
    //                                                                                 width: '80px',
    //                                                                                 backgroundColor:
    //                                                                                     isBypassed ||
    //                                                                                         lockedTargets[`${member.user_id}_${kpi.id}`] ||
    //                                                                                         kpi.target_type === 'done_not_done'
    //                                                                                         ? 'rgba(200, 200, 200, 0.2)'
    //                                                                                         : 'transparent',
    //                                                                                 color: 'inherit'
    //                                                                             }}
    //                                                                         />
    //                                                                     )}
    //                                                                     {!isBypassed && kpi.target_type !== 'done_not_done' && (
    //                                                                         lockedTargets[`${member.user_id}_${kpi.id}`] ? (
    //                                                                             <FaLock
    //                                                                                 style={{ cursor: 'pointer' }}
    //                                                                                 onClick={() => handleUnlock(member.user_id.toString(), kpi.id)}
    //                                                                                 title="Unlock Editing"
    //                                                                             />
    //                                                                         ) : (
    //                                                                             <FaUnlock
    //                                                                                 style={{ cursor: 'pointer' }}
    //                                                                                 onClick={() => handleLock(member.user_id.toString(), kpi.id)}
    //                                                                                 title="Lock Editing"
    //                                                                             />
    //                                                                         )
    //                                                                     )}
    //                                                                 </div>
    //                                                             </div>
    //                                                         </div>
    //                                                     ))}
    //                                                 </div>
    //                                             </div>
    //                                         );
    //                                     })}
    //                                 </div>
    //                             </div>
    //                         )}
    //                     </div>

    //                     <div style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', fontFamily: 'Nunito Sans, sans-serif' }}>
    //                         <Badge
    //                             bg="primary"
    //                             className="px-3 py-2 cursor-pointer"
    //                             onClick={() => handleSaveKPIs(roleTeamMembers)}
    //                         >
    //                             Save & Create Ticket
    //                         </Badge>
    //                     </div>
    //                 </div>
    //             )}
    //         </>
    //     );
    // };

    const renderSendTabs = () => {
        if (!isSendGoalsClicked) return null;

        // Group KPIs by role
        const kpisByRole = selectedKPIs.reduce((acc, kpi) => {
            const matchingKpi = kpiData.find(k => k.id === kpi.id);
            const roleName = matchingKpi?.roles.name || 'Unknown';
            if (!acc[roleName]) {
                acc[roleName] = [];
            }
            acc[roleName].push(kpi);
            return acc;
        }, {} as Record<string, Goal[]>);

        const activeRole = roles.find(role => role.name.toLowerCase() === activeTab.toLowerCase());
        const activeRoleId = activeRole?.id?.toString();

        // Get team members for active tab/role (including both primary and ancillary roles)
        const roleTeamMembers = employees.filter(emp => {
            if (!emp.kpiRoles || !Array.isArray(emp.kpiRoles)) return false;
            const normalizedRoles = emp.kpiRoles.map(roleId => roleId.toString());
            const hasRole = normalizedRoles.includes(activeRoleId || '');

            if (!hasRole) return false;

            // Check aceAndGoalPreference for hide/bypass
            if (emp.aceAndGoalPreference && emp.aceAndGoalPreference.length > 0) {
                // Find preference for the current active role
                const preference = emp.aceAndGoalPreference.find(p =>
                    p.role_id.toString() === activeRoleId
                );

                // If there's a preference for this role and isHidden is 1, don't show the employee
                if (preference && preference.isHidden === 1) {
                    return false;
                }
            }

            return true;
        });

        // Calculate divided targets for each KPI based on non-bypassed members only
        const nonBypassedMembers = roleTeamMembers.filter(member => {
            const isBypassed = member.aceAndGoalPreference?.some(
                pref => pref.role_id.toString() === activeRoleId && pref.isBypass === 1
            );
            return !isBypassed;
        });

        const teamMemberCount = nonBypassedMembers.length;

        // Debug: Log the distribution calculation
        console.log('Target Distribution Debug:');
        console.log('Total team members (including bypassed):', roleTeamMembers.length);
        console.log('Non-bypassed members:', nonBypassedMembers.length);
        console.log('Bypassed members:', roleTeamMembers.length - nonBypassedMembers.length);
        console.log('Active role:', sendActiveTab);

        const dividedKPIs = kpisByRole[sendActiveTab]?.map(kpi => {
            const dividedTarget = teamMemberCount > 0 ? kpi.currentMonthTarget / teamMemberCount : kpi.currentMonthTarget;
            console.log(`KPI "${kpi.kpi}": Total target ${kpi.currentMonthTarget}, divided by ${teamMemberCount} members = ${dividedTarget} each`);
            return {
                ...kpi,
                dividedTarget: dividedTarget,
                memberTargets: kpi.memberTargets || {}
            };
        }) || [];

        return (
            <>
                {loading ? (
                    <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', fontFamily: 'Nunito Sans, sans-serif' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                marginTop: '20px',
                                marginBottom: '20px',
                                fontFamily: 'Nunito Sans, sans-serif',
                            }}
                        >
                            {Object.keys(kpisByRole).map((roleName) => (
                                <button
                                    key={roleName}
                                    onClick={() => setSendActiveTab(roleName)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: sendActiveTab === roleName ? '2px solid #007bff' : '1px solid #ccc',
                                        backgroundColor: sendActiveTab === roleName ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                                        color: sendActiveTab === roleName ? '#007bff' : '#333',
                                        fontWeight: sendActiveTab === roleName ? 'bold' : 'normal',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        fontFamily: 'Nunito Sans, sans-serif',
                                    }}
                                >
                                    {roleName}
                                </button>
                            ))}
                        </div>

                        {sendActiveTab && roleTeamMembers.length > 0 && (
                            <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                                <table className="table table-bordered text-center" style={{ fontFamily: 'Nunito Sans, sans-serif', minWidth: '800px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ verticalAlign: 'middle', textAlign: 'left', paddingLeft: '1rem' }}>KPI Name</th>
                                            {roleTeamMembers.map(member => {
                                                const activeRole = roles.find(role => role.name.toLowerCase() === sendActiveTab.toLowerCase());
                                                const isPrimaryRole = member.role_id === activeRole?.id?.toString();
                                                const isAncillaryRole = member.ancillary_roles?.includes(activeRole?.id?.toString() || '');
                                                const isBypassed = member.aceAndGoalPreference?.some(pref => pref.role_id.toString() === activeRole?.id?.toString() && pref.isBypass === 1);

                                                return (
                                                    <th key={member.id} style={{ backgroundColor: isBypassed ? '#ffebee' : 'white' }}>
                                                        <div>{member.label}</div>
                                                        <div style={{ fontSize: '12px', color: isPrimaryRole ? '#28a745' : '#ffc107', fontWeight: 'normal' }}>
                                                            {isPrimaryRole ? 'Primary' : isAncillaryRole ? 'Ancillary' : ''}
                                                            {isBypassed && ' (Bypassed)'}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dividedKPIs.map(kpi => (
                                            <tr key={kpi.id}>
                                                <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>{kpi.kpi}</td>
                                                {roleTeamMembers.map(member => {
                                                    const activeRole = roles.find(role => role.name.toLowerCase() === sendActiveTab.toLowerCase());
                                                    const isBypassed = member.aceAndGoalPreference?.some(pref => pref.role_id.toString() === activeRole?.id?.toString() && pref.isBypass === 1);

                                                    return (
                                                        <td key={member.id} style={{ backgroundColor: isBypassed ? '#ffebee' : 'white', verticalAlign: 'middle' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                                                {kpi.target_type === 'done_not_done' ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!doneNotDoneSelections[`${member.user_id}_${kpi.id}`]}
                                                                        onChange={e => {
                                                                            setDoneNotDoneSelections(prev => ({
                                                                                ...prev,
                                                                                [`${member.user_id}_${kpi.id}`]: e.target.checked
                                                                            }));
                                                                        }}
                                                                        disabled={isBypassed}
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={
                                                                            isBypassed
                                                                                ? '0.00'
                                                                                : kpi.memberTargets?.[member.user_id.toString()] !== undefined
                                                                                    ? kpi.memberTargets[member.user_id.toString()]
                                                                                    : kpi.dividedTarget?.toFixed(2)
                                                                        }
                                                                        onChange={(e) => handleInputChange(e, kpi.id, member.user_id.toString())}
                                                                        disabled={isBypassed || lockedTargets[`${member.user_id}_${kpi.id}`]}
                                                                        style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '5px', width: '80px', backgroundColor: (isBypassed || lockedTargets[`${member.user_id}_${kpi.id}`]) ? 'rgba(200, 200, 200, 0.2)' : 'transparent', color: 'inherit' }}
                                                                    />
                                                                )}
                                                                {!isBypassed && kpi.target_type !== 'done_not_done' && (
                                                                    lockedTargets[`${member.user_id}_${kpi.id}`] ? (
                                                                        <FaLock
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleUnlock(member.user_id.toString(), kpi.id)}
                                                                            title="Unlock Editing"
                                                                        />
                                                                    ) : (
                                                                        <FaUnlock
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleLock(member.user_id.toString(), kpi.id)}
                                                                            title="Lock Editing"
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'flex-end', fontFamily: 'Nunito Sans, sans-serif' }}>
                            <Badge
                                bg="primary"
                                className="px-3 py-2 cursor-pointer"
                                onClick={() => handleSaveKPIs(roleTeamMembers)}
                            >
                                Save & Create Ticket
                            </Badge>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderAssignedTargets = () => {
        if (!showAssignedTargets) return null;

        const activeRole = roles.find(role => role.name.toLowerCase() === activeTab.toLowerCase());
        const activeRoleId = activeRole?.id?.toString();

        // Get a unique list of members who have assigned targets.
        const membersWithAssignedTargets = Array.from(
            new Set(
                assignedTargetsData.flatMap(kpiData =>
                    kpiData.targets.map(target => target.created_by.name)
                )
            )
        ).sort(); // Sort for consistent column order

        const employeeDetailsMap = new Map();
        membersWithAssignedTargets.forEach(name => {
            const employee = employees.find(emp => emp.name === name);
            if (employee) {
                const isBypassed = employee.aceAndGoalPreference?.some(
                    pref => pref.role_id.toString() === activeRoleId && pref.isBypass === 1
                );
                const isPrimaryRole = employee.role_id === activeRoleId;
                const isAncillaryRole = employee.ancillary_roles?.includes(activeRoleId || '');
                employeeDetailsMap.set(name, { isBypassed, isPrimaryRole, isAncillaryRole });
            }
        });

        return (
            <div style={{ marginBottom: '30px', marginTop: '20px', fontFamily: 'Nunito Sans, sans-serif' }}>
                <h5 style={{ marginBottom: '20px', color: '#2c3e50', fontFamily: 'Nunito Sans, sans-serif' }}>
                    Already Assigned KPIs
                </h5>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-bordered text-center" style={{ minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th style={{ verticalAlign: 'middle', textAlign: 'left', paddingLeft: '1rem' }}>KPI Name</th>
                                {membersWithAssignedTargets.map(memberName => {
                                    const details = employeeDetailsMap.get(memberName);
                                    return (
                                        <th key={memberName} style={{ backgroundColor: details?.isBypassed ? '#ffebee' : 'white' }}>
                                            <div>{memberName}</div>
                                            {details && (
                                                <div style={{ fontSize: '12px', color: details.isPrimaryRole ? '#28a745' : '#ffc107', fontWeight: 'normal' }}>
                                                    {details.isPrimaryRole ? 'Primary' : details.isAncillaryRole ? 'Ancillary' : ''}
                                                    {details.isBypassed && ' (Bypassed)'}
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {assignedTargetsData.map(kpiData => (
                                <tr key={kpiData.kpi}>
                                    <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>{kpiData.kpi}</td>
                                    {membersWithAssignedTargets.map(memberName => {
                                        const target = kpiData.targets.find(t => t.created_by.name === memberName);
                                        const details = employeeDetailsMap.get(memberName);

                                        return (
                                            <td key={memberName} style={{ backgroundColor: details?.isBypassed ? '#ffebee' : 'white', verticalAlign: 'middle' }}>
                                                {target ? (target.target_type === 'Done/Not Done' ? 'Assigned' : target.target_value) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="setace-goals">
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '20px',
                    marginBottom: '40px',
                    fontFamily: 'Nunito Sans, sans-serif',
                    flexWrap: 'wrap'
                }}
            >
                {/* Badges for employee info */}
                {(!isAdmin || isGoalCreated || showControlForm) && !showControlForm && (
                    <>
                        <Badge
                            bg="primary"
                            variant="phoenix"
                            className="me-3"
                            style={{
                                padding: '8px 16px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Employee name : {empName}
                        </Badge>
                        <Badge
                            bg="info"
                            variant="phoenix"
                            style={{
                                padding: '8px 16px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            IsUnder : {data === empName ? 'InorbVict' : data}
                        </Badge>
                    </>
                )}

                {/* Admin: KPI Dashboard */}
                {isAdmin && !isGoalCreated && !showControlForm && (
                    <>
                        <Badge
                            bg="success"
                            className="me-3"
                            onClick={() => {
                                setActiveDashboard('firstLine');
                                setShowLastuserDashboard(false);
                                setShowControlForm(false);
                            }}
                            style={{
                                padding: '8px 16px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            Dashboard
                        </Badge>
                        <Badge
                            bg="warning"
                            className="me-3"
                            onClick={() => {
                                setShowControlForm(true);
                                setActiveDashboard('other');
                                setShowLastuserDashboard(false);
                            }}
                            style={{
                                padding: '8px 16px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            Control Panel
                        </Badge>
                    </>
                )}

                {/* Admin: Control Panel open */}
                {isAdmin && showControlForm && (
                    <Badge
                        bg="success"
                        className="me-3"
                        onClick={() => {
                            setShowControlForm(false);
                            setActiveDashboard('firstLine');
                            setShowLastuserDashboard(false);
                        }}
                        style={{
                            padding: '8px 16px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        Dashboard
                    </Badge>
                )}

                {/* Admin: Create Ace & Goal and Date Picker */}
                {isAdmin && !selectedDate && (
                    <Badge
                        bg="primary"
                        className="px-3 py-2 cursor-pointer"
                        onClick={() => {
                            setShowControlForm(false);
                            handleCreateGoalClick();
                        }}
                        style={{
                            padding: '8px 16px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '10px',
                            fontFamily: 'Nunito Sans, sans-serif',
                        }}
                    >
                        Create Ace &amp; Goal
                    </Badge>
                )}

                {/* Admin: Date Picker */}
                {isAdmin && isGoalCreated && (
                    <div className="date-picker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            placeholderText="Select Month/Year"
                            className="form-control"
                            wrapperClassName="date-picker-wrapper"
                            minDate={minDate}
                            onFocus={(e) => e.target.blur()}
                        />
                    </div>

                )}
  <style>
                                    {`
      .date-picker-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .dashboard-btn-wrapper {
        margin-left: auto;
      }
      .react-datepicker {
        border: none;
        border-radius: 12px;
        padding: 0;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
        font-family: Arial, sans-serif;
        width: 300px;
        overflow: hidden;
      }
      .react-datepicker__triangle { display: none; }
      .react-datepicker__header {
        padding: 16px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background: white;
        border-bottom: 1px solid #eee;
      }
      .react-datepicker__current-year {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
      .react-datepicker__navigation {
        top: 16px;
        width: 24px;
        height: 24px;
      }
      .react-datepicker__navigation--previous {
        left: 16px;
        border-right-color: #333;
      }
      .react-datepicker__navigation--next {
        right: 54px;
        border-left-color: #333;
      }
      .react-datepicker__close-button {
        position: absolute;
        top: 16px;
        right: 16px;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        background: none;
        border: none;
        padding: 0;
        line-height: 1;
      }
      .react-datepicker__month-container { padding: 16px; }
      .react-datepicker__month-wrapper {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 16px;
      }
      .react-datepicker__month-text {
        padding: 10px 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }
      .react-datepicker__month-text:hover { background-color: #f0f0f0; }
      .react-datepicker__month-text--selected,
      .react-datepicker__month-text--keyboard-selected {
        background-color: #3366ff;
        color: white;
      }
      .react-datepicker__apply-button {
        display: block;
        width: 100%;
        background-color: #3366ff;
        color: white;
        text-align: center;
        padding: 12px 0;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        border: none;
        margin-top: auto;
      }
      .react-datepicker__apply-button:hover { background-color: #2a5ed9; }
    `}
                                </style>
                {/* Non-admin dashboards */}
                {!isAdmin && hasChildren && (
                    <Badge
                        bg="success"
                        className="me-3"
                        style={{
                            padding: '8px 16px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setActiveDashboard('firstLine');
                            setShowLastuserDashboard(false);
                            setShowControlForm(false);
                        }}
                    >
                        Dashboard
                    </Badge>
                )}
                {!isAdmin && !hasChildren && (
                    <Badge
                        bg="success"
                        className="me-3"
                        style={{
                            padding: '8px 16px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setShowLastuserDashboard(true);
                            setActiveDashboard('other');
                            setShowControlForm(false);
                        }}
                    >
                        Dashboard
                    </Badge>
                )}

                {!isAdmin && (
                    <Badge
                        bg="secondary"
                        className="px-3 py-2"
                        style={{ marginRight: '10px', fontFamily: 'Nunito Sans, sans-serif' }}
                    >
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Badge>
                )}

                {/* Back button always at the right */}
                <div style={{ marginLeft: 'auto' }}>
                    <button
                        style={{
                            padding: '8px 20px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontFamily: 'Nunito Sans, sans-serif',
                            fontWeight: 400,
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                        onClick={() => {
                            setIsGoalCreated(false);
                            setShowControlForm(false);
                            setShowLastuserDashboard(false);
                            setActiveDashboard('other');
                            setSelectedDate(null);
                        }}
                    >
                        Back to Main Dashboard
                    </button>
                </div>
            </div>



            {isAdmin && isGoalCreated && selectedDate && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        margin: '0 0 24px 0',
                        padding: '12px 0',
                        borderBottom: '1px solid #eee',
                        background: '#f8f9fa',
                        gap: '24px',
                    }}
                >
                    <div style={{ minWidth: 220 }}>
                        <SearchBox
                            placeholder="Search KPI's"
                            className="me-2"
                            onChange={handleSearchInputChange}
                            value={searchInput}
                        />
                    </div>
                    <div style={{ width: 220 }}>
                        <ReactSelect
                            options={employees}
                            value={selectedEmployee}
                            onChange={handleSelectChange}
                            placeholder="My Team Member"
                            isDisabled={employees.length === 0}
                        />
                    </div>
                </div>
            )}
            {activeDashboard === 'firstLine' ? (
                <FirstLineDashboard />
            ) : showLastuserDashboard ? (
                <div className="mt-4">
                    <LastuserDashboard />
                </div>
            ) : showControlForm ? (
                <div className="mt-4">
                    <ControlPanel />
                </div>
            ) : (
                <>
                    {isAdmin && !isGoalCreated && (
                        <KPIDistributionDashboard />
                    )}



                    {renderTabs()}
                    <hr />
                    {isSetGoalsClicked && !isMyKPITab && (
                        <div style={{ marginTop: '20px' }}>
                            <Badge
                                bg="primary"
                                className="px-3 py-2 cursor-pointer"
                                onClick={() => {
                                    setShowControlForm(false);

                                    const activeRole = roles.find(role => role.name.toLowerCase() === activeTab.toLowerCase());
                                    const activeRoleId = activeRole?.id?.toString();

                                    const filteredEmployees = employees.filter(emp => {
                                        if (!emp.kpiRoles || !Array.isArray(emp.kpiRoles)) return false;
                                        const normalizedRoles = emp.kpiRoles.map(roleId => roleId.toString());
                                        return normalizedRoles.includes(activeRoleId || '');
                                    });
                                    if (filteredEmployees.length === 0) {
                                        swal("Warning!", "No team members to assign goals", "warning");
                                    } else {
                                        handleSendGoalsClick();
                                    }
                                }}
                                style={{
                                    marginRight: "10px",
                                    fontFamily: 'Nunito Sans, sans-serif',
                                    backgroundColor: '#007bff',
                                    color: '#ffffff'
                                }}
                            >
                                Send Goal
                            </Badge>
                        </div>
                    )}
                    {renderAssignedTargets()}
                    {renderSendTabs()}
                </>
            )}
        </div>
    );
}

export default SetaceGoals;


