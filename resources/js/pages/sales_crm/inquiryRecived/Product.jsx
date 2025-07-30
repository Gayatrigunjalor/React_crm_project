import React from 'react';

const ProductTable = () => {
  const tableData = [
    {
      srNo: 1,
      productName: "Non-Contact Infrared Forehead Temperature Measuring Device",
      make: "Thermo Fisher Scientific",
      model: "MA02",
      qty: 10,
      targetPrice: "$75000.00"
    },
    {
      srNo: 2,
      productName: "Advanced Non-Contact Infrared Forehead Thermometer With Real-Time Bluetooth Data Transmission And AI-Powered Fever Detection",
      make: "VitaCheck Health",
      model: "INFRATEMP S3",
      qty: 3,
      targetPrice: "$15000.00"
    },
    {
      srNo: 3,
      productName: "Multi-Function Non-Contact Infrared Thermometer With AI-Powered Temperature Analysis, Bluetooth Connectivity, And Cloud-Enabled Health Monitoring System",
      make: "NovaMed Instruments",
      model: "INTELLITEMP HX900",
      qty: 12,
      targetPrice: "$45000.00"
    }
  ];

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
    </svg>
  );

  return (
    <div className="container-fluid p-0">
      <style jsx>{`
        .gradient-header {
          background: linear-gradient(135deg, #111A2E 0%, #375494 100%);
        }
        .table-body-text {
          color: #375494;
        }
        .action-btn {
          background: none;
          border: none;
          padding: 4px 8px;
          margin: 0 2px;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .edit-btn {
          background-color: #375494;
          color: white;
        }
        .delete-btn {
          background-color: #dc3545;
          color: white;
        }
        .action-btn:hover {
          opacity: 0.8;
        }
        .table th {
          border: none;
          font-weight: 600;
          font-size: 14px;
          padding: 16px 12px;
          vertical-align: middle;
        }
        .table td {
          border: none;
          padding: 16px 12px;
          vertical-align: middle;
          font-size: 14px;
          border-bottom: 1px solid #e9ecef;
        }
        .table tbody tr:last-child td {
          border-bottom: none;
        }
        .table-responsive {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>
      
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="gradient-header text-white">
            <tr>
              <th scope="col" style={{ width: '80px' }}>SR.NO</th>
              <th scope="col" style={{ width: '35%' }}>PRODUCT NAME</th>
              <th scope="col" style={{ width: '20%' }}>MAKE</th>
              <th scope="col" style={{ width: '15%' }}>MODEL</th>
              <th scope="col" style={{ width: '80px' }}>QTY</th>
              <th scope="col" style={{ width: '120px' }}>TARGET PRICE</th>
              <th scope="col" style={{ width: '100px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index} className="table-body-text">
                <td className="text-center fw-bold">{item.srNo}</td>
                <td>{item.productName}</td>
                <td>{item.make}</td>
                <td>{item.model}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-end fw-bold">{item.targetPrice}</td>
                <td className="text-center">
                  <button className="action-btn edit-btn me-1" title="Edit">
                    <EditIcon />
                  </button>
                  <button className="action-btn delete-btn" title="Delete">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;