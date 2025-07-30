import React, { useEffect, useState } from "react";
import { Container, Table, Nav, Form, Row, Col, Pagination, Modal } from "react-bootstrap";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Button from "../../../components/base/Button";
import axiosInstance from "../../../axios";
import swal from 'sweetalert';
import { set } from "date-fns";

interface Reminder {
  id: number;
  subject: string;
  description: string;
  tat_date: string;
  status: string;
}

const initialMeetings: Reminder[] = [
  { id: 1, subject: "Purchasing-Related Vendors", description: "Purchasing-Related Vendors", tat_date: "Nov 20, 2022", status: "progress" },
];

const Reminder = () => {
  const [meetings, setMeetings] = useState<Reminder[]>(initialMeetings);
  const [filteredMeetings, setFilteredMeetings] = useState<Reminder[]>(initialMeetings);
  const [selectedTab, setSelectedTab] = useState<string>("inProgress");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUpdateReminderModal, setUpdateReminderModal] = useState<boolean>(false);
  const [showUpdateReminderModal1, setUpdateReminderModal1] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // New state for delete confirmation
  const [reminderToDelete, setReminderToDelete] = useState<number | null>(null); // Store the ID of the reminder to be deleted
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: 0,
    subject: "",
    description: "",
    tat_date: "",
    status: "progress",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [actionType, setActionType] = useState<'moveToDone' | 'moveToProgress' | null>(null);
  // Handle checkbox change to update status
  const handleCheckboxChange = (id: number, subject: string, description: string, tat_date: string) => {
    if (selectedTab === 'inProgress') {
      setActionType('moveToDone');

    } else {
      setActionType('moveToProgress');

    }
    const status = selectedTab === "inProgress" ? "done" : "progress";

    setNewReminder({
      id,
      subject,
      description,
      tat_date,
      status,
    });
    setUpdateReminderModal(true);
  };


  const handleEditReminder = (reminder: Reminder) => {
    setNewReminder(reminder); // Set the selected reminder to be edited
    setUpdateReminderModal1(true); // Open the update modal
  };

  // Fetch meetings from API
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const cleanToken = token.split('|')[1];

      const url = selectedTab === "inProgress" ? "/reminder_progress" : "/reminder_done";
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setMeetings(response.data);
        setFilteredMeetings(response.data); // Initially show all meetings
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      swal("Error!", "Failed to fetch reminders. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchReminders();
    setSearchTerm("");
    setSelectedDate("");
  }, [selectedTab]);


  // Handle delete reminder
  const handleDeleteReminder = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const cleanToken = token.split('|')[1];

      if (reminderToDelete !== null) {
        const response = await axiosInstance.post("/reminder_delete", { id: reminderToDelete }, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response) {
          swal("Success!", response.data.message, "success");
          fetchReminders(); // Refresh the list
          setShowDeleteModal(false); // Close the modal
          setReminderToDelete(null); // Reset the ID of the reminder
        }
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      swal("Error!", "Failed to delete reminder. Please try again.", "error");
    }
  };

  // Handle adding a new reminder
  const handleAddReminder = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const cleanToken = token.split('|')[1];
      const status = selectedTab === "inProgress" ? "progress" : "done";
      const requestBody = {
        subject: newReminder.subject,
        description: newReminder.description,
        tat_date: newReminder.tat_date,
        status: status,
      };

      const response = await axiosInstance.post("/reminder_store", requestBody, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        swal("Success!", response.data.message, "success");
        fetchReminders();
        setShowModal(false);
        setNewReminder({ id: 0, subject: "", description: "", tat_date: "", status: "progress" }); // Reset form
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      // alert("Failed to save reminder. Please try again.");
    }
  };

  // Handle updating a reminder
  const handleUpdateReminder = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const cleanToken = token.split('|')[1];

      const requestBody = {
        id: newReminder.id,
        subject: newReminder.subject,
        description: newReminder.description,
        tat_date: newReminder.tat_date,
        status: newReminder.status,
      };

      const response = await axiosInstance.post("/reminder_update", requestBody, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        swal("Success!", response.data.message, "success");
        fetchReminders();
        setUpdateReminderModal(false);
        setUpdateReminderModal1(false);
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      // alert("Failed to update reminder. Please try again.");
    }
  };

  // Handle search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter the meetings based on the search term
    const filtered = meetings.filter((meeting) =>
      meeting.subject.toLowerCase().includes(value.toLowerCase()) ||
      meeting.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredMeetings(filtered);
  };

  // Handle date change to filter meetings by date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);

    const filtered = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.tat_date).toLocaleDateString();
      return meetingDate === new Date(date).toLocaleDateString();
    });
    setFilteredMeetings(filtered);
  };

  return (
    <Container fluid className="p-3 border rounded">
      {/* Nav Tabs */}
      <Row className="align-items-center mb-3 justify-content-between">
        <Col xs={12} md={8} className="mb-2 mb-md-0 d-flex align-items-center">
          <Nav variant="underline" activeKey={selectedTab} onSelect={(k) => setSelectedTab(k as string)}>
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
          <Form.Control type="date" value={selectedDate} onChange={handleDateChange} />
        </Col>
      </Row>

      {/* Search & Add Button */}
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <Form.Control type="text" placeholder="Search by name" value={searchTerm} onChange={handleSearchChange} />
        </Col>
        {selectedTab !== "done" && ( // Conditionally render the Add Reminder button
          <Col md="auto" className="ms-auto">
            {/* <Button
              variant="primary"
              style={{ width: "150px", fontFamily: 'Nunito Sans, sans-serif' }}
              onClick={() => setShowModal(true)}
            >
              + Add Reminder
            </Button> */}
            <Button
              variant="primary"
              style={{ width: "150px", fontFamily: 'Nunito Sans, sans-serif' }}
              onClick={() => {
                setNewReminder({ id: 0, subject: "", description: "", tat_date: "", status: "progress" }); // Reset the state
                setShowModal(true); // Show the modal
              }}
            >
              + Add Reminder
            </Button>
          </Col>
        )}
      </Row>
      {/* Table */}
      <div className="table-responsive">
        <Table hover className="text-secondary border-0" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
          <thead className="text-muted">
            <tr>
              <th></th>
              <th style={{ fontSize: "0.90rem" }}>SUBJECT</th>
              <th style={{ fontSize: "0.90rem" }}>DESCRIPTION</th>
              <th style={{ fontSize: "0.90rem" }}>TAT</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeetings
              .filter((meeting) => selectedTab === "inProgress" ? meeting.status !== "done" : meeting.status === "done")
              .map((meeting) => (
                <tr key={meeting.id} className="border-bottom">
                  <td>
                    <Form.Check
                      checked={meeting.status === "done"} // Check if the meeting is done
                      onChange={() => handleCheckboxChange(meeting.id, meeting.subject, meeting.description, meeting.tat_date)}
                    />
                  </td>
                  <td>{meeting.subject}</td>
                  <td>{meeting.description}</td>
                  <td>{meeting.tat_date}</td>
                  <td className="text-end">
                    <FaRegEdit className="text-primary me-2 cursor-pointer" onClick={() => handleEditReminder(meeting)} />
                    <FaTrashAlt className="text-danger cursor-pointer"
                      onClick={() => {
                        setReminderToDelete(meeting.id); // Set the reminder ID to be deleted
                        setShowDeleteModal(true); // Show the delete confirmation modal
                      }} />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Row className="align-items-center mt-3">
        <Col xs={12} md={6} className="text-center text-md-start mb-2 mb-md-0">
          <span className="text-muted">1 to {filteredMeetings.length} Items of {filteredMeetings.length}</span> &nbsp;
          <span className="text-primary cursor-pointer">View all</span>
        </Col>
        <Col xs={12} md={6} className="text-center text-md-end">
          <Pagination size="sm" className="justify-content-center justify-content-md-end">
            <Pagination.Prev disabled />
            <Pagination.Item active>{1}</Pagination.Item>
            <Pagination.Next disabled />
          </Pagination>
        </Col>
      </Row>

      {/* Add Reminder Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control type="text" placeholder="Enter subject" value={newReminder.subject} onChange={(e) => setNewReminder({ ...newReminder, subject: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter description" value={newReminder.description} onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>TAT (Date)</Form.Label>
              <Form.Control type="date"  min={new Date().toISOString().split('T')[0]} value={newReminder.tat_date} onChange={(e) => setNewReminder({ ...newReminder, tat_date: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddReminder}>Save Reminder</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showUpdateReminderModal} onHide={() => setUpdateReminderModal(false)} centered>
        <Modal.Body className="text-center">
          <p>Are you sure you want to {actionType === 'moveToDone' ? 'move this Reminder to Done' : 'move this Reminder to In Progress'}?</p>
          {/* <span className="fs-5">Are you sure you want to mark this Reminder as 'Done'?</span> */}
          <div className="d-flex justify-content-center gap-3">
            <Button variant="success" onClick={handleUpdateReminder}>Yes</Button>
            <Button variant="danger" onClick={() => setUpdateReminderModal(false)}>No</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="text-center">
          <span className="fs-5">Are you sure you want to delete this reminder?</span>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Button variant="success" onClick={handleDeleteReminder}>Yes</Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(false)}>No</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Update Reminder Modal */}
      <Modal show={showUpdateReminderModal1} onHide={() => setUpdateReminderModal1(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                value={newReminder.subject}
                onChange={(e) => setNewReminder({ ...newReminder, subject: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
               
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>TAT (Date)</Form.Label>
              <Form.Control
                type="date"
                value={newReminder.tat_date}
                onChange={(e) => setNewReminder({ ...newReminder, tat_date: e.target.value })}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={newReminder.status}
                onChange={(e) => setNewReminder({ ...newReminder, status: e.target.value })}
              >
                <option value="progress">Progress</option>
                <option value="done">Done</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setUpdateReminderModal1(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateReminder}>Update Reminder</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Reminder;
