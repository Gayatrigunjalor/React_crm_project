import React, { useEffect, useState } from "react";
import { Container, Row, Col, Tab, Nav, Form, Button, Modal, Pagination, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaCalendar, FaCalendarAlt, FaCalendarDay, FaRegEdit, FaVideo } from "react-icons/fa";
import axiosInstance from "../../../axios";
import swal from 'sweetalert';
import Badge from "../../../components/base/Badge";
import { set } from "date-fns";

type MeetingType = {
  id: number;
  title: string;
  time: string;
  date: string;
  description: string;
  done: boolean;
  status: string;
  customer_name: string;
  date_time: string;
  start_time: string;
  end_time: string;
  link: string;
  meeting_agenda: string;
  lead_stage?: string;
  reason?: string | null;
};

const initialMeetings: MeetingType[] = [
  {
    id: 1,
    title: "Sales Strategy Planning",
    time: "5:30 pm to 7:00 pm",
    date: "26-3-2025",
    description: "Review Q1 sales performance and set Q2 goals.",
    done: false,
    status: "progress",
    customer_name: "Customer A",
    date_time: "26-3-2025 5:30 pm",
    start_time: "5:30 pm",
    end_time: "7:00 pm",
    link: "https://meetinglink.com",
    meeting_agenda: "Review Q1 sales performance",
  },
];

type Customer = {
  id: number;
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
};

const Meeting = () => {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedTab, setSelectedTab] = useState("inProgress");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "",
    date: "",
    description: "",
    customer: "",
    leadStage: "",
    agenda: "",
    link: "",
    startTime: "",
    endTime: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingType | null>(null);
  const [status, setStatus] = useState<string>("done");
  const [updatedstatus, setUpdatedStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeetingData, setSelectedMeetingData] = useState<any>(null); // This will hold the selected meeting data
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'moveToDone' | 'moveToProgress' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Handler for date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    console.log("****", date);
    setSelectedDate(date);
    setCurrentPage(1); // Reset the pagination to the first page when date changes
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      try {
        const response = await axiosInstance.get("/sales_customer_list", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        const data = response.data;
        setCustomers(data.customer_list);
      } catch (error) {
        console.error("Error :", error);
      }
    };

    fetchCustomers();
  }, []);

  const fetchMeetings = async () => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    try {
      const endpoint = selectedTab === "inProgress" ? "/meeting_progress" : "/meeting_done";
      const response = await axiosInstance.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data = response.data;
      setMeetings(data || []);
    } catch (error) {
      console.error("Error while fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    setSearchTerm("");
    setSelectedDate("");
  }, [selectedTab]);

  const handleCheckboxChange = (id: number, status: string) => {
    if (selectedTab === 'inProgress') {
      setActionType('moveToDone');
      setUpdatedStatus(status);
    } else {
      setActionType('moveToProgress');
      setUpdatedStatus(status);
    }
    setSelectedMeetingId(id);
    setShowConfirmModal(true);
    // setMeetings((prevMeetings) =>
    //   prevMeetings.map((meeting) => (meeting.id === id ? { ...meeting, done: !meeting.done } : meeting))
    // );
  };
  // Handler to open the edit modal with pre-populated data
  const handleOpenEditModal = (meeting: MeetingType) => {
    setSelectedMeetingData({
      ...meeting,
      customer: meeting.customer_name, // Set customer name to be used in the dropdown
      leadStage: meeting.lead_stage,
      // Set lead stage
      status: meeting.status, // Set status
      title: meeting.title,
      date: meeting.date_time,
      description: meeting.description,
      agenda: meeting.meeting_agenda,
      link: meeting.link,
      startTime: meeting.start_time,
      endTime: meeting.end_time,
    });
    if (selectedTab === 'inProgress') {
      setActionType('moveToDone');
      setUpdatedStatus(status);
    } else {
      setActionType('moveToProgress');
      setUpdatedStatus(status);
    }
    setShowEditModal(true); // Open modal
  };

  const handleOpenCheckBoxUpdateModal = (meeting: MeetingType) => {
    const status = selectedTab === "inProgress" ? "done" : "progress";
    if (selectedTab === 'inProgress') {
      setActionType('moveToDone');
    } else {
      setActionType('moveToProgress');
    }
    console.log('status', status);
    console.log('selectedTab', selectedTab);
    setSelectedMeetingData({
      ...meeting,
      customer: meeting.customer_name, // Set customer name to be used in the dropdown
      leadStage: meeting.lead_stage,
      // Set lead stage
      status: status, // Set status
      title: meeting.title,
      date: meeting.date_time,
      description: meeting.description,
      agenda: meeting.meeting_agenda,
      link: meeting.link,
      startTime: meeting.start_time,
      endTime: meeting.end_time,
    });
    setShowConfirmModal(true); // Open modal
  };

  const handleAddMeeting = async () => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];
    const status = selectedTab === "inProgress" ? "progress" : "done";

    const selectedCustomer = customers.find(customer => customer.id === parseInt(newMeeting.customer));

    if (!selectedCustomer) {
      swal("Error", "Please select a valid customer", "error");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/meeting_store",
        {
          customer_name: selectedCustomer.sender_name,
          lead_stage: newMeeting.leadStage,
          meeting_agenda: newMeeting.agenda,
          link: newMeeting.link,
          date_time: newMeeting.date,
          start_time: newMeeting.startTime,
          end_time: newMeeting.endTime,
          description: newMeeting.description,
          status: status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data) {
        setMeetings([...meetings, { ...response.data, done: false }]);
        swal("Success!", response.data.message, "success");
        setShowModal(false);
        fetchMeetings();
        setNewMeeting({
          title: "",
          time: "",
          date: "",
          description: "",
          customer: "",
          leadStage: "",
          agenda: "",
          link: "",
          startTime: "",
          endTime: "",
        });
      }
    } catch (error) {
      console.error("Error while adding meeting:", error);
    }
  };

  const handleUpdateMeeting = async () => {

    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    const selectedCustomer = customers.find(customer => customer.sender_name === selectedMeetingData.customer);
    if (!selectedCustomer) {
      swal("Error", "Please select a valid customer", "error");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/meeting_update",
        {
          id: selectedMeetingData.id,
          customer_name: selectedCustomer.sender_name,
          lead_stage: selectedMeetingData.leadStage,
          meeting_agenda: selectedMeetingData.agenda,
          link: selectedMeetingData.link,
          date_time: selectedMeetingData.date,
          start_time: selectedMeetingData.startTime,
          end_time: selectedMeetingData.endTime,
          description: selectedMeetingData.description,
          status: selectedMeetingData.status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data) {
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === selectedMeetingData.id ? { ...meeting, ...response.data } : meeting
          )
        );

        swal("Success!", "Meeting updated successfully", "success");
        setShowEditModal(false);
        setShowConfirmModal(false);
        // Ensure the latest data is fetched after updating
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error while updating meeting:", error);
    }
  };


  const getPagedMeetings = (status: string) => {
    const filteredMeetings = meetings.filter(
      (meeting) => {
        // For the "done" tab, include all three statuses: done, postponed, cancelled
        if (status === "done") {
          return (
            (meeting.status === "done" || meeting.status === "postponed" || meeting.status === "cancelled") &&
            meeting.meeting_agenda &&
            meeting.meeting_agenda.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedDate ? meeting.date_time === selectedDate : true)
          );
        } else {
          // For other tabs, keep the original filtering logic
          return (
            meeting.status === status &&
            meeting.meeting_agenda &&
            meeting.meeting_agenda.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedDate ? meeting.date_time === selectedDate : true)
          );
        }
      }
    );
    console.log("Meeting Date", meetings);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return filteredMeetings.slice(indexOfFirst, indexOfLast);
  };
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenStatusModal = (meeting: MeetingType) => {
    setSelectedMeeting(meeting);
    setShowStatusModal(true);
  };


  const handleStatusUpdate = async () => {
    if (!selectedMeeting) return;

    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    try {
      const response = await axiosInstance.post(
        "/meeting_status_update",
        {
          id: selectedMeeting.id,
          status: status,
          reason: statusReason,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        }
      );

      if (response.data) {
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === selectedMeeting.id ? { ...meeting, status: status } : meeting
          )
        );

        swal("Success!", "Meeting status updated successfully", "success");
        setShowStatusModal(false);

        // Ensure the latest data is fetched after updating
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error while updating meeting status:", error);
    }
  };


  return (
    <Container fluid className="p-3 border rounded">
      <Row className="mb-3 align-items-center">
        <Col>
          <Nav variant="underline" activeKey={selectedTab} onSelect={(k: string | null) => k && setSelectedTab(k)}>
            <Nav.Item>
              <Nav.Link
                eventKey="inProgress"
                className={`fw-bolder ${selectedTab === "inProgress" ? "text-primary border-bottom border-3 border-primary" : "text-black"}`}
              >
                In Progress
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>

              <Nav.Link
                eventKey="done"
                className={`fw-bolder ${selectedTab === "done" ? "text-primary border-bottom border-3 border-primary" : "text-black"}`}
              >
                Done
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md="3" className="text-end">
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </Col>
      </Row>

      {/* <Row className="mb-3 align-items-center" >
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        {selectedTab !== "done" && (
          <Col md="auto" className="ms-auto">
            <Row className="mb-3">
              <Col>
                <p
                  className="fw-bold mb-0"
                  style={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: '14px',
                    marginTop: "10px", 
                    padding: "5px",
                    borderRadius: "2px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    width: "150px",
                 
                  }}
                >
                  Total Meetings: 
                  {meetings.filter((meeting) =>
                     meeting.status === "progress").length}
                </p>
              </Col>
              <Button
                variant="primary"
                style={{
                  width: "150px",
                  fontFamily: 'Nunito Sans, sans-serif',
                  marginRight: "30px",
                }}
                onClick={() => setShowModal(true)}
              >
                + Add Meeting
              </Button>
            </Row>
          </Col>
        )}
      </Row> */}
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md="auto" className="ms-auto">
          <Row className="mb-3">
            <Col>
              <p
                className="fw-bold mb-0"
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: '14px',
                  marginTop: "10px",
                  padding: "5px",
                  borderRadius: "2px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  width: "150px",
                }}
              >
                Total Meetings: {selectedTab === "done"
                  ? meetings.filter((meeting) =>
                    meeting.status === "done" ||
                    meeting.status === "postponed" ||
                    meeting.status === "cancelled"
                  ).length
                  : meetings.filter((meeting) => meeting.status === "progress").length}
              </p>
            </Col>
            {selectedTab !== "done" && (
              <Button
                variant="primary"
                style={{
                  width: "150px",
                  fontFamily: 'Nunito Sans, sans-serif',
                  marginRight: "30px",
                }}
                onClick={() => setShowModal(true)}
              >
                + Add Meeting
              </Button>
            )}
          </Row>
        </Col>
      </Row>

      {/* <Tab.Container activeKey={selectedTab}>
        <Tab.Content>
          <Tab.Pane eventKey="inProgress">
            {getPagedMeetings("progress").map((meeting) => (
              <Row key={meeting.id} className="mb-3">
                <Col md={12}>
                  <div className="border p-3 rounded shadow-sm bg-white d-flex align-items-center" style={{ position: 'relative' }}>
                    <Form.Check
                      className="me-2"
                      checked={meeting.status === "done"}
                      onChange={() => (selectedTab === "inProgress" ? handleOpenCheckBoxUpdateModal(meeting) : handleOpenCheckBoxUpdateModal(meeting))}
                    />
                    <div className="flex-grow-1">

                      <div className="d-flex align-items-center mb-1" style={{ gap: '10px' }}>
                        <span className="fw-bold" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>{meeting.meeting_agenda}</span>
                        <FaCalendarAlt className="text-primary ms-2" />
                        <p className="mb-0" style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '13px' }}>
                          {meeting.start_time} to {meeting.end_time}
                        </p>
                      </div>
                      <FaRegEdit
                        className="text-secondary cursor-pointer ms-2"
                        onClick={() => handleOpenEditModal(meeting)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px'
                        }}
                      />
                      <p style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '16px' }}>{meeting.description}</p>


                      <div className="d-flex justify-content-between align-items-center">

                        <Badge bg="primary" variant="phoenix" className="p-1" style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}>
                          Today - {meeting.date_time}
                        </Badge>


                        <div className="d-flex">
                          <Button variant="primary" style={{ backgroundColor: '#F5F7FA', color: '#3874FF', border: '1px solid #E3E6ED', fontFamily: 'Nunito Sans, sans-serif' }} className="me-2" onClick={() => window.open(meeting.link, "_blank")}><FaVideo className="text-primary ms-2" /> Join</Button>
                          <Button variant="primary" style={{ fontFamily: 'Nunito Sans, sans-serif' }} onClick={() => handleOpenStatusModal(meeting)}>Select Meeting Status</Button>
                        </div>
                      </div>
                    </div>
                  </div>



                </Col>
              </Row>
            ))}

            <Pagination>
              {Array.from({ length: Math.ceil(meetings.filter((meeting) => meeting.status === "progress").length / itemsPerPage) }).map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>

          <Tab.Pane eventKey="done">
            {getPagedMeetings("done").map((meeting) => (
              <Row key={meeting.id} className="mb-3">
                <Col md={12}>
                  <div className="border p-3 rounded shadow-sm bg-white d-flex align-items-center position-relative">
                    <Form.Check
                      className="me-2"
                      checked={meeting.status === "done"}
                      onChange={() => (selectedTab === "inProgress" ? handleOpenCheckBoxUpdateModal(meeting) : handleOpenCheckBoxUpdateModal(meeting))}
                    />
                    <div className="w-100">
                      <div className="d-flex align-items-center mb-1" style={{ gap: '10px' }}>
                        <h5 className="fw-bold text-dark">{meeting.meeting_agenda}</h5>
                        <FaCalendarAlt className="text-primary ms-2" />
                        <p className="mb-0" style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '13px' }}>
                          {meeting.start_time} to {meeting.end_time}
                        </p>
                      </div>
                      <p className="text-dark">{meeting.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge
                          bg="primary"
                          variant="phoenix"
                          className="p-1"
                          style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}
                        >
                          {meeting.date_time}
                        </Badge>

                      </div>
                    </div>
                    <div className="position-absolute top-0 end-0 p-2">

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meeting-status-tooltip">{meeting.reason ? meeting.reason : 'No reason available'}</Tooltip>}
                      >
                        <Button
                          variant={meeting.status === "done" ? "success" : meeting.status === "postponed" ? "warning" : "danger"}
                          className="p-1"
                          style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}
                        >
                          {meeting.status === "done" ? "Completed" : meeting.status === "postponed" ? "Postponed" : "Cancelled"}
                        </Button>
                      </OverlayTrigger>

                    </div>
                  </div>
                </Col>
              </Row>
            ))}

            <Pagination>
              {Array.from({
                length: Math.ceil(meetings.filter((meeting) =>
                  meeting.status === "done" || meeting.status === "postponed" || meeting.status === "cancelled"
                ).length / itemsPerPage)
              }).map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container> */}

      <Tab.Container activeKey={selectedTab}>
        <Tab.Content>
          <Tab.Pane eventKey="inProgress">



            {getPagedMeetings("progress").map((meeting) => (
              <Row key={meeting.id} className="mb-3">
                <Col md={12}>
                  <div className="border p-3 rounded shadow-sm bg-white d-flex align-items-center" style={{ position: 'relative' }}>
                    <Form.Check
                      className="me-2"
                      checked={meeting.status === "done"}
                      onChange={() => (selectedTab === "inProgress" ? handleOpenCheckBoxUpdateModal(meeting) : handleOpenCheckBoxUpdateModal(meeting))}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1" style={{ gap: '10px' }}>
                        <span className="fw-bold" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>{meeting.meeting_agenda}</span>
                        <FaCalendarAlt className="text-primary ms-2" />
                        <p className="mb-0" style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '13px' }}>
                          {meeting.start_time} to {meeting.end_time}
                        </p>
                      </div>
                      <FaRegEdit
                        className="text-secondary cursor-pointer ms-2"
                        onClick={() => handleOpenEditModal(meeting)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px'
                        }}
                      />
                      <p style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '16px' }}>{meeting.description}</p>

                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg="primary" variant="phoenix" className="p-1" style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}>
                          Today - {meeting.date_time}
                        </Badge>
                        <div className="d-flex">
                          <Button variant="primary" style={{ backgroundColor: '#F5F7FA', color: '#3874FF', border: '1px solid #E3E6ED', fontFamily: 'Nunito Sans, sans-serif' }} className="me-2" onClick={() => window.open(meeting.link, "_blank")}><FaVideo className="text-primary ms-2" /> Join</Button>
                          <Button variant="primary" style={{ fontFamily: 'Nunito Sans, sans-serif' }} onClick={() => handleOpenStatusModal(meeting)}>Select Meeting Status</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            ))}

            <Pagination>
              {Array.from({ length: Math.ceil(meetings.filter((meeting) => meeting.status === "progress").length / itemsPerPage) }).map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>

          <Tab.Pane eventKey="done">
            {/* Item Count Display */}
            {/* <Row className="mb-3" style={{
              padding: "10px",
              borderRadius: "2px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              width: "200px",
              height: "50px", 
              marginLeft: "auto",
              marginBottom: "50px",
              marginRight: "20px",
              
            }}>
              <Col>
                <p className="fw-bold" style={{ fontFamily: 'Nunito Sans, sans-serif', }}>
                  Total Meetings: {meetings.filter((meeting) => meeting.status === "done" || meeting.status === "postponed" || meeting.status === "cancelled").length}
                </p>
              </Col>
            </Row> */}

            {getPagedMeetings("done").map((meeting) => (
              <Row key={meeting.id} className="mb-3">
                <Col md={12}>
                  <div className="border p-3 rounded shadow-sm bg-white d-flex align-items-center position-relative">
                    <Form.Check
                      className="me-2"
                      checked={meeting.status === "done"}
                      onChange={() => (selectedTab === "inProgress" ? handleOpenCheckBoxUpdateModal(meeting) : handleOpenCheckBoxUpdateModal(meeting))}
                    />
                    <div className="w-100">
                      <div className="d-flex align-items-center mb-1" style={{ gap: '10px' }}>
                        <h5 className="fw-bold text-dark">{meeting.meeting_agenda}</h5>
                        <FaCalendarAlt className="text-primary ms-2" />
                        <p className="mb-0" style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#525B75', fontSize: '13px' }}>
                          {meeting.start_time} to {meeting.end_time}
                        </p>
                      </div>
                      <p className="text-dark">{meeting.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge
                          bg="primary"
                          variant="phoenix"
                          className="p-1"
                          style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}
                        >
                          {meeting.date_time}
                        </Badge>
                      </div>
                    </div>
                    <div className="position-absolute top-0 end-0 p-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="meeting-status-tooltip">{meeting.reason ? meeting.reason : 'No reason available'}</Tooltip>}
                      >
                        <Button
                          variant={meeting.status === "done" ? "success" : meeting.status === "postponed" ? "warning" : "danger"}
                          className="p-1"
                          style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: '13px' }}
                        >
                          {meeting.status === "done" ? "Completed" : meeting.status === "postponed" ? "Postponed" : "Cancelled"}
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </Col>
              </Row>
            ))}

            <Pagination>
              {Array.from({
                length: Math.ceil(meetings.filter((meeting) =>
                  meeting.status === "done" || meeting.status === "postponed" || meeting.status === "cancelled"
                ).length / itemsPerPage)
              }).map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>






      {/* Modal for Adding Meeting */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    as="select"
                    value={newMeeting.customer}
                    onChange={(e) => setNewMeeting({ ...newMeeting, customer: e.target.value })}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.sender_name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Lead Stage</Form.Label>
                  <Form.Control
                    as="select"
                    value={newMeeting.leadStage}
                    onChange={(e) => setNewMeeting({ ...newMeeting, leadStage: e.target.value })}
                  >
                    <option value="">Select Stage</option>
                    <option value="Inquiry Received">Inquiry Received</option>
                    <option value="Lead Acknowledgment">Lead Acknowledgment</option>
                    <option value="Product Sourcing">Product Sourcing</option>
                    <option value="Price Shared">Price Shared</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Victory Stage">Victory Stage</option>
                  </Form.Control>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Meeting Agenda</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Meeting Agenda"
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Link For Meeting</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Link"
                    value={newMeeting.link}
                    onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type="date"
                    min={new Date().toISOString().split('T')[0]} // sets today as the minimum date
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />

                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="primary" onClick={handleAddMeeting} style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                Add Meeting
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Meeting Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check
              type="radio"
              label="Done"
              name="status"
              value="done"
              checked={status === "done"}
              onChange={() => setStatus("done")}
            />
            <Form.Check
              type="radio"
              label="Postponed"
              name="status"
              value="postponed"
              checked={status === "postponed"}
              onChange={() => setStatus("postponed")}
            />
            <Form.Check
              type="radio"
              label="Cancelled"
              name="status"
              value="cancelled"
              checked={status === "cancelled"}
              onChange={() => setStatus("cancelled")}
            />
            <Form.Group className="mt-3">
              <Form.Label>Reason for Status Change</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Provide a reason for the status change"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Editing Meeting */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMeetingData && (
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedMeetingData.customer}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, customer: e.target.value })}
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.sender_name}>
                          {customer.sender_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Lead Stage</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedMeetingData.leadStage}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, leadStage: e.target.value })}
                    >
                      <option value="">Select Stage</option>
                      <option value="Inquiry Received">Inquiry Received</option>
                      <option value="Lead Acknowledgment">Lead Acknowledgment</option>
                      <option value="Product Sourcing">Product Sourcing</option>
                      <option value="Price Shared">Price Shared</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Victory Stage">Victory Stage</option>
                    </Form.Control>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Meeting Agenda</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Meeting Agenda"
                      value={selectedMeetingData.agenda}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, agenda: e.target.value })}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Link For Meeting</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Link"
                      value={selectedMeetingData.link}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, link: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Date & Time</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedMeetingData.date}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, date: e.target.value })}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={selectedMeetingData.startTime}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, startTime: e.target.value })}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={selectedMeetingData.endTime}
                      onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, endTime: e.target.value })}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  value={selectedMeetingData.description}
                  onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedMeetingData.status}
                  onChange={(e) => setSelectedMeetingData({ ...selectedMeetingData, status: e.target.value })}
                >
                  <option value="progress">In Progress</option>
                  <option value="done">Done</option>
                </Form.Control>
              </Form.Group>

              <div className="text-end">
                <Button variant="primary" onClick={handleUpdateMeeting}>
                  Update Meeting
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Body>
          <div className="text-center">
            <p>Are you sure you want to {actionType === 'moveToDone' ? 'move this Meeting to Done' : 'move this Meeting to In Progress'}?</p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="success" onClick={handleUpdateMeeting}>Yes</Button>
              <Button variant="danger" onClick={() => setShowConfirmModal(false)}>No</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Meeting;
