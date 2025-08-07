import React, { useEffect, useState } from 'react';
import edit from "../../../assets/img/newIcons/edit.svg";
import deleteIcon from "../../../assets/img/newIcons/delete.svg";
import axiosInstance from "../../../axios";

const ConsigneeDirectory = ({ onClose, lead_id, customer_id }) => {
  const [consignees, setConsignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch consignees data from API dynamically
  const fetchConsigneesData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/showCustomerConsigneeDirectory", {
        params: {
          lead_id: lead_id,
          cust_id: customer_id,
        },
      });

      const consigneeSection = response.data.consignee || [];
      const mappedConsignees = consigneeSection.map((section, index) => ({
        srNo: index + 1, // numbering dynamically
        productName: section.productName || 'N/A', // if applicable, else remove these fields
        make: section.make || 'N/A',
        model: section.model || 'N/A',
        qty: section.qty || 0,
        targetPrice: section.targetPrice || '$0.00',
        // add any other fields you want to display
        id: section.id,
        consignee_address: section.add,
        consignee_city: section.city,
        contact_person_name: section.contact_person_name,
        consignee_country: section.country,
        consignee_designation: section.designation,
        consignee_email: section.email,
        consignee_mobile_number: section.mo_no,
        consignee_pincode: section.pincode,
        consignee_state: section.state,
      }));

      setConsignees(mappedConsignees);
      setLoading(false);
    } catch (error) {
      setError("Error fetching consignees data: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsigneesData();
  }, [lead_id, customer_id]);

  return (
    <div className="container-fluid p-0">
      <style jsx>{`
        /* Styles remain unchanged */
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
        .loading-text, .error-text {
          text-align: center;
          margin: 20px 0;
          font-weight: 600;
        }
      `}</style>

      <div className="table-responsive">
        {loading && <div className="loading-text">Loading Consignees...</div>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
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
              {consignees.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', fontWeight: '600' }}>
                    No Consignees Found
                  </td>
                </tr>
              )}
              {consignees.map((item, index) => (
                <tr key={item.id || index} className="table-body-text">
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
        )}
      </div>
    </div>
  );
};

export default ConsigneeDirectory;
