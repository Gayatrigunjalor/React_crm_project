import React, { useState } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";

const ChangeOwner = ({ onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");

  return (
    <Container
      className="shadow rounded bg-white py-4 px-5"
      style={{ maxWidth: "700px" }}
    >
      <style>{` 
      .form-heading {
          text-align: center;
          font-size: 20px;
          font-weight: 600; 
          margin-bottom: 1.5rem;
          position: relative;
        }

        .form-heading::before,
        .form-heading::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 35%;
          height: 1px;
          background-color: #ccc;
        }

        .form-heading::before {
          left: 0;
        }

        .form-heading::after {
          right: 0;
        }
        .btn-cancel {
          background: linear-gradient(to right, #a30707, #720101);
          color: #fff;
          border: none;
          padding: 12px 34px;
          border-radius: 15px;
        }

        .btn-save {
          background: linear-gradient(to right, #111A2E, #375494);
          color: #fff;
          border: none;
          padding: 12px 34px;
          border-radius: 15px;
        }

        .section-title {
          text-align: center;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #ccc;
        }
        .label {
          font-weight: 600;
          color: #2E467A;
          margin-right: 5px;
        }
        .value {
          color:#2E467A99;
          font-weight: 500;
        }
      `}</style>

      {/* <div className="section-title">Change Owner</div> */}
      <div className="form-heading">ChangeOwner</div>


      <Row className="align-items-center mb-4">
        <Col md={6} className="d-flex align-items-center mb-2 mb-md-0">
          <span className="label">Current Owner Name:</span>
          <span className="value">Dhanashree Chavan</span>
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <span className="label">Change Owner:</span>
          <Dropdown onSelect={(e) => setSelectedEmployee(e)}>
            <Dropdown.Toggle
              variant="light"
              style={{ width: "100%", borderRadius: "20px", color: "#2E467A99" }}
              className=" border-0 fw-semibold"
            >
              {selectedEmployee || "Select Employee"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Employee A">Employee A</Dropdown.Item>
              <Dropdown.Item eventKey="Employee B">Employee B</Dropdown.Item>
              <Dropdown.Item eventKey="Employee C">Employee C</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <div className="d-flex justify-content-center gap-3">
        <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
        <Button className="btn-save">Save</Button>
      </div>
    </Container>
  );
};

export default ChangeOwner;
