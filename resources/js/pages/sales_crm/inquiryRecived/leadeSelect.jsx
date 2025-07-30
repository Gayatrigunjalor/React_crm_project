import React, { useState, useRef, useEffect } from 'react';

const CustomLeadStatusDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Select Lead Status');
  const dropdownRef = useRef(null);

  const statusOptions = [
    'Qualified Lead',
    'Disqualified Lead',
    'Clarity Pending',
     
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedStatus(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <style>{`
        .custom-dropdown-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 1rem;
        }

        .custom-dropdown-label {
          color: #2E467A;
          fontSize: 14px;
          font-weight: 500;
          white-space: nowrap;
          margin: 0;
        }

        .custom-dropdown-wrapper {
          position: relative;
          width: 180px;
          height: 36px;
        }

        .custom-dropdown-button {
          width: 100%;
          height: 100%;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          padding: 0 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          outline: none;
        }

        .custom-dropdown-button:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #375494;
        }

        .custom-dropdown-button:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .custom-dropdown-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-height: 150px;
          overflow-y: auto;
          padding: 2px;
        }

        /* Custom Scrollbar Styling */
        .custom-dropdown-options::-webkit-scrollbar {
          width: 6px;
        }

        .custom-dropdown-options::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-dropdown-options::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #111A2E, #375494);
          border-radius: 3px;
        }

        .custom-dropdown-options::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #1a2642, #4a63a8);
        }

        /* Firefox Scrollbar */
        .custom-dropdown-options {
          scrollbar-width: thin;
          scrollbar-color: #375494 rgba(255, 255, 255, 0.1);
        }

        .custom-dropdown-option {
          width: 100%;
          background: linear-gradient(135deg, #111A2E, #375494);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          height: 26px;
          padding: 0 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          outline: none;
        }

        .custom-dropdown-option:last-child {
          margin-bottom: 0;
        }

        .custom-dropdown-option:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .custom-dropdown-option:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .dropdown-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <div className="custom-dropdown-container">
        <span className="custom-dropdown-label">
          Lead Acknowledgment Status:
        </span>
        
        <div 
          ref={dropdownRef}
          className="custom-dropdown-wrapper"
        >
          {/* Main Select Button */}
          <button
            onClick={toggleDropdown}
            className="custom-dropdown-button"
          >
            <span className="dropdown-text">{selectedStatus}</span>
          </button>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="custom-dropdown-options">
              {statusOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className="custom-dropdown-option"
                >
                  <span className="dropdown-text">{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomLeadStatusDropdown;