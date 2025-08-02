import React from 'react';
import edit from "../../../assets/img/newIcons/edit.svg";
import deleteIcon from "../../../assets/img/newIcons/delete.svg";

const Productdirectory = ({ onClose }) => {
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
  return (
    <div className="container-fluid p-0">
      <style jsx>{`
        .gradient-header {
          background: linear-gradient(90deg, #111A2E 0%, #375494 100%);
        }
        .table th, .table td {
          vertical-align: middle !important;
        }
        .table th {
          border: none;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
          padding: 18px 10px;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .table th.product-name-header {
          text-align: left;
          padding-left: 36px;
        }
        .table td {
          border: none;
          padding: 18px 10px;
          font-size: 15px;
          border-bottom: 1px solid #dee2e6;
          text-align: center;
        }
        .table td.product-name-cell {
          text-align: left;
          padding-left: 36px;
          font-weight: 700;
          word-break: break-word;
          white-space: normal;
        }
        .make-cell, .model-cell {
          font-weight: 600;
        }
        .fw-bold {
          font-weight: 700 !important;
        }
        .table-body-text {
          color: #2E467A;
          font-size: 16px;
          font-weight: 700;
        }
        .action-btn-group {
          display: flex;
          gap: 6px;
          justify-content: center;
          align-items: center;
        }
       
        .actions-header {
          white-space: nowrap;
          text-align: center;
        }
        .table tbody tr:last-child td {
          border-bottom: none;
        }
        .table-responsive {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          background: #fff;
          padding: 0;
          margin: 0;
        } 
          .close-btn {
  background: none;
  border: none;
          color: #2E467A;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

      `}</style> 
    <div className="d-flex justify-content-between align-items-center  p-2"> 
      <h5 className="mb-0" style={{color:"#2E467A"}}>Product Directory</h5>
  <button className="close-btn" onClick={onClose}>&times;</button>
</div>

      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="gradient-header text-white">
            <tr>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>SR.NO</th>
              <th className="product-name-header" style={{ width: '35%', whiteSpace: 'nowrap' }}>PRODUCT NAME</th>
              <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MAKE</th>
              <th style={{ width: '15%', whiteSpace: 'nowrap' }}>MODEL</th>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>QTY</th>
              <th style={{ width: '120px', whiteSpace: 'nowrap' }}>TARGET PRICE</th>
              <th className="actions-header" style={{ width: '90px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index} className="table-body-text">
                <td className="text-center fw-bold">{item.srNo}</td>
                <td className="product-name-cell">{item.productName}</td>
                <td className="make-cell">{item.make}</td>
                <td className="model-cell">{item.model}</td>
                <td className="text-center fw-bold">{item.qty}</td>
                <td className="fw-bold" style={{ textAlign: 'center' }}>{item.targetPrice}</td>
                <td className="text-center">
                  <span className="action-btn-group">
                      <img src={edit} alt="Edit" style={{ width: '16px', height: '16px' }} />
                      <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px' }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  export default Productdirectory;