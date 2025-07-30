import React, { useState } from "react";
import { Form, Container, Button, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../axios";
import swal from "sweetalert";

const ComplainForm = () => {
  const { leadid, customerid } = useParams();
  const [feedback, setFeedback] = useState({
    overallExperience: 5,
    serviceQuality: 3,
    delays: "",
    name: "",
    customerID: "",
    issue: "",
    occurrence_date: "",
    occurrence_time: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, customerID, issue, occurrence_date, occurrence_time } = feedback;
    if (!name || !customerID || !issue || !occurrence_date || !occurrence_time) {
      swal("Validation Error", "Please fill all the required fields.", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    const cleanToken = token && token.split("|")[1];

    const occurredAt = `${feedback.occurrence_date} ${feedback.occurrence_time}:00`;

    const complaintData = {
      issue_description: feedback.issue,
      occurred_at: occurredAt,
      interaction_point: feedback.name,
      customer_id: feedback.customerID,
      lead_id: leadid,
    };

    const headers = {
      Authorization: `Bearer ${cleanToken}`,
    };

    try {
      const response = await axiosInstance.post("/complaint", complaintData, { headers });
      if (response.status === 201) {
        swal("Success", "Your complaint has been submitted successfully!", "success");
        setSubmitted(true);
        setFeedback({
          overallExperience: 5,
          serviceQuality: 3,
          delays: "",
          name: "",
          customerID: "",
          issue: "",
          occurrence_date: "",
          occurrence_time: "",
        });
      }
    } catch (error) {
      swal("Error", "Something went wrong. Please try again later.", "error");
    }
  };

  const questions = [
    {
      text: "What issue are you facing?",
      type: "textarea",
      name: "issue",
      placeholder: "Describe your complaint...",
      required: true,
    },
    {
      text: "When did this occur?",
      type: "datetime",
      required: true,
    },
    {
      text: "Who was your point of interaction from Inorbvict?",
      type: "text",
      name: "name",
      placeholder: "Enter Name",
      required: true,
    },
    {
      text: "What is your Customer ID?",
      type: "text",
      name: "customerID",
      placeholder: "Enter Customer ID",
      required: true,
    },
  ];

  return (
    <Container className="p-4 mt-4 d-flex justify-content-center">
      <Card className="p-4 w-100" style={{ maxWidth: "600px", borderRadius: "12px", border: "1px solid rgb(13, 14, 14)" }}>
        <>
          <h3 className="text-center mb-4 fw-bold">Complaint Form</h3>
          <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {questions.map((question, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label className="fw-semibold">
                  {index + 1}. {question.text}{" "}
                  {question.required && <span style={{ color: "red" }}>*</span>}
                </Form.Label>
                {question.type === "textarea" ? (
                  <Form.Control
                    as="textarea"
                    name={question.name}
                    placeholder={question.placeholder}
                    onChange={handleChange}
                    className="text-start"
                    value={feedback[question.name]}
                    required={question.required}
                  />
                ) : question.type === "datetime" ? (
                  <div className="d-flex gap-3">
                    <Form.Control
                      type="date"
                      name="occurrence_date"
                      onChange={handleChange}
                      value={feedback.occurrence_date}
                      required
                    />
                    <Form.Control
                      type="time"
                      name="occurrence_time"
                      onChange={handleChange}
                      value={feedback.occurrence_time}
                      required
                    />
                  </div>
                ) : (
                  <Form.Control
                    type="text"
                    name={question.name}
                    placeholder={question.placeholder}
                    onChange={handleChange}
                    value={feedback[question.name]}
                    required={question.required}
                  />
                )}
              </Form.Group>
            ))}
            <div className="text-center mt-3">
              <Button variant="warning" size="lg" type="submit" className="px-4 fw-bold">
                Submit
              </Button>
            </div>
          </Form>
        </>
      </Card>
    </Container>
  );
};

export default ComplainForm;
