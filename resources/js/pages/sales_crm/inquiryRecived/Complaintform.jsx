import React from "react";
import { Form, Button } from "react-bootstrap";
import EditIcon from "../../../assets/img/newIcons/edit.svg";

const Complaintform = ({ onClose }) => {
  return (
    <>
      <style>{`
        .form-container {
          border-radius: 15px;
          padding: 2rem;
          background: #fff;
          max-width: 480px;
          margin: auto;
        }

        .form-heading {
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2rem;
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

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          font-size: 11px;
          font-weight: 600;
          color: #2E467A;
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          border: none;
          border-bottom: 1px solid #aaa;
          border-radius: 0;
          background-color: transparent;
          font-size: 12px;
          height: 32px;
          width: 100%;
          padding-right: 28px;
        }

        .form-icon {
          position: absolute;
          top: 50%;
          right: 6px;
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
          padding: 4px 22px;
          border-radius: 15px;
        }

        .btn-save {
          background: linear-gradient(to right, #111A2E, #375494);
          color: #fff;
          border: none;
          padding: 8px 28px;
          border-radius: 15px;
        }
      `}</style>

      <div className="form-container">
        <div className="form-heading">Complaint Form</div>

        <div className="form-group">
          <label className="form-label">1. What issue are you facing?</label>
          <div className="input-wrapper">
            <Form.Control type="text" className="input-field" />
            <img src={EditIcon} alt="Edit" className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">2. When did this occur?</label>
          <div className="input-wrapper">
            <Form.Control type="text" className="input-field" />
            <img src={EditIcon} alt="Edit" className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            3. Who was your point of interaction from Inorbvict? *
          </label>
          <div className="input-wrapper">
            <Form.Control type="text" className="input-field" />
            <img src={EditIcon} alt="Edit" className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">4. What is your Customer ID?</label>
          <div className="input-wrapper">
            <Form.Control type="text" className="input-field" />
            <img src={EditIcon} alt="Edit" className="form-icon" />
          </div>
        </div>

        <div className="action-buttons">
          <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
          <Button className="btn-save">Submit</Button>
        </div>
      </div>
    </>
  );
};

export default Complaintform;
