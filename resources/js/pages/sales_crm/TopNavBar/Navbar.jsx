import React, { useState, useEffect } from "react";
import SectionMenu from "../SectionMenu/sectionMenu";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { useNavigate } from "react-router-dom";
import Badges from "../../../assets/img/newIcons/Badges.svg";
import Modal from 'react-bootstrap/Modal';
import AddProductForm from '../inquiryRecived/AddproductForm';
import  ChangeOwner from "../inquiryRecived/Changeowner";

const Navbar = ({ currentIndex, onStageSelect, unique_query_id, created_at, query_product_name, sender_name, customer_id }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    if (unique_query_id) {
      localStorage.setItem('unique_query_id', unique_query_id);
    }
    if (created_at) {
      localStorage.setItem('opp_date', created_at);
    }
  }, [unique_query_id, created_at]);

  const navigate = useNavigate();
  const handleStageSelect = (index) => {
    navigate(`/stage/${customer_id}/${index}`); // Navigate to a new page dynamically
  };

  // Badge Number Component
  const NumberBadge = ({ number }) => (
    <div style={{
      position: "absolute",
      top: "-12px", // Position above the text
      right: "-12px", // Increased gap from text end
      zIndex: 10
    }}>
      <img
        src={Badges}
        alt="badge"
        style={{
          width: "20px",
          height: "20px"
        }}
      />
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          fontFamily: "Nunito Sans, sans-serif"
        }}
      >
        {number}
      </span>
    </div>
  );

  const placeholderStyle = `
  ::placeholder {
    font-size: 0.9rem;
    color: #9CA3AF;
  }

.section {
 font-size: clamp(0.6rem, 1vw, 0.8rem); /* Font adjusts dynamically */
 padding: clamp(0.2rem, 0.5vw, 0.4rem) clamp(0.4rem, 0.8vw, 0.6rem);
 width: clamp(7rem, 12vw, 9rem); /* Width adapts to screen size */
 transition: all 0.3s ease;
}

@media screen and (max-width: 1024px) {
 .section {
   width: clamp(6.5rem, 11vw, 8.5rem);
   font-size: 0.7rem;
 }
}

@media screen and (max-width: 768px) {
 .section {
   width: clamp(6rem, 10vw, 8rem);
   font-size: 0.65rem;
   padding: 0.2rem 0.4rem;
 }
}

@media screen and (max-width: 480px) {
 .section {
   width: clamp(5rem, 9vw, 7rem);
   font-size: 0.6rem;
 }
}

 .btn-container {
            display: flex;
            // justify-content: center; /* Centers the buttons */
            gap: 10px;
            padding: 10px;
            max-width: 90%; /* Adjust width to maintain space on both sides */
            // margin: auto; /* Centers the container */
            flex-wrap: nowrap; /* Prevents wrapping */
            overflow: hidden; /* Ensures no horizontal scrolling */
        }

        .btn-custom {
            text-align: center;
            padding: 8px;
            font-size: clamp(12px, 1.2vw, 16px); /* Adjust font size dynamically */
            white-space: nowrap;
        }
            .action-btn {
  border: 1px solid;
  border-radius: 15px;
  height: 44px;
  width: 169px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 700;
  fontstyle: bold;
  background-color: #fff;
  color: #2550acff;
  font-family: 'Nunito Sans, sans-serif';
  white-space: nowrap;
  margin-left: 15px;
  margin-right: 10px;
  transition: background 0.3s, border 0.3s; /* Smooth transition */
}

.action-btn:hover {
  background: linear-gradient(90deg, #111A2E 0%, #375494 100%);
  color: #fff; /* Change text color on hover if needed */
  border: none; /* Optional: remove border on hover */
}

`;
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleAddProduct = () => {
    setShowAddProductModal(true); // show modal
  };

  const handleCloseAddProductModal = () => {
    setShowAddProductModal(false); // hide modal
  };

   const [showChangeownerModal, setShowChangeownerModal] = useState(false);

  const handleChangeowner = () => {
   setShowChangeownerModal(true); // show modal
  };

  const handleCloseChangeownerModal = () => {
    setShowChangeownerModal(false); // hide modal
  };
  return (
    <>
      <div style={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        borderRadius: "20px",
        padding: "12px 16px",
        // marginBottom: "40px",
        width: "1200px"
      }}>

        <style>{placeholderStyle}</style>
        <nav
          className="navbar-light"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >

          <div>
            {/* Navbar Toggler Button */}
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                // border: "1px solid #000",
                // backgroundColor: "#fff",
                fontSize: "0.8rem",
              }}
            >
              ☰ Menu
            </button>

            {/* Navbar Links */}
            <div
              className={`collapse navbar-collapse ${isCollapsed ? "d-block" : "d-lg-flex"}`}
              style={{
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >

              <div
                className="d-flex justify-content-start navContainer"
                style={{
                  whiteSpace: "nowrap",
                  padding: "8px 18px",
                  width: "100%",
                  // overflowX: "auto", // ✅ allow scroll
                  flexWrap: "nowrap",
                  fontFamily: "Nunito Sans, sans-serif",
                  fontSize: "16px", // responsive font size
                  fontWeight: 700,
                  gap: "14px", // more gap between stages
                }}
              >
                {[
                  { label: " Inquiry Received" },
                  { label: " Lead Acknowledgment" },
                  { label: " Product Sourcing" },
                  { label: " Price Shared" },
                  { label: " Quotation Shared" },
                  { label: " Follow Up" },
                  { label: " Victory Stage" },
                ].map((step, index) => (
                  <span
                    key={index}
                    onClick={() => handleStageSelect(index)}
                    className="px-4 py-2 fw-bold navItem"
                    style={{
                      position: "relative", // Added for badge positioning
                      padding: "0 20px", // Increased padding for more space
                      marginLeft: '10px',
                      marginRight: '10px',
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: " 16px",
                      color: "#375494",
                      fontFamily: 'Nunito Sans',
                    }}
                  >
                    <span style={{ position: "relative" }}>
                      {step.label}
                    </span>
                    {/* Badge Component */}
                    <div style={{ height: "16px", width: "16px" }}>
                      <NumberBadge />
                    </div>

                    <img
                      src="https://cdn-icons-png.flaticon.com/512/271/271228.png"
                      alt="arrow"
                      style={{
                        width: "10px",
                        height: "10px",
                        marginLeft: "10px",
                        objectFit: "contain",
                        transform: "rotate(90deg)",
                      }}
                    />
                  </span>
                ))}
              </div>

              <div className="flex-grow-1 p-2 h-100 overflow-auto  w-100" >
                <SectionMenu onStageSelect={onStageSelect} selectedStageIndex={currentIndex} />
              </div>

            </div>
          </div>

          {/* Info Row Styled Like Image */}
          <div className="d-flex flex-wrap  gap-2 px-3 py-2"
            style={{
              fontFamily: 'Nunito Sans',
              fontStyle: 'bold',
              fontWeight: 600,
              fontSize: '14px',
              color: 'rgba(46, 70, 122, 0.6)',
              flexWrap: 'wrap',
              marginBottom: '10px',
              marginLeft: '19px',
              marginRight: '10px',

            }}>
            <span style={{ marginRight: '8px' }}><strong>Opportunity ID:</strong> {unique_query_id}</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span style={{ marginRight: '8px' }}><strong>Date:</strong> {new Date(created_at).toLocaleDateString()}</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span style={{ marginRight: '8px' }}><strong>Product Name:</strong> {query_product_name}</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span style={{ marginRight: '8px' }}><strong>Customer Name:</strong> {sender_name}</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span><strong>Buying Plan:</strong> 22/7/2025</span> {/* Use a dynamic value if available */}
          </div>

          {/* Main Container for Action Buttons */}
          <div
            className="d-flex"
            style={{
              fontFamily: 'Nunito Sans',
              width: '1100px',
              height: '44px',
              alignItems: 'center',
              flexWrap: 'nowrap',
              overflow: 'hidden',
              margin: '10px 15px',
              gap: '1px' // ✅ 2px gap between button divs
            }}
          >
            <div>
              <button className="action-btn" onClick={handleAddProduct}>
                Add Product
              </button>
            </div>
            <div>
              <button className="action-btn" >
                Product Directory
              </button>
            </div>
            <div>
              <button className="action-btn"  onClick={ handleChangeowner}>
                Change Owner
              </button>
            </div>
            <div>
              <button className="action-btn" >
                Remark
              </button>
            </div>
            <div>
              <button className="action-btn" >
                Key Opportunity
              </button>
            </div>
          </div>



          {/* Responsive CSS */}
          <style>
            {`
                .navItem {
                  font-size: 0.875rem;
                  min-width: 0;
                }
                @media (max-width: 1958px) {
                  .navItem {
                    font-size: 0.8rem;
                  }
                }
                @media (max-width: 1647px) {
                  .navItem {
                    font-size: 0.75rem;
                    padding: 8px 12px !important;
                  }
                }
                @media (max-width: 1444px) {
                  .navItem {
                    font-size: 0.7rem;
                    padding: 6px 10px !important;
                  }
                }
                @media (max-width: 1303px) {
                  .navItem {
                    font-size: 0.65rem;
                    padding: 6px 8px !important;
                  }
                }
                @media (max-width: 1149px) {
                  .navItem {
                    font-size: 0.6rem;
                    padding: 6px 6px !important;
                  }
                }
                @media (max-width: 768px) {
                  .navContainer {
                    padding: 8px 10px !important;
                  }
                  .navItem {
                    font-size: 0.55rem;
                    padding: 4px 4px !important;
                  }
                }
                 .action-btn {
  border: 1px solid;
  border-radius: 15px;
  height: 36px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  background-color: #fff;
  color: #2550acff;
  font-family: 'Nunito Sans, sans-serif';
  white-space: nowrap;
  transition: background 0.3s, border 0.3s;
}

.action-btn:hover {
  background: linear-gradient(90deg, #111A2E 0%, #375494 100%);
  color: #fff;
  border: none;
}

              `}
          </style>
        </nav>
        <Modal
          show={showAddProductModal}
          onHide={handleCloseAddProductModal}
          centered
          backdrop="static"
          size="500px"

        >
          <Modal.Header closeBu tton>
          </Modal.Header>
          <Modal.Body>
            <AddProductForm onClose={handleCloseAddProductModal} />
          </Modal.Body>
        </Modal>


        <Modal
          show={showChangeownerModal}
          onHide={handleChangeowner}
          centered
          backdrop="static"
          size="500px"

        >
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
            <ChangeOwner onClose={handleCloseChangeownerModal} />
          </Modal.Body>
        </Modal>

      </div>
    </>
  );
};

export default Navbar;