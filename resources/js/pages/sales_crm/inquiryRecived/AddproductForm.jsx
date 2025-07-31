import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import EditIcon from "../../../assets/img/newIcons/edit.svg";

const AddproductFrom = ({ onClose }) => {
  return (
    <>
      <style>{`
        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: #2E467A;
        }

        .form-container {
          border-radius: 15px;
          padding: 1.5rem;
          background: #fff;
          height: auto;
          max-width: 800px;
  margin: auto;
        }

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
          .compact-field {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 4px; /* tighter gap */
}

.compact-label {
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2E467A;
  white-space: nowrap;
    min-width: 100px; /* decreased to reduce space between label and input */

}


.input-wrapper {
  position: relative;
  flex: 1;
  margin-bottom: 0; /* remove default margin */
}

.input-field {
  border: none;
  border-bottom: 1px solid #aaa;
  border-radius: 0;
  padding-right: 28px;
  padding-left: 2px; /* slightly tighter padding */
  padding-bottom: 2px;
  color: #000;
  background-color: transparent;
  font-size: 14px;
  height: 30px;
  width: 100%;
}

        .form-icon {
          position: absolute;
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 1.5rem;
        }

        .btn-cancel {
          background: linear-gradient(to right, #a30707, #720101);
          color: #fff;
          border: none;
          padding: 6px 24px;
          border-radius: 15px;
        }

        .btn-save {
          background: linear-gradient(to right, #111A2E, #375494);
          color: #fff;
          border: none;
          padding: 12px 34px;
          border-radius: 15px;
        }

        .checkbox-label {
          font-size: 16px;
          font-weight: 600;
          color:  #111A2E;
          margin-left: 10px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="form-container">
        <div className="form-heading">Add Product</div>

        <div className="checkbox-container">
          <Form.Check type="checkbox" />
          <label className="checkbox-label">Use Product Dropdown</label>
        </div>

        <Row>
          <Col md={12}>
            <div className="compact-field">
              <label className="compact-label">Product Name:</label>
              <div className="input-wrapper">
                <Form.Control type="text" className="input-field" />
                <img src={EditIcon} alt="Edit" className="form-icon" />
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Make:</label>
              <div className="input-wrapper">
                <Form.Control type="text" className="input-field" />
                <img src={EditIcon} alt="Edit" className="form-icon" />
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Mobile Number:</label>
              <div className="input-wrapper">
                <Form.Control type="text" className="input-field" />
                <img src={EditIcon} alt="Edit" className="form-icon" />
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Quantity:</label>
              <div className="input-wrapper">
                <Form.Control type="text" className="input-field" />
                <img src={EditIcon} alt="Edit" className="form-icon" />
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="compact-field">
              <label className="compact-label">Target Price:</label>
              <div className="input-wrapper">
                <Form.Control type="text" className="input-field" />
                <img src={EditIcon} alt="Edit" className="form-icon" />
              </div>
            </div>
          </Col>
        </Row>

        <div className="action-buttons">
          <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
          <Button className="btn-save">Save</Button>
        </div>
      </div>
    </>
  );
};

export default AddproductFrom;
