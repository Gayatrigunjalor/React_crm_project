import React, { useState } from "react";
import { Card, Nav, Tab, Row, Col, CardBody } from "react-bootstrap";
import taskicon from "../../../assets/img/newIcons/task.svg";
import edit from "../../../assets/img/newIcons/edit.svg";
import sarthi from "../../../assets/img/newIcons/sarthi.svg";
import chanakya from "../../../assets/img/newIcons/chank.svg";
import chat from "../../../assets/img/newIcons/chats.svg";
import tabframe from "../../../assets/img/newIcons/tabframe.svg";
import TaskManagerContent from "./Taskmanger";

const Rightcard = () => {
  const [key, setKey] = useState("task");

  return (
    <>
      <Card.Body className="p-0 m-0"
      >
        <Tab.Container activeKey={key} onSelect={(k) => setKey(k || "task")}>
          <Row className="m-0">
            <Col sm={12} className="p-0">
              <div className="custom-tab-scroll-wrapper">
                <Nav className="d-flex flex-row align-items-start custom-tab-wrapper">
                  {[
                    { key: "task", label: "Task Manager", icon: taskicon },
                    { key: "chat", label: "Chat View", icon: chat },
                    { key: "chanakya", label: "Chanakya", icon: chanakya },
                    { key: "sarthii", label: "Sarthii", icon: sarthi },
                  ].map((tab) => (
                    <Nav.Item key={tab.key} className="me-3 nav-item">
                      <Nav.Link
                        eventKey={tab.key}
                        className={`custom-tab ${key === tab.key ? "active-tab" : ""
                          }`}
                      >
                        <div className="tab-title d-flex flex-column align-items-center">
                          <div className="d-flex align-items-center gap-1">
                            <img src={tab.icon} alt={tab.label} className="icon" />
                            <span>{tab.label}</span>
                          </div>
                          {key === tab.key && (
                            <img
                              src={tabframe}
                              alt="underline"
                              className="tabframe mt-1"
                            />
                          )}
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>
            </Col>
            <CardBody className="tab-card-body">
              <Col sm={12} className="content-container">
                <Tab.Content>
                  <Tab.Pane eventKey="task">

                    <TaskManagerContent />

                  </Tab.Pane>
                  <Tab.Pane eventKey="chat">Chat View Content</Tab.Pane>
                  <Tab.Pane eventKey="chanakya">Chanakya Content</Tab.Pane>
                  <Tab.Pane eventKey="sarthii">Sarthii Content</Tab.Pane>
                </Tab.Content>
              </Col>
            </CardBody>
          </Row>
        </Tab.Container>
      </Card.Body>

      {/* Styles */}
      <style>{`
     .tab-card-body {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0 !important;
  margin: 0 !important;
  width: 500px;
  height: 380px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.custom-tab-scroll-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 2px 12px 2px;
}

.custom-tab-wrapper {
  display: flex;
  width: 492px;
  justify-content: center;
  margin: 0;
  padding: 0;
  gap: 16px;
  flex-wrap: nowrap;
}

.custom-tab {
  background: none !important;
  border: none !important;
  color: #002855;
  padding: 0;
}

.custom-tab:hover {
  color: #004080;
}

.active-tab {
  font-weight: 600;
}

.tabframe {
  height: 16px;
  width: 90px;
  object-fit: contain;
  margin-bottom: 10px;
}

.icon {
  width: 18px;
  height: 18px;
}

.tab-title span {
  font-size: 13.5px;
}

.tab-title {
  white-space: nowrap;
}

.nav-item {
  flex-shrink: 0;
}

.content-container {
  padding: 0 !important;
  margin: 0 !important;
}

.task-content-wrapper {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

      `}</style>
    </>
  );
};

export default Rightcard;
