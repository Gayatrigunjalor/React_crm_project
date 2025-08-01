import React, { useState } from "react";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../axios";
import swal from "sweetalert";

const FeedbackModal = ({ onClose }) => {
    const { leadid, customerid } = useParams();

    const [feedback, setFeedback] = useState({
        serviceSatisfaction: "",
        overallExperience: 5,
        recommendServices: "",
        metExpectations: "",
        serviceQuality: 3,
        timelyAddress: "",
        supportSatisfaction: "",
        teamFriendliness: "",
        feltHeard: "",
        speedOfDelivery: "",
        worthPrice: "",
        compareCompetitors: "",
        delayDescription: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [missingFields, setMissingFields] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const requiredFields = [
            "serviceSatisfaction",
            "overallExperience",
            "recommendServices",
            "metExpectations",
            "serviceQuality",
            "timelyAddress",
            "supportSatisfaction",
            "teamFriendliness",
            "feltHeard",
            "speedOfDelivery",
            "worthPrice",
            "compareCompetitors",
            "delayDescription",
        ];

        const missing = requiredFields.filter(
            (field) => !feedback[field] || feedback[field].toString().trim() === ""
        );

        setMissingFields(missing);

        return missing.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            swal("Warning", "Please fill out all required fields.", "warning");
            return;
        }

        const token = localStorage.getItem("token");
        const cleanToken = token && token.split("|")[1];

        const feedbackData = {
            lead_id: leadid,
            customer_id: customerid,
            service_satisfaction: feedback.serviceSatisfaction,
            overall_experience: feedback.overallExperience,
            recommend_services: feedback.recommendServices,
            met_expectations: feedback.metExpectations,
            service_quality: feedback.serviceQuality,
            timely_address: feedback.timelyAddress,
            support_satisfaction: feedback.supportSatisfaction,
            team_friendliness: feedback.teamFriendliness,
            felt_heard: feedback.feltHeard,
            speed_of_delivery: feedback.speedOfDelivery,
            worth_price: feedback.worthPrice,
            compare_competitors: feedback.compareCompetitors,
            delay_description: feedback.delayDescription,
        };

        const headers = {
            Authorization: `Bearer ${cleanToken}`,
        };

        try {
            const response = await axiosInstance.post("/feedback", feedbackData, { headers });

            if (response.status === 201) {
                setFeedback({
                    serviceSatisfaction: "",
                    overallExperience: 5,
                    recommendServices: "",
                    metExpectations: "",
                    serviceQuality: 3,
                    timelyAddress: "",
                    supportSatisfaction: "",
                    teamFriendliness: "",
                    feltHeard: "",
                    speedOfDelivery: "",
                    worthPrice: "",
                    compareCompetitors: "",
                    delayDescription: "",
                });
                setMissingFields([]);
                swal("Success!", response.data.message, "success");
                setSubmitted(true);
            } else {
                console.error("Error submitting feedback:", response.statusText);
            }
        } catch (error) {
            if (error.response) {
                console.error("Error with response:", error.response.data);
            } else if (error.request) {
                console.error("Error with request:", error.request);
            } else {
                console.error("Error:", error.message);
            }
        }
    };

    const renderStars = (count, name) => (
        <div className="star-container">
            {[...Array(count)].map((_, index) => (
                <FaStar
                    key={index}
                    size={14}
                    color={
                        index < feedback[name]
                            ? "#ffc107"
                            : missingFields.includes(name)
                                ? "red"
                                : "#e4e5e9"
                    }
                    onClick={() => setFeedback({ ...feedback, [name]: index + 1 })}
                    style={{ cursor: "pointer" }}
                />
            ))}
        </div>
    );

    const questions = [
        "How satisfied are you with our service?",
        "How would you rate your overall experience with our company?",
        "Would you recommend our services?",
        "Did our service meet your expectations?",
        "How would you rate the quality of service you received?",
        "Were your concerns or issues addressed in a timely manner?",
        "How satisfied are you with our customer support team?",
        "Was our team friendly and helpful?",
        "Did you feel heard and valued during your interaction with us?",
        "How satisfied are you with the speed of service delivery?",
        "Did you face any delays? If yes, please describe.",
        "Do you feel our service is worth the price you paid?",
        "How would you rate our service compared to competitors?",
    ];

    return (
        <>
            <style>{`
      
        .form-heading {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 1.5rem;
    position: relative;
}

.form-heading::before,
.form-heading::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background-color: #ccc;
}

.form-heading::before {
    left: 0;
}

.form-heading::after {
    right: 0;
}

.feedback-option {
    font-size: 14px;
    font-weight: 500;
    margin-right: 12px;
}

textarea.form-control {
    font-size: 14px;
}

.star-container {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
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


      `}</style>

            <Container className="p-3 mt-2 d-flex justify-content-center">
                <div
                    className="p-5 w-100"
                    style={{
                        maxWidth: "900px",
                        borderRadius: "12px",
                        border: "1px solid black",
                        backgroundColor: "#f8f9fa",
                        padding: "15px",
                    }}
                >
                    <h3 className="text-center mb-5 fw-bold" style={{ fontSize: "16.5px" }}>
                        <div className="form-heading">Give your Feedback </div>
                    </h3>
                    <Form onSubmit={handleSubmit}>
                        <Row className="gy-4">
                            {questions.map((question, index) => {
                                let fieldName = "";
                                switch (index) {
                                    case 0: fieldName = "serviceSatisfaction"; break;
                                    case 1: fieldName = "overallExperience"; break;
                                    case 2: fieldName = "recommendServices"; break;
                                    case 3: fieldName = "metExpectations"; break;
                                    case 4: fieldName = "serviceQuality"; break;
                                    case 5: fieldName = "timelyAddress"; break;
                                    case 6: fieldName = "supportSatisfaction"; break;
                                    case 7: fieldName = "teamFriendliness"; break;
                                    case 8: fieldName = "feltHeard"; break;
                                    case 9: fieldName = "speedOfDelivery"; break;
                                    case 10: fieldName = "delayDescription"; break;
                                    case 11: fieldName = "worthPrice"; break;
                                    case 12: fieldName = "compareCompetitors"; break;
                                    default: break;
                                }

                                return (
                                    <Col md={6} key={index} className="mb-3">
                                        <Form.Group className="p-2">
                                            <Form.Label className="fw-semibold" style={{ fontSize: "11.5px" }}>
                                                {index + 1}. {question} <span style={{ color: "red" }}>*</span>
                                            </Form.Label>

                                            {index === 1 || index === 4 ? (
                                                renderStars(
                                                    index === 1 ? 10 : 5,
                                                    fieldName
                                                )
                                            ) : index === 10 ? (
                                                <Form.Control
                                                    as="textarea"
                                                    name="delayDescription"
                                                    value={feedback.delayDescription}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className={`mt-2 p-2 border rounded ${missingFields.includes("delayDescription") ? "border-danger" : ""
                                                        }`}
                                                    placeholder="Describe any delays you faced..."
                                                    style={{ fontSize: "11px" }}
                                                />
                                            ) : (
                                                <div
                                                    className={`d-flex justify-content-start gap-3 flex-wrap mt-2 ${missingFields.includes(fieldName)
                                                        ? "border border-danger p-2 rounded"
                                                        : ""
                                                        }`}
                                                >
                                                    {(index === 0 || index === 6
                                                        ? ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
                                                        : index === 2 || index === 3 || index === 7 || index === 8 || index === 11
                                                            ? ["Yes", "No", "Maybe"]
                                                            : index === 5 || index === 9 || index === 12
                                                                ? ["Yes", "No", "Took longer than expected"]
                                                                : []
                                                    ).map((option) => (
                                                        <Form.Check
                                                            type="radio"
                                                            label={<span style={{ fontSize: "11px" }}>{option}</span>}
                                                            name={fieldName}
                                                            value={option}
                                                            onChange={handleChange}
                                                            key={option}
                                                            className="text-start"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                );
                            })}
                        </Row>
                        <div className="action-buttons">
                            <Button className="btn-cancel" onClick={onClose}>Cancel</Button>
                            <Button className="btn-save">Save</Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default FeedbackModal;
