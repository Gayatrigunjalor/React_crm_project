import React, { useState } from "react";

const StarPopup = () => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    
  };

  return (
    <select
      className="form-select"
      style={{
        fontSize: "0.7rem", 
        height: "40px", 
        padding: "0.5rem 1rem",
        width: "100%", 
     
      
        border: "1px solid #babfc7",
        borderRadius: "0.25rem",
        transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
        fontFamily:
          '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: "border-box",
        textTransform: "none",
        wordWrap: "normal",
      }}
      value={selectedValue}
      onChange={handleChange}
    >
      <option value="" disabled>
        Select Points
      </option>
      {[...Array(8)].map((_, index) => (
        <option key={index + 1} value={index + 1}>
          {index + 1}
        </option>
      ))}
    </select>
  );
};

export default StarPopup;
