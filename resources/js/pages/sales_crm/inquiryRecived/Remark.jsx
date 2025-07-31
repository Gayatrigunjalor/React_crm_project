import React, { useState } from "react";
import edit from "../../../assets/img/newIcons/edit.svg";

const RemarkForm = ({ onClose }) => {
  const [remark, setRemark] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved remark:", remark);
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
      {/* Remark Label with Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#111A2E",
            marginRight: "8px",
          }}
        >
          Remark
        </span>
        <img src={edit} alt="edit" style={{ width: "16px", height: "16px" }} />
      </div>

      {/* Custom multi-line underlines */}
      <div style={{ position: "relative", marginBottom: "30px" }}>
        <textarea
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder=""
          style={{
            width: "100%",
            resize: "none",
            border: "none",
            outline: "none",
            fontSize: "14px",
            padding: "0",
            fontFamily: "inherit",
            color: "#111A2E",
            backgroundColor: "transparent",
            lineHeight: "32px", // spacing between lines
            height: "128px",
          }}
        />
        {/* Simulated underline lines */}
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${32 * index}px`,
              borderBottom: "1px solid #cbd5e1",
            }}
          />
        ))}
      </div>

      {/* Centered Save Button */}
      <div style={{ textAlign: "center" }}>
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
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default RemarkForm;
