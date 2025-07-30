import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';

const CombinedButtons = () => {

  const [openKpiModal, setOpenKpiModal] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 76 }, (_, i) => currentYear + i);
  });
  return (
    <>
      <Row className="gx-2">
        <Col md="auto">
          <Button
            variant="primary"
            className="me-2"
            onClick={() => setOpenKpiModal(true)}
          >
            Add KPI
          </Button>

          <Button
            variant="primary"
            onClick={() => setOpenFilterModal(true)}
          >
            Filter
          </Button>
        </Col>
      </Row>

      {/* Add KPI Modal */}
      <Modal show={openKpiModal} onHide={() => setOpenKpiModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add KPI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="kpiList">
              <Form.Label>KPIs List</Form.Label>
              <Form.Select>
                <option>None selected</option>
                <option>KPI 1</option>
                <option>KPI 2</option>
              </Form.Select>
            </Form.Group>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="year">
                  <Form.Label>Year</Form.Label>
                  <Form.Select>
                    <option>Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="month">
                  <Form.Label>Month</Form.Label>
                  <Form.Select>
                    <option>Select Month</option>
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setOpenKpiModal(false)}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filter Modal */}
      <Modal show={openFilterModal} onHide={() => setOpenFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="filter">
              <Form.Label>Where</Form.Label>
              <Form.Select>
                <option disabled>Select Filter</option>
                <option>Due Date</option>
                <option>Priority</option>
                <option>Date Created</option>
                <option>Date Updated</option>
                <option>Start Date</option>
              </Form.Select>
            </Form.Group>
            <Row className="mt-3">
              <Col>
                <Form.Group controlId="yearFilter">
                  <Form.Label>Year</Form.Label>
                  <Form.Select>
                    <option>Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="monthFilter">
                  <Form.Label>Month</Form.Label>
                  <Form.Select>
                    <option>Select Month</option>
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setOpenFilterModal(false)}>
            Clear Filter
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CombinedButtons;
