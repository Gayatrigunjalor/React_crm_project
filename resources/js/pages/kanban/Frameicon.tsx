import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import ReverseBypass from '../../components/aceIcon/ReverseBypass.png';
import HideButton from '../../components/aceIcon/HideButton.png';
import RoleHidePopup from './hide';
import RoleBypassPopup from './bypass';
import axiosInstance from '../../axios';

interface SubordinateTableProps {
  onBack: () => void;
  activeTab: string;
  userId: string;
  roleId: number;
}

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
  is_under_id: number;
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

interface SubordinateApiResponse {
  employee: EmployeeData;
  isUnderEmployees: SubordinateData[];
}

const SubordinateTable: React.FC<SubordinateTableProps> = ({ onBack, activeTab, userId, roleId }) => {
  const [subordinateData, setSubordinateData] = useState<SubordinateApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    // Refresh data after bypass operation
    fetchSubordinates();
  };

  const handleShowHide = (data: any) => {
    setSelectedData(data);
    setShowHide(true);
  };

  const handleCloseHide = () => {
    setShowHide(false);
    // Refresh data after hide operation
    fetchSubordinates();
  };

  const fetchSubordinates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/aceAndGoalIsUnderUsersByRole?id=${userId}&role_id=${roleId}`);
      setSubordinateData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subordinates:', err);
      setError('Failed to fetch subordinates data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && roleId) {
      fetchSubordinates();
    }
  }, [userId, roleId]);

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
        <div className="text-center text-danger">{error}</div>
      </Container>
    );
  }

  const employeeName = subordinateData?.employee?.name || 'N/A';
  const managerName = subordinateData?.employee?.is_under?.name || 'N/A';
  const subordinates = subordinateData?.isUnderEmployees || [];

  return (
    <Container fluid className="p-4" style={{ minHeight: '100vh', background: '#f7f8fa' }}>
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
          <strong>Employee Name</strong> - {employeeName}
        </Col>
        <Col md={6} className="text-end">
          <strong>Is Under /Manager</strong>- {managerName}
        </Col>
      </Row>
      {subordinates.length === 0 ? (
        <div className="text-center p-4">
          <h5>No data available</h5>
        </div>
      ) : (
        <Table bordered hover responsive>
          <thead className="text-center">
            <tr>
              <th>Name</th>
              <th>Primary Role KPI</th>
              <th>Ancillary Role KPI</th>
              <th>Reporting Manager / Is Under</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {subordinates.map((subordinate) => (
              <tr key={subordinate.id}>
                <td><b>{subordinate.name}</b></td>
                <td>{subordinate.role.name}</td>
                <td>
                  {subordinate.ancillary_roles_names && subordinate.ancillary_roles_names.length > 0
                    ? (
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
                              {subordinate.subordinates_count > 0 && (
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
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                    : '-'}
                </td>
                <td>{subordinate.is_under.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SubordinateTable;