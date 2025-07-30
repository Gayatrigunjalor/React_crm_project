import React, { useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import ReverseBypass from '../../components/aceIcon/ReverseBypass.png';
import HideButton from '../../components/aceIcon/HideButton.png';
import Frame from '../../components/aceIcon/Frame.png';
import RoleHidePopup from './hide';
import RoleBypassPopup from './bypass';
import axiosInstance from '../../axios';

interface EmployeeData {
  id: number;
  user_id: number;
  name: string;
  is_under_id: number;
  is_under: {
    id: number;
    user_id: number;
    name: string;
  };
}

interface AceAndGoalPreference {
  id: number;
  user_id: number;
  role_id: number;
  isHidden: number;
  isBypass: number;
  created_at: string;
  updated_at: string;
}

interface SubordinateData {
  id: number;
  user_id: number;
  name: string;
  role_id: number;
  ancillary_roles: string | null;
  subordinates_count: number;
  ancillary_roles_names: any[];
  is_under: {
    id: number;
    user_id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
  ace_and_goal_preference?: AceAndGoalPreference[];
}

interface CareerTableProps {
  onBack: () => void;
  activeTab: number;
  employee: EmployeeData;
  isUnderEmployees: SubordinateData[];
  onDataRefresh?: () => void;
}

const CareerTable: React.FC<CareerTableProps> = ({ onBack, activeTab, employee, isUnderEmployees, onDataRefresh }) => {
  const [showBypass, setShowBypass] = useState(false);
  const [showHide, setShowHide] = useState(false);
  const [selectedData, setSelectedData] = useState({
    id: '',
    role_id: 0,
    roleName: '',
    type: '',
    isBypass: false,
    isHide: false,
    managerName: '',
    immediateBoss: ''
  });

  const isDarkMode = document.body.classList.contains('dark');

  const styles: any = {
    icon: {
      width: '26px',
      height: '17px',
      margin: '0 2px',
      cursor: 'pointer',
      verticalAlign: 'middle',
    },
    iconRow: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '6px',
      marginTop: '2px',
    },
  };

  const handleShowBypass = (data: any) => {
    setSelectedData(data);
    setShowBypass(true);
  };

  const handleCloseBypass = () => {
    setShowBypass(false);
    // Call the parent's refresh function instead of reloading the page
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  const handleShowHide = (data: any) => {
    setSelectedData(data);
    setShowHide(true);
  };

  const handleCloseHide = () => {
    setShowHide(false);
    // Call the parent's refresh function instead of reloading the page
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  return (
    <Container fluid className="p-4" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
      <style>
        {`
          .career-tab-btn {
            background: #3b82f6;
            color: #fff;
            font-weight: 600;
            min-width: 120px;
            border-radius: 8px;
            border: none;
            margin-bottom: 18px;
            margin-right: 12px;
            font-size: 18px;
            padding: 10px 0;
            box-shadow: 0 2px 8px rgba(59,130,246,0.08);
          }
        `}
      </style>

      <RoleBypassPopup
        show={showBypass}
        id={selectedData.id}
        role_id={selectedData.role_id}
        roleName={selectedData.roleName}
        isbypassed={selectedData.isBypass}
        type={selectedData.type}
        managerName={selectedData.managerName}
        immediateBoss={selectedData.immediateBoss}
        handleClose={handleCloseBypass}
        handleSave={handleCloseBypass}
      />

      <RoleHidePopup
        show={showHide}
        id={selectedData.id}
        role_id={selectedData.role_id}
        roleName={selectedData.roleName}
        isHided={selectedData.isHide}
        type={selectedData.type}
        managerName={selectedData.managerName}
        immediateBoss={selectedData.immediateBoss}
        handleClose={handleCloseHide}
        handleSave={handleCloseHide}
      />

      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold m-0">Control Panel - {activeTab}</h4>
          <Button variant="primary" className="mt-3" style={{ minWidth: 120, fontWeight: 600 }}>
            {activeTab}
          </Button>
        </Col>
        <Col className="text-end">
          <Button
            onClick={onBack}
            variant="outline-secondary"
            className="border border-secondary"
            style={{ fontWeight: 500 }}
          >
            Back to Control Panel
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <strong>Employee Name</strong> - {employee?.name || 'N/A'}
        </Col>
        <Col md={6} className="text-end">
          <strong>Is Under / Manager</strong> - {employee?.is_under?.name || 'N/A'}
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>Subordinates Name</th>
            <th>Primary Role KPI</th>
            <th>Ancillary Role KPI</th>
            <th>Is Under / Reporting Manager</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {isUnderEmployees && isUnderEmployees.length > 0 ? (
            isUnderEmployees.map((subordinate) => (
              <tr key={subordinate.id}>
                <td>{subordinate.name}</td>
                <td>{subordinate.role?.name || 'N/A'}</td>
                <td>
                  {subordinate.ancillary_roles_names && subordinate.ancillary_roles_names.length > 0 ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {subordinate.ancillary_roles_names.map((role: any, index: number) => {
                        const rolePreferences = subordinate.ace_and_goal_preference?.find(
                          pref => pref.role_id === role.id
                        );

                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: 130,
                            }}
                          >
                            <Button
                              size="sm"
                              variant={isDarkMode ? "dark" : "light"}
                              className="mb-2 border"
                              style={{
                                fontSize: '15px',
                                minWidth: 120,
                                padding: '6px 10px',
                                textAlign: 'center',
                                background: isDarkMode ? '#23272b' : '#fff',
                                border: '1px solid #d1d5db',
                                borderRadius: 6,
                                fontWeight: 500,
                                color: isDarkMode ? '#fff' : '#222',
                              }}
                            >
                              {role.name}
                            </Button>
                            <div style={styles.iconRow}>
                          
                              {rolePreferences ? (
                                <>
                                  {rolePreferences.isBypass === 0 ? (
                                    <img
                                      src={ReverseBypass}
                                      alt="Bypass icon"
                                      style={styles.icon}
                                      onClick={() => {
                                        handleShowBypass({
                                          id: subordinate.user_id,
                                          role_id: role.id,
                                          roleName: role.name,
                                          type: 'bypass',
                                          isBypass: false,
                                          managerName: subordinate.name,
                                          immediateBoss: subordinate.is_under.name
                                        });
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={ReverseBypass}
                                      alt="Unbypass icon"
                                      style={{ ...styles.icon, opacity: 0.5 }}
                                      onClick={() => {
                                        handleShowBypass({
                                          id: subordinate.user_id,
                                          role_id: role.id,
                                          roleName: role.name,
                                          type: 'unbypass',
                                          isBypass: true,
                                          managerName: subordinate.name,
                                          immediateBoss: subordinate.is_under.name
                                        });
                                      }}
                                    />
                                  )}
                                  {rolePreferences.isHidden === 0 ? (
                                    <img
                                      src={HideButton}
                                      alt="Hide icon"
                                      style={styles.icon}
                                      onClick={() => {
                                        handleShowHide({
                                          id: subordinate.user_id,
                                          role_id: role.id,
                                          roleName: role.name,
                                          type: 'hide',
                                          isHide: false,
                                          managerName: subordinate.name,
                                          immediateBoss: subordinate.is_under.name
                                        });
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={HideButton}
                                      alt="Unhide icon"
                                      style={{ ...styles.icon, opacity: 0.5 }}
                                      onClick={() => {
                                        handleShowHide({
                                          id: subordinate.user_id,
                                          role_id: role.id,
                                          roleName: role.name,
                                          type: 'unhide',
                                          isHide: true,
                                          managerName: subordinate.name,
                                          immediateBoss: subordinate.is_under.name
                                        });
                                      }}
                                    />
                                  )}
                                </>
                              ) : (
                                <>
                                  <img
                                    src={ReverseBypass}
                                    alt="Bypass icon"
                                    style={styles.icon}
                                    onClick={() => {
                                      handleShowBypass({
                                        id: subordinate.user_id,
                                        role_id: role.id,
                                        roleName: role.name,
                                        type: 'bypass',
                                        isBypass: false,
                                        managerName: subordinate.name,
                                        immediateBoss: subordinate.is_under.name
                                      });
                                    }}
                                  />
                                  <img
                                    src={HideButton}
                                    alt="Hide icon"
                                    style={styles.icon}
                                    onClick={() => {
                                      handleShowHide({
                                        id: subordinate.user_id,
                                        role_id: role.id,
                                        roleName: role.name,
                                        type: 'hide',
                                        isHide: false,
                                        managerName: subordinate.name,
                                        immediateBoss: subordinate.is_under.name
                                      });
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{subordinate.is_under?.name || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4}>No subordinates found.</td></tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default CareerTable;