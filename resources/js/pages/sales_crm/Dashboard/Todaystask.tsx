import React, { useState, useEffect } from "react";
import { Container, Table, Nav, Form, Row, Col, Modal, Card, Pagination } from "react-bootstrap";
import Button from "../../../components/base/Button";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../../../axios";
import swal from 'sweetalert';
import { BiShow } from "react-icons/bi";

interface Task {
  id: string;
  opportunityId: string;
  customer: string;
  leadStage: string;
  task: string;
  date: string;
  done: boolean;
}

const Todaystask = () => {
  const [meetings, setMeetings] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [selectedTab, setSelectedTab] = useState("inProgress");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [status, setStatus] = useState('progress');
  const [editForm, setEditForm] = useState<Task | null>(null);
  const [tat, setTat] = useState<string>('');
  const [actionType, setActionType] = useState<'moveToDone' | 'moveToProgress' | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const fetchTodayTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token ? token.split('|')[1] : '';
      const response = await axiosInstance.get("/getTodayTasks", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const data = response.data;

      const formattedData: Task[] = data.map((task) => ({
        id: task.id,
        opportunityId: task.opportunity_id,
        customer: task.customer_name,
        leadStage: task.lead_stage,
        task: `${task.product_name}: ${task.task}`,
        date: task.tat,
        time: "",
        done: false,
      }));

      setMeetings(formattedData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchDoneTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const cleanToken = token ? token.split('|')[1] : '';

      const response = await axiosInstance.get("/todays_task_done", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data: Task[] = response.data.map((task: any) => ({
        id: task.id,
        opportunityId: task.opportunity_id,
        customer: task.customer_name,
        leadStage: task.lead_stage,
        task: `${task.product_name}: ${task.task}`,
        date: task.tat,
        done: true,
      }));

      setDoneTasks(data);
    } catch (error) {
      console.error("Error fetching done tasks:", error);
    }
  };

  useEffect(() => {
    // Clear search term when switching tabs
    setSearchTerm("");

    if (selectedTab === "inProgress") {
      fetchTodayTasks();
    } else if (selectedTab === "done") {
      fetchDoneTasks();
    }
  }, [selectedTab]);

  const handleEdit = (meeting: Task) => {
    setEditForm(meeting);
    setTat(meeting.date);  // Populate TAT field
    setStatus(meeting.done ? 'done' : 'progress');
    setShowModal(true);
  };

  const handleModalSave = async () => {
    if (editForm) {
      const updatedStatus = status === 'done' ? "0" : "1";
      const isTodayTask = selectedTab === 'inProgress' ? 'done' : 'progress';

      const requestData = {
        id: editForm.id,
        is_today_status: isTodayTask,
        status: updatedStatus,
      };

      try {
        const token = localStorage.getItem('token');
        const cleanToken = token ? token.split('|')[1] : '';

        const response = await axiosInstance.post("/tasks_update", requestData, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        swal("Success!", response.data.message, "success");

        fetchTodayTasks(); // Refresh the task list after
        setShowModal(false);
        setShowConfirmModal(false);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleCheckboxClick = (meeting: Task) => {
    if (selectedTab === 'inProgress') {
      setActionType('moveToDone');
      setEditForm(meeting);
    } else {
      setActionType('moveToProgress');
      setEditForm(meeting);
    }
    setSelectedMeetingId(meeting.id);
    setShowConfirmModal(true);
  };

  // Updated filtering logic
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = searchTerm === "" ||
      meeting.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.opportunityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate === "" || meeting.date === selectedDate;

    return matchesSearch && matchesDate;
  });

  const filteredDoneTasks = doneTasks.filter((task) => {
    const matchesSearch = searchTerm === "" ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.opportunityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate === "" || task.date === selectedDate;

    return matchesSearch && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirstItem, indexOfLastItem);
  const currentDoneTasks = filteredDoneTasks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container fluid className="p-3 border rounded ">
      <Row className="align-items-center justify-content-between mb-3">
        <Col xs="auto">
          <Nav variant="underline" activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)}>
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
        <Col md="auto" className="d-flex align-items-center gap-3 ms-auto">

          <Form.Control
            type="date"
            className="px-2 py-1"
            style={{ width: "200px" }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mb-3 align-items-center">
        
        <Form.Control
          type="text"
          placeholder="Search by name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "350px", marginLeft: "20px" }}
        />
      </Row>
      {/* Table */}
      <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <Table hover className="text-secondary border-0">
          <thead className="text-muted">
            <tr className="py-5">
              <th className="px-1"></th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>OPPORTUNITY ID</th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>CUSTOMER NAME</th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>LEAD STAGE</th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>TASK</th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>TAT</th>
              <th className="px-3" style={{ fontSize: "0.90rem" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {(selectedTab === "inProgress" ? currentMeetings : currentDoneTasks)
              .map((meeting) => (
                <tr key={meeting.id} className="border-bottom align-middle py-2">
                  <td className="px-3">
                    <Form.Check
                      checked={meeting.done}
                      onChange={() => handleCheckboxClick(meeting)}
                    />
                  </td>
                  <td className="px-3">{meeting.opportunityId}</td>
                  <td className="px-3">{meeting.customer || "-"}</td>
                  <td className="px-3">{meeting.leadStage || "-"}</td>
                  <td className="px-3">{meeting.task || "-"}</td>
                  <td className="px-3">{meeting.date}</td>
                  <td className="px-3">
                    <BiShow className="text-primary me-3 cursor-pointer" size={24} onClick={() => handleEdit(meeting)} />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        {(() => {
          const totalPages = Math.ceil((selectedTab === "inProgress" ? filteredMeetings.length : filteredDoneTasks.length) / itemsPerPage);
          const maxVisiblePages = 5;
          const pages = [];

          if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are less than maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
              pages.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
                  {i}
                </Pagination.Item>
              );
            }
          } else {
            // Always show first page
            pages.push(
              <Pagination.Item key={1} active={1 === currentPage} onClick={() => paginate(1)}>
                1
              </Pagination.Item>
            );

            // Calculate start and end of visible pages
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if at the start
            if (currentPage <= 2) {
              endPage = 3;
            }
            // Adjust if at the end
            if (currentPage >= totalPages - 1) {
              startPage = totalPages - 2;
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
              pages.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
                  {i}
                </Pagination.Item>
              );
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
              pages.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
            }

            // Always show last page
            pages.push(
              <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => paginate(totalPages)}>
                {totalPages}
              </Pagination.Item>
            );
          }

          return pages;
        })()}
      </Pagination>



      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Opportunity ID</Form.Label>
              <Form.Control type="text" value={editForm?.opportunityId || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control type="text" value={editForm?.customer || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lead Stage</Form.Label>
              <Form.Control type="text" value={editForm?.leadStage || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Task</Form.Label>
              <Form.Control type="text" value={editForm?.task || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>TAT (Date)</Form.Label>
              <Form.Control type="date" value={tat} disabled onChange={(e) => setTat(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="progress">Progress</option>
                <option value="done">Done</option>
              </Form.Control>
            </Form.Group>
          </Form>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="success" onClick={handleModalSave}>Save</Button>
            <Button variant="danger" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Body>
          <div className="text-center">
            <p>Are you sure you want to {actionType === 'moveToDone' ? 'move this task to Done' : 'move this task to In Progress'}?</p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="success" onClick={handleModalSave}>Yes</Button>
              <Button variant="danger" onClick={() => setShowConfirmModal(false)}>No</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Todaystask;
