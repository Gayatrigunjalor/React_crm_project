import React, { useState } from "react";
import EditIcon from "../../../assets/img/newIcons/edit.svg"; 

const RemarkForm = ({ onClose }) => {
  const [remark, setRemark] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved remark:", remark);
    // Perform your API call or state update here
    if (onClose) onClose(); // Close modal after save
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        fontFamily: "Nunito Sans, sans-serif",
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <label
        style={{
          fontSize: "16px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          color: "#111A2E",
        }}
      >
        Remark
        <EditIcon style={{ width: "18px", height: "18px", marginLeft: "8px" }} />
      </label>

      <textarea
        rows={4}
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Write your remark..."
        style={{
          width: "100%",
          resize: "none",
          border: "none",
          borderBottom: "1px solid #d1d5db",
          padding: "10px 0",
          fontSize: "14px",
          color: "#111A2E",
          outline: "none",
          backgroundColor: "transparent",
        }}
      />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #111A2E, #375494)",
            color: "#fff",
            padding: "8px 24px",
            border: "none",
            borderRadius: "20px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default RemarkForm;
