import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const InquiryDashboard = () => {
  return (
    <div className="container mt-4 d-flex flex-column align-items-center">
      <h4 className="fw-bold text-center">Inquiry Received Dashboard</h4>
      <div className="row mt-3 w-100 justify-content-center">
        {[
          { title: "CH-i7PRV", online: 70, offline: 30 },
          { title: "CH-i7IRB", online: 70, offline: 30 },
          { title: "CH-i7VX", online: 70, offline: 30 },
        ].map((item, index) => (
          <div key={index} className="col-md-4 d-flex justify-content-center">
            <div className="card text-center p-3 shadow-sm w-100">
              <h2 className="text-primary">100</h2>
              <h5>{item.title}</h5>
              <div className="d-flex justify-content-between px-3">
                <span className="text-primary">{item.online} Online</span>
                <span className="text-primary">{item.offline} Offline</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row mt-3 w-100 justify-content-center">
        {[
          { title: "Trade Inquiries", count: 70 },
          { title: "Chat-bot Inquiries", count: 50 },
          { title: "E-Mail Inquiries", count: 20 },
          { title: "Website Inquiries", count: 20 },
        ].map((item, index) => (
          <div key={index} className="col-md-3 d-flex justify-content-center">
            <div className="card text-center p-3 shadow-sm w-100">
              <h2 className="text-primary">{item.count}</h2>
              <h5>{item.title}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InquiryDashboard;
