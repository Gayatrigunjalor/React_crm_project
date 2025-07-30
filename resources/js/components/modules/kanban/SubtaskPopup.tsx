import React, { useEffect, useRef, useState } from "react";
import Button from "../../base/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faStar, faPlus, faCaretDown, faPaperPlane, faBullseye } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from '../../../axios';
import qs from "qs";
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import { Form, Modal, Table } from "react-bootstrap";
import Select from 'react-select';
import { is } from "date-fns/locale";

interface Stage {
  id: number;
  stage_name: string;
  stage_order: number;
  is_done_stage: number;
  stage_bg_color: string;
  created_at: string | null;
  updated_at: string | null;
}

interface SubTask {
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

const colors = {
  2: '#FF0000',
  3: '#00FF00',
  4: '#0000FF',
  5: '#FFFF00',
  6: '#FF00FF',
  7: '#00FFFF',
  8: '#800080',
};

const SubtaskPopup = ({ type, isTask, onStageNext }) => {
  console.log("***taskType****", type);
  console.log("***task****", isTask);
  const [subtaskId, setSubtaskId] = useState(localStorage.getItem("selectedTaskId") || "");
  const [status, setStatus] = useState("SelectTask");
  const [flag, setFlag] = useState("");
  const [sprintPoint, setSprintPoint] = useState("");
  const [showFlagOptions, setShowFlagOptions] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [userIDS, setUserIDS] = useState<string[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [columnNAME, setColName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [ehours, setTaskHours] = useState("");
  const [eminutes, setTaskMinutes] = useState("");
  const [eseconds, setTaskSeconds] = useState("");
  const [debouncedDescription, setDebouncedDescription] = useState("");
  const [debouncedHours, setDebouncedHours] = useState("");
  const [debouncedMinutes, setDebouncedMinutes] = useState("");
  const [debouncedSeconds, setDebouncedSeconds] = useState("");
  const [created, setCreated] = useState("");
  const [timelineData, setTimelineData] = useState([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const statusOptions = [
  //   { label: "To Do", color: "#000000", symbol: "■" },
  //   { label: "In Progress", color: "#EAB21A", symbol: "■" },
  //   { label: "Hold", color: "#EA06E2", symbol: "■" },
  //   { label: "Abort", color: "#3924D6", symbol: "■" },
  //   { label: "Review", color: "#3B5998", symbol: "■" },
  //   // { label: "Complete", color: "#10E039", symbol: "■" },
  // ];

  const statusOptions = [
    { label: "To Do", color: "#000000", symbol: "■" },
    { label: "In Progress", color: "#FF9800", symbol: "■" },
    { label: "Hold", color: "#EA06E2", symbol: "■" },
    { label: "Abort", color: "#3924D6", symbol: "■" },
    { label: "Review", color: "#6A1B9A", symbol: "■" },
    // { label: "Complete", color: "#10E039", symbol: "■" },   
  ];


  const [task, setTask] = useState<SubTask | null>(null);

  const statusOptions2 = [
    { label: "1" },
    { label: "2" },
    { label: "3" },
    { label: "4" },
    { label: "5" },
    { label: "6" },
    { label: "7" },
    { label: "8" }
  ]

  const flagOptions = [
    { label: "Low", color: "green" },
    { label: "Medium", color: "orange" },
    { label: "High", color: "red" },
    { label: "Urgent", color: "darkred" },
    { label: "Salary Hold", color: "darkgreen" },
    { label: "Directors Priority", color: "blue" },
  ];
  // const assigneeOptions = [
  //   "ASSIGNEE",
  //   "Monty",
  //   "Compliance Manager Pratik",
  //   "Amruta Meshram",
  //   "Nandan",
  //   "Vaibhav C&S",
  // ];
  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [text, setText] = useState("");
  const [targetCompleted, setTargetCompleted] = useState("");
  const [targetDone, setTargetDone] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [targetType, setTargetType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [due_date, setEndDate] = useState("");
  const [enddateDisabled, setEndDateDisabled] = useState(false);
  const [startdateDisabled, setStartDateDisabled] = useState(false);
  //for taskpopup delete btn
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const inputRef = useRef(null);
  const [debouncedTitle, setDebouncedTitle] = useState("");

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Format to HH:MM:SS
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
        if (debouncedHours && columnNAME === "ehours") {
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


  const handleChange = (columnName) => (event) => {
    console.log("event", event.target.value);
    if (columnName === "title") {
      setTaskTitle(event.target.value);
      setColName(columnName);
    } else if (columnName === "description") {
      setTaskDescription(event.target.value);
      setColName(columnName);
    }
    else if (columnName === "e_hours") {
      setTaskHours(event.target.value);
      setColName(columnName);
    }
    else if (columnName === "e_minutes") {
      setTaskMinutes(event.target.value);
      setColName(columnName);
    }
    else if (columnName === "e_seconds") {
      setTaskSeconds(event.target.value);
      setColName(columnName);
    }
  };

  //for outside click event
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
    else if (columnName === "e_hours") {
      console.log('HOUR is ', ehours);
      callApi(ehours, columnName);
    }
    // else if (columnName === "e_minutes") {
    //   console.log('MIN is ', eminutes);
    //   callApi(eminutes, columnName);
    // }
    // else if (columnName === "e_seconds") {
    //   console.log('SEC is ', eseconds);
    //   callApi(eseconds, columnName);
    // }
  }

  //ADD CHECKLIST 
  const [newTodo, setNewTodo] = useState('');
  const [todoList, setTodoList] = useState([]);
  const [allAttachmentList, setAllAttachmentList] = useState([]);
  const [error, setError] = useState('');
  const [checkedItem, setChekedItem] = useState('');
  const [checkedId, setChekedId] = useState('');
  const [completeList, setCompleteList] = useState([]);


  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
    setError(''); // Clear any previous errors
  };


  //FETCH SUBTASK
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
      const taskData = response.data;
      // console.log(taskData);
      // console.log(taskData.title);
      const updatedTask: SubTask = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        user_ids: taskData.user_ids,
        priority: taskData.priority,
        start_date: taskData.start_date,
        due_date: taskData.due_date,
        e_hours: taskData.e_hours,
        e_minutes: taskData.e_minutes,
        e_seconds: taskData.e_seconds,
        task_type: taskData.task_type,
        stage_id: taskData.stage_id,
        timer_status: taskData.timer_status,
        kpi_year: taskData.kpi_year,
        kpi_month: taskData.kpi_month,
        sprint_point: taskData.sprint_point,
        target_type: taskData.target_type,
        target_value: taskData.target_value,
        target_completed: taskData.target_completed,
        target_remaining: taskData.target_remaining,
        created_by: taskData.created_by,
        created_at: taskData.created_at,
        updated_at: taskData.updated_at,
        deleted_at: taskData.deleted_at,
        isAuthorizedAssignee: taskData.isAuthorizedAssignee,
        created: taskData.created,
        stages: taskData.stages,
        stage_name: taskData.stages.stage_name,
      };


      setTask(updatedTask);
      setTaskTitle(updatedTask.title);
      setStatus(updatedTask.stage_name);
      setTargetType(updatedTask.target_type);
      setTargetCompleted(updatedTask.target_completed);
      setTaskDescription(updatedTask.description || "");
      setTaskHours(updatedTask.e_hours || "");
      setTaskMinutes(updatedTask.e_minutes);
      setTaskSeconds(updatedTask.e_seconds);
      setStartDate(updatedTask.start_date);
      setEndDate(updatedTask.due_date);
      setUserIDS(updatedTask.user_ids);
      setSprintPoint(updatedTask.sprint_point);
      if (updatedTask.priority) {
        setFlag(updatedTask.priority);
      } else {
        setFlag("Medium");
      }
    } catch (error) {
      console.error("Error fetching Task:", error);
    }
  };
  useEffect(() => {
    fetchSubTask();
  }, [subtaskId]);

  //SUBTASK TIMELINE
  const fetchSubTaskTimelineData = async () => {

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/timelineSubTask?sub_task_id=${subtaskId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });


      const data = response.data;
      setTimelineData(data);
    }
    catch (error) {
      console.error("Error fetching timeline data:", error);
    }
  };
  useEffect(() => {
    fetchSubTaskTimelineData();
  }, [subtaskId]);

  //UPDATE TASK FOR DATE,HOUR,MINUTE
  const callApi = async (value, colName) => {

    if (!value) return;
    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateSubTask",
        {
          id: subtaskId,
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
        fetchSubTaskTimelineData();
        fetchSubTask();
        //onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);
      }
    } catch (error) {
      console.error("Error updating priority:", error);

    }
  };


  const assigneeOptions = assignee && Array.isArray(assignee)
    ? assignee.map((option) => ({
      value: option.value,
      label: option.label,
    }))
    : [];


  const handleAssigneeChange = async (selectedOptions) => {
    // Ensure we're working with an array of selected options
    const newSelectedOptions = selectedOptions || [];
    setSelectedAssignee(newSelectedOptions);

    // Extract user IDs from selected options
    const userIds = newSelectedOptions.map(option => option.value);
    console.log('Selected user IDs:', userIds);

    // Always call the API, even with empty array
    const data = {
      sub_task_id: subtaskId,
      user_ids: userIds, // This will be empty array if no assignees selected
    };

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateAssigneeSubTask",
        data,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchSubTaskTimelineData();
        fetchSubTask();
      } else {
        console.error("Failed to update assignees:", response.data);
      }
    } catch (error) {
      console.error("Error updating assignees:", error);
    }
  };


  //UPDATE SUBTASK NEXT STAGE
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

      if (!subtaskId) {
        alert("SUb Task ID is missing!");
        return;
      }

      if (!token) {
        alert("Authorization token is missing!");
        return;
      }

      const currentStageValue = statusMapping[status];
      if (!currentStageValue) {
        alert("Current stage is invalid!");
        return;
      }

      // Prepare request data
      const requestData = qs.stringify({
        sub_task_id: subtaskId,
        current_stage_id: currentStageValue,
        updated_stage_id: statusValue,
      });

      console.log("Sending Request: ", requestData);

      // Make API call
      const response = await axiosInstance.post(
        "/updateSubtaskStage",
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
        fetchSubTaskTimelineData();
        fetchSubTask();
        onStageNext();

      } else {
        console.error("API Response Error:", response.data);
        alert(response.data?.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };


  //UPDATE SPRINT POINT
  const handleSprintChange = async (e) => {
    try {

      const selectedSprint = e.target.value; // Get selected status value 
      const token = localStorage.getItem("token");

      if (!subtaskId) {
        alert("SUb Task ID is missing!");
        return;
      }

      if (!token) {
        alert("Authorization token is missing!");
        return;
      }
      console.log("Selected Sprint", selectedSprint);

      // Prepare request data
      const requestData = qs.stringify({
        id: subtaskId,
        sprint_point: selectedSprint,
      });

      console.log("Sending Request: ", requestData);

      // Make API call
      const response = await axiosInstance.post(
        "/updateSubtaskSprintPoint",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("updateSubtaskSprintPoint API Response:", response);

      if (response.data?.success) {
        // fetchSubTaskTimelineData();
        fetchSubTask();
        // onStageNext();

      } else {
        console.error("API Response Error:", response.data);
        alert(response.data?.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };
  //UPDATE SUB TASK PRIORITY
  const handleFlagChange = async (newFlag) => {
    setFlag(newFlag);

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/updateSubTask",
        {
          id: subtaskId,
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
        fetchSubTaskTimelineData();
        // onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);

        setFlag(task?.priority || "Medium");
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      setFlag(task?.priority || "Medium");
    }
  };

  //ADD SUBTASK CHECKLIST
  const handleAddTodo = async () => {
    if (newTodo.trim() === '') {
      setError('Please enter a task.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/addSubTaskCheckList",
        {
          sub_task_id: subtaskId,
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
        fetchSubTaskTodoList();
        setError('');
        fetchSubTaskTimelineData();
        // onPriorityChanged();
      } else {
        console.error("Failed to update priority:", response.data);
      }

    }
    catch (err) {
      console.error('Error adding todo:', err);
      setError('Error adding task. Please try again.');
    }
  };

  //FETCH TODO
  const fetchSubTaskTodoList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchSubTaskTodoList?sub_task_id=${subtaskId}`, {
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
    fetchSubTaskTodoList();
  }, []);

  //DELETE CHECK LIST
  const handleDeleteCheckList = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.delete(`/deleteSubTaskCheckList?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchSubTaskTodoList();
        setError('');
        // onPriorityChanged();
      } else {
        console.error("Failed to delete:", response.data);
      }
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  //SUBTASK TO LIST
  const handleDeleteCompleteList = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.delete(`/deleteSubTaskCheckList?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchCompleteList();
        setError('');
        //  onPriorityChanged();
      } else {
        console.error("Failed to delete:", response.data);
      }
    } catch (error) {
      console.error("Error fetching todo list:", error);
    }

  };

  //SUBTASK TODO LIST 
  const handleTODOCheck = async (id: string) => {

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/markSubTaskCompleted",
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
        fetchSubTaskTodoList();
        fetchCompleteList();
        setError('');
        fetchSubTaskTimelineData();
        // onPriorityChanged();
      } else {
        console.error("Failed to check", response.data);
      }

    }
    catch (err) {
      console.error('Error checking todo:', err);
      setError('Error checking list');
    }
  };


  //SUBTASK COMPLETE LIST 
  const handleCompleteCheck = async (id: string) => {

    try {
      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const response = await axiosInstance.post(
        "/markSubTaskTodo",
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
        fetchSubTaskTodoList();
        setError('');
        fetchSubTaskTimelineData();
        // onPriorityChanged();
      } else {
        console.error("Failed to check", response.data);
      }

    }
    catch (err) {
      console.error('Error checking :', err);
      setError('Error checking list');
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


  //SUBTASK COMPLETE LIST FETCH
  const fetchCompleteList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchSubTaskCompleteList?sub_task_id=${subtaskId}`, {
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

  const handleSendComment = async () => {
    try {
      if (!comment) {
        // Comment is required
        return;
      }

      const token = localStorage.getItem("token");
      const cleanToken = token && token.split("|")[1];

      const formData = new FormData();
      formData.append("task_comment_subtask", comment);
      formData.append("sub_task_id", subtaskId); // Convert ID to string

      // if (selectedFile) {
      //   formData.append("subtask_comment_attachments[]", selectedFile); // Append file if selected
      // }

      if (selectedFile.length > 0) {
        selectedFile.forEach((file, index) => {
          formData.append(`subtask_comment_attachments[${index}]`, file);
        });


      }

      const response = await axiosInstance.post(`/storeCommentSubTask`, formData, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "multipart/form-data",
        },
      });




      console.log("Comment added successfully:", response.data);
      if (response.data.success) {
        setComment(""); // Clear comment input
        setSelectedFile(null); // Clear file input
        fetchSubTaskTimelineData();

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        swal("Success!", "Comment and file uploaded successfully!", "success"); // Corrected line
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      swal("Error!", "Failed to upload comment or file. Please try again.", "error");
    }
  };

  const handleEditClick = async (id: string, listItem: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/editSubTaskCheckList?id=${id}`, {
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
        "/updateSubTaskCheckList",
        {
          subcheck_list_id: checkedId,
          checklist: checkedItem
        },
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data.success) {
        fetchSubTaskTodoList();
        fetchCompleteList();
        setError('');

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

  const handleUpload = async () => {
    const formData = new FormData();

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append(`subtaskfiles${i}`, selectedFiles[i]);
    }

    formData.append('attachmentFiles', selectedFiles.length);
    formData.append('sub_task_id', subtaskId);

    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const response = await axiosInstance.post('/addSubTaskAttachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      if (response.data.success) {
        console.log('File uploaded successfully:', response.data.message);
        fetchSubTaskTimelineData();
        fetchAllTaskAttachmentList();
        setShowFileUpload(false);
      } else {
        console.error('File upload failed:', response.data.message || 'Unknown error');
        // Handle error, display message to the user, etc.
      }
    } catch (error) {
      console.error('File upload error:', error);
      // Handle error, display message to the user, etc.
    }
  };

  const fetchAllTaskAttachmentList = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/fetchAllSubTaskAttachments?id=${subtaskId}`, {
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

      const response = await axiosInstance.delete(`/deleteSubTaskAttachment?id=${id}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      if (response.data.success) {
        fetchAllTaskAttachmentList();
        setError('');
        // onPriorityChanged();
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


  const handleTimeLineDownloadClick = async (fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

      const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/subtasks/comment/${fileName}`, {
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


  const [dateError, setDateError] = useState("");

  const [showTaskTypePopup, setShowTaskTypePopup] = useState(false);
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


  return (
    <div className="container  d-flex align-items-center justify-content-center" style={{
      // minHeight: '100vh',
      padding: 0,
      margin: 0,
    }}>
      {/* HeadSection */}
      <div
        className="card w-100 p-3"
      >
        <div style={{ borderRadius: "0.9rem" }}>





          {/* Created Timestamp (Aligned to Right) */}
          <div
            className="col text-end text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            {task?.created}
          </div>
        </div>

        <hr className="my-3" style={{ borderTop: "2px solid #333" }} />

        {/* Subheadesection */}
        <div className="d-flex justify-content-between align-items-center flex-column flex-sm-row">
          {/* part1 */}
          <div
            className="d-flex flex-column flex-sm-row justify-content-between align-items-start"
            style={{ gap: "0.7rem" }}
          >
            {/* First dropdown */}
            <div className="d-flex flex-column">
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                {/* Custom Select Button */}



                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "120px",
                    height: "35px",
                    backgroundColor: statusOptions.find((opt) => opt.label === status)?.color || "#F7D600", // Dynamically set background color
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
                  <div
                    style={{
                      // backgroundColor: "#D1AC00",
                      padding: "6px 5px",
                      borderRadius: "0 8px 8px 0",
                    }}
                  >
                    ▶
                  </div>
                </div>

                {/* Hidden Select Box for Functionality */}
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


            </div>


            {/* Second and Third dropdowns */}
            <div className="d-flex gap-3 flex-wrap">
              {/* Flag dropdown */}
              <div className="position-relative" ref={dropdownRef} style={{ marginBottom: '1rem' }}>

                {/* Flag dropdown button */}
                <button
                  className="btn btn-light border"
                  onClick={() => setShowFlagOptions(!showFlagOptions)}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.4rem 0.8rem",
                    height: "36px",
                    marginBottom: "0.5rem",
                    whiteSpace: "nowrap", // Prevents text wrapping
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
                  {flag || "Priority"}
                  <FontAwesomeIcon icon={faCaretDown} className="ms-2" />
                </button>

                {/* Dropdown options */}
                {showFlagOptions && (
                  <div
                    className="position-absolute bg-white border rounded shadow p-2"
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

              {/* <select
                className="form-select"
                value={flag}
                onChange={(e) => {
                  setFlag(e.target.value);
                  handleFlagChange(e.target.value);
                }}
                style={{
                  width: "105px",
                  height: "27px",
                  fontSize: "0.75rem",
                  padding: "0.2rem",
                }}




              {/* Assignee dropdown */}
              {/* <select
                className="form-select"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                style={{
                  width: "105px",
                  height: "27px",
                  fontSize: "0.75rem",
                  padding: "0.2rem",
                }}
              >
                <option value="">ASSIGNEE</option>
                {assigneeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select> */}



              {type === 'objective' &&
                <Select
                  isMulti
                  options={assigneeOptions}
                  value={selectedAssignee}
                  onChange={handleAssigneeChange}
                  placeholder="Select Assignees"
                  isDisabled={!isTask}
                  styles={{
                    option: (styles, state) => ({
                      ...styles,
                      fontSize: '10px',
                    }),
                    control: (styles) => ({
                      ...styles,
                      fontSize: '10px',
                    }),
                    multiValue: (styles) => ({
                      ...styles,
                      fontSize: '10px',
                    }),
                  }}
                  isClearable={false} // This removes the clear all button
                  closeMenuOnSelect={false} // This prevents the menu from closing when selecting an option
                />
              }

            </div>
          </div>

          <div
            className="border-start mx-1"
            style={{
              height: "4rem",
              borderColor: "#222",
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          ></div>




          <div
            className="border border-secondary rounded p-2 d-inline-flex align-items-center"
            style={{ position: 'relative', padding: '10px 10px', minWidth: '50px' }}
          >
            <FontAwesomeIcon
              icon={faStar}
              style={{ color: 'black', fontSize: '12px', marginRight: '5px' }}
            />
            <span style={{ fontSize: "12px", paddingRight: "5px" }}>
              {sprintPoint}PT
            </span>
            <select
              className="form-select"
              value={sprintPoint}
              onChange={(e) => {
                setSprintPoint(e.target.value);
                handleSprintChange(e);
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
              {statusOptions2.map((option, index) => (
                <option key={index} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="border-start mx-1"
            style={{
              height: "4rem",
              borderColor: "#222",
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          ></div>






          {/* part2 */}
          <div
            className="d-flex flex-column flex-sm-row p-2"
            style={{ gap: "0.4rem" }}
          >
            <div ref={ehoursRef}>

              <input
                type="text"
                placeholder="H"
                value={ehours}
                disabled={!isTask}
                onChange={(e) => {
                  const raw = e.target.value;
                  const numeric = raw.replace(/\D/g, ''); // Remove non-digit characters
                  const value = Math.min(Math.max(Number(numeric), 0), 12); // Clamp between 0 and 12
                  setTaskHours(value);
                }}
                onFocus={() => setIsHoursFocused(true)}
                className="form-control"
                style={{
                  width: "48px",
                  height: "24px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                }}
              />

            </div>

            <div ref={eminRef}>
              <input
                type="text"
                placeholder="M"
                disabled={!isTask}
                value={eminutes}
                onChange={(e) => {
                  const raw = e.target.value;
                  const numeric = raw.replace(/\D/g, ''); // Remove non-numeric input
                  const clamped = Math.min(Math.max(Number(numeric), 0), 59); // Clamp between 0 and 59
                  setTaskMinutes(clamped);
                }}
                onFocus={() => setIsMinFocused(true)}
                className="form-control"
                style={{
                  width: "48px",
                  height: "24px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                }}
              />

              {/* <input
                type="text"
                placeholder="M"
                // onFocus={(e) => e.target.select()}
                min="0"
                value={eminutes}
                // onChange={handleChange("e_minutes",)}
                // onBlur={handleBlur("e_minutes")}
                onChange={(e) => setTaskMinutes(e.target.value)}
                onFocus={() => setIsMinFocused(true)}
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

            <div ref={esecRef}>
              <input
                type="text"
                placeholder="S"
                disabled={!isTask}
                value={eseconds}
                onChange={(e) => {
                  const raw = e.target.value;
                  const numeric = raw.replace(/\D/g, '');
                  const clamped = Math.min(Math.max(Number(numeric), 0), 59);
                  setTaskSeconds(clamped);
                }}
                onFocus={() => setIsSecFocused(true)}
                className="form-control"
                style={{
                  width: "48px",
                  height: "24px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  padding: "0.3rem",
                }}
              />

              {/* <input
                type="text"
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

          <div
            className="border-start mx-1"
            style={{
              height: "4rem",
              borderColor: "#222",
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          ></div>
          {/* part3 */}




          <div className="d-flex flex-column">
            {/* <input
            readOnly
              type="date"
              className="form-control mb-2"
              value={startDate}
              style={{ fontSize: "0.7rem", height: "30px" }}
              onChange={(event) => {
                setStartDate(event.target.value);
                setDateError(""); // Clear error when start date changes
              }}
            /> */}
            <input
              type="date"
              className="form-control mb-2"
              value={startDate}
              disabled={startDate}
              // Disable if a date is already selected
              style={{ fontSize: "0.7rem", height: "30px" }}
              onChange={(event) => {
                const newDate = event.target.value;
                setStartDate(newDate);
                setDateError(""); // Clear error
                callApi(newDate, "start_date"); // Only call once when date is selected
              }}
            />

            {/* <input
              type="date"
              className="form-control"
              value={endDate}
              style={{ fontSize: "0.7rem", height: "30px" }}
              onChange={(event) => {
                const selectedEndDate = event.target.value;
                if (new Date(selectedEndDate) < new Date(startDate)) {
                  setDateError("End date cannot be earlier than the start date."); // Set error message
                  return;
                }
                setEndDate(selectedEndDate);
                setDateError(""); // Clear error if valid
              }}
            /> */}
            <input
              type="date"
              className="form-control"
              value={due_date}
              disabled={due_date} // disables only if endDate is not empty
              style={{ fontSize: "0.7rem", height: "30px" }}
              onChange={(event) => {
                const selectedEndDate = event.target.value;
                if (new Date(selectedEndDate) < new Date(startDate)) {
                  setDateError("End date cannot be earlier than the start date.");
                  return;
                }
                setEndDate(selectedEndDate);
                setDateError("");
                callApi(selectedEndDate, "due_date");
              }}
            />


            {dateError && (
              <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                {dateError}
              </p>
            )}
          </div>





        </div>

        <hr className="my-4" style={{ borderTop: "2px solid #555" }} />

        {/* mainsection */}
        <div className="d-flex flex-column flex-lg-row" style={{ maxHeight: "380px", overflowY: "auto" }}
        >
          {/* leftside */}
          <div className="w-100 w-lg-50 pe-4 mb-4 mb-lg-0" style={{ maxHeight: "350px", overflowY: "auto", maxWidth: "600px" }}>
            <div className="mb-4" ref={titleRef}>
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                className="form-control"
                style={{ fontSize: "0.9rem" }}
                // onChange={handleChange("title",)}
                // onBlur={handleBlur("title")}
                onChange={(e) => setTaskTitle(e.target.value)}
                onFocus={() => setIsTitleFocused(true)}
              // ref={inputRef}
              />
              {/* <textarea
                placeholder="Description"
                className="form-control mt-2"
                style={{ fontSize: "0.9rem", height: "110px" }}
                value={taskDescription}
                onChange={handleChange("description",)}
                onBlur={handleBlur("description")}
              /> */}
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
              style={{ borderColor: "#555", borderWidth: "2px" }}
            />




            <div className="mb-3">
              <h5 style={{ color: 'gray'}}>ADD CHECKLIST</h5>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control flex-grow-1"
                  style={{ fontSize: "0.9rem", height: "30px" }}
                  value={newTodo}
                  onChange={handleInputChange}
                />
                <Button
                  className="d-flex justify-content-center align-items-center border"
                  style={{ width: "2rem", height: "30px", backgroundColor: "transparent", marginLeft: "0.5rem", padding: 0 }}
                  onClick={handleAddTodo}
                >
                  <FontAwesomeIcon icon={faPlus} style={{ color: "#add8e6" }} />
                </Button>
              </div>
            </div>

            <div>
              <h6 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>TODO</h6>
              <div >
                {todoList && todoList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}> {/* Table styling */}
                    <tbody>
                      {todoList.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '0.5px solid #ddd' }}> {/* Row styling */}
                          <td style={{ padding: '7px' }}> {/* Checkbox cell */}
                            <div className="d-flex justify-content-between align-items-center px-2 py-1 ">
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={item.status === "1"}
                                  onChange={(e) => handleTODOCheck(item.id)}
                                />
                                <span>{item.checklist}</span>
                              </div>
                              <div>
                                <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleEditClick(item.id, item.checklist)} /> {/* Edit icon */}
                                <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteCheckList(item.id)} />

                              </div>
                            </div>
                          </td>
                          {/* <td style={{ padding: '8px' }}>{item.checklist}</td> */}
                          {/* <td style={{ padding: '8px', textAlign: 'center' }}>
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
                  top: "5%", // Moves the modal near the top 
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

              <h5 style={{  color: 'gray',marginTop: '2rem', marginBottom: '0.5rem' }}>COMPLETED</h5>
              <div >
                {completeList && completeList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}> {/* Table styling */}
                    <tbody>
                      {completeList.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}> {/* Row styling */}
                          <td style={{ padding: '8px' }}> {/* Checkbox cell */}
                            <input
                              type="checkbox"
                              checked={item.status === "1"}
                              onChange={(e) => handleCompleteCheck(item.id)}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>{item.checklist}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleEditClick(item.id, item.checklist)} /> {/* Edit icon */}
                            <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteCompleteList(item.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "red", fontSize: "0.85rem" }}> No Check List in Completed</p>
                )}
              </div>


              <div className="d-flex align-items-center justify-content-between"
              // style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
              >
                  <h5 style={{ color: 'gray', marginBottom: '0.5rem' }}>Attachments</h5>
                <Button
                  className="d-flex justify-content-center align-items-center btn btn-primary text-white border-0"
                  style={{
                    width: "4rem",
                    height: "2rem",
                    border: "1px solid #ccc",
                    padding: 0,
                    fontSize: "0.9rem"
                  }}
                  onClick={() => setShowFileUpload(true)}
                >
                  Add
                </Button>


              </div>



              <div>
                {allAttachmentList && allAttachmentList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}> {/* Table styling */}
                    <tbody>
                      {allAttachmentList.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}> {/* Row styling */}

                          <td style={{ padding: '8px' }}>{item.name}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <FaDownload style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }} onClick={() => handleDownloadClick(item.name)} /> {/* Edit icon */}
                            <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleDeleteAttachmentList(item.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "red", fontSize: "0.85rem" }}>No Attachments</p>
                )}
              </div>

              {/* ATTACH FILE */}
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
                          fontSize: "0.9rem",
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                        }}
                        multiple // Allow multiple file selection
                        onChange={handleFileAttachChange} // Call handleFileChange on file selection
                      />
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <div className="d-flex justify-content-end">
                    <Button className="btn btn-danger me-2" onClick={() => setShowFileUpload(false)}>
                      Cancel
                    </Button>
                    <Button className="btn btn-primary" onClick={handleUpload} disabled={selectedFiles.length === 0}> {/* Disable if no files selected */}
                      Upload
                    </Button>
                  </div>
                </Modal.Footer>
              </Modal>


            </div>
          </div>








          {/* Vertical Divider */}
          <div
            style={{
              width: "1px",
              backgroundColor: "#222",
              margin: "0 1rem",
            }}
          ></div>

          {/* rightside */}
          <div className="w-100 w-lg-50 p-2 d-flex flex-column justify-content-between gap-3">

            <div className="w-90 overflow-y-auto" style={{ maxHeight: "500px", flex: 1 }}>
              {/* {timelineData.map((item) => (
                <div key={item.id} className="mb-2">
                  {item.name}{' '}
                  <span dangerouslySetInnerHTML={{ __html: item.description }} style={{ fontSize: '12px' }} /> 
                  <span className="text-muted" style={{ fontSize: '10px' }}>{formatTime(item.created_at)}</span> 
                </div>
              ))} */}
              {timelineData.map((item) => (
                <div key={item.id} className="mb-2">
                  {item.name}{' '}
                  <span
                    dangerouslySetInnerHTML={{ __html: item.description }}
                    style={{ fontSize: '12px', marginRight: '4px' }}
                  />
                  <span className="text-muted" style={{ fontSize: '10px' }}>
                    {formatTime(item.created_at)}
                  </span>

                  {/* Render images if attachments exist */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="mt-1">
                      {item.attachments.map((attachment) => (
                        <span style={{ fontSize: "12px", color: "#1f2c8f", cursor: "pointer", display: "block" }} onMouseEnter={(e) => e.target.style.color = "#21d2ed"} onMouseLeave={(e) => e.target.style.color = "#1f2c8f"} onClick={() => handleTimeLineDownloadClick(attachment.image)}>{attachment.image}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {timelineData.length === 0 && <p> No activity yet.</p>}
            </div>
            <div className="border p-2 d-flex flex-column">
              <textarea
                placeholder="Type your comment..."
                style={{
                  fontSize: "0.85rem",
                  height: "45px",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px",
                }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="d-flex align-items-center justify-content-between mt-2">
                <div className="flex-grow-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    className="form-control"
                    style={{
                      fontSize: "0.85rem",
                      padding: "4px",
                    }}
                    onChange={handleFileChange}
                  />
                </div>

                <Button
                  className="btn ms-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: "1.8rem",
                    height: "1.8rem",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "0.3rem",
                  }}
                  onClick={handleSendComment}
                // disabled={!comment.trim() && !selectedFile}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-primary fs-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskPopup;
