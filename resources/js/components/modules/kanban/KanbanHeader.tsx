import { Col, Row, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../axios';
import DatePicker from '../../../components/base/DatePicker';

const KanbanHeader = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [showDropdown, setShowDropdown] = useState(false);
  const [reportOption, setReportOption] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [apiUserId, setApiUserId] = useState<number | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
  const userId = localStorage.getItem('employee_id');
  const empId = localStorage.getItem('employee_id');
  const empName = localStorage.getItem('employee_name');

  useEffect(() => {
    const alreadySet = localStorage.getItem('start_dt') && localStorage.getItem('end_dt');
    if (!alreadySet) {
      handleDateRangeChange('This Month');
    }
  }, []);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('start_dt');
    const savedEndDate = localStorage.getItem('end_dt');
    if (savedStartDate && savedEndDate) {
      // setDateRange(
      //   `${new Date(savedStartDate).toLocaleDateString()} - ${new Date(savedEndDate).toLocaleDateString()}`
      // );
      setDateRange(
        `${new Date(savedStartDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} - ${new Date(savedEndDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`
      );

    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdminUser = userRole !== null && userRole.replace(/"/g, '') === 'ADMIN';
   
      const endpoint = `/tasks/employee_task/${userId}/${isAdminUser ? 1 : 0}`;

      try {
        const response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });
        const reportOptions = response.data.reportsTo;
        setReportOption(reportOptions);
        // localStorage.setItem('isunder_name', reportOptions);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // New useEffect to fetch reports to name
  useEffect(() => {
    const fetchReportsToName = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      try {
        const response = await axiosInstance.get('/getReportsToName', {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
          params: {
            id: userId
          }
        });

        console.log('Reports to name response:', response.data);


      } catch (err) {
        console.error('Error fetching reports to name:', err);
        setError('Error fetching reports to name');
      }
    };

    if (userId) {
      fetchReportsToName();
    }
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { path: `/kanban/kanban/${empId}`, label: 'Tasks' },
    { path: '/kanban/kpiDashboard', label: 'KPI Dashboard' },
    { path: '/kanban/objectiveDashboard', label: 'Objective Dashboard' },
    { path: '/kanban/colleaguetask', label: 'Colleague Task' },
  ];

  const handleDateRangeChange = (option: string) => {
    // Always close the custom date modal when any option is selected
    setShowCustomDateModal(false);

    if (option === 'Custom Range') {
      setShowCustomDateModal(true);
      setShowDropdown(false);
      return;
    }

    const endDate = new Date();
    let startDate;

    switch (option) {
      case 'Last 7 Days':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'Last 30 Days':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'Last Month':
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0);
        break;
      case 'This Month':
        startDate = new Date();
        startDate.setDate(1);
        break;
      default:
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
    }

    localStorage.setItem('start_dt', startDate.toISOString().split('T')[0]);
    localStorage.setItem('end_dt', endDate.toISOString().split('T')[0]);

    const formattedDateRange = `${startDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;

    setDateRange(formattedDateRange);
    setShowDropdown(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCustomDateApply = () => {
    if (!customStart || !customEnd) return;


    // const formattedDateRange = `${customStart.toLocaleDateString('en-GB')} - ${customEnd.toLocaleDateString('en-GB')}`;
    const formattedDateRange = `${customStart.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} - ${customEnd.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;

    localStorage.setItem('start_dt', customStart.toLocaleDateString('en-CA')); // yyyy-mm-dd
    localStorage.setItem('end_dt', customEnd.toLocaleDateString('en-CA'));


    setDateRange(formattedDateRange);
    setShowDropdown(false);
    setShowCustomDateModal(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCustomDateCancel = () => {
    setShowCustomDateModal(false);
    setCustomStart(null);
    setCustomEnd(null);
  };

  return (
    <div
      className="kanban-header px-4 py-3"
      style={{
        borderBottom: '2px solid #eaeaea',
      }}
    >
      <Row className="gx-0 justify-content-between align-items-center">
        <Col md="auto">
          <h5
            className="mb-2 fw-bold"
            style={{ fontSize: '1.7rem', color: '#495057' }}
          >
            Individual Task Dashboard
          </h5>
          {userId !== "1" && (
            <p className="mb-0 text-muted" style={{ fontSize: '1.2rem' }}>
              <strong>{empName}</strong> reports to:{' '}
              <strong>{reportOption === empName ? 'Inorbvict' : reportOption}</strong>
            </p>
          )}
        </Col>

        <Col md="auto">
          <div
            className="date-range-box px-3 py-2 text-muted fw-bold"
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              fontSize: '0.9rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {dateRange}
          </div>

          {showDropdown && (
            <Dropdown.Menu
              show
              className="date-range-dropdown"
              ref={dropdownRef}
            >
              <Dropdown.Item onClick={() => handleDateRangeChange('Last 7 Days')}>
                Last 7 Days
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('Last 30 Days')}>
                Last 30 Days
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('Last Month')}>
                Last Month
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('This Month')}>
                This Month
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDateRangeChange('Custom Range')}>
                Custom Range
              </Dropdown.Item>
            </Dropdown.Menu>
          )}
        </Col>
      </Row>

      <Row className="gx-3 mt-3">
        <Col>
          <div className="kanban-nav-labels d-flex gap-3">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-decoration-none ${location.pathname === path ? 'nav-active' : 'nav-inactive'
                  }`}
                style={{
                  color: location.pathname === path ? '#0d6efd' : 'black',
                  fontWeight: location.pathname === path ? 'bold' : 'normal',
                  borderBottom: location.pathname === path ? '2px solid #0d6efd' : 'none',
                  paddingBottom: location.pathname === path ? '0px' : '0px',
                  transition: 'color 0.3s ease, border-bottom 0.3s ease',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </Col>
      </Row>

      {showCustomDateModal && (
        <div className="custom-date-modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <h5 className="mb-3">Select Date Range</h5>
          <div className="mb-3">
            <label className="form-label">Start Date</label>
            <DatePicker
              value={customStart}
              onChange={(dates) => setCustomStart(dates[0])}
              options={{
                dateFormat: 'Y-m-d',
                maxDate: customEnd || undefined
              }}
              render={({ defaultValue, ...props }, ref) => (
                <input
                  ref={ref}
                  {...props}
                  placeholder="YYYY/MM/DD"
                  defaultValue={defaultValue}
                />
              )}
            />

          </div>
          <div className="mb-3">
            <label className="form-label">End Date</label>
            <DatePicker
              value={customEnd}
              onChange={(dates) => setCustomEnd(dates[0])}
              options={{
                dateFormat: 'Y-m-d',
                minDate: customStart || undefined
              }}
              render={({ defaultValue, ...props }, ref) => (
                <input
                  ref={ref}
                  {...props}
                  placeholder="YYYY/MM/DD"
                  defaultValue={defaultValue}
                />
              )}
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={handleCustomDateCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCustomDateApply} disabled={!customStart || !customEnd}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanHeader;