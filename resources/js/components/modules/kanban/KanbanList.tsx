import classNames from 'classnames';
import Button from "../../../components/base/Button";
import { ToastContainer, toast } from "react-toastify";
import React, { useEffect, useState } from 'react';
import { Form as BootstrapForm, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faPlus, faArrowRight, faClock, faFlag, faCalendarAlt, faBullseye } from '@fortawesome/free-solid-svg-icons';
import KanbanListHeader from '../../../components/modules/kanban/KanbanListHeader';
import axiosInstance from '../../../axios';
import Select from 'react-select';
import { Draggable } from 'react-beautiful-dnd';
import TaskPopup from './TaskPopup';
import SubtaskPopup from './SubtaskPopup';
import TargetPopup from './TargetPopup';
import StarPopup from './StarPopup';
import { el } from 'date-fns/locale';
interface KanbanListProps {
  list: {
    id: number | string;
    title?: string;
    isCollapsed?: boolean;
    tasks: KanbanBoardTask[];
  };
  dataObj: {
    tasks: KanbanBoardTask[];
    assignTasks: KanbanBoardTask[];
    assignSubtasks: KanbanBoardTask[];
    task_count: number;
    assignCount: number;
  };
  empInf: { value: string | number; label: string }[];
  refreshTasks: () => Promise<void>;
  showAddTaskButton?: boolean;
  isTask?: boolean;
  searchQuery?: string;
  activeTab?: string;
}

interface KanbanBoardTask {
  id: number | string;
  title: string;
  priority: string;
  start_date: string;
  due_date: string;
  e_hours: number;
  e_minutes: number;
  e_seconds: number;
  task_type: string;
  created_by: {
    id: number;
    user_id: number;
    name: string;
  };
  created_at: string;
  users: { name: string }[];
  sprint_point: string;
  target_type: string;
  target_value: string;
  kpi_month: string;
  kpi_year: string;
  target_completed: string;
  source: string;
  description?: string;
  sub_task_count?: number;
  assigned_by?: {
    id: number;
    user_id: number;
    name: string;
  };
}

const KanbanList = ({ list, dataObj, empInf, refreshTasks, showAddTaskButton, isTask, searchQuery = '', activeTab = 'objective' }: KanbanListProps) => {
  // console.log('data is this', dataObj['assignCount']);
  // console.log("called refresh task",refreshTasks);
  const userId = localStorage.getItem("employee_id");
  const [collapsed, setCollapsed] = useState<boolean>(!!list.isCollapsed);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>("");
  const [assignees, setAssignees] = useState<any[]>([]);
  const [priority, setPriority] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [estimateTime, setEstimateTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<KanbanBoardTask[]>(list.tasks || []);
  // const employees = empInf.map((emp) => ({
  //   value: emp.value, // Mapping user_id to value
  //   label: emp.label,    // The label remains the same
  // }));
  const employees = empInf
    .filter((emp) => emp.value.toString() !== userId) // Exclude the employee with the matching userId
    .map((emp) => ({
      value: emp.value, // Mapping user_id to value
      label: emp.label, // The label remains the same
    }));
  // console.log("Employees array: ", employees);

  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showTargetPopup, setShowTargetPopup] = useState(false);
  const [showStarPopup, setShowStarPopup] = useState(false);
  const [taskSource, setTaskSource] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(""); // State to hold selected value

  const [selectedType, setSelectedType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | string | null>(null);
  const [type, setTaskType] = useState("objective");

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);

    // If "Done/Not Done" is selected, set value to 0 and disable input
    if (value === "Done/Not Done") {
      setTargetValue("0");
    } else {
      setTargetValue(""); // Allow user input for other types
    }
  };

  const handleAddTarget = async () => {
    let hasError = false;
    const newErrors = { type: "", value: "" };

    if (!selectedType) {
      newErrors.type = "Target type is required.";
      hasError = true;
    }

    if (selectedType !== "Done/Not Done" && !targetValue.trim()) {
      newErrors.value = "Target value is required.";
      hasError = true;
    }

    setTargetTypeErrors(newErrors);

    if (hasError) return;

    try {
      const taskId = JSON.parse(localStorage.getItem("taskId") || "null");
      const token = localStorage.getItem("token");
      const cleanToken = token?.split("|")[1];

      if (!taskId) {
        alert("Task ID is missing!");
        return;
      }

      if (!cleanToken) {
        alert("Authorization token is missing!");
        return;
      }

      // console.log("Task ID:", taskId);

      const response = await axiosInstance.post(
        "/updateTarget",
        {
          task_id: taskId,
          target_type: selectedType,
          target_value: targetValue,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle success response
      // console.log("API Response: ", response.data);
      toast.success("Sprint point updated successfully!");
      setShowTargetPopup(false);
      
      // Reset the form fields
      setSelectedType("");
      setTargetValue("");
      setTargetTypeErrors({ type: "", value: "" });
      
      refreshTasks();
    } catch (error) {
      console.error("API Error:", error);

      // Improved error handling
      if (error.response) {
        alert(`Error: ${error.response.data.message || "Something went wrong"}`);
      } else {
        alert("Failed to add target. Please try again.");
      }
    }
  };


  const handleTaskDeleted = () => {
    setShowTaskPopup(false);

    refreshTasks();
  };

  const handleStageNext = () => {
    refreshTasks();
  };

  const handlePriorityChanged = () => {
    refreshTasks();
  };
  const handleStarButtonClick = (taskId: number | string) => {
    localStorage.setItem('taskId', JSON.stringify(taskId));
  };

  const handleChange = async (event) => {
    const value = event.target.value;
    setSelectedValue(value);

    if (value) {
      try {
        const taskId = JSON.parse(localStorage.getItem('taskId') || 'null');
        const token = localStorage.getItem("token");
        const cleanToken = token?.split("|")[1];

        // console.log('Task ID:', taskId);

        // Make sure cleanToken is valid
        if (!cleanToken) {
          throw new Error("Token is missing or invalid");
        }

        const response = await axiosInstance.post('/updateSprintPoint', {
          id: taskId,
          sprint_point: value, // Selected value
        }, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,  // Add Authorization header
          }
        });

        // Handle success response if needed
        // console.log("API Response: ", response.data);
        toast.success("Sprint point updated successfully!");
        setShowStarPopup(false);
        refreshTasks();

      } catch (error) {
        console.error("Error updating sprint point:", error);
        toast.error("Failed to update sprint point.");
      }

    }
  };

  const [errors, setErrors] = useState({
    taskName: false,
    priority: false,
    startDate: false,
    dueDate: false,
  });

  const [targeterrors, setTargetTypeErrors] = useState({
    type: "",
    value: "",
  });


  const handleSaveTask = async () => {
    const newErrors = {
      taskName: !taskName.trim(),
      priority: !priority,
      startDate: !startDate,
      dueDate: !dueDate,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }



    const userPermissions = localStorage.getItem("user_permission");
    const parsedPermissions = userPermissions
      ? JSON.parse(userPermissions)
      : null;


    const userId = localStorage.getItem("employee_id");
    const assigneeIds = assignees.length > 0 ? assignees.map((assignee) => assignee.value) : "";

    const newTask = {
      stage_id: list.id,
      title: taskName,
      user_ids: assigneeIds,
      priority,
      start_date: startDate,
      due_date: dueDate,
      e_hours: estimateTime.hours,
      e_minutes: estimateTime.minutes,
      e_seconds: estimateTime.seconds,
      task_type: "objective",
      created_by: userId,
    };

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const cleanToken = token?.split("|")[1];

      const response = await axiosInstance.post("/createTask", newTask, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const createdTask = response.data;
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      refreshTasks();
      setShowModal(false);
      resetFormFields();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create the task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetFormFields = () => {
    setTaskName("");
    setAssignees([]);
    setPriority("");
    setStartDate("");
    setDueDate("");
    setEstimateTime({ hours: 0, minutes: 0, seconds: 0 });
  };

  // Add helper function to get creator name
  const getCreatorName = (task: KanbanBoardTask) => {
    if (task.task_type?.toUpperCase() === 'KPI') {
      // For KPI tasks, use assigned_by as created by
      if (task.assigned_by?.name) {
        return task.assigned_by.name;
      }
    }
    
    if (typeof task.created_by === 'object' && task.created_by !== null) {
      return task.created_by.name;
    } else if (task.created_name) {
      return task.created_name;
    }
    return 'Unknown';
  };

  // Add helper function to get priority color
  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      "Low": "green",
      "Medium": "orange", 
      "High": "red",
      "Urgent": "darkred",
      "Salary Hold": "darkgreen",
      "Directors Priority": "blue"
    };
    return priorityColors[priority] || "red"; // default to red if priority not found
  };

  const renderTasksForStage = (stageId: number | string) => {
    const tasksToRender = [
      ...(dataObj?.tasks?.map(task => ({ ...task, source: 'task' })) || []),
      ...(dataObj?.assignTasks?.map(task => ({ ...task, source: 'assignTask' })) || []),
      ...(dataObj?.assignSubtasks?.map(task => ({ ...task, source: 'assignSubtask' })) || []),
    ];

    // Filter tasks based on search query and active tab
    const filteredTasks = tasksToRender.filter(task => {
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // For subtasks (assignSubtasks), always show them as they are always objectives
      // For regular tasks, filter based on task_type
      const matchesTab = task.source === 'assignSubtask' 
        ? true // Always show subtasks
        : activeTab === 'objective'
          ? task.task_type?.toUpperCase() === 'OBJECTIVE'
          : task.task_type?.toUpperCase() === 'KPI';

      return matchesSearch && matchesTab;
    });

    return filteredTasks.map((task: KanbanBoardTask, index: number) => {
      const assigneeNames = task.users.map((user) => user.name).join(', ');
      const assigneeInitials = task.users.map((user) => {
        const initials = user.name.split(' ').map((name) => name.charAt(0).toUpperCase()).join('');
        return initials;
      });

      // Determine if dragging should be disabled for this column (stage 7) and not admin
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
      const isDragDisabled = !isAdmin && (list.id === 7 || list.id === '7');

      // --- Start of new logic for assignSubtask card ---
      if (task.source === 'assignSubtask') {
        return (
          <Draggable key={task.id} draggableId={`${task.id}`} index={index} isDragDisabled={isDragDisabled}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="kanban-task"
                style={{
                  ...provided.draggableProps.style,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  margin: '20px',
                  padding: '10px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  backgroundColor: 'rgba(249, 245, 245, 0.2)',
                  border: '1px solid rgba(120, 120, 120, 0.4)',
                  width: 'auto',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  localStorage.setItem("selectedTaskId", JSON.stringify(task.id));
                  setTaskSource(task.source);
                  setShowTaskPopup(true);
                }}
              >
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <span style={{ fontWeight: 600 }}>T-{task.id}</span>
                    <span style={{
                      color: '#6c757d',
                      fontSize: '12px'
                    }}>
                      Created - {new Date(task.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <hr style={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    margin: '4px 0',
                    width: '100%'
                  }} />
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%'
                  }}>
                    <span style={{
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontWeight: '500',
                      fontSize: '12px',
                      color: '#000000',
                      textAlign: 'left',
                      marginBottom: '4px'
                    }}>
                      {task.title}
                    </span>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      color: '#6c757d',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span>Created by - {getCreatorName(task)}</span>
                        {/* <span>|</span>
                        <span>Assignees: {assigneeNames || 'Unassigned'}</span> */}
                        <span>|</span>
                        <span>Priority: <span style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0d6efd' }} />
                          <span>
                            {new Date(task.start_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} to {new Date(task.due_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span>|</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faClock} style={{ color: '#0d6efd' }} />
                          <span>{task.e_hours}h {task.e_minutes}m {task.e_seconds}s</span>
                        </div>
                        <span>|</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {task.users.map((user, index) => {
                            const initials = user.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
                            return (
                              <div
                                key={index}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#0d6efd',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                                title={user.name}
                              >
                                {initials}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Target and Story Point Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* {task.target_type !== null && task.target_value !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faBullseye}
                              style={{
                                color: '#0d6efd',
                                fontSize: '12px'
                              }}
                            />
                            <span>
                              {task.target_type === 'Done/Not Done' ? (
                                `${task.target_type} : ${task.target_completed === "1" ? task.target_type.split('/')[0] : task.target_type.split('/')[1]}`
                              ) : (
                                `${task.target_type} : ${task.target_completed || 0} / ${task.target_value}`
                              )}
                            </span>
                          </div>
                        )} */}
                        {task.target_type !== null && task.target_value !== null && task.sprint_point && (
                          <span>|</span>
                        )}
                        {task.sprint_point && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faStar}
                              style={{
                                color: '#0d6efd',
                                fontSize: '12px'
                              }}
                            />
                            <span>{task.sprint_point}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </h5>
                {/* Task Type Bar */}
                <p
                  style={{
                    margin: '0 4px 4px 0',
                    backgroundColor: 'rgb(251, 205, 40)',
                    borderRadius: '2px 13px 13px 2px',
                    padding: '0 10px 0 8px',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  OBJECTIVE
                </p>
                <div className="card-footer" style={{ padding: "0.2rem" }}>
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="d-flex gap-2">
                      {/* Story Point Button */}
                      <div
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#0d6efd',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStarPopup(true);
                          handleStarButtonClick(task.id);
                        }}
                      >
                        <span style={{ color: 'white', fontSize: '12px' }}>
                          Story Point
                        </span>
                      </div>
                      {/* Target Button */}
                      {task.target_type === null && task.target_value === null && (
                        <div
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#2ecc71',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTargetPopup(true);
                            handleStarButtonClick(task.id);
                          }}
                        >
                          <span style={{ color: 'white', fontSize: '12px' }}>Target</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Draggable>
        );
      }
      // --- End of new logic for assignSubtask card ---

      return (
        <Draggable key={task.id} draggableId={`${task.id}`} index={index} isDragDisabled={isDragDisabled}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="kanban-task"
              style={{
                ...provided.draggableProps.style,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                margin: '20px',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                backgroundColor: 'rgba(249, 245, 245, 0.2)',
                border: '1px solid rgba(120, 120, 120, 0.4)',
                width: 'auto',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedTaskId(task.id);
                localStorage.setItem("selectedTaskId", JSON.stringify(task.id));
                setTaskSource(task.source);
                setShowTaskPopup(true);
              }}
            >
              <h5 style={{
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <span style={{ fontWeight: 600 }}>T-{task.id}</span>
                  <span style={{
                    color: '#6c757d',
                    fontSize: '12px'
                  }}>
                    Created - {new Date(task.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </span>
                </div>
                <hr style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  margin: '4px 0',
                  width: '100%'
                }} />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%'
                }}>
                  <span style={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontWeight: '500',
                    fontSize: '12px',
                    color: '#000000',
                    textAlign: 'left',
                    marginBottom: '4px'
                  }}>
                    {task.title}
                  </span>
                  {task.task_type?.toUpperCase() === 'KPI' && task.description && (
                    <span style={{
                      color: '#6c757d',
                      fontSize: '12px',
                      textAlign: 'left',
                      marginBottom: '4px'
                    }}>
                      {task.description}
                    </span>
                  )}
                  {task.task_type?.toUpperCase() === 'KPI' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      color: '#6c757d',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span>Created by - {task.assigned_by?.name || 'Unknown'}</span>
                        <span>|</span>
                        <span>Assignee to - {task.created_by?.name || 'Unassigned'}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#FB28E2' }} />
                          <span>{task.kpi_month} - {task.kpi_year}</span>
                        </div>
                        <span>|</span>
                        <span>Total subtasks: {task.sub_tasks_count || 0}</span>
                        <span>|</span>
                        <span>Priority: <span style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span></span>
                      </div>
                      {/* Target and Story Point Row for KPI */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {task.target_type !== null && task.target_value !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faBullseye}
                              style={{
                                color: '#FB28E2',
                                fontSize: '12px'
                              }}
                            />
                            <span>
                              {task.target_type === 'Done/Not Done' ? (
                                `${task.target_type} : ${task.target_completed === "1" ? task.target_type.split('/')[0] : task.target_type.split('/')[1]}`
                              ) : (
                                `${task.target_type} : ${task.target_completed || 0} / ${task.target_value}`
                              )}
                            </span>
                          </div>
                        )}
                        {task.target_type !== null && task.target_value !== null && task.sprint_point && (
                          <span>|</span>
                        )}
                        {task.sprint_point && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faStar}
                              style={{
                                color: task.task_type?.toUpperCase() === 'KPI' ? '#FB28E2' : '#0d6efd',
                                fontSize: '12px'
                              }}
                            />
                            <span>{task.sprint_point}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {task.task_type?.toUpperCase() === 'OBJECTIVE' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      color: '#6c757d',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span>Created by - {getCreatorName(task)}</span>
                        <span>|</span>
                        <span>Total subtasks: {task.sub_tasks_count || 0}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#0d6efd' }} />
                          <span>
                            {new Date(task.start_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} to {new Date(task.due_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span>|</span>
                        <span>Priority: <span style={{ color: getPriorityColor(task.priority) }}>{task.priority}</span></span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FontAwesomeIcon icon={faClock} style={{ color: '#0d6efd' }} />
                          <span>{task.e_hours}h {task.e_minutes}m {task.e_seconds}s</span>
                        </div>
                        <span>|</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {task.users.map((user, index) => {
                            const initials = user.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
                            return (
                              <div
                                key={index}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#0d6efd',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                                title={user.name}
                              >
                                {initials}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Target and Story Point Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {task.target_type !== null && task.target_value !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faBullseye}
                              style={{
                                color: task.task_type?.toUpperCase() === 'KPI' ? '#FB28E2' : '#0d6efd',
                                fontSize: '12px'
                              }}
                            />
                            <span>
                              {task.target_type === 'Done/Not Done' ? (
                                `${task.target_type} : ${task.target_completed === "1" ? task.target_type.split('/')[0] : task.target_type.split('/')[1]}`
                              ) : (
                                `${task.target_type} : ${task.target_completed || 0} / ${task.target_value}`
                              )}
                            </span>
                          </div>
                        )}
                        {task.target_type !== null && task.target_value !== null && task.sprint_point && (
                          <span>|</span>
                        )}
                        {task.sprint_point && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FontAwesomeIcon
                              icon={faStar}
                              style={{
                                color: task.task_type?.toUpperCase() === 'KPI' ? '#FB28E2' : '#0d6efd',
                                fontSize: '12px'
                              }}
                            />
                            <span>{task.sprint_point}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </h5>

              {/* Task Type Bar */}
              <p
                style={{
                  margin: '0 4px 4px 0',
                  backgroundColor: task.task_type && task.task_type?.toUpperCase() === 'OBJECTIVE' ? 'rgb(251, 205, 40)' : task.task_type && task.task_type.toUpperCase() === 'KPI' ? 'rgb(251, 40, 226)' : 'rgb(40, 251, 226)',
                  borderRadius: '2px 13px 13px 2px',
                  padding: '0 10px 0 8px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              >
                {task.task_type && task.task_type.toUpperCase()}
                {/* {task.task_type && task.task_type.toUpperCase() === "KPI" && (
                  <span style={{ marginLeft: '8px', fontWeight: 'normal' }}>
                    ({task.kpi_month} - {task.kpi_year})
                  </span>
                )} */}
              </p>

              <div className="card-footer" style={{ padding: "0.2rem" }}>
                <div className="d-flex justify-content-end align-items-center">
                  <div className="d-flex gap-2">
                    {/* Story Point Button */}
                    <div
                      style={{
                        padding: '4px 8px',
                        backgroundColor: task.task_type?.toUpperCase() === 'KPI' ? '#FB28E2' : '#0d6efd',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStarPopup(true);
                        handleStarButtonClick(task.id);
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '12px' }}>
                        Story Point
                      </span>
                    </div>

                    {/* Target Button */}
                    {task.target_type === null && task.target_value === null && (
                      <div
                        style={{
                          padding: '4px 8px',
                          backgroundColor: task.task_type?.toUpperCase() === 'KPI' ? '#FB28E2' : '#2ecc71',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTargetPopup(true);
                          handleStarButtonClick(task.id);
                        }}
                      >
                        <span style={{ color: 'white', fontSize: '12px' }}>Target</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Draggable>
      );
    });
  };

  const getFilteredTaskCount = () => {
    const tasksToCount = [
      ...(dataObj?.tasks?.map(task => ({ ...task, source: 'task' })) || []),
      ...(dataObj?.assignTasks?.map(task => ({ ...task, source: 'assignTask' })) || []),
      ...(dataObj?.assignSubtasks?.map(task => ({ ...task, source: 'assignSubtask' })) || []),
    ];

    return tasksToCount.filter(task => {
      // For subtasks (assignSubtasks), always count them as they are always objectives
      // For regular tasks, filter based on task_type
      const matchesTab = task.source === 'assignSubtask' 
        ? true // Always count subtasks
        : activeTab === 'objective'
          ? task.task_type?.toUpperCase() === 'OBJECTIVE'
          : task.task_type?.toUpperCase() === 'KPI';
      return matchesTab;
    }).length;
  };

  return (
    <div className={classNames("kanban-column scrollbar", { collapsed })} style={{ borderRadius: '8px' }}>
      <KanbanListHeader
        list={list}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        taskCount={getFilteredTaskCount()}
      />
      <div className="py-3 px-4 kanban-add-task">
        {showAddTaskButton && !(list.id === '7' || list.id === '8') && list.title?.toString() === "To Do" && activeTab === 'objective' && (
          <Button
            className="rounded-circle bg-body-tertiary d-flex align-items-center justify-content-center me-2"
            style={{ width: "28px", height: "28px" }}
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="text-white" />
          </Button>
        )}

      </div>
      <div className="kanban-items-container" >
        {renderTasksForStage(list.id)}
      </div>


      {/* TaskPopup Modal */}
      <Modal show={showTaskPopup} onHide={() => setShowTaskPopup(false)} size="xl"
        dialogClassName="modal-90w" style={{ padding: 0, margin: 0 }}>
        {/* <Modal.Header closeButton onClick={() => setShowTaskPopup(false)} style={{ margin: 0 }}>
        </Modal.Header> */}
        <Modal.Body style={{ padding: 0 }}>
          {taskSource === 'assignSubtask' ? (
            <SubtaskPopup
              type={type}
              isTask={isTask}
              onStageNext={handleStageNext}
            />
          ) : (
            <TaskPopup
              taskId={selectedTaskId}
              onTaskDeleted={handleTaskDeleted}
              onPriorityChanged={handlePriorityChanged}
              onStageNext={handleStageNext}
              isTask={isTask}
            />
          )}
        </Modal.Body>

      </Modal>

      {/* TargetPopup Modal */}

      <Modal
        show={showTargetPopup}
        onHide={() => setShowTargetPopup(false)}
      >
        <Modal.Header closeButton />
        <Modal.Body>

          <div
            className="d-flex flex-column"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "20px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
              margin: "0 auto",
            }}
          >
            <h3 className="h5 font-weight-semibold mb-2 text-start" style={{ fontSize: "1rem" }}>
              Type Of Target
            </h3>
            <h5 className="text-muted mb-3 text-start" style={{ fontSize: "0.82rem" }}>
              How do you want to measure this result?
            </h5>

            <hr className="my-3 w-100" style={{ borderTop: "1.5px solid #ccc" }} />

            <h5 className="text-start mb-2" style={{ fontSize: "0.7rem" }}>Objective:</h5>

            <hr className="my-3 w-100" style={{ borderTop: "1px solid #ddd" }} />

            <div className="mb-3">
              <label className="form-label text-start d-block" style={{ fontSize: "0.7rem", marginBottom: "5px" }}>
                Choose Type
              </label>
              <select
                className="form-select"
                style={{
                  fontSize: "0.75rem",
                  height: "32px",
                  padding: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
                value={selectedType}
                onChange={(e) => {
                  handleTypeChange(e);
                  setTargetTypeErrors(prev => ({ ...prev, type: "" })); // clear error on change
                }}
              >
                <option value="">Select Type</option>
                <option value="Number">Number</option>
                <option value="Done/Not Done">Done/Not Done</option>
                <option value="Currency">Currency</option>
              </select>
              {targeterrors.type && <small className="text-danger">{targeterrors.type}</small>}
            </div>

            <div className="mb-3">
              <label className="form-label text-start d-block" style={{ fontSize: "0.7rem", marginBottom: "5px" }}>
                Values of Target*
              </label>
              <input
                type="text"
                className="form-control"
                style={{
                  fontSize: "0.75rem",
                  height: "32px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                value={targetValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits
                  if (value === "" || /^\d+$/.test(value)) {
                    setTargetValue(value);
                    setTargetTypeErrors(prev => ({ ...prev, value: "" }));
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent 'e', '+', '-', '.' and any non-numeric characters
                  if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                disabled={selectedType === "Done/Not Done"}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {/* <input
                type="number"
                className="form-control"
                style={{
                  fontSize: "0.75rem",
                  height: "32px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                value={targetValue}
                onChange={(e) => {
                  const value = e.target.value;

                  // Allow empty string (for erasing input) or whole numbers only
                  if (value === "" || /^[0-9]+$/.test(value)) {
                    setTargetValue(value);
                    setTargetTypeErrors(prev => ({ ...prev, value: "" }));
                  }
                }}
                disabled={selectedType === "Done/Not Done"}
                step="1" // optional: hints browser to increment by whole numbers
                min="0"   // optional: disallow negative numbers if needed
              /> */}

              {targeterrors.value && <small className="text-danger">{targeterrors.value}</small>}
            </div>

            <hr className="my-3 w-100" style={{ borderTop: "1px solid #ddd" }} />

            <div className="d-flex justify-content-end gap-3">
              <button className="btn btn-danger btn-sm px-2" style={{ fontSize: "0.77rem", borderRadius: "5px", padding: "6px 10px" }} onClick={() => setShowTargetPopup(false)}>
                Close
              </button>
              <button
                className="btn btn-success btn-sm px-2"
                style={{ fontSize: "0.77rem", borderRadius: "5px", padding: "6px 13px" }}
                onClick={handleAddTarget}
              >
                Add Target
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>


      {/* Modal Component */}
      <Modal
        show={showStarPopup}
        onHide={() => setShowStarPopup(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>Story Points</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* The select dropdown inside the Modal body */}
          <select
            className="form-select"
            style={{
              fontSize: "0.7rem",
              height: "40px",
              padding: "0.5rem 1rem",
              width: "100%",
              border: "1px solid #babfc7",
              borderRadius: "0.25rem",
              transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              fontFamily:
                '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              boxSizing: "border-box",
              textTransform: "none",
              wordWrap: "normal",
            }}
            value={selectedValue}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Points
            </option>
            {[...Array(8)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </Modal.Body>
      </Modal>


   
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        // Reset all form fields
        setTaskName("");
        setAssignees([]);
        setPriority("");
        setStartDate("");
        setDueDate("");
        setEstimateTime({ hours: 0, minutes: 0, seconds: 0 });
        setErrors({
          taskName: false,
          priority: false,
          startDate: false,
          dueDate: false,
        });
      }}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BootstrapForm>
            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Task Name <span className="text-danger">*</span>
              </BootstrapForm.Label>
              <BootstrapForm.Control
                type="text"
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                style={{ borderColor: errors.taskName ? "red" : undefined }}
              />
              {errors.taskName && <small className="text-danger">Task name is required.</small>}
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Assignee
              </BootstrapForm.Label>
              <Select
                isMulti
                options={employees}
                value={assignees}
                onChange={(selected) => setAssignees(selected as any[] || [])}
                placeholder="Select Assignees"
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#6c757d",
                    fontSize: "0.85rem",
                  }),
                }}
              />
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Priority <span className="text-danger">*</span>
              </BootstrapForm.Label>
              <BootstrapForm.Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  fontSize: "0.85rem",
                  borderColor: errors.priority ? "red" : undefined,
                  color: priority === "" ? "#6c757d" : "inherit",
                }}
              >
                <option value="">Select Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Salary Hold">Salary Hold</option>
                <option value="Directors priority">Directors Priority</option>
              </BootstrapForm.Select>
              {errors.priority && <small className="text-danger">Priority is required.</small>}
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Start Date <span className="text-danger">*</span>
              </BootstrapForm.Label>
              <BootstrapForm.Control
                type="date"
                placeholder="Select Start Date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]} // Prevents selecting dates before today
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  fontSize: "0.85rem",
                  borderColor: errors.startDate ? "red" : undefined,
                }}
              />
              {errors.startDate && (
                <small className="text-danger" style={{ fontSize: "0.75rem" }}>
                  Start date is required.
                </small>
              )}
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Due Date <span className="text-danger">*</span>
              </BootstrapForm.Label>
              {/* <BootstrapForm.Control
                type="date"
                placeholder="Select Due Date"
                value={dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (startDate && new Date(selectedDate) < new Date(startDate)) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      dueDate: true,
                    }));
                  } else {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      dueDate: false,
                    }));
                  }
                  setDueDate(selectedDate);
                }}
                style={{
                  fontSize: "0.85rem",
                  borderColor: errors.dueDate ? "red" : undefined,
                }}
              /> */}
              <BootstrapForm.Control
                type="date"
                placeholder="Select Due Date"
                value={dueDate}
                min={startDate || new Date().toISOString().split('T')[0]}  // Prevents selecting before start date
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (startDate && new Date(selectedDate) < new Date(startDate)) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      dueDate: true,
                    }));
                  } else {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      dueDate: false,
                    }));
                  }
                  setDueDate(selectedDate);
                }}
                style={{
                  fontSize: "0.85rem",
                  borderColor: errors.dueDate ? "red" : undefined,
                }}
              />

              {errors.dueDate && (
                <small className="text-danger" style={{ fontSize: "0.75rem" }}>
                  Due date is required but cannot be earlier than the start date.
                </small>
              )}
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label style={{ fontSize: "0.8rem", fontWeight: "500" }}>
                Estimate Time
              </BootstrapForm.Label>
              <div className="d-flex gap-2">
                <BootstrapForm.Control
                  type="number"
                  placeholder="Hours"
                  min="0"
                  max="12"
                  value={estimateTime.hours}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const value = Math.min(parseInt(e.target.value, 10) || 0, 12);
                    setEstimateTime({
                      ...estimateTime,
                      hours: value,
                    });
                  }}

                />
                <span className="input-group-text">hrs</span>
                <BootstrapForm.Control
                  type="number"
                  placeholder="Minutes"
                  min="0"
                  max="59"
                  onFocus={(e) => e.target.select()}
                  value={estimateTime.minutes}
                  onChange={(e) =>
                    setEstimateTime({
                      ...estimateTime,
                      minutes: Math.min(59, parseInt(e.target.value, 10) || 0),
                    })
                  }
                />

                <span className="input-group-text">min</span>
                <BootstrapForm.Control
                  type="number"
                  placeholder="Seconds"
                  min="0"
                  max="59"
                  onFocus={(e) => e.target.select()}
                  value={estimateTime.seconds}
                  onChange={(e) =>
                    setEstimateTime({
                      ...estimateTime,
                      seconds: Math.min(59, parseInt(e.target.value, 10) || 0),
                    })
                  }
                />
                <span className="input-group-text">sec</span>
              </div>
            </BootstrapForm.Group>
          </BootstrapForm>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            // Reset all form fields
            setTaskName("");
            setAssignees([]);
            setPriority("");
            setStartDate("");
            setDueDate("");
            setEstimateTime({ hours: 0, minutes: 0, seconds: 0 });
            setErrors({
              taskName: false,
              priority: false,
              startDate: false,
              dueDate: false,
            });
          }}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveTask} disabled={loading}>
            {loading ? "Saving..." : "Save Task"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KanbanList;
