import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaPlus} from "react-icons/fa";
const GoalManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { name: "Team Member A", goals: {} },
    { name: "Team Member B", goals: {} },
    { name: "Team Member C", goals: {} },
    { name: "Team Member D", goals: {} },
  ]);

  const [formData, setFormData] = useState({
    salesTarget: "",
    currency: "",
    keyOpportunities: "",
    meetingTarget: "",
    leadVictory: "",
    customerConversion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const updatedTeamMembers = teamMembers.map((member) => ({
      ...member,
      goals: { ...formData },
    }));
    setTeamMembers(updatedTeamMembers);
  };


  const handleModalShow = () => {

    setShowModal(true);

  };
  return (
    <div style={{ padding: "20px", fontFamily: "'Roboto', sans-serif" }}>


      <Button
        variant="primary"
        onClick={() => handleModalShow()}
        style={{ float: 'right' }}
      >
         <FaPlus style={{ marginRight: '5px' }} />Add Goal
      </Button>




      {/* Team Members Section */}
      <div style={{ marginTop: "30px" }}>
        <h4 style={{ textAlign: "center", fontSize: "16px", marginBottom: "20px" }}>Team Goals</h4>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {teamMembers.map((member, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                minWidth: "200px",
                flexShrink: "0",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <h5 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>
                {member.name}
              </h5>
              <div style={{ fontSize: "12px", color: "#555" }}>
                <p>Sales Goal: {member.goals.salesTarget || "-"}</p>
                <p>Currency: {member.goals.currency || "-"}</p>
                <p>Key Opportunities: {member.goals.keyOpportunities || "-"}</p>
                <p>Meeting Target: {member.goals.meetingTarget || "-"}</p>
                <p>Lead Victory: {member.goals.leadVictory || "-"}</p>
                <p>Customer Conversion: {member.goals.customerConversion || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              maxWidth: "500px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {[
                { label: "Sales Target", name: "salesTarget", placeholder: "Enter Sales Target" },
                { label: "Currency", name: "currency", placeholder: "Enter Currency" },
                { label: "Key Opportunities", name: "keyOpportunities", placeholder: "Enter Key Opportunities" },
                { label: "Meeting Target", name: "meetingTarget", placeholder: "Enter Meeting Target" },
                { label: "Lead Victory", name: "leadVictory", placeholder: "Enter Lead Victory" },
                { label: "New Customer Conversion", name: "customerConversion", placeholder: "Enter Customer Conversion" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      marginBottom: "5px",
                      fontWeight: "500",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "14px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              ))}
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>

          <Button variant="primary" onClick={handleSave}>
            Save Goals
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoalManager;
