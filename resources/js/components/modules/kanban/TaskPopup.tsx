import React, { useEffect, useRef, useState } from "react";
import Button from "../../base/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFlag, faPlus, faCaretDown, faPaperPlane, faBullseye } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from '../../../axios';
import qs from "qs";
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import { Form, Modal, Table } from "react-bootstrap";
import SubtaskPopup from "./SubtaskPopup";
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import swal from 'sweetalert';
import events from "data/calendarEvents";
interface Stage {
  id: number;
  stage_name: string;
  stage_order: number;
  is_done_stage: number;
  stage_bg_color: string;
  created_at: string | null;
  updated_at: string | null;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  user_ids: string[];
  priority: string;
  start_date: string;
  due_date: string;
  e_hours: number;
  e_minutes: number;
  e_seconds: number;
  task_type: string;
  stage_id: number;
  timer_status: number;
  kpi_year: string | null;
  kpi_month: string | null;
  sprint_point: string;
  target_type: string;
  target_value: string;
  target_completed: string;
  target_remaining: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  isAuthorizedAssignee: number;
  created: string;
  stages: Stage;
  stage_name: string;
}

interface TodoItem {
  id: number;
  checklist: string;
  status: string;
  task_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface SubTaskDataType {
  id: number;
  stage_id: number;
  // other fields as needed
}

const colors = {
  2: '#FF0000',
  3: '#00FF00',
  4: '#0000FF',
  5: '#FFFF00',
  6: '#FF00FF',
  7: '#00FFFF',
  8: '#800080',
};

const TaskPanel = ({ taskId, onTaskDeleted, onPriorityChanged, onStageNext, isTask }) => {
  console.log(taskId);
  const [status, setStatus] = useState("SelectTask");
  const [flag, setFlag] = useState("");
  const [showFlagOptions, setShowFlagOptions] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [columnNAME, setColName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [userIDS, setUserIDS] = useState<string[]>([]);
  const [ehours, setTaskHours] = useState("");
  const [eminutes, setTaskMinutes] = useState("");
  const [eseconds, setTaskSeconds] = useState("");
  const [debouncedDescription, setDebouncedDescription] = useState("");
  const [debouncedHours, setDebouncedHours] = useState("");
  const [debouncedMinutes, setDebouncedMinutes] = useState("");
  const [debouncedSeconds, setDebouncedSeconds] = useState("");
  const [created, setCreated] = useState("");
  const [timelineData, setTimelineData] = useState([]);

  const statusOptions = [
    { label: "To Do", color: "#000000", symbol: "■", stageId: 2 },
    { label: "In Progress", color: "#EAB21A", symbol: "■", stageId: 3 },
    { label: "Hold", color: "#EA06E2", symbol: "■", stageId: 4 },
    { label: "Abort", color: "#3924D6", symbol: "■", stageId: 5 },
    { label: "Review", color: "#3B5998", symbol: "■", stageId: 6 },
  ];

  const [task, setTask] = useState<Task | null>(null);

  const [dateError, setDateError] = useState(""); // State to track validation message
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flagOptions = [
    { label: "Low", color: "green" },
    { label: "Medium", color: "orange" },
    { label: "High", color: "red" },
    { label: "Urgent", color: "darkred" },
    { label: "Salary Hold", color: "darkgreen" },
    { label: "Directors Priority", color: "blue" },
  ];

  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [text, setText] = useState("");
  const [targetCompleted, setTargetCompleted] = useState("");
  const [targetDone, setTargetDone] = useState("");
  const [targRemain, setTargRemain] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetType, setTargetType] = useState("");
  const [targetRemining, setTargetRemaining] = useState("");
  const [targetVal, setTargetVal] = useState("");
  //for taskpopup delete btn
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const inputRef = useRef(null);
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showTaskTypePopup, setShowTaskTypePopup] = useState(false);
  const [valueWiseTargetDone, setValueWiseTargetDone] = useState("");

  const [type, setTaskType] = useState("");
  //for Make Done
  const [showTable, setShowTable] = useState(false);
  const [reportingDate, setReportingDate] = useState(null);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Format to HH:MM:SS
  };

  const [commentError, setCommentError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [open, setOpen] = useState(false);
  const [subtaskId, setSubtaskId] = useState("");
  const [subTaskData, setSubTaskData] = useState<SubTaskDataType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const handleSelect = (label: string) => {
    const selected = statusOptions.find((status) => status.label === label);
    if (selected) {
      setSelectedStatus(selected.label);
      updateSubtaskStage(selected.stageId);
    }
  };

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

        setAssignee(employeeOptions);
        if (userIDS && userIDS.length > 0) {
          const initialSelectedAssignee = employeeOptions.filter((option) =>
            userIDS.includes(String(option.value))
          );
          setSelectedAssignee(initialSelectedAssignee);
        } else {
          setSelectedAssignee([]);
        }

      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [userIDS]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(taskTitle);
    }, 500);

    return () => clearTimeout(timer);
  }, [taskTitle]);

  useEffect(() => {
    const timerDescription = setTimeout(() => {
      setDebouncedDescription(taskDescription);
    }, 500);

    return () => clearTimeout(timerDescription);
  }, [taskDescription]);


  useEffect(() => {
    const timerHours = setTimeout(() => {
      setDebouncedHours(ehours);
    }, 500);

    return () => clearTimeout(timerHours);
  }, [ehours]);

  useEffect(() => {
    const timerMinutes = setTimeout(() => {
      setDebouncedMinutes(eminutes);
    }, 500);

    return () => clearTimeout(timerMinutes);
  }, [eminutes]);

  useEffect(() => {
    const timerSeconds = setTimeout(() => {
      setDebouncedSeconds(eseconds);
    }, 500);

    return () => clearTimeout(timerSeconds);
  }, [eseconds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        if (debouncedTitle && columnNAME === "title") {
          callApi(debouncedTitle, columnNAME);
        }
        if (debouncedDescription && columnNAME === "description") {
          callApi(debouncedDescription, columnNAME);
        }
        if (debouncedHours && columnNAME === "e_hours") {
          callApi(debouncedHours, columnNAME);
        }
        if (debouncedMinutes && columnNAME === "e_minutes") {
          callApi(debouncedMinutes, columnNAME);
        }
        if (debouncedSeconds && columnNAME === "e_seconds") {
          callApi(debouncedSeconds, columnNAME);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [debouncedTitle, debouncedDescription, debouncedHours, debouncedMinutes, debouncedSeconds, columnNAME]);

  const [debounceTimer, setDebounceTimer] = useState(null);
  const handleChange = (columnName) => (event) => {
    const value = event.target.value;

    if (columnName === "title") {
      setTaskTitle(event.target.value);
      setColName(columnName);
    } else if (columnName === "description") {
      setTaskDescription(event.target.value);
      setColName(columnName);
    }
    else if (columnName === "e_hours") {
      setTaskHours(event.target.value);
      // setColName(columnName);
    }
    else if (columnName === "e_minutes") {
      setTaskMinutes(event.target.value);
      // setColName(columnName);
    }
    else if (columnName === "e_seconds") {
      setTaskSeconds(event.target.value);
      // setColName(columnName);
    }

    // Debounce API call to reduce excessive requests
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setDebounceTimer(
      setTimeout(() => {
        callApi(value, columnName);
      }, 100) // API call after 500ms delay
    );
  };

  //for outside click
  const descriptionRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isHoursFocused, setIsHoursFocused] = useState(false);
  const [isMinFocused, setIsMinFocused] = useState(false);
  const [isSecFocused, setIsSecFocused] = useState(false);
  const handleClickOutside = (event) => {
    if (
      descriptionRef.current &&
      !descriptionRef.current.contains(event.target) &&
      isFocused
    ) {
      // User clicked outside the input
      callApi(taskDescription, "description");
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [taskDescription, isFocused]);

  const titleRef = useRef(null);
  const handleTitleClickOutside = (event) => {
    if (
      titleRef.current &&
      !titleRef.current.contains(event.target) &&
      isTitleFocused
    ) {
      // User clicked outside the input
      callApi(taskTitle, "title");
      setIsTitleFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleTitleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleTitleClickOutside);
    };
  }, [taskTitle, isTitleFocused]);


  const ehoursRef = useRef(null);
  const handleehoursClickOutside = (event) => {
    if (ehoursRef.current && !ehoursRef.current.contains(event.target) && isHoursFocused) {
      callApi(ehours, "e_hours");
      setIsHoursFocused(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleehoursClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleehoursClickOutside);
    };
  }, [ehours, isHoursFocused]);

  const eminRef = useRef(null);
  const handleMinClickOutside = (event) => {
    if (eminRef.current && !eminRef.current.contains(event.target) && isMinFocused) {
      callApi(eminutes, "e_minutes");
      setIsMinFocused(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleMinClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleMinClickOutside);
    };
  }, [eminutes, isMinFocused]);

  const esecRef = useRef(null);
  const handleSecClickOutside = (event) => {
    if (esecRef.current && !esecRef.current.contains(event.target) && isSecFocused) {
      callApi(eseconds, "e_seconds");
      setIsSecFocused(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleSecClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleSecClickOutside);
    };
  }, [eseconds, isSecFocused]);

  const handleBlur = (columnName) => (event) => {

    if (columnName === "title") {
      callApi(taskTitle, columnName);
    } else if (columnName === "description") {
      console.log('descrition is ', taskDescription);
      callApi(taskDescription, columnName);
    }
    // else if (columnName === "e_hours") {
    //   console.log('HOUR is ', ehours);
    //   callApi(ehours, columnName);
    // }
    // else if (columnName === "e_minutes") {
    //   console.log('MIN is ', eminutes);
    //   callApi(eminutes, columnName);
    // }
    // else if (columnName === "e_seconds") {
    //   console.log('SEC is ', eseconds);
    //   callApi(eseconds, columnName);
    // }
  }


  const fetchTimelineData = async () => {

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/timelineTask?task_id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });


      const data = response.data;
      setTimelineData(data);
    }
    catch (error) {
      console.error("Error fetching timeline data:", error);
      // Handle error, e.g., display an error message
    }
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);

    callApi(event.target.value, 'start_date');
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    callApi(event.target.value, 'due_date');
  };


  useEffect(() => {
    fetchTimelineData();
  }, [taskId]);

  const callApi = async (value, colName) => {

    if (!value) return;
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateTask",
        {
          id: taskId,
          col_name: colName,
          col_val: value,
          description: `Set ${colName} to ${value}`,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchTimelineData();
        // fetchTask();
        onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);
      }
    } catch (error) {
      console.error("Error updating priority:", error);

    }
  };

  const handleDelete = () => {
    // onDelete();
    fetchTimelineData();
    handleClose();
  };

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];
      const response = await axiosInstance.get(
        `/editTask?id=${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      // Mapping response data to set task state
      const taskData = response.data;

      const updatedTask: Task = {
        id: taskData.id,
        title: taskData.title || "",
        description: taskData.description || null,
        user_ids: taskData.user_ids ? taskData.user_ids.split(",") : [], // Handle null user_ids
        priority: taskData.priority || "Medium", // Default to Medium if null
        start_date: taskData.start_date || "",
        due_date: taskData.due_date || "",
        e_hours: taskData.e_hours || 0,
        e_minutes: taskData.e_minutes || 0,
        e_seconds: taskData.e_seconds || 0,
        task_type: taskData.task_type || "",
        stage_id: taskData.stage_id || 0,
        timer_status: taskData.timer_status || 0,
        kpi_year: taskData.kpi_year || null,
        kpi_month: taskData.kpi_month || null,
        sprint_point: taskData.sprint_point || null,
        target_type: taskData.target_type || null,
        target_value: taskData.target_value || null,
        target_completed: taskData.target_completed || null,
        target_remaining: taskData.target_remaining || null,
        created_by: taskData.created_by || 0,
        created_at: taskData.created_at || "",
        updated_at: taskData.updated_at || "",
        deleted_at: taskData.deleted_at || null,
        isAuthorizedAssignee: taskData.isAuthorizedAssignee || 0,
        created: taskData.created || "",
        stages: taskData.stages || {}, // Handle potential null stages
        stage_name: taskData.stages?.stage_name || "To Do", // Handle potential null stage_name
      };

      // Set task data to state with null checks
      setTaskHours(updatedTask.e_hours);
      setTaskMinutes(updatedTask.e_minutes);
      setTaskSeconds(updatedTask.e_seconds);
      setTask(updatedTask);
      setTaskTitle(updatedTask.title);
      setStatus(updatedTask.stage_name);
      setTargetType(updatedTask.target_type);
      setTargetVal(updatedTask.target_value);
      setTargetRemaining(updatedTask.target_remaining);
      setTargetCompleted(updatedTask.target_completed);
      setTaskDescription(updatedTask.description || "");
      setStartDate(updatedTask.start_date);
      setEndDate(updatedTask.due_date);
      setUserIDS(updatedTask.user_ids);
      setFlag(updatedTask.priority); // Priority will always have a value now due to default
      setTaskType(updatedTask.task_type);
      // Update selectedAssignee only if we have both user_ids and assignee options
      if (updatedTask.user_ids.length > 0 && assignee.length > 0) {
        const initialSelectedAssignee = assignee.filter((option) =>
          updatedTask.user_ids.includes(String(option.value))
        );
        setSelectedAssignee(initialSelectedAssignee);
      } else {
        setSelectedAssignee([]); // Reset if no valid user_ids
      }

    } catch (error) {
      console.error("Error fetching Task:", error);
    }
  };

  const updateSubtaskStage = async (updatedStageId: number) => {
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];
      const payload = {
        sub_task_id: subtaskId,
        current_stage_id: subTaskData?.stage_id,
        updated_stage_id: updatedStageId,
      };
      await axiosInstance.post("/updateSubtaskStage", payload, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });


      // After updating, also update local subtask data
      setSubTaskData((prev) => prev ? { ...prev, stage_id: updatedStageId } : null);
      fetchSubTaskList();
      setOpen(false);
    } catch (error) {
      console.error("Error updating Stage:", error);
    }
  };
  useEffect(() => {
    fetchTask();
  }, [taskId]);

  //for delete task api
  const handleDeleteTask = async () => {
    console.log("Task deleted");
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const response = await axiosInstance.delete("/deleteTask", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { id: taskId }, // Send data inside `data`
      });

      if (response.data.success) {
        handleClose();
        onTaskDeleted();
      } else {
        console.error("Failed to delete task:", response.data);
      }
    } catch (error) {
      console.error(
        "Error deleting task:",
        error.response ? error.response.data : error.message
      );
    }
    //refreshTasks();
    //  setShowTaskPopup(false);
  };

  //for updateStageNext api for task type
  const handleStatusChange = async (e) => {
    try {
      const statusMapping = {
        "To Do": 2,
        "In Progress": 3,
        "Hold": 4,
        "Abort": 5,
        "Review": 6,
        "Complete": 7,
      };

      const selectedStatus = e.target.value; // Get selected status value
      const statusValue = statusMapping[selectedStatus]; // Map status to corresponding number

      if (!statusValue) {
        alert("Invalid status selected!");
        return;
      }

      const token = localStorage.getItem("token");

      if (!taskId) {
        alert("Task ID is missing!");
        return;
      }

      if (!token) {
        alert("Authorization token is missing!");
        return;
      }

      // Prepare request data
      const requestData = qs.stringify({
        id: taskId,
        status: statusValue, // Use mapped numerical value
      });

      console.log("Sending Request: ", requestData);

      // Make API call
      const response = await axiosInstance.post(
        "/updateStageNext",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("API Response:", response);

      if (response.data?.success) {
        fetchTimelineData();
        onStageNext();

      } else {
        console.error("API Response Error:", response.data);
        if (response.data?.message) {
          toast.error(response.data.message); // Show only the actual error message
        }

      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage =
        error.data?.message || error.response?.data || error.message || "Something went wrong";

      toast.error(errorMessage)
    }
  };

  //UpdateTaskPriority
  const handleFlagChange = async (newFlag) => {
    setFlag(newFlag);

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateTask",
        {
          id: taskId,
          col_name: "priority",
          col_val: newFlag,
          description: `Set priority to ${newFlag}`,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);

        setFlag(task?.priority || "Medium");
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      setFlag(task?.priority || "Medium");
    }
  };

  //ADD CHECKLIST 
  const [newTodo, setNewTodo] = useState('');
  const [todoList, setTodoList] = useState([]);
  const [newSubtask, setNewSubTask] = useState('');
  const [subTaskList, setSubTaskList] = useState([]);
  const [allAttachmentList, setAllAttachmentList] = useState([]);
  const [error, setError] = useState('');
  const [checkedItem, setChekedItem] = useState('');
  const [checkedId, setChekedId] = useState('');
  const [completeList, setCompleteList] = useState([]);
  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
    setError(''); // Clear any previous errors
  };

  const handleSubTaskInputChange = (e) => {
    setNewSubTask(e.target.value);
    setError(''); // Clear any previous errors
  };
  const handleAddTodo = async () => {
    if (newTodo.trim() === '') {
      setError('Please enter a task.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/addCheckList",
        {
          task_id: taskId,
          checklist: newTodo
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        setNewTodo('');
        fetchTodoList();
        setError('');
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);
      }

    }
    catch (err) {
      console.error('Error adding todo:', err);
      setError('Error adding task. Please try again.');
    }
  };
  const fetchTodoList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchTodoList?task_id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setTodoList(response.data);
      console.log("Todo List:", response.data);
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };
  useEffect(() => {
    fetchTodoList();
  }, []);
  const handleAddSubTask = async () => {
    if (newSubtask.trim() === '') {
      setError('Please enter a task.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/addSubtaskList",
        {
          task_id: taskId,
          title: newSubtask
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        setNewSubTask('');
        fetchSubTaskList();
        setError('');
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to :", response.data);
      }

    }
    catch (err) {
      console.error('Error adding SubtaskList:', err);
      setError('Error adding task. Please try again.');
    }
  };

  const fetchSubTaskList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchSubtaskList?task_id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setSubTaskList(response.data);
      console.log("SUBTASK List:", response.data);
    } catch (error) {
      console.error("Error fetching  list:", error);
    }

  };

  useEffect(() => {
    fetchSubTaskList();
  }, []);

  const fetchSubTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.get(
        `/editSubtask?id=${subtaskId}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      // Mapping response data to set task state
      setSubTaskData(response.data);
      const matchedStatus = statusOptions.find(
        (status) => status.stageId === response.data.stage_id
      );
      if (matchedStatus) {
        setSelectedStatus(matchedStatus.label);
      }
    } catch (error) {
      console.error("Error fetching Task:", error);
    }
  };
  useEffect(() => {
    fetchSubTask();
  }, [subtaskId]);

  const handleDeleteCheckList = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.delete(`/deleteCheckList?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchTodoList();
        setError('');
        onPriorityChanged();
      } else {
        console.error("Failed to delete:", response.data);
      }
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };
  const handleDeleteCompleteList = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.delete(`/deleteCheckList?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchCompleteList();
        setError('');
        onPriorityChanged();
      } else {
        console.error("Failed to delete:", response.data);
      }
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };
  const handleTODOCheck = async (id: string) => {

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/markCompleted",
        {
          id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchTodoList();
        fetchCompleteList();
        setError('');
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to check", response.data);
      }

    }
    catch (err) {
      console.error('Error checking todo:', err);
      setError('Error checking list');
    }
  };

  const handleCompleteCheck = async (id: string) => {

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/markTodo",
        {
          id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchCompleteList();
        fetchTodoList();
        setError('');
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to check", response.data);
      }

    }
    catch (err) {
      console.error('Error checking :', err);
      setError('Error checking list');
    }
  };

  const fetchCompleteList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchCompleteList?task_id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setCompleteList(response.data);

    } catch (error) {
      console.error("Error fetching Complete list:", error);
    }

  };
  useEffect(() => {
    fetchCompleteList();
  }, []);


  const [comment, setComment] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File[]>([]); // Renamed `file` to `selectedFile`

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(Array.from(event.target.files));
    }
  };

  const [isCommentUploading, setIsCommentUploading] = useState(false);

  const handleSendComment = async () => {
    try {
      if (!comment.trim()) {
        setCommentError(true);
        return;
      }

      setIsCommentUploading(true);
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const formData = new FormData();
      formData.append("task_comment", comment);
      formData.append("task_id", taskId);

      if (selectedFile.length > 0) {
        selectedFile.forEach((file, index) => {
          formData.append(`comment_attachments[${index}]`, file);
        });
      }

      const response = await axiosInstance.post(`/storeCommentTask`, formData, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setComment("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchTimelineData();
        onPriorityChanged();
        swal("Success!", "Comment and file uploaded successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      swal("Error!", "Failed to upload comment or file. Please try again.", "error");
    } finally {
      setIsCommentUploading(false);
    }
  };

  const handleEditClick = async (id: string, listItem: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
      const response = await axiosInstance.get(`/editTaskCheckList?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setChekedId(id);
      setChekedItem(listItem);
      setShowChecklistPopup(true);
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  const handleUpdateClick = async () => {

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateCheckList",
        {
          check_list_id: checkedId,
          checklist: checkedItem
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchTodoList();
        fetchCompleteList();
        setError('');
        // fetchTimelineData();
        onPriorityChanged();
        setShowChecklistPopup(false);
      } else {
        console.error("Failed to update", response.data);
      }

    }
    catch (err) {

      setError('Error update list');
    }
  };



  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileAttachChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    const formData = new FormData();

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append(`files${i}`, selectedFiles[i]);
    }

    formData.append('TotalFiles', selectedFiles.length);
    formData.append('task_id', taskId);

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const response = await axiosInstance.post('/addTaskAttachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      if (response.data.success) {
        console.log('File uploaded successfully:', response.data.message);
        fetchTimelineData();
        fetchAllTaskAttachmentList();
        setShowFileUpload(false);
        swal("Success!", "File uploaded successfully!", "success");
      } else {
        console.error('File upload failed:', response.data.message || 'Unknown error');
        swal("Error!", "Failed to upload file. Please try again.", "error");
      }
    } catch (error) {
      console.error('File upload error:', error);
      swal("Error!", "Failed to upload file. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAllTaskAttachmentList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchAllTaskAttachments?id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setAllAttachmentList(response.data);
      console.log("List:", response.data);
    } catch (error) {
      console.error("Error fetching  list:", error);
    }

  };

  useEffect(() => {
    fetchAllTaskAttachmentList();
  }, []);

  const handleDeleteAttachmentList = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.delete(`/deleteTaskAttachment?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchAllTaskAttachmentList();
        setError('');
        onPriorityChanged();
      } else {
        console.error("Failed to delete:", response.data);
      }
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  const handleDownloadClick = async (fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/tasks/attachment/${fileName}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        responseType: 'blob',
      });
      // Create a blob URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);


      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  //DOWNLOAD IMG FROM THE TIMELINE
  const handleTimeLineDownloadClick = async (fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/tasks/comment/${fileName}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        responseType: 'blob',
      });
      // Create a blob URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);


      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  const [targetRecords, setTargetRecords] = useState([]); // Store all records
  const [reportHistory, setReportHistory] = useState({});

  const fetchTargetDone = async () => {
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.get(
        `/targetList?task_id=${taskId}&target_type=${targetType}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      console.log(
        "Report generated successfully:",
        response.data.targetReports[0].target_done
      );
      const latestReport = response.data.targetReports[0];
      console.log("Latest Report:", latestReport);
      setTargetDone(response.data.targetReports[0].target_done);
      setTargRemain(response.data.targetReports[0].target_remaining);
      setReportDate(response.data.targetReports[0].reporting_date);
      setReportHistory(prevHistory => {
        const newHistory = { ...prevHistory }; // Create a copy
        response.data.targetReports.forEach((report) => {
          newHistory[report.id] = report; // Use report.id as the key
        });
        return newHistory;
      });

      // Append new record while keeping old records

    } catch (error) {
      console.error(
        "Error generating report:",
        error.response?.data || error.message
      );

    }
  };

  useEffect(() => {
    fetchTargetDone();
  }, [targetDone]);

  console.log("Report History", reportHistory);

  const handleMakeDone = () => {
    setShowTable(true);
  };

  //for makeDoneReport api
  const handleMakeReport = async () => {
    console.log("Handle Make report api");
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.get(
        `/makeDoneReport?id=${taskId}`, // Dynamically pass taskId
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );
      setReportingDate(response.data.updated_at);
      fetchTask();
      fetchTargetDone();

    } catch (error) {
      console.error(
        "Error generating report:",
        error.response?.data || error.message
      );
      alert("Failed to generate report. Please try again.");
    }
  };


  const [showSubtaskPopup, setShowSubtaskPopup] = useState(false);

  const assigneeOptions = assignee && Array.isArray(assignee)
    ? assignee.map((option) => ({
      value: option.value,
      label: option.label,
    }))
    : [];

  const handleOpen = async (id) => {
    setOpen(true);
    setSubtaskId(id);
  }

  const handleAssigneeChange = async (selectedOptions) => {
    setSelectedAssignee(selectedOptions);

    // Get user IDs from selected options, or empty array if no options selected
    const userIds = selectedOptions ? selectedOptions.map(option => option.value) : [];

    // Always make the API call, even with empty array
    const data = {
      id: taskId,
      user_ids: userIds,
    };

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateAssigneeTask",
        data,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchTimelineData();
        onPriorityChanged();
      } else {
        console.error("Failed to update assignees:", response.data);
      }
    } catch (error) {
      console.error("Error updating assignees:", error);
    }
  };


  const handleAddTarget = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!taskId) {
        alert("Task ID is missing!");
        return;
      }

      if (!token) {
        alert("Authorization token is missing!");
        return;
      }


      const requestData = qs.stringify({
        task_id: taskId,
        target_type: targetType,
        target_value: targetVal,
        target_remaining: Number(targetRemining),
        target_completed: Number(targetCompleted),
        target_done: valueWiseTargetDone,
      });

      console.log("Sending Request: ", requestData);

      // Make API call
      const response = await axiosInstance.post(
        "/addTargetReport",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("API Response:", response);
      fetchTargetDone();
      fetchTask();
    } catch (error) {
      console.error("API Error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [tempTarget, setTemptarget] = useState("");
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
  useEffect(() => {
    let tempTargetVal = targetVal; // Start with the initial value

    Object.values(reportHistory).reverse().forEach((report) => {
      tempTargetVal -= report.target_done; // Update temp value
    });

    setTemptarget(tempTargetVal); // Set the final target value after iteration
  }, [reportHistory]);


  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFlagOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const containerStyle = {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row', // For larger screens
  };

  const leftSideStyle = {
    width: '50%',
    height: '100%',
    overflowY: 'auto',
    paddingRight: '1rem',
  };

  const dividerStyle = {
    width: '1px',
    backgroundColor: '#222',
    margin: '0 1rem',
    height: '100%',
  };

  const rightSideStyle = {
    width: '50%',
    height: '100%',
    overflowY: 'auto',
    paddingLeft: '1rem',
    display: 'flex',
    flexDirection: 'column',
  };

  const rightSideContentStyle = {
    flex: 1,
    overflowY: 'auto',
  };

  const mediaQueryStyle = {
    '@media (max-width: 992px)': {
      '.left-side, .right-side': {
        width: '100%',
        height: '50vh',
      },
      '.vertical-divider': {
        display: 'none',
      },
    },
  };
  return (
    <>
      <div className="container  d-flex align-items-center justify-content-center" style={{
        // minHeight: '100vh',
        padding: 0,
        margin: 0,
      }}>
        <div
          className="card w-100 p-4"
        >
          <div className="px-3 py-2" style={{ borderRadius: "0.9rem" }}>
            {/* Refactored: Single row for Task Type, Status, Priority, Created At */}
            <div className="d-flex align-items-center flex-wrap gap-3" style={{ minHeight: 40 }}>
              {/* Task Type Badge */}
              <div
                style={{
                  fontSize: "0.8rem",
                  textAlign: "right",
                  backgroundColor:
                    task?.task_type?.toUpperCase() === "OBJECTIVE"
                      ? "rgb(251, 205, 40)"
                      : "rgb(251, 40, 226)",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: 8,
                  padding: "0.3rem 0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                {task?.task_type?.toUpperCase()}
              </div>

              {/* Stage/Status Dropdown */}
              <div style={{ position: "relative", minWidth: 120 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "120px",
                    height: "35px",
                    backgroundColor:
                      statusOptions.find((opt) => opt.label === status)?.color || "#F7D600",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    padding: "0.3rem 0.2rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                  }}
                >
                  {status.toUpperCase()}
                  <div style={{ padding: "6px 5px", borderRadius: "0 8px 8px 0" }}>▶</div>
                </div>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    handleStatusChange(e);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                >
                  {statusOptions.map((option, index) => (
                    <option
                      key={index}
                      value={option.label}
                      style={{
                        color: option.color,
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {option.symbol} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority (Flag Dropdown) */}
              <div className="position-relative" ref={dropdownRef} style={{ minWidth: 120 }}>
                <button
                  className="btn btn-light border d-flex align-items-center"
                  onClick={() => setShowFlagOptions(!showFlagOptions)}
                  disabled={!isTask}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.4rem 0.8rem",
                    height: "36px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFlag}
                    style={{
                      color: flag
                        ? flagOptions.find((opt) => opt.label === flag)?.color
                        : "gray",
                      fontSize: "17px",
                    }}
                    className="me-2"
                  />
                  <span className="d-flex align-items-center">
                    {flag || "Priority"}
                    <FontAwesomeIcon icon={faCaretDown} className="ms-2" />
                  </span>
                </button>
                {showFlagOptions && (
                  <div
                    className="position-absolute border rounded shadow p-2 bg-white"
                    style={{
                      zIndex: 10,
                      top: "100%",
                      left: 0,
                      minWidth: "150px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flagOptions.map((option, index) => (
                      <div
                        key={index}
                        className="dropdown-item cursor-pointer d-flex align-items-center"
                        onClick={() => {
                          setFlag(option.label);
                          setShowFlagOptions(false);
                          handleFlagChange(option.label);
                        }}
                        style={{ padding: "5px 10px" }}
                      >
                        <FontAwesomeIcon
                          icon={faFlag}
                          style={{
                            color: option.color,
                            fontSize: "17px",
                            marginRight: "0.5rem",
                          }}
                        />
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Created At */}
              <div
                className="text-muted ms-auto"
                style={{
                  fontSize: "0.9rem",
                  color: "grey",
                  minWidth: "120px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                CREATED {task?.created}
              </div>

              {/* Task ID (optional, can be moved to the right if needed) */}
              <div
                className="text-muted"
                style={{
                  fontSize: "0.9rem",
                  color: "grey",
                  minWidth: "80px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                T-{task?.id}
              </div>

              {/* Close Button */}
              <div>
                <button
                  style={{
                    fontSize: "0.9rem",
                    border: "none",
                    background: "none",
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={onTaskDeleted}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          </div>


          <hr className="my-3" style={{ borderTop: "1.5px solid #333", color: "grey" }} />


          <div className="d-flex justify-content-between align-items-center flex-column flex-sm-row">

            <div
              className="d-flex flex-column flex-sm-row justify-content-between align-items-start"
              style={{ gap: "1rem" }}
            >

              <div className="d-flex flex-column">
                {/* Task Title above Delete button */}
                {taskTitle && (
                  <div style={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontWeight: 500,
                    color: '#141824',
                    fontSize: '1.02rem',
                    marginBottom: '0.7rem',
                    marginTop: '0.2rem',
                    letterSpacing: '0.02em',
                    paddingBottom: '0.2rem',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '100%',
                    paddingLeft: 0,
                    lineHeight: 1.3
                  }}>
                    {taskTitle}
                  </div>
                )}
                {isAdmin && (
                  <Button
                    className="btn btn-danger mb-2"
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.6rem",
                      height: "35px",
                      width: "75px",
                      marginTop: "0.3rem",
                    }}
                    onClick={handleShow}
                  >
                    Delete
                  </Button>
                )}
              </div>

              {show && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1040,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "10px",
                  }}
                >
                  <div
                    className="modal-dialog"
                    style={{
                      zIndex: 1050,
                      maxWidth: "400px",
                      width: "90%",
                    }}
                  >
                    <div
                      className="modal-content"
                      style={{
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="modal-header"
                        style={{
                          borderBottom: "none",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "40px",
                            color: "#F4A52E",
                            marginBottom: "10px",
                          }}
                        >
                          ⚠️
                        </div>
                        <h5
                          className="modal-title"
                          style={{
                            fontWeight: "bold",
                            fontSize: "20px",
                          }}
                        >
                          Are you sure?
                        </h5>
                      </div>
                      <div className="modal-body">
                        <p
                          style={{
                            fontSize: "16px",
                            color: "#555",
                          }}
                        >
                          You won't be able to revert
                          this!
                        </p>
                      </div>
                      <div
                        className="modal-footer"
                        style={{
                          borderTop: "none",
                          justifyContent: "center",
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleDelete();
                            handleDeleteTask();
                          }}
                          style={{
                            backgroundColor: "#007BFF",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "5px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Yes, delete it!
                        </button>
                        <button
                          onClick={handleClose}
                          style={{
                            backgroundColor: "#DC3545",
                            color: "#fff",
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: "5px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* <div className="d-flex gap-3 flex-wrap position-relative" ref={dropdownRef}>
                <button
                  className="btn btn-light border d-flex align-items-center"
                  onClick={() => setShowFlagOptions(!showFlagOptions)}
                  disabled={!isTask}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.4rem 0.8rem",
                    height: "36px",
                    marginBottom: "0.5rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFlag}
                    style={{
                      color: flag
                        ? flagOptions.find((opt) => opt.label === flag)?.color
                        : "gray",
                      fontSize: "17px",
                    }}
                    className="me-2"
                  />
                  <span className="d-flex align-items-center">
                    {flag || "Priority"}
                    <FontAwesomeIcon icon={faCaretDown} className="ms-2" />
                  </span>
                </button>

                {showFlagOptions && (
                  <div
                    className="position-absolute border rounded shadow p-2 bg-white"
                    style={{
                      zIndex: 10,
                      top: "100%",
                      left: 0,
                      minWidth: "150px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flagOptions.map((option, index) => (
                      <div
                        key={index}
                        className="dropdown-item cursor-pointer d-flex align-items-center"
                        onClick={() => {
                          setFlag(option.label);
                          setShowFlagOptions(false);
                          handleFlagChange(option.label);
                        }}
                        style={{ padding: "5px 10px" }}
                      >
                        <FontAwesomeIcon
                          icon={faFlag}
                          style={{
                            color: option.color,
                            fontSize: "17px",
                            marginRight: "0.5rem",
                          }}
                        />
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}

                {task?.task_type == 'objective' && <Select
                  isMulti
                  options={assigneeOptions}
                  value={selectedAssignee}
                  onChange={handleAssigneeChange}
                  placeholder="Select Assignees"
                  isDisabled={!isTask}
                  isClearable={false}
                  closeMenuOnSelect={false}
                  styles={{
                    option: (styles) => ({
                      ...styles,
                      fontSize: "10px",
                    }),
                    control: (styles) => ({
                      ...styles,
                      fontSize: "12px",
                      minWidth: "230px",
                      maxWidth: "250px",
                    }),
                    multiValue: (styles) => ({
                      ...styles,
                      fontSize: "10px",
                    }),
                    clearIndicator: (styles) => ({
                      ...styles,
                      display: 'none'
                    })
                  }}
                />}

              </div> */}


            </div>





            <div
              className="border-start mx-3"
              style={{
                height: "4rem",
                borderColor: "#222",
                borderWidth: "1.5px",
                borderStyle: "solid",
                marginRight: "250px",
                color: "grey"
              }}
            ></div>

            {/* <div
              className="d-flex flex-wrap justify-content-start p-2"
              style={{ gap: "0.4rem", color: "grey" }}
            >
              <input
                type="number"
                placeholder="H"
                min="0"
                onFocus={(e) => e.target.select()}
                // value={task?.e_hours || ""}
                value={ehours} // Use the individual state variable
                className="form-control"
                onChange={handleChange("e_hours")}
                // onBlur={handleBlur("e_hours")}
                style={{
                  width: "48px",
                  height: "32px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                  flex: "1 1 48px",
                  minWidth: "40px",
                }}

              />

              <input
                type="number"
                placeholder="M"
                min="0"
                onFocus={(e) => e.target.select()}
                // value={task?.e_minutes}
                value={eminutes}
                onChange={handleChange("e_minutes")}
                // onBlur={handleBlur("e_minutes")}
                className="form-control"
                style={{
                  width: "48px",
                  height: "32px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                  flex: "1 1 48px",
                  minWidth: "40px",
                }}
              />

              <input
                type="number"
                placeholder="S"
                min="0"
                onFocus={(e) => e.target.select()}
                // value={task?.e_seconds}
                value={eseconds}
                onChange={handleChange("e_seconds")}
                // onBlur={handleBlur("e_seconds")}
                className="form-control"
                style={{
                  width: "48px",
                  height: "32px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                  flex: "1 1 48px",
                  minWidth: "40px",
                }}
              />
            </div> */}
            {task?.task_type !== "kpi" && (
              <div
                className="d-flex flex-column flex-sm-row"
                style={{ gap: "0.2rem", padding: '0.2rem 0' }}
              >
                <div ref={ehoursRef}>
                  <input
                    type="number"
                    placeholder="H"
                    value={ehours}
                    disabled={!isTask}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), 12); // Enforce max in code too
                      setTaskHours(value);
                    }}
                    onFocus={() => setIsHoursFocused(true)}
                    className="form-control"
                    style={{
                      width: "40px",
                      height: "24px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      padding: "0.15rem 0.2rem",
                      marginRight: '0.15rem',
                    }}
                    min="0"
                    max="12"
                  />

                </div>

                <div ref={eminRef}>

                  <input
                    type="number"
                    placeholder="M"
                    disabled={!isTask}
                    value={eminutes}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), 59); // Prevent >59
                      setTaskMinutes(value);
                    }}
                    onFocus={() => setIsMinFocused(true)}
                    className="form-control"
                    style={{
                      width: "40px",
                      height: "24px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      padding: "0.15rem 0.2rem",
                      marginRight: '0.15rem',
                    }}
                    min="0"
                    max="59"
                  />

                </div>

                <div ref={esecRef}>
                  <input
                    type="number"
                    placeholder="S"
                    value={eseconds}
                    disabled={!isTask}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), 59); // Prevent >59
                      setTaskSeconds(value);
                    }}
                    onFocus={() => setIsSecFocused(true)}
                    className="form-control"
                    style={{
                      width: "40px",
                      height: "24px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      padding: "0.15rem 0.2rem",
                    }}
                    min="0"
                    max="59"
                  />

                  {/* <input
                    type="number"
                    placeholder="S"
                    value={eseconds}
                    onChange={(e) => setTaskSeconds(e.target.value)}
                    onFocus={() => setIsSecFocused(true)}
                    className="form-control"
                    style={{
                      width: "48px",
                      height: "24px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      padding: "0.3rem",
                    }}
                  /> */}
                </div>
              </div>
            )}

            <div className="d-flex align-items-center flex-wrap gap-2">
              {/* Vertical Line - Adjusts for Small Screens */}
              <div
                className="border-start mx-3 d-none d-md-block"
                style={{
                  height: "3.2rem",
                  borderColor: "#222",
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  margin: '0 0.7rem',
                }}
              ></div>

              {task?.task_type === "objective" ? (
                <div className="d-flex flex-wrap gap-2">
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      width: "110px",
                      minWidth: "90px",
                      padding: '0.15rem 0.3rem',
                      marginRight: '0.15rem',
                    }}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      setDateError("");
                    }}
                    readOnly
                  />
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      width: "110px",
                      minWidth: "90px",
                      padding: '0.15rem 0.3rem',
                      marginRight: '0.15rem',
                    }}
                    onChange={(event) => {
                      const selectedEndDate = event.target.value;
                      if (new Date(selectedEndDate) < new Date(startDate)) {
                        setDateError("End date cannot be earlier than the start date.");
                        return;
                      }
                      setEndDate(selectedEndDate);
                      setDateError("");
                    }}
                    readOnly
                  />
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  <input
                    type="text"
                    className="form-control"
                    value={task?.kpi_month}
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      width: "110px",
                      minWidth: "90px",
                      padding: '0.15rem 0.3rem',
                      marginRight: '0.15rem',
                    }}
                    readOnly
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={task?.kpi_year}
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      width: "110px",
                      minWidth: "90px",
                      padding: '0.15rem 0.3rem',
                      marginRight: '0.15rem',
                    }}
                    readOnly
                  />
                </div>
              )}

              {dateError && (
                <p style={{ color: "red", fontSize: "0.5rem", marginTop: "0.5rem" }}>
                  {dateError}
                </p>
              )}










            </div>

          </div>

          <hr className="my-3" style={{ borderTop: "1.5px solid #333" }} />





          <div className="d-flex flex-column flex-lg-row" style={{ maxHeight: "380px", overflowY: "auto" }}
          >

            <div className="w-100 w-lg-50 pe-4 mb-4 mb-lg-0" style={{ maxHeight: "350px", overflowY: "auto", maxWidth: "600px" }}>
              <div className="mb-4" ref={titleRef}>
                {/* Assignee Header and Dropdown for 'objective' task type */}
                {task?.task_type == 'objective' && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, color: '#141824', fontSize: '1rem', marginBottom: 4, display: 'block' }}>Assignee</label>
                    <Select
                      isMulti
                      options={assigneeOptions}
                      value={selectedAssignee}
                      onChange={handleAssigneeChange}
                      placeholder="Select Assignees"
                      isDisabled={!isTask}
                      isClearable={false}
                      closeMenuOnSelect={false}
                      styles={{
                        option: (styles) => ({
                          ...styles,
                          fontSize: "10px",
                        }),
                        control: (styles) => ({
                          ...styles,
                          fontSize: "12px",
                          minWidth: "100%",
                          maxWidth: "100%",
                          width: '100%',
                        }),
                        multiValue: (styles) => ({
                          ...styles,
                          fontSize: "10px",
                        }),
                        clearIndicator: (styles) => ({
                          ...styles,
                          display: 'none'
                        })
                      }}
                    />
                  </div>
                )}
                {/* Description Header */}
                <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, color: '#141824', fontSize: '1rem', marginBottom: 4, display: 'block' }}>Description</label>
                <div ref={descriptionRef}>
                  <textarea
                    value={taskDescription}
                    placeholder="Description"
                    onChange={(e) => setTaskDescription(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="form-control mt-2"
                    style={{ fontSize: "0.7rem", height: "100px", color: "grey" }}
                  />
                </div>
              </div>

              <hr
                className="my-4"
                style={{ borderColor: "#555", borderWidth: "1.5px" }}
              />

              <div className="mb-3">
                <h5 style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, color: '#141824', fontSize: '1rem', marginBottom: '0.5rem' }}>ADD SUBTASK</h5>

                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      padding: "0.375rem 0.75rem"
                    }}
                    value={newSubtask}
                    onChange={handleSubTaskInputChange}
                  />
                  <Button
                    className="btn border d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "transparent",
                      marginLeft: "0.5rem",
                      padding: 0
                    }}
                    onClick={handleAddSubTask}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ color: "#add8e6" }}
                      size="sm"
                    />
                  </Button>
                </div>
                {/* <hr
                // className="my-4"
                style={{ borderColor: "#555", borderWidth: "1.5px" }}
              /> */}
                <div>
                  {subTaskList && subTaskList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {subTaskList.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '0.5px solid #ddd' }}>
                            <td style={{ padding: '7px', cursor: "pointer" }} >
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  style={{
                                    width: '9px',
                                    height: '9px',
                                    backgroundColor: item.stages.stage_bg_color || 'white',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleOpen(item.id)}
                                ></div>
                                <span onClick={() => {
                                  if (item.id) {
                                    localStorage.setItem("selectedTaskId", item.id);
                                    setShowSubtaskPopup(true);
                                  }
                                }}>{item.title}</span>
                              </div>

                            </td>
                            {/* <td
                              style={{ padding: "7px", cursor: "pointer" }}
                              onClick={() => {
                                if (item.id) {
                                  localStorage.setItem("selectedTaskId", item.id);
                                  setShowSubtaskPopup(true);
                                }
                              }}

                            >
                              {item.title}
                            </td> */}

                            {showSubtaskPopup && (
                              <SubtaskPopup type={type} onClose={() => setShowSubtaskPopup(false)} onPriorityChanged={onPriorityChanged} onStageNext={onStageNext} />
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "red", fontSize: "0.80rem" }}>No Check List in Todo</p>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h5 style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, color: '#141824', fontSize: '1rem', marginBottom: '0.5rem' }}>ADD CHECKLIST</h5>
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    style={{
                      fontSize: "0.8rem",
                      height: "32px",
                      padding: "0.375rem 0.75rem"
                    }}
                    value={newTodo}
                    onChange={handleInputChange}
                  />
                  <Button
                    className="btn border d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "transparent",
                      marginLeft: "0.5rem",
                      padding: 0
                    }}
                    onClick={handleAddTodo}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ color: "#add8e6" }}
                      size="sm"
                    />
                  </Button>
                </div>
              </div>

              <div>
                <h6 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', color: 'grey' }}>TODO</h6>
                <div >
                  {todoList && todoList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'grey' }}>
                      <tbody>
                        {todoList.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '0.5px solid #ddd' }}>
                            <td style={{ padding: '7px' }}>
                              <div className="d-flex justify-content-between align-items-center px-2 py-1 ">
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.status === "1"}
                                    onChange={() => handleTODOCheck(item.id)}
                                  />
                                  <span>{item.checklist}</span>
                                </div>

                                <div>
                                  <FaEdit
                                    style={{
                                      marginRight: '8px',
                                      cursor: 'pointer',
                                      color: 'blue',
                                    }}
                                    onClick={() => handleEditClick(item.id, item.checklist)}
                                  />
                                  <FaTrash
                                    style={{
                                      cursor: 'pointer',
                                      color: 'red',
                                    }}
                                    onClick={() => handleDeleteCheckList(item.id)}
                                  />
                                </div>
                              </div>

                            </td>
                            {/* <td style={{ padding: '7px' }}>{item.checklist}</td> */}
                            {/* <td style={{ padding: '7px', textAlign: 'center' }}>
                              <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleEditClick(item.id, item.checklist)} />
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteCheckList(item.id)} />
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "red", fontSize: "0.85rem" }}>No Check List in Todo</p>
                  )}
                </div>

                <Modal
                  show={showChecklistPopup}
                  onHide={() => setShowChecklistPopup(false)}
                  centered
                  style={{
                    top: "5%",
                  }}

                >
                  <Modal.Header closeButton>
                    <Modal.Title>
                      Edit Checklist
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group controlId="checklistTextarea">
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter checklist item..."
                          value={checkedItem}
                          onChange={(e) =>
                            setChekedItem(e.target.value)
                          }
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="success"
                      onClick={handleUpdateClick}
                    >
                      Update
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Modal show={showSubtaskPopup} onHide={() => setShowSubtaskPopup(false)} size="xl"
                  dialogClassName="modal-90w" style={{ padding: 0, margin: 0 }}>
                  <Modal.Header closeButton onClick={() => setShowSubtaskPopup(false)}>
                  </Modal.Header>
                  <Modal.Body>
                    <SubtaskPopup type={type} isTask={isTask} />
                  </Modal.Body>

                </Modal>


                <Modal
                  show={open}
                  onHide={() => setOpen(false)}
                  size="sm"
                  dialogClassName="modal-30w"
                  style={{ padding: 0, margin: 0 }}
                  centered
                >
                  <Modal.Header closeButton onClick={() => setOpen(false)}></Modal.Header>
                  <Modal.Body className="p-0">
                    <div className="list-group">
                      {statusOptions.map((status) => (
                        <div
                          key={status.label}
                          onClick={() => handleSelect(status.label)}
                          className="list-group-item list-group-item-action d-flex align-items-center"
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              selectedStatus === status.label ? status.color : "transparent",
                            color: selectedStatus === status.label ? "#fff" : "#000",
                          }}
                        >
                          <span style={{ color: status.color, marginRight: 8 }}>
                            {status.symbol}
                          </span>
                          <span>{status.label}</span>
                        </div>
                      ))}
                    </div>
                  </Modal.Body>
                </Modal>




                <h5 style={{ color: 'grey', marginTop: '2rem', marginBottom: '0.5rem' }}>COMPLETED</h5>
                <div >
                  {completeList && completeList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {completeList.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '8px' }}>
                              <input
                                type="checkbox"
                                checked={item.status === "1"}
                                onChange={(e) => handleCompleteCheck(item.id)}
                              />
                            </td>
                            <td style={{ padding: '7px' }}>{item.checklist}</td>
                            <td style={{ padding: '7px', textAlign: 'center' }}>
                              <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleEditClick(item.id, item.checklist)} /> {/* Edit icon */}
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteCompleteList(item.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "red", fontSize: "0.80rem" }}> No Check List in Completed</p>
                  )}
                </div>


                <div className="d-flex align-items-center justify-content-between">
                  <h5 style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, color: '#141824', fontSize: '1rem', marginBottom: '0.5rem' }}>Add Attachments</h5>
                </div>

                {/* Upload Area (styled clickable box) */}
                <div
                  onClick={() => setShowFileUpload(true)}
                  style={{
                    border: `2px dashed ${task?.task_type === 'kpi' ? '#ff69b4' : '#b3d8f6'}`,
                    background: task?.task_type === 'kpi' ? '#ffe6f7' : '#eaf4fa',
                    color: task?.task_type === 'kpi' ? '#ff69b4' : '#007bff',
                    borderRadius: 12,
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginBottom: 16,
                    marginTop: 8,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      border: `1.5px solid ${task?.task_type === 'kpi' ? '#ff69b4' : '#007bff'}`,
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      fontSize: 28,
                      color: task?.task_type === 'kpi' ? '#ff69b4' : '#007bff',
                      background: '#fff',
                    }}
                  >
                    +
                  </div>
                  <div style={{ fontSize: 16, color: '#333' }}>Upload the Files</div>
                </div>

                {/* Attachments Table (remains unchanged) */}
                <div>
                  {allAttachmentList && allAttachmentList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'grey' }}>
                      <tbody>
                        {allAttachmentList.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '7px' }}>{item.name}</td>
                            <td style={{ padding: '7px', textAlign: 'center' }}>
                              <FaDownload style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }} onClick={() => handleDownloadClick(item.name)} />
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteAttachmentList(item.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "red", fontSize: "0.80rem" }}>No Attachments</p>
                  )}
                </div>


                <Modal
                  show={showFileUpload}
                  onHide={() => setShowFileUpload(false)}
                  centered
                  style={{ top: "5%" }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Add Attachment</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="popup-overlay">
                      <div className="popup-content p-4 shadow rounded">
                        <input
                          type="file"
                          className="form-control mb-3"
                          style={{
                            fontSize: "0.8rem",
                            border: "1px solid #ccc",
                            padding: "0.4rem",
                            color: 'grey'
                          }}
                          multiple
                          onChange={handleFileAttachChange}
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="d-flex justify-content-end">
                      <Button className="btn btn-danger me-2" onClick={() => setShowFileUpload(false)} disabled={isUploading}>
                        Cancel
                      </Button>
                      <Button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Uploading...
                          </>
                        ) : (
                          'Upload'
                        )}
                      </Button>
                    </div>
                  </Modal.Footer>
                </Modal>


                <div className="d-flex align-items-center ">
                  {targetType !== null && <FontAwesomeIcon
                    icon={faBullseye}
                    style={{ marginRight: "8px" }}
                  />}
                  <h5 style={{ color: 'gray', marginBottom: '0.5rem' }}>
                    {targetType !== null && (
                      task?.target_value === "0"
                        ? `${task?.target_type} : ${targetCompleted === "1" ? "Done" : "Not Done"}`
                        : `${task?.target_type} : ${targetCompleted} / ${task?.target_value}`
                    )}
                  </h5>

                  <div>
                    {targetType != null && (
                      task?.target_type === "Done/Not Done" ? (
                        <>
                          {targetDone !== "1" && (
                            <Button
                              className="btn btn-primary mb-2"
                              style={{
                                fontSize: "0.7rem",
                                height: "30px",
                                width: "100px",
                                marginTop: "0.3rem",
                                marginLeft: "2rem",
                              }}
                              onClick={() => {
                                handleMakeReport();
                              }}
                            >
                              Make Done
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          className="btn btn-primary mb-2"
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.6rem",
                            height: "30px",
                            width: "100px",
                            marginTop: "0.3rem",
                            marginLeft: "1rem",
                          }}
                          onClick={() => {
                            setShowTaskTypePopup(true);
                          }}
                        >
                          Add Report
                        </Button>
                      )
                    )}



                    <Modal
                      show={showTaskTypePopup}
                      onHide={() =>
                        setShowTaskTypePopup(false)
                      }

                    >
                      <Modal.Header
                        closeButton

                      />
                      <Modal.Body>
                        <div
                          className="d-flex flex-column"
                          style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "20px",
                            boxShadow:
                              "0px 4px 15px rgba(0, 0, 0, 0.1)",
                            margin: "0 auto",
                            color: 'grey'

                          }}
                        >
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Target Value{" "}
                                <span className="text-danger">
                                  *
                                </span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={
                                  task?.target_value
                                }
                                disabled
                              />
                            </div>


                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Target Remaining{" "}
                                <span className="text-danger">
                                  *
                                </span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={
                                  task?.target_remaining
                                }
                                disabled
                              />
                            </div>


                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Target Complete{" "}
                                <span className="text-danger">
                                  *
                                </span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={
                                  task?.target_completed
                                }
                                disabled
                              />
                            </div>


                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Value Wise Target
                                Done{" "}
                                <span className="text-danger">
                                  *
                                </span>
                              </label>
                              {/* <input
                                type="text"
                                className="form-control"
                                onChange={(e) =>
                                  setValueWiseTargetDone(
                                    e.target
                                      .value
                                  )
                                }
                              /> */}
                              <input
                                type="number"
                                step="1"
                                value={valueWiseTargetDone}
                                onChange={(e) => setValueWiseTargetDone(e.target.value)}
                                className="form-control"
                                style={{ width: "160px" }} // adjust the width as needed
                              />


                            </div>
                          </div>


                          <div className="d-flex justify-content-end">
                            <Button
                              className="btn btn-success"
                              style={{
                                fontSize: "0.9rem",
                                padding: "6px 12px",
                              }}

                              // onClick={() => {
                              //   const numericValue = Number(valueWiseTargetDone);
                              //   const targetRemaining = Number(task?.target_remaining);

                              //   if (numericValue > targetRemaining) {

                              //     // alert("Entered value cannot be greater than Target Remaining.");
                              //     swal("Warning!", "Entered value cannot be greater than Target Remaining!", "warning");
                              //     // Swal.fire({
                              //     //   icon: "error",
                              //     //   title: "Invalid Input",
                              //     //   text: "Entered value cannot be greater than Target Remaining!",
                              //     // });
                              //     setValueWiseTargetDone(""); // Clear the input field
                              //     return; // Prevent closing the modal
                              //   }

                              //   setShowTaskTypePopup(false);
                              //   handleAddTarget();
                              // }}
                              onClick={() => {
                                const numericValue = Number(valueWiseTargetDone);
                                const targetRemaining = Number(task?.target_remaining);

                                if (!Number.isInteger(numericValue)) {
                                  swal("Warning!", "Please enter a whole number (no decimals).", "warning");
                                  setValueWiseTargetDone("");
                                  return;
                                }

                                // Check if input is greater than target remaining
                                if (numericValue > targetRemaining) {
                                  swal("Warning!", "Entered value cannot be greater than Target Remaining!", "warning");
                                  setValueWiseTargetDone("");
                                  return;
                                }

                                setShowTaskTypePopup(false);
                                handleAddTarget();
                              }}

                            >
                              Add Report
                            </Button>



                          </div>
                        </div>
                      </Modal.Body>
                    </Modal>
                  </div>
                </div>
                {targetType == 'Done/Not Done' &&
                  (targetDone == "1" && (

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ borderBottom: '1px solid #ddd', marginBottom: "0.7rem", color: 'grey' }}>
                        <tr>
                          <td>Target Done</td>
                          <td>Reporting Date</td>
                        </tr>

                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          {targetDone ? (
                            <td style={{ padding: '8px' }}>Done</td>
                          ) : (
                            <td>Not Done</td>
                          )}
                          <td style={{ padding: '8px', color: 'grey' }}>{reportDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  ))}

                {(targetType === 'Number' || targetType === 'Currency' || targetType === 'currency' || targetType === 'number') && targetDone >= '1' && (

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ borderBottom: '1px solid #ddd', marginBottom: "0.7rem", fontSize: "0.7rem", color: 'grey' }}>
                      <tr>
                        <td>Value Wise Target Done</td>
                        <td>Target Done</td>
                        <td>Balance Target</td>
                        <td>Reporting Date</td>
                      </tr>

                    </thead>
                    <tbody>

                      {Object.values(reportHistory).reverse().map((report, index) => {
                        return (
                          <tr key={report.id} style={{ "borderBottom": '1px solid #ddd' }}>
                            <td style={{ padding: '8px', color: 'grey' }}>{Number(report.target_done) + Number(report.target_remaining)}</td>
                            <td style={{ padding: '8px', color: 'grey' }}>{report.target_done}</td>
                            <td style={{ padding: '8px', color: 'grey' }}>{report.target_remaining}</td>
                            <td style={{ padding: '8px', color: 'grey' }}>{report.reporting_date || 'N/A'}</td>
                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                )}
              </div>
            </div>







            <div
              style={{
                width: "1px",
                backgroundColor: "#222",
                margin: "0 1rem",
              }}
            ></div>


            <div className="w-100 w-lg-50 p-2 d-flex flex-column justify-content-between gap-3">

              {/* Timeline Activity List */}
              <div
                className="w-100 overflow-y-auto"
                style={{ maxHeight: "500px", flex: 1, color: "grey" }}
              >
                {timelineData.map((item) => (
                  <div key={item.id} className="mb-2">
                    {item.name}{" "}
                    <span
                      dangerouslySetInnerHTML={{ __html: item.description }}
                      style={{ fontSize: "12px", marginRight: "4px", color: "grey" }}
                    />
                    <span className="text-muted" style={{ fontSize: "10px" }}>
                      {formatTime(item.created_at)}
                    </span>

                    {/* Attachments */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="mt-1">
                        {item.attachments.map((attachment) => (
                          <span
                            key={attachment.image}
                            style={{
                              fontSize: "12px",
                              color: "grey",
                              cursor: "pointer",
                              display: "block", // Ensures text wraps properly
                              wordBreak: "break-word", // Prevents overflow issues
                            }}
                            onMouseEnter={(e) => (e.target.style.color = "#21d2ed")}
                            onMouseLeave={(e) => (e.target.style.color = "#1f2c8f")}
                            onClick={() => handleTimeLineDownloadClick(attachment.image)}
                          >
                            {attachment.image}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {timelineData.length === 0 && <p>No activity yet.</p>}
              </div>

              {/* Comment Input Section */}
              <div className="border p-2 d-flex flex-column">
                <textarea
                  placeholder="Type your comment..."
                  className="w-100"
                  style={{
                    fontSize: "0.85rem",
                    height: "45px",
                    border: "none",
                    borderRadius: "5px",
                    padding: "6px",
                    color: "grey",
                    resize: "none",
                  }}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setCommentError(false); // Clear error when a comment is entered
                  }}
                />


                <div className="d-flex flex-wrap align-items-center justify-content-between mt-2 gap-2">
                  {/* File Input */}
                  <div className="flex-grow-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      className="form-control"
                      style={{
                        fontSize: "0.85rem",
                        padding: "4px",
                        color: "grey",
                        width: "100%",
                      }}
                      onChange={(e) => {
                        handleFileChange(e);
                        setFileError(false);
                      }}
                    />

                  </div>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCommentUploading || (!comment.trim() && (!selectedFile || selectedFile.length === 0))}
                    onClick={handleSendComment}
                  >
                    {isCommentUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </>

  );
};

export default TaskPanel;

