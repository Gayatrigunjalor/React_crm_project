import React, { ChangeEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../js/components/base/AdvanceTable';
import AdvanceTableFooter from '../../../js/components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../js/hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../js/providers/AdvanceTableProvider';
import SearchBox from '../../../js/components/common/SearchBox';
import axiosInstance from '../../../js/axios';
import { Button, Col, Row } from 'react-bootstrap';

type Employee = {
  id: number;
  user_id: number;
  name: string;
  role?: { id: number; name: string } | null;
  is_under_id: number | null;
  department?: string;
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();
  const employeeData = JSON.parse(localStorage.getItem('emp_data') || '{}');
  const Id = employeeData.id;
  const [activeTab, setActiveTab] = useState<'teamLeader' | 'department'>('teamLeader');
  const [activeDeptTab, setActiveDeptTab] = useState<string>('all');

  const departmentTabs = [
    'all',
    'Sales',
    'Digital Marketing',
    'Account',
    'Supply Chain Management',
    'Quality Assurance',
    'Data Science',
    'Business Analyst',
    'Business Intelligence',
    'CNS',
    'UI/UX Designer'
  ];

  useEffect(() => {
    const fetchEmployeeList = async () => {
      try {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        const response = await axiosInstance.get('/isUnderEmployeeList', {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employee list:', error);
      }
    };

    fetchEmployeeList();
  }, []);

  useEffect(() => {
    const fetchImmediateHierarchy = async () => {
      try {
        if (Id === null) {
          return;
        }
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        const response = await axiosInstance.get('/getHierarchy_ImmediateHierarchy', {
          params: { id: Id },
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        setChildren(response.data.children);
      } catch (error) {
        console.error('Error fetching:', error);
      }
    };

    fetchImmediateHierarchy();
  }, [Id]);

  useEffect(() => {
    if (activeTab === 'department' && activeDeptTab !== 'all') {
      const filtered = employees.filter(emp => 
        emp.department?.toLowerCase() === activeDeptTab.toLowerCase()
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [activeDeptTab, activeTab, employees]);

  const teamLeaderColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name', 
      header: 'Manager',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontWeight: 'normal' }
        },
        cellProps: {
          className: 'white-space-nowrap ps-2 border-end border-translucent',
        }
      }
    },
    {
      accessorKey: 'role', 
      header: 'Role',
      cell: ({ row: { original } }) => original.role?.name || '',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontWeight: 'normal' }
        },
        cellProps: {
          className: 'white-space-nowrap ps-2 border-end border-translucent',
        }
      }
    },
    {
      id: 'is_under',
      header: 'Is Under',
      cell: ({ row: { original } }) => original.is_under?.name || '',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontWeight: 'normal' }
        },
        cellProps: {
          className: 'white-space-nowrap ps-2 border-end border-translucent',
        }
      }
    },
    {
      id: 'enquiry',
      header: 'Dashboards',
      cell: ({ row: { original } }) => (
        <Link
          to={`/kanban/kanban/${original.user_id}`}
          className="btn btn-info btn-sm"
          onClick={() => {
            localStorage.setItem('employee_id', String(original.user_id));
            localStorage.setItem('emp_id', String(original.id));
            localStorage.setItem('employee_name', original.name);
          }}
          style={{ fontWeight: 'normal' }}
        >
          View Dashboard
        </Link>
      ),
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontWeight: 'normal' }
        },
        cellProps: {
          className: 'white-space-nowrap ps-2 border-end border-translucent',
        }
      }
    },
    {
      id: 'team',
      header: 'Team',
      cell: ({ row: { original } }) => (
        <Link
          to={`/kanban/kanban/${original.user_id}`}
          className="btn btn-info btn-sm"
          style={{ fontWeight: 'normal' }}
        >
          View Team
        </Link>
      ),
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontWeight: 'normal' }
        },
        cellProps: {
          className: 'white-space-nowrap ps-2 border-end border-translucent',
        }
      }
    },
  ];

  const departmentColumns = teamLeaderColumns.filter(col => col.accessorKey !== 'role');
  const columns = activeTab === 'teamLeader' ? teamLeaderColumns : departmentColumns;
  
  const table = useAdvanceTable({
    data: filteredEmployees,
    columns,
    pageSize: 5,
    pagination: true,
    selection: false,
    sortable: true,
  });

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value || undefined);
  };

  return (
    <AdvanceTableProvider {...table}>
      <div className="d-flex justify-content-between mt-4">
        <h2 className="mb-5">Employees</h2>
        <Row className="g-3 justify-content-between">
          <Col xs="auto">
            <div className="d-flex">
              <SearchBox
                placeholder="Search Employee"
                onChange={handleSearchInputChange}
                className="me-2"
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className="mb-4 d-flex">
        <Button
          variant={activeTab === 'teamLeader' ? 'info' : 'light'}
          className={`me-2 border border-translucent ${activeTab === 'teamLeader' ? 'text-white' : 'text-dark'}`}
          onClick={() => {
            setActiveTab('teamLeader');
            setActiveDeptTab('all');
          }}
        >
          Team leader Wise
        </Button>
        <Button
          variant={activeTab === 'department' ? 'info' : 'light'}
          className={`me-2 border border-translucent ${activeTab === 'department' ? 'text-white' : 'text-dark'}`}
          onClick={() => setActiveTab('department')}
        >
          Department Wise
        </Button>
      </div>

      {activeTab === 'department' && (
        <div className="mb-4 d-flex flex-wrap">
          {departmentTabs.map((dept) => (
            <Button
              key={dept}
              variant={activeDeptTab === dept ? 'info' : 'light'}
              className={`me-2 mb-2 border border-translucent ${activeDeptTab === dept ? 'text-white' : 'text-dark'}`}
              onClick={() => setActiveDeptTab(dept)}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </Button>
          ))}
        </div>
      )}

      <div className="border border-translucent">
        <AdvanceTable
          tableProps={{ className: 'phoenix-table fs-9' }}
          rowClassName="hover-actions-trigger btn-reveal-trigger"
        />
      </div>
      <AdvanceTableFooter navBtn className="py-4" />
    </AdvanceTableProvider>
  );
};

export default EmployeeList;
