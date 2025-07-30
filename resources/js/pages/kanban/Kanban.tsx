import PhoenixDroppable from '../../components/base/PhoenixDroppable';
import KanbanList from '../../components/modules/kanban/KanbanList';
import KanbanProvider, { useKanbanContext } from '../../providers/KanbanProvider';
import MainLayoutProvider, { useMainLayoutContext } from '../../providers/MainLayoutProvider';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import CombinedButtons from "./CombinedButtons.tsx";
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import swal from 'sweetalert';
import { s } from '@fullcalendar/core/internal-common';

const Kanban = () => {
  const { userId } = useParams();
  console.log('USER ID', userId);
  return (
    <MainLayoutProvider>
      <KanbanProvider>
        <KanbanContent userId={userId} />
      </KanbanProvider>
    </MainLayoutProvider>
  );
};


const KanbanContent = ({ userId }) => {
  console.log('EMP ID', userId);
  const { boardLists, kanbanDispatch } = useKanbanContext();
  const { setContentClass } = useMainLayoutContext();
  console.log(boardLists);
  const [employees, setEmployees] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [selectedKpis, setSelectedKpis] = useState([]);
  const [data, setData] = useState<any>(null);  // To store response data
  const [error, setError] = useState<string>(''); // To store any errors
  const [openKpiModal, setOpenKpiModal] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState(localStorage.getItem("start_dt"));
  const [endDate, setEndDate] = useState(localStorage.getItem("end_dt"));
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state
  const [activeTab, setActiveTab] = useState('objective'); // Add state for active tab
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/inorbvictHierarchy');
  };
  const handleNavigateToGoals = () => {
    navigate('/setacegoals');
  };

  const handleNavigateKPI = () => {
    navigate('/inorbvictHierarchyKPI');
  };
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 76 }, (_, i) => currentYear + i);
  });


  const params = {
    start_dt: startDate,
    end_dt: endDate,
  };


  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data in Task ...");
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const userRole = localStorage.getItem("user_role");
      const isAdmin = userRole !== null && userRole.replace(/"/g, "") === "ADMIN";

      // Fetch latest start and end dates directly from localStorage
      const latestStartDate = localStorage.getItem("start_dt");
      const latestEndDate = localStorage.getItem("end_dt");

      if (!latestStartDate || !latestEndDate) {
        console.error("Date range missing!");
        return;
      }

      const params = { start_dt: latestStartDate, end_dt: latestEndDate };
      // const endpoint = `/fetchTask?id=${userId}/${isAdmin ? 1 : 0}`;
      const endpoint = `/fetchTask?id=${userId}`;

      try {
        const response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
          params: params,
        });

        setData(response.data);
        console.log("DATA IS", response.data);
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      }
    };

    fetchData();
  }, [startDate, endDate]); // Ensures API call when dates update

  // Listen for localStorage changes and debounce API calls
  useEffect(() => {
    const handleStorageChange = () => {
      setTimeout(() => {
        setStartDate(localStorage.getItem("start_dt"));
        setEndDate(localStorage.getItem("end_dt"));
      }, 200); // Small delay to ensure values are updated
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // return <div> {/* Kanban Board UI */} </div>;


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        const response = await axiosInstance.get('/employees_list', {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        // // Store the employee names and user_ids
        const employeeOptions = response.data.map((emp: any) => ({
          value: emp.user_id,
          label: emp.name,
        }));

        // Filter out the employee with the same userId
        // const employeeOptions = response.data
        // .filter((emp: any) => {
        //   // console.log('Current userId:', userId, 'Type:', typeof userId);  
        //   // console.log('Emp user_id:', emp.user_id, 'Type:', typeof emp.user_id); 
        //   return emp.user_id.toString() !== userId;  
        // })
        // .map((emp: any) => ({
        //   value: emp.user_id,
        //   label: emp.name,
        // }));

        setEmployees(employeeOptions);

      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        const userRole = localStorage.getItem('user_role');
        const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

        const response = await axiosInstance.get(`tasks/employee_task/${userId}/${isAdmin ? 1 : 0}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        const kpiOptions = response.data.kpis.map((kpi) => ({
          value: kpi.id,
          label: kpi.kpi_name,
        }));

        // Add "Select All" option
        kpiOptions.unshift({
          value: 'all',
          label: 'Select All',
        });

        setKpis(kpiOptions);

      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchKPI();
  }, []);

  useEffect(() => {
    if (setContentClass) {
      setContentClass('kanban-content');
    }

    return () => {
      if (setContentClass) {
        setContentClass('');
      }
    };
  }, [setContentClass]);

  const handleKpiChange = (selectedKpis) => {
    if (selectedKpis.some((option) => option.value === 'all')) {

      setSelectedKpis(kpis.filter((kpi) => kpi.value !== 'all'));
    } else {
      // Set selected KPIs
      setSelectedKpis(selectedKpis);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // Do nothing if there's no destination

    // Dispatch action to move items in the state (this is assumed to be part of your logic)
    kanbanDispatch({
      type: 'MOVE_ITEMS',
      payload: { source, destination },
    });
    const sourceId = source.droppableId;
    const taskId = result.draggableId;
    const destinationStageId = destination.droppableId;


    console.log(`Task ${taskId} was dropped into stage ${destinationStageId}`);


    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      const response = await axiosInstance.post(
        '/updateKanbanStatus',
        {
          id: taskId,
          status: destinationStageId,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );




      swal("Success!", response.data.message, "success");

      const updatedBoardData = await fetchUpdatedData();

      // Dispatch the updated data to the state
      kanbanDispatch({
        type: 'SET_BOARD_LISTS',
        payload: updatedBoardData,
      });

    } catch (err) {
      console.error('Error updating Kanban status:', err);
      swal("Error!", err.data.message || "An error occurred.", "error");
    }
  };

  // A helper function to fetch the updated board data
  const fetchUpdatedData = async () => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    const userPermissions = localStorage.getItem('user_permission');
    const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;

    //new added
    const latestStartDate = localStorage.getItem("start_dt");
    const latestEndDate = localStorage.getItem("end_dt");
    if (!latestStartDate || !latestEndDate) {
      console.error("Date range missing!");
      return;
    }
    //upto here

    const params = { start_dt: latestStartDate, end_dt: latestEndDate };

    //const userId = parsedPermissions ? parsedPermissions.user_id : null;
    const userRole = localStorage.getItem('user_role');
    const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";


    //  const endpoint = `/tasks/employee_task/${userId}/${isAdmin ? 1 : 0}`;
    // const endpoint = `/fetchTask?id=${userId}/${isAdmin ? 1 : 0}`;
    const endpoint = `/fetchTask?id=${userId}`;
    try {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        params: params
      });
      setData(response.data);
      console.log('DATA IS', response.data);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };



  const addMultipleTasks = async () => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    try {
      // Prepare the data you need to send to the API
      //   const tasksToAdd = selectedKpis.map(kpi => ({
      //     created_by: userId,
      //     title: selectedKpis.map(kpi => kpi.label).join(', '),
      //     kpi_year: selectedYear, 
      //     kpi_month: selectedMonth, 
      //   }));
      //     // Log the full array of tasks that you're sending to the API
      // console.log('Tasks to Send to API:', tasksToAdd);

      const task = {
        created_by: userId,
        title: [selectedKpis.map(kpi => kpi.label).join(', ')],
        kpi_year: selectedYear,
        kpi_month: selectedMonth,
      };

      // Log the task data to the console
      console.log('Task to Adds:', task);




      // Send the POST request to your API to add multiple tasks
      const response = await axiosInstance.post(
        '/addMultipleTask', task,

        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data) {
        toast.success("Tasks added successfully");
        setOpenKpiModal(false);  // Close the modal after success
        fetchUpdatedData();  // Refresh the board data
      }
    } catch (error) {
      toast.error("Error adding tasks");
      console.error("Error adding tasks", error);
    }
  };
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedDateOption, setSelectedDateOption] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const priorityOptions = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    {value: 'Salary hold', label: 'Salary hold'},
    {value: 'Directors priority', label: 'Directors Priority'},
  ];

  const handlePriorityChange = (selectedOptions) => {
    setSelectedPriorities(selectedOptions || []);
  };
  const fetchTasks = async () => {
    console.log("FETCHTASK FOR FILTER");
    let params = {};

    // Add the start_dt and end_dt params
    if (startDate && endDate) {
      params['start_dt'] = startDate;
      params['end_dt'] = endDate;
    }

    // Handle date-based filters (e.g., due_date, date_created, etc.)
    if (selectedFilter === "due_date" || selectedFilter === "date_created" || selectedFilter === "start_date") {
      if (selectedDateOption === "today" || selectedDateOption === "yesterday" || selectedDateOption === "tomorrow") {
        params[`${selectedFilter}_single_filter`] = selectedDateOption.charAt(0).toUpperCase() + selectedDateOption.slice(1); // Capitalize first letter
      } else if (selectedDateOption === "dateRange") {
        params[`${selectedFilter}_single_filter`] = "Date Range";
        params[`fromDateFilter`] = fromDate;
        params[`toDateFilter`] = toDate;
      }
    } else if (selectedFilter === "priority") {
      if (selectedPriorities.length > 0) {
        selectedPriorities.forEach(p => {
          params[`priority_filter[]`] = p.value;
        });
      }
    }

    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    const userRole = localStorage.getItem('user_role');
    const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

    // Construct the correct URL with dynamic values
    // const endpoint = `/fetchTask?id=${userId}/${isAdmin ? 1 : 0}`;
    const endpoint = `/fetchTask?id=${userId}`;
    try {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        params: params
      });
      setData(response.data);
      setOpenFilterModal(false); // Close the modal after success 
      // console.log('DATA IS', response.data);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };

  const handleApplyFilter = () => {
    fetchTasks();
  };

  useEffect(() => {

  }, []);

  // useEffect(() => {
  //   fetchTasks();
  // }, [selectedDateOption, toDate, selectedPriorities]);

  const handleClearFilter = () => {
    setSelectedFilter('');
    setSelectedDateOption('');
    setFromDate('');
    setToDate('');
    setPriority('');
    setSelectedPriorities([]);
    fetchTasks();
  };

  return (
    <div>

      <div className="kanban-header px-3 py-2">
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <Button
              variant="primary"
              onClick={() => setOpenFilterModal(true)}
              className="me-2"
            >
              Filter
            </Button>
            <Button
              variant="primary"
              onClick={handleNavigate}
              className="me-2"
            >
              Inorbvict Hierarchy
            </Button>
            <Button
              variant="primary"
              onClick={handleNavigateKPI}
              className="me-2"
            >
              Inorbvict Hierarchy with KPI
            </Button>
          </div>
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Search by task ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* Add Tab Navigation */}
      <div className="px-3 py-2" style={{ backgroundColor: '#E3E6ED' }}>
        <div className="nav nav-tabs" role="tablist" style={{ borderBottom: 'none' }}>
          <button
            className={`nav-link ${activeTab === 'objective' ? 'active' : ''}`}
            onClick={() => setActiveTab('objective')}
            style={{
              border: 'none',
              background: activeTab === 'objective' ? '#0d6efd' : 'white', // Primary blue when active
              padding: '8px 15px', // Reduced padding
              color: activeTab === 'objective' ? 'white' : 'black', // White text when active
              borderBottom: 'none', // Remove the bottom border
              fontWeight: 'bold', // Keep normal font weight
              borderRadius: '5px', // Add rounded corners
              margin: '8px 10px 8px 0', // Add top/bottom margin and right margin
              cursor: 'pointer', // Add pointer cursor
              width: '120px', // Increased width
              textAlign: 'center', // Center text within button
              
            }}
          >
            Objective
          </button>
          <button
            className={`nav-link ${activeTab === 'kpi' ? 'active' : ''}`}
            onClick={() => setActiveTab('kpi')}
            style={{
              border: 'none',
              background: activeTab === 'kpi' ? '#0d6efd' : 'white', // Primary blue when active
              padding: '8px 15px', // Reduced padding
              color: activeTab === 'kpi' ? 'white' : 'black', // White text when active
              borderBottom: 'none', // Remove the bottom border
              fontWeight: 'bold', // Keep normal font weight
              borderRadius: '5px', // Add rounded corners
              margin: '8px 10px 8px 0', // Add top/bottom margin and right margin
              cursor: 'pointer', // Add pointer cursor
              width: '120px', // Increased width
              textAlign: 'center', // Center text within button
            }}
          >
            KPI
          </button>
        </div>
      </div>

      <Modal show={openFilterModal} onHide={() => setOpenFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* First Dropdown - Filter Selection */}
            <Form.Group controlId="filter">
              <Form.Label>Where</Form.Label>
              <Form.Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                <option value="" disabled>Select Filter</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="date_created">Date Created</option>
                {/* <option value="date_updated">Date Updated</option> */}
                <option value="start_date">Start Date</option>
              </Form.Select>
            </Form.Group>

            {/* Second Dropdown - Conditionally Rendered */}
            {["due_date", "date_created", "date_updated", "start_date"].includes(selectedFilter) && (
              <Form.Group controlId="dateFilter" className="mt-3">
                <Form.Label>Select Option</Form.Label>
                <Form.Select value={selectedDateOption} onChange={(e) => setSelectedDateOption(e.target.value)}>
                  <option value="" disabled>Select</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  {/* <option value="tomorrow">Tomorrow</option> */}
                  <option value="dateRange">Date Range</option>
                </Form.Select>
              </Form.Group>
            )}

            {/* Date Range Pickers - Conditionally Rendered */}
            {selectedDateOption === "dateRange" && (
              <Row className="mt-3">
                <Col>
                  <Form.Group controlId="fromDate">
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      max={toDate || undefined} // restrict fromDate to be before or equal to toDate
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="toDate">
                    <Form.Label>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      min={fromDate || undefined} // restrict toDate to be after or equal to fromDate
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {/* Priority Dropdown - Conditionally Rendered */}
            {/* {selectedFilter === "priority" && (
              <Form.Group controlId="priorityFilter" className="mt-3">
                <Form.Label>Select Priority</Form.Label>
                <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)} >
                  <option value="">Select Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Form.Group>
            )} */}

            {selectedFilter === "priority" && (
              <Form.Group controlId="priorityFilter" className="mt-3">
                <Form.Label>Select Priority</Form.Label>
                <Select
                  isMulti // Enable multi-select
                  options={priorityOptions}
                  value={selectedPriorities}
                  onChange={handlePriorityChange}
                  placeholder="Select Priorities"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClearFilter}>
            Clear Filter
          </Button>
          <Button variant="success" onClick={handleApplyFilter}>
            Apply Filter
          </Button>
        </Modal.Footer>
      </Modal>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container scrollbar">
          {employees && data && boardLists.map((list, s) => (
            <PhoenixDroppable key={list.id} droppableId={list.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <KanbanList 
                    list={list} 
                    key={list.id} 
                    dataObj={data.stages[s]} 
                    empInf={employees} 
                    refreshTasks={fetchUpdatedData} 
                    showAddTaskButton={true}  
                    isTask={true}
                    searchQuery={searchQuery}
                    activeTab={activeTab} // Pass active tab to KanbanList
                  />
                  {provided.placeholder}
                </div>
              )}
            </PhoenixDroppable>
          ))}
        </div>
      </DragDropContext>


    </div>
  );
};

export default Kanban;
