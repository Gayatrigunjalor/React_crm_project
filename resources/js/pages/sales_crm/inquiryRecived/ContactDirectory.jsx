import React, { useState, useEffect } from 'react';
import edit from "../../../assets/img/newIcons/edit.svg";
import deleteIcon from "../../../assets/img/newIcons/delete.svg";
import axiosInstance from "../../../axios";

const ContactDirectory = ({ onClose, lead_id, customer_id }) => {
  const [contactFetch, setContactFetch] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomerContacts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/showCustomerContactsDirectory",
        {
          params: {
            lead_id: lead_id,
            lead_cust_id: customer_id,
          },
        }
      );

      const sections = response.data.contacts || [];
      const contacts = sections.map((section) => ({
        id: section.id,
        contact_person_name: section.contact_person_name,
        city: section.city,
        country: section.country,
        mobile_no: section.mobile_no,
        address: section.address,
        pincode: section.pincode,
        state: section.state,
        email: section.email,
        designation: section.designation,
      }));

      setContactFetch(contacts);
      setLoading(false);
      return contacts;
    } catch (error) {
      setLoading(false);
      throw new Error(
        "Error fetching customer contacts: " + error.message
      );
    }
  };

  useEffect(() => {
    if (lead_id && customer_id) {
      fetchCustomerContacts();
    }
  }, [lead_id, customer_id]);

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
        .table th.contact-name-header {
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
        .table td.contact-name-cell {
          text-align: left;
          padding-left: 36px;
          font-weight: 700;
          word-break: break-word;
          white-space: normal;
        }
        .designation-cell, .city-cell {
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
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 50px;
          color: #2E467A;
          font-size: 16px;
        }
        .no-data-container {
          text-align: center;
          padding: 50px;
          color: #666;
          font-size: 16px;
        }
      `}</style>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="gradient-header text-white">
            <tr>
              <th style={{ width: '70px', whiteSpace: 'nowrap' }}>SR.NO</th>
              <th className="contact-name-header" style={{ width: '25%', whiteSpace: 'nowrap' }}>CONTACT PERSON</th>
              <th style={{ width: '15%', whiteSpace: 'nowrap' }}>DESIGNATION</th>
              <th style={{ width: '12%', whiteSpace: 'nowrap' }}>CITY</th>
              <th style={{ width: '12%', whiteSpace: 'nowrap' }}>MOBILE NO</th>
              <th style={{ width: '15%', whiteSpace: 'nowrap' }}>EMAIL</th>
              <th style={{ width: '12%', whiteSpace: 'nowrap' }}>PINCODE</th>
              <th className="actions-header" style={{ width: '90px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-container">
                  Loading contacts...
                </td>
              </tr>
            ) : contactFetch.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-container">
                  No contacts found
                </td>
              </tr>
            ) : (
              contactFetch.map((contact, index) => (
                <tr key={contact.id} className="table-body-text">
                  <td className="text-center fw-bold">{index + 1}</td>
                  <td className="contact-name-cell">{contact.contact_person_name || '-'}</td>
                  <td className="designation-cell">{contact.designation || '-'}</td>
                  <td className="city-cell">{contact.city || '-'}</td>
                  <td className="text-center fw-bold">{contact.mobile_no || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{contact.email || '-'}</td>
                  <td className="text-center fw-bold">{contact.pincode || '-'}</td>
                  <td className="text-center">
                    <span className="action-btn-group">
                      <img src={edit} alt="Edit" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactDirectory;