import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const FollowUpTable = () => {
  const followUpData = [
    { status: "Another Follow-up", count: 4 },
    { status: "Buyer’s Internal Progress", count: 5 },
    { status: "Negotiation", count: 7 },
    { status: "Contract Sent", count: 7 },
    { status: "Payment Pending", count: 6 },
  ];

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th className="text-start">FOLLOW UP STATUS ⬍</th>
            <th className="text-end">COUNT ⬍</th>
          </tr>
        </thead>
        <tbody>
          {followUpData.map((item, index) => (
            <tr key={index}>
              <td className="text-start">{item.status}</td>
              <td className="text-end">{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FollowUpTable;
