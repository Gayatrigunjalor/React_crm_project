import React, { useEffect, useState } from 'react';
import edit from "../../../assets/img/newIcons/edit.svg";
import deleteIcon from "../../../assets/img/newIcons/delete.svg";
import axiosInstance from "../../../axios";

// Make sure you pass customer_id, leadId, onClose as props
const Productdirectory = ({ onClose, customer_id, leadId }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from API when the popup opens or when ids change
  useEffect(() => {
    if (!customer_id || !leadId) {
      setTableData([]);
      return;
    }
    setLoading(true);
    axiosInstance.get("/showProductsDirectory", {
      params: { customer_id, lead_id: leadId }
    })
      .then(res => {
        const products = (res.data && res.data.products) ? res.data.products : [];
        // Format API data to match static table structure
        const mapped = products.map((item, idx) => ({
          srNo: idx + 1,
          productName: item.product,
          make: item.make,
          model: item.model,
          qty: item.quantity,
          targetPrice: item.target_price
        }));
        setTableData(mapped);
      })
      .catch(() => setTableData([]))
      .finally(() => setLoading(false));
  }, [customer_id, leadId]);

  return (
    <div className="container-fluid p-0">
      <style>{`
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
      <div className="d-flex justify-content-between align-items-center p-2">
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
            {loading && (
              <tr>
                <td className="text-center" colSpan={7} style={{color: "#205"}}>Loading...</td>
              </tr>
            )}
            {!loading && tableData.length === 0 && (
              <tr>
                <td className="text-center" colSpan={7} style={{color: "#bbb"}}>No products found.</td>
              </tr>
            )}
            {!loading && tableData.map((item, index) => (
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
