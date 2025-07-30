import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaUserFriends,    
  FaCommentAlt,
  FaCheckSquare,  
  FaUser           
} from "react-icons/fa";



const QuestionIconBox = ({ size = 28, color = "#5C4E8E" }) => (
  <div
    style={{
      position: "relative",
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
    }}
  >
    <FaCommentAlt size={26} />
    <span
      style={{
        position: "absolute",
        fontSize: size * 0.6,
        fontWeight: "bold",
        color: "#fff",
        top: "1%",
        left: "37%",
      }}
    >
      ?
    </span>
  </div>
);












const StatCard = ({ stat }) => {
  return (
    <div className="stat-card-container">
      <div
        className="stat-card-border"
        style={{ backgroundColor: stat.borderColor }}
      ></div>
      <div className="stat-card-content">
        <stat.icon size={26} style={{ color: stat.iconColor }} />
        <div className="ms-3">
        <p className="stat-card-title mb-1 text-muted fw-semibold small">{stat.title}</p>


          <p className="mb-0 fw-bold fs-6">{stat.count}</p>
        </div>
      </div>
    </div>
  );
};


const StatsGrid = ({ totalCustomers, inquiriesData }) => {
  console.log("inquiriesData",  inquiriesData?.qualified_by_agent);
  const stats = [
    {
      title: "Total Customers",
      count: totalCustomers,
      icon: FaUserFriends,
      iconColor: "#F29993",
      borderColor: "#F29993",
    },
    {
      title: "Total Inquiries Received on Software",
      count: inquiriesData?.total || 0,
      icon: () => <QuestionIconBox />,
      borderColor: "#5C4E8E",
    }
    
,    
    {
      title: "Total Qualified Inquiries by Software",
      count: inquiriesData?.qualified_by_software || 0,
      icon: FaCheckSquare,
      iconColor: "#FFC000",
      borderColor: "#FFC000",
    },
    {
      title: "Total Qualified Inquiries by Agent",
      count: inquiriesData?.qualified_by_agent || 0,
      icon: FaUser,
      iconColor: "#3FB65F",
      borderColor: "#3FB65F",
    },
  ];
  

  return (
    <>
      <style>{`
.stat-card-container {
  display: flex;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.25rem rgba(0, 0, 0, 0.075);
  width: 310px; /* increased width */
  height: auto;  /* auto height for content flexibility */
  overflow: hidden;
}

.stat-card-border {
  width: 6px;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  width: 100%;
}

.stat-card-title {
  white-space: normal; /* allow wrapping */
  overflow: visible;
  text-overflow: initial;
  max-width: 200px; /* increased max-width */
  display: block;
  line-height: 1.1;
}

@media (max-width: 576px) {
  .stat-card-container {
    width: 100%; /* Full width on very small screens */
  }
  .stat-card-title {
    max-width: 100%;
  }
}

      `}</style>

      <Container className="px-1">
        <Row className="justify-content-center gx-3 gy-3 d-flex flex-wrap flex-lg-nowrap">
          {stats.map((stat) => (
            <Col
              key={stat.title}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="d-flex justify-content-center"
            >
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default StatsGrid;
