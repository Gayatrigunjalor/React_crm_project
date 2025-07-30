import React from "react"; 
import Button from "../../../components/base/Button";

const TargetModal = () => {
  return (
    <div
      className="d-flex flex-column"
      style={{
        width: "100%",
        maxWidth: "400px", 
        padding: "20px",
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
        margin: "0 auto",
      }}
    >
      <h3
        className="h5 font-weight-semibold mb-2 text-start"
        style={{ fontSize: "1rem" }}
      >
        Type Of Target
      </h3>
      <h5
        className="text-muted mb-3 text-start"
        style={{ fontSize: "0.82rem" }}
      >
        How do you want to measure this result?
      </h5>

      <hr className="my-3 w-100" style={{ borderTop: "1.5px solid #ccc" }} />

      <h5 className="text-start mb-2" style={{ fontSize: "0.7rem" }}>
        Objective:
      </h5>

      <hr className="my-3 w-100" style={{ borderTop: "1px solid #ddd" }} />

      <div className="mb-3">
        <label
          className="form-label text-start d-block"
          style={{ fontSize: "0.7rem", marginBottom: "5px" }}
        >
          Choose Type
        </label>
        <select
          className="form-select"
          style={{
            fontSize: "0.75rem",
            height: "32px", 
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="">Number</option>
          <option value="">Done/Not Done</option>
          <option value="">Currency</option>
        </select>
      </div>

      <div className="mb-3">
        <label
          className="form-label text-start d-block"
          style={{ fontSize: "0.7rem", marginBottom: "5px" }}
        >
          Values of Target*
        </label>
        <input
          type="text"
          className="form-control"
          style={{
            fontSize: "0.75rem",
            height: "32px", // Adjusted height
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          
          }}
        />
      </div>

      <hr className="my-3 w-100" style={{ borderTop: "1px solid #ddd" }} />

      <div className="d-flex justify-content-end gap-3">
        <Button
          className="btn btn-danger btn-sm px-2"
          style={{
            fontSize: "0.77rem",
            borderRadius: "5px",
            padding: "6px 10px", 
          }}
        >
          Close
        </Button>
        <Button
          className="btn btn-success btn-sm px-2"
          style={{
            fontSize: "0.77rem",
            borderRadius: "5px",
            padding: "6px 13px",
          }}
        >
          Add Target
        </Button>
      </div>
    </div>
  );
};

export default TargetModal;
