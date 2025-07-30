import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { Tab, Nav, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axiosInstance from "../../../axios";
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import Badge from '../../../components/base/Badge';
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from 'react-icons/fa';
import SearchBox from '../../../components/common/SearchBox';


interface ClarityEntry {
  clarity_pending: string;
  status_mode: string;
  id:string;
}

const LeadAck: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('qualified');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clarityPendingData, setClarityPendingData] = useState<any[]>([]);
  const [disqualifiedData, setDisqualifiedData] = useState<any[]>([]);
  const [qualifiedData, setQualifiedData] = useState<any[]>([]);
  const [newOpportunityName, setNewOpportunityName] = useState<string>('');
  const [clarityId, setClarityId] = useState<string>('');
  const [modalType, setModalType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const clarityPendingColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'clarity_pending',
      header: 'Pending Clarities',
    },
    {
      accessorKey: 'status_mode',
      header: 'Status Mode',
      cell: info => (
        <Badge bg={getBadgeColor(info.getValue())}>{info.getValue()}</Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const opportunity = row.original; // Access the original data
        return (
          <>
            <FaEdit
              style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }}
              onClick={() => handleModalEdit('clarityPending', opportunity)}
            />
            <FaTrash
              style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }}
              onClick={() => handleDeleteModalShow('clarityPending', opportunity)}
            />
          </>
        );
      },
    },
  ];
  const baseNavLinkStyle = {
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '6px 12px',
    marginRight: '5px',
    color: '#007bff',
    cursor: 'pointer',
  };

  const disqualifiedColumns: ColumnDef<any>[] = [
    { accessorKey: 'disqualified_opportunity', header: 'Disqualified Opportunity' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const opportunity = row.original;
        return (
          <>
            <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleModalEdit('disqualified', opportunity)} />
            <FaTrash style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }} onClick={() => handleDeleteModalShow('disqualified', opportunity)} />
          </>
        );
      },
    },
  ];

  const qualifiedColumns: ColumnDef<any>[] = [
    { accessorKey: 'qualified_opportunity', header: 'Qualified Opportunity' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const opportunity = row.original;
        return (
          <>
            <FaEdit style={{ marginRight: '8px', cursor: 'pointer', color: 'blue' }} onClick={() => handleModalEdit('qualified', opportunity)} />
            <FaTrash style={{ marginRight: '8px', cursor: 'pointer', color: 'green' }} onClick={() => handleDeleteModalShow('qualified', opportunity)} />
          </>
        );
      },
    },
  ];

  const handleQualifiedSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    qualifiedTable.setGlobalFilter(e.target.value || undefined);
  };

  const handleDisQualifiedSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    disqualifiedTable.setGlobalFilter(e.target.value || undefined);
  };
  const handleClaritySearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    clarityPendingTable.setGlobalFilter(e.target.value || undefined);
  };

  // Fetch clarity pending, disqualified, and qualified data
  useEffect(() => {
    if (activeKey === 'clarityPending') {
      axiosInstance.get('/clarity-pending')
        .then(response => {
          setClarityPendingData(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching clarity pending data:', error);
        });
    }

    if (activeKey === 'disqualified') {
      axiosInstance.get('/disqualifiedopportunities')
        .then(response => {
          setDisqualifiedData(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching disqualified opportunities:', error);
        });
    }

    if (activeKey === 'qualified') {
      axiosInstance.get('/qualified-opportunities') // Fetch qualified opportunities
        .then(response => {
          setQualifiedData(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching qualified opportunities:', error);
        });
    }
  }, [activeKey]);

  const handleTabSelect = (key: string) => {
    setActiveKey(key);
  };

  // Handle modal show/hide
  const handleModalClose = () => setShowModal(false);

  const handleModalEdit = (type: string, opportunity: any = null) => {
    console.log('Edit opportunity:', opportunity);
    setModalType(type);
    setShowEditModal(true);
    setSelectedOpportunity(opportunity);

    if (opportunity) {
      console.log('Selected opportunity:', opportunity);
      let opportunityName = '';
      if (type === 'clarityPending') {
        opportunityName = opportunity.clarity_pending;
        setSelectedStatus(opportunity.status_mode);
      } else if (type === 'qualified') {
        opportunityName = opportunity.qualified_opportunity;
      } else if (type === 'disqualified') {
        opportunityName = opportunity.disqualified_opportunity;
      }
      setNewOpportunityName(opportunityName);
    } else {
      setNewOpportunityName('');
      if (type === 'clarityPending') {
        setSelectedStatus('positive');
      }
    }
  };
  const handleEditModalClose = () => setShowEditModal(false);

  const handleDeleteModalShow = (type: string, opportunity: any) => {
    setModalType(type);
    setShowDeleteModal(true);
    setSelectedOpportunity(opportunity);
  };

  const handleDeleteModalClose = () => setShowDeleteModal(false);
  const handleModalShow = (type: string) => {
    setModalType(type);
    setShowModal(true);
    setNewOpportunityName('');
    if (type === 'clarityPending') {
      setSelectedStatus('positive');
    }
  };

  const handleNewOpportunitySubmit = async () => {
    if (newOpportunityName.trim()) {
      let endpoint = '';
      let dataKey = '';
      let newData = {};

      switch (modalType) {
        case 'qualified':
          endpoint = '/storeQualifiedOpportunity';
          dataKey = 'qualified_opportunity';
          newData = { [dataKey]: newOpportunityName.trim() };
          break;
        case 'clarityPending':
          endpoint = '/storeClarityPending';
          dataKey = 'clarity_pending';
          newData = { [dataKey]: newOpportunityName.trim(), status_mode: selectedStatus }; // Include status_mode
          break;
        case 'disqualified':
          endpoint = '/storeDisqualifiedOpportunity';
          dataKey = 'disqualified_opportunity';
          newData = { [dataKey]: newOpportunityName.trim() };
          break;
        default:
          console.error('Invalid modal type');
          return;
      }

      try {
        const response = await axiosInstance.post(endpoint, newData);
        console.log('Opportunity added:', response.data);
        toast(response.data.message || 'Opportunity added successfully!'); // Toast message

        switch (modalType) {
          case 'qualified':
            setQualifiedData([...qualifiedData, response.data.data]);
            break;
          case 'clarityPending':
            // setClarityPendingData([...clarityPendingData, response.data.data]);
            if (response.data.data) {
              const newEntry = {
                status_mode: selectedStatus, // Ensure status is included
                clarity_list: [{ clarity_pending: newOpportunityName.trim(), id: clarityId.trim() }], // Mock unique ID
              };

              setClarityPendingData((prevData) => [...prevData, newEntry]);
            }
            break;
          case 'disqualified':
            setDisqualifiedData([...disqualifiedData, response.data.data]);
            break;
        }

        setNewOpportunityName('');
        handleModalClose();
      } catch (error) {
        console.error('Error adding opportunity:', error);
        toast.error(error?.response?.data?.message || 'Error adding opportunity');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedOpportunity) {
      console.log("selectedOpportunity before check:", selectedOpportunity);
      let endpoint = '';
      let data = {}; // Object to hold the request body

      switch (modalType) {
        case 'qualified':
          endpoint = '/qualified-opportunity/delete';
          data = { id: selectedOpportunity.id };
          break;
        case 'clarityPending':
          endpoint = '/clarity-pending/delete';
          data = { id: selectedOpportunity.id };
          break;
      
        case 'disqualified':
          endpoint = '/disqualified-opportunity/delete';
          data = { id: selectedOpportunity.id };
          break;
        default:
          console.error('Invalid modal type');
          return;
      }

      try {
        const response = await axiosInstance.post(endpoint, data); // Pass data as the second argument
        console.log('Opportunity deleted:', response.data);
        toast(response.data.message || 'Opportunity deleted successfully!');

        switch (modalType) {
          case 'qualified':
            setQualifiedData(qualifiedData.filter(item => item.id !== selectedOpportunity.id));
            break;
          case 'clarityPending':
            setClarityPendingData(clarityPendingData.map(group => ({
              ...group,
              clarity_list: group.clarity_list.filter(item => item.id !== selectedOpportunity.id)
            })));
            break;
          case 'disqualified':
            setDisqualifiedData(disqualifiedData.filter(item => item.id !== selectedOpportunity.id));
            break;
        }

        handleDeleteModalClose();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        toast.error(error?.response?.data?.message || 'Error deleting opportunity');
      }
    }
  };

  const handleUpdate = async () => {
    if (selectedOpportunity) {
      console.log('selectedOpportunity:', selectedOpportunity);
      let endpoint = '';
      let data = {}; // Object to hold the request body

      switch (modalType) {
        case 'qualified':
          endpoint = '/qualified-opportunity/update';
          data = {
            id: selectedOpportunity.id,
            qualified_opportunity: newOpportunityName
          };
          break;
        case 'clarityPending':
          endpoint = '/clarity-pending/update';
          data = {
            id: selectedOpportunity.id,
            clarity_pending: newOpportunityName,
            status_mode: selectedStatus
          };
          break;
      
        case 'disqualified':
          endpoint = '/disqualified-opportunity/update';
          data = {
            id: selectedOpportunity.id,
            disqualified_opportunity: newOpportunityName
          };
          break;
        default:
          console.error('Invalid modal type');
          return;
      }

      try {
        const response = await axiosInstance.post(endpoint, data); // Pass data as the second argument
        console.log('Opportunity deleted:', response.data);
        toast(response.data.message || 'Opportunity updated successfully!');

        const updatedOpportunity = response.data.data;
        switch (modalType) {
          case 'qualified':
            setQualifiedData(prevData => prevData.map(item =>
              item.id === updatedOpportunity.id ? updatedOpportunity : item
            ));
            break;
          case 'clarityPending':
            setClarityPendingData(prevData => prevData.map(item => {
              if (item.clarity_list && item.clarity_list.length > 0 && item.clarity_list[0].id === updatedOpportunity.id) {
                return {
                  ...item,
                  clarity_list: [{ ...item.clarity_list[0], clarity_pending: newOpportunityName.trim() }] // Update clarity_pending
                };
              } else {
                return item;
              }
            }));
            break;
          case 'disqualified':
            setDisqualifiedData(prevData => prevData.map(item =>
              item.id === updatedOpportunity.id ? updatedOpportunity : item
            ));
            break;
        }

        setNewOpportunityName('');

        handleEditModalClose();
      } catch (error) {
        console.error('Error  opportunity:', error);
        toast.error(error?.response?.data?.message || 'Error  opportunity');
      }
    }
  };
  // A helper function to map status_mode to badge color
  const getBadgeColor = (statusMode: string) => {
    switch (statusMode) {
      case 'positive':
        return 'success'; // Green
      case 'negative':
        return 'secondary'; // Grey
      case 'pending':
        return 'warning'; // Yellow
      case 'completed':
        return 'primary'; // Blue
      default:
        return 'info'; // Default color
    }
  };

  const transformedData = useMemo(() => {
    // Explicitly define the arrays with type ClarityEntry[]
    const positiveEntries: ClarityEntry[] = [];
    const negativeEntries: ClarityEntry[] = [];

    clarityPendingData.forEach(item => {
      item.clarity_list.forEach(clarity => {
        const clarityWithStatus: ClarityEntry = {
          clarity_pending: clarity.clarity_pending,
          status_mode: item.status_mode,
          id: clarity.id
        };

        if (item.status_mode === 'positive') {
          positiveEntries.push(clarityWithStatus);
        } else if (item.status_mode === 'negative') {
          negativeEntries.push(clarityWithStatus);
        }
      });
    });

    // Combine positive and negative entries, positive first
    return [...positiveEntries, ...negativeEntries];
  }, [clarityPendingData]);

  const clarityPendingTable = useAdvanceTable({
    columns: clarityPendingColumns,
    data: transformedData,
  });

  const disqualifiedTable = useAdvanceTable({
    columns: disqualifiedColumns,
    data: disqualifiedData,
  });

  const qualifiedTable = useAdvanceTable({
    columns: qualifiedColumns,
    data: qualifiedData,
  });



  const renderClarityPending = () => (
    <AdvanceTableProvider {...clarityPendingTable}>
      <Row className="g-3 justify-content-between my-2 align-items-center"> {/* Added align-items-center */}
        <Col xs="auto">
          <div className="d-flex">
            <SearchBox
              placeholder="Search Clarity Pending"
              className="me-2"
              onChange={handleClaritySearchInputChange}
            />
          </div>
        </Col>
        <Col xs="auto"> {/* New Col for the button */}
          <Button variant="primary" onClick={() => handleModalShow('clarityPending')}>
            <i className="bi bi-plus-circle"></i> Add New Clarity Pending Opportunity
          </Button>
        </Col>
      </Row>
      <AdvanceTable tableProps={{
        className: 'phoenix-table fs-12',
        striped: true,
        bordered: true,
        style: { cursor: 'pointer' }
      }}
        rowClassName="hover-actions-trigger btn-reveal-trigger" />
      <AdvanceTableFooter pagination />
    </AdvanceTableProvider>
  );

  const renderDisqualifiedTable = () => (
    <AdvanceTableProvider {...disqualifiedTable}>
      <Row className="g-3 justify-content-between my-2 align-items-center"> {/* Added align-items-center */}
        <Col xs="auto">
          <div className="d-flex">
            <SearchBox
              placeholder="Search Disqualified Opportunities"
              className="me-2"
              onChange={handleDisQualifiedSearchInputChange}
            />
          </div>
        </Col>
        <Col xs="auto"> {/* New Col for the button */}
          <Button variant="primary" onClick={() => handleModalShow('disqualified')}>
            <i className="bi bi-plus-circle"></i> Add New Disqualified Opportunity
          </Button>
        </Col>
      </Row>
      <AdvanceTable tableProps={{
        className: 'phoenix-table fs-12',
        striped: true,
        bordered: true,
        style: { cursor: 'pointer' }
      }}
        rowClassName="hover-actions-trigger btn-reveal-trigger" />
      <AdvanceTableFooter pagination />
    </AdvanceTableProvider>
  );

  const renderQualifiedTable = () => (
    <AdvanceTableProvider {...qualifiedTable}>
      <Row className="g-3 justify-content-between my-3 align-items-center"> {/* Added align-items-center */}
        <Col xs="auto">
          <div className="d-flex">
            <SearchBox
              placeholder="Search Qualified Opportunities"
              className="me-2"
              onChange={handleQualifiedSearchInputChange}
            />
          </div>
        </Col>
        <Col xs="auto"> {/* New Col for the button */}
          <Button variant="primary" onClick={() => handleModalShow('qualified')}>
            <i className="bi bi-plus-circle"></i> Add New Qualified Opportunity
          </Button>
        </Col>
      </Row>
      <AdvanceTable tableProps={{
        className: 'phoenix-table fs-12',
        striped: true,
        bordered: true,
        style: { cursor: 'pointer' }
      }}
        rowClassName="hover-actions-trigger btn-reveal-trigger" />
      <AdvanceTableFooter pagination />
    </AdvanceTableProvider>
  );

  // const renderClarityPending = () => (
  //   <AdvanceTableProvider {...clarityPendingTable}>
  //     <Row className="g-3 justify-content-between my-2">
  //       <Col xs="auto">
  //         <div className="d-flex">
  //           <SearchBox
  //             placeholder="Search Clarity Pending"
  //             className="me-2"
  //             onChange={handleClaritySearchInputChange}
  //           />
  //         </div>
  //       </Col>
  //     </Row>
  //     <AdvanceTable tableProps={{
  //       className: 'phoenix-table fs-12',
  //       striped: true,
  //       bordered: true,

  //       style: { cursor: 'pointer' }
  //     }}
  //       rowClassName="hover-actions-trigger btn-reveal-trigger" />
  //     <AdvanceTableFooter pagination />

  //   </AdvanceTableProvider>
  // );

  // const renderDisqualifiedTable = () => (
  //   <AdvanceTableProvider {...disqualifiedTable}>
  //     <Row className="g-3 justify-content-between my-2">
  //       <Col xs="auto">
  //         <div className="d-flex">
  //           <SearchBox
  //             placeholder="Search Disqualified Opportunities"
  //             className="me-2"
  //             onChange={handleDisQualifiedSearchInputChange}
  //           />
  //         </div>
  //       </Col>
  //     </Row>
  //     <AdvanceTable tableProps={{
  //       className: 'phoenix-table fs-12',
  //       striped: true,
  //       bordered: true,

  //       style: { cursor: 'pointer' }
  //     }}
  //       rowClassName="hover-actions-trigger btn-reveal-trigger" />
  //     <AdvanceTableFooter pagination />

  //   </AdvanceTableProvider>
  // );

  // const renderQualifiedTable = () => (
  //   <AdvanceTableProvider {...qualifiedTable}>
  //     <Row className="g-3 justify-content-between my-2">
  //       <Col xs="auto">
  //         <div className="d-flex">
  //           <SearchBox
  //             placeholder="Search Qualified Opportunities"
  //             className="me-2"
  //             onChange={handleQualifiedSearchInputChange}
  //           />
  //         </div>
  //       </Col>
  //     </Row>
  //     <AdvanceTable tableProps={{
  //       className: 'phoenix-table fs-12',
  //       striped: true,
  //       bordered: true,

  //       style: { cursor: 'pointer' }
  //     }}
  //       rowClassName="hover-actions-trigger btn-reveal-trigger" />
  //     <AdvanceTableFooter pagination />

  //   </AdvanceTableProvider>
  // );



  return (
    <>
      <div className="card-body">
        <Tab.Container activeKey={activeKey} onSelect={handleTabSelect}>
          <Nav variant="tabs" className="justify-content-center mt-2 mb-2">
            <Nav.Item>
              <Nav.Link
                eventKey="qualified"
                style={
                  activeKey === 'qualified'
                    ? {
                      ...baseNavLinkStyle,
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderColor: '#007bff',
                    }
                    : baseNavLinkStyle
                }
              >
                Qualified Opportunities
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="clarityPending"
                style={
                  activeKey === 'clarityPending'
                    ? {
                      ...baseNavLinkStyle,
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderColor: '#007bff',
                    }
                    : baseNavLinkStyle
                }
              >
                Clarity Pending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="disqualified"
                style={
                  activeKey === 'disqualified'
                    ? {
                      ...baseNavLinkStyle,
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderColor: '#007bff',
                    }
                    : baseNavLinkStyle
                }
              >
                Disqualified Opportunities
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>

            <Tab.Pane eventKey="qualified">
              {/* <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => handleModalShow('qualified')}>
                  <i className="bi bi-plus-circle"></i> Add New Qualified Opportunity
                </Button>
              </div> */}
              {renderQualifiedTable()}
            </Tab.Pane>

            <Tab.Pane eventKey="clarityPending">
              {/* <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => handleModalShow('clarityPending')}>
                  <i className="bi bi-plus-circle"></i> Add New Clarity Pending Opportunity
                </Button>
              </div> */}
              {renderClarityPending()}
            </Tab.Pane>

            <Tab.Pane eventKey="disqualified">
              {/* <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => handleModalShow('disqualified')}>
                  <i className="bi bi-plus-circle"></i> Add New Disqualified Opportunity
                </Button>
              </div> */}
              {renderDisqualifiedTable()}
            </Tab.Pane>
          </Tab.Content>

        </Tab.Container>

        {/* Modal for adding new opportunity */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add New {modalType === 'qualified' ? 'Qualified' : modalType === 'clarityPending' ? 'Clarity Pending' : 'Disqualified'} Opportunity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formOpportunityName">
                <Form.Label>Opportunity Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter opportunity name"
                  value={newOpportunityName}
                  onChange={(e) => setNewOpportunityName(e.target.value)}
                />
              </Form.Group>

              {modalType === 'clarityPending' && ( // Conditionally render dropdown
                <Form.Group controlId="formStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </Form.Control>
                </Form.Group>
              )}

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleNewOpportunitySubmit}>
              Add Opportunity
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        {showDeleteModal && (
        <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          zIndex: 1050, // Ensure it's on top
        }}
        onClick={handleDeleteModalClose} // Close on backdrop click
      >
        <div
          className="modal-dialog"
          style={{
            maxWidth: "400px",
            width: "90%",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent backdrop close when clicking inside modal
        >
          <div
            className="modal-content"
            style={{
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              backgroundColor: "white", // Modal content background
            }}
          >
            <div className="modal-header" style={{ borderBottom: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "40px", color: "#F4A52E", marginBottom: "10px" }}>
                ⚠️
              </div>
              <h5 className="modal-title" style={{ fontWeight: "bold", fontSize: "20px" }}>
                Are you sure?
              </h5>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", color: "#555" }}>
                You won't be able to revert this!
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: "none", justifyContent: "center", display: "flex", gap: "10px" }}>
              <button
                onClick={handleDelete}
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
                onClick={handleDeleteModalClose}
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

        {/* UPDATE MODAL */}
        <Modal show={showEditModal} onHide={handleEditModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Update New {modalType === 'qualified' ? 'Qualified' : modalType === 'clarityPending' ? 'Clarity Pending' : 'Disqualified'} Opportunity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formOpportunityName">
                <Form.Label>Opportunity Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter opportunity name"
                  value={newOpportunityName}
                  onChange={(e) => setNewOpportunityName(e.target.value)}
                />
              </Form.Group>

              {modalType === 'clarityPending' && ( // Conditionally render dropdown
                <Form.Group controlId="formStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </Form.Control>
                </Form.Group>
              )}

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEditModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Update Opportunity
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
      <ToastContainer />
    </>

  );
};

export default LeadAck;
