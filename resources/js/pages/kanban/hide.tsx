import React from "react";
import { Button, Modal } from "react-bootstrap";
import axiosInstance from "../../axios";
import { is } from "date-fns/locale";

interface RoleHidePopupProps {
  show: boolean;
  id: string;
  role_id: number;
  roleName: string;
  isHided: boolean;
  type: string;
  managerName: string;
  immediateBoss: string;
  handleClose: () => void;
  handleSave: () => void;
}

const RoleHidePopup = ({ show, id, role_id, roleName,isHided, type, managerName, immediateBoss, handleClose, handleSave }: RoleHidePopupProps) => {
  console.log("RoleHidePopup Props:", { show, id, role_id,roleName, type, isHided, managerName, immediateBoss });

  const handleSaveClick = async () => {
    try {
      const params = new URLSearchParams({
        user_id: id,
        role_id: role_id
      });

      const body = {
        user_id: id,
        role_id: role_id,
        ...(type === 'hide' ? { hide: 1} : { hide: 0 })
      };

      const response = await axiosInstance.post(`/toggleAceAndGoalPreferences?${params.toString()}`, body);
      
      if (response.data) {
        handleSave();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      animation={false}
      dialogClassName="role-bypass-alert-modal"
      backdrop="static"
      centered={false}
    >
      <Modal.Body>
        <div className="px-3">
          <div className="mb-3">
            <strong>Form Name -</strong> {type === 'unhide' ? 'Role Unhide Popup' : 'Role Hide Popup'}
          </div>
          <div className="d-flex justify-content-between mb-4">
            <div>
              <strong>Manager Name -</strong> {managerName}
            </div>
            <div>
              <strong>Is Under -</strong> {immediateBoss}
            </div>
          </div>
          <div className="text-center mb-4">
            <strong>
              {type === 'unhide' 
                ? `Do you want to unhide the ${roleName} KPI from this user?`
                : `Do you want to hide the ${roleName} KPI from this user?`}
            </strong>
          </div>
          <div className="d-flex justify-content-end">
            <Button variant="danger" onClick={handleClose} className="me-2">
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveClick}>
              Save
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RoleHidePopup;

// Add this CSS to your main CSS file (e.g., App.css or a global style file):
/*
.role-bypass-alert-modal .modal-dialog {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  width: 600px;
  z-index: 1055;
}
.role-bypass-alert-modal .modal-content {
  border-radius: 10px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.12);
}
*/