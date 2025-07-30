import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Card, Row, Col, Container } from "react-bootstrap";


const TargetDashboard = () => {
  const data = {
    name: "",
    totalsales: "10 M $",
    salesAchived: "3 M $",
    inquiries: "300",
    incomeInquiriesNo: "1000",
    leadNo: "100",
    leadVictNo: "10",
    incomeInquiriesPer: "100%",
    leadPer: "10%",
    leadVictPer: "1%",
    totalMeet: "100",
    meetDone: "40",
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  return (
    <div className="card mb-4">
    <Container fluid className="p-4" >
      {/* Header Section */}
      <div className="mb-4">
        <h4 className="text-center">Inquiry Response Manager - {data.name}</h4>
      </div>

      {/* Date Picker */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div style={{ position: "relative", display: "inline-block",marginRight:"1rem" }}>
          <p className="text-center mb-2">From Date </p>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select Date"
            className="form-control"
            wrapperClassName="date-picker-wrapper"
          />
          <FaRegCalendarAlt
            style={{
              position: "absolute",
              right: "10px",
              top: "70%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#6c757d",
            }}
          />
        </div>

        <div style={{ position: "relative", display: "inline-block" }}>
          <p className="text-center mb-2">To Date</p>
          <DatePicker
            selected={selectedDate2}
            onChange={(date) => setSelectedDate2(date)}
            placeholderText="Select Date"
            className="form-control"
            wrapperClassName="date-picker-wrapper"
          />
          <FaRegCalendarAlt
            style={{
              position: "absolute",
              right: "10px",
              top: "70%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#6c757d",
            }}
          />
        </div>
      </div>

      {/* Summary Section */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Total Sales Target</Card.Text>
              <h5>{data.totalsales}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Sales Target Achieved</Card.Text>
              <h5>{data.salesAchived}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>No of Inquiries</Card.Text>
              <h5>{data.inquiries}</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inquiry Section */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Total Incoming Inquiries (Numberwise)</Card.Text>
              <h5>{data.incomeInquiriesNo}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Lead Conversion to Prospect (Numberwise)</Card.Text>
              <h5>{data.leadNo}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Lead Victory (Numberwise)</Card.Text>
              <h5>{data.leadVictNo}</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Total Incoming Inquiries (Percentage)</Card.Text>
              <h5>{data.incomeInquiriesPer}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Lead Conversion to Prospect (Percentage)</Card.Text>
              <h5>{data.leadPer}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Lead Victory (Percentage)</Card.Text>
              <h5>{data.leadVictPer}</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Meeting Section */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Total Meetings</Card.Text>
              <h5>{data.totalMeet}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Meetings Done</Card.Text>
              <h5>{data.meetDone}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>Meeting Completion Rate</Card.Text>
              <h5>40%</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* New Customer Section */}
      <Row className="g-3">
        <Col md={6}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>New Customer Conversion Target</Card.Text>
              <h5>---</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Text>New Customers Converted</Card.Text>
              <h5>---</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default TargetDashboard;
