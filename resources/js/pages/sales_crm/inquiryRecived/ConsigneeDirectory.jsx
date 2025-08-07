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
        srNo: index + 1,
        id: section.id,
        contact_person_name: section.contact_person_name || 'N/A',
        address: section.add || 'N/A',
        city: section.city || 'N/A',
        pincode: section.pincode || 'N/A',
        state: section.state || 'N/A',
        country: section.country || 'N/A',
        mobile_number: section.mo_no || 'N/A',
        email: section.email || 'N/A',
        designation: section.designation || 'N/A',
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
        /* Styles for the updated table */
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
          font-size: 14px;
          padding: 18px 10px;
          letter-spacing: 0.5px;
          text-align: center;
          white-space: nowrap;
        }
        .table th.left-align {
          text-align: left;
          padding-left: 20px;
        }
        .table td {
          border: none;
          padding: 18px 10px;
          font-size: 14px;
          border-bottom: 1px solid #dee2e6;
          text-align: center;
          word-break: break-word;
        }
        .table td.left-align {
          text-align: left;
          padding-left: 20px;
          font-weight: 600;
        }
        .fw-bold {
          font-weight: 700 !important;
        }
        .table-body-text {
          color: #2E467A;
          font-size: 14px;
          font-weight: 600;
        }
        .action-btn-group {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
        }
        .action-btn-group img {
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .action-btn-group img:hover {
          opacity: 0.7;
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
        .error-text {
          color: #dc3545;
        }
        .loading-text {
          color: #6c757d;
        }
      `}</style>

      <div className="table-responsive">
        {loading && <div className="loading-text">Loading Consignees...</div>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && (
          <table className="table table-hover mb-0">
            <thead className="gradient-header text-white">
              <tr>
                <th style={{ width: '60px' }}>SR.NO</th>
                <th className="left-align" style={{ width: '15%' }}>CONTACT PERSON</th>
                <th style={{ width: '12%' }}>DESIGNATION</th>
                <th className="left-align" style={{ width: '20%' }}>ADDRESS</th>
                <th style={{ width: '10%' }}>CITY</th>
                <th style={{ width: '8%' }}>PINCODE</th>
                <th style={{ width: '10%' }}>STATE</th>
                <th style={{ width: '12%' }}>MOBILE</th>
                <th style={{ width: '15%' }}>EMAIL</th>
                <th className="actions-header" style={{ width: '80px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {consignees.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', fontWeight: '600', padding: '40px' }}>
                    No Consignees Found
                  </td>
                </tr>
              )}
              {consignees.map((item, index) => (
                <tr key={item.id || index} className="table-body-text">
                  <td className="text-center fw-bold">{item.srNo}</td>
                  <td className="left-align">{item.contact_person_name}</td>
                  <td className="text-center">{item.designation}</td>
                  <td className="left-align">{item.address}</td>
                  <td className="text-center">{item.city}</td>
                  <td className="text-center">{item.pincode}</td>
                  <td className="text-center">{item.state}</td>
                  <td className="text-center">{item.mobile_number}</td>
                  <td className="text-center" style={{ fontSize: '13px' }}>{item.email}</td>
                  <td className="text-center">
                    <span className="action-btn-group">
                      <img 
                        src={edit} 
                        alt="Edit" 
                        style={{ width: '16px', height: '16px' }}
                        onClick={() => console.log('Edit consignee:', item.id)}
                      />
                      <img 
                        src={deleteIcon} 
                        alt="Delete" 
                        style={{ width: '16px', height: '16px' }}
                        onClick={() => console.log('Delete consignee:', item.id)}
                      />
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