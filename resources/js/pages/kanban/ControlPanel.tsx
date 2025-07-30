import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import ReverseBypass from '../../components/aceIcon/ReverseBypass.png';
import HideButton from '../../components/aceIcon/HideButton.png';
import Vector from '../../components/aceIcon/Vector.png';
import Frame from '../../components/aceIcon/Frame.png';
import CareerTable from './memberIcon';
import SubordinateTable from './Frameicon';
import RoleHidePopup from './hide';
import RoleBypassPopup from './bypass';
import axiosInstance from '../../axios';
import { set } from 'date-fns';
import Reverse from '../../components/aceIcon/Reverse.png';
import Unhide from '../../components/aceIcon/Unhide.png';

interface Department {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AncillaryRole {
  id: number;
  name: string;
}

interface IsUnderKpiRole {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

interface IsUnder {
  id: number;
  user_id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface LeadershipKpi {
  id: number;
  name: string;
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

interface EmployeeData {
  id: number;
  user_id: number;
  name: string;
  emp_id: string;
  department_id: number;
  is_under_id: number;
  role_id: number;
  leadership_kpi_id: number | null;
  ancillary_roles: string | null;
  ancillary_roles_names: AncillaryRole[];
  isUnderKpiRoles: IsUnderKpiRole[];
  position: string;
  is_under: IsUnder;
  role: Role;
  leadership_kpi: LeadershipKpi | null;
  ace_and_goal_preference: AceAndGoalPreference[];
}

interface AncillaryRoleDisplay {
  id: number;
  name: string;
}

const styles: any = {
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: '24px',
    gap: '16px',
  },
  tabButton: {
    borderRadius: '6px',
    border: '1px solid #d0d0d0',
    padding: '8px 16px',
    color: '#3b82f6',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    fontSize: '15px',
  },
  activeTabButton: {
    color: 'white',
    borderColor: '#3b82f6',
    background: '#3b82f6',
  },
  icon: {
    width: '26px',
    height: '17x',
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

const ControlPanel = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<{ id: number; name: string }>({ id: 0, name: '' });
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [showCareerTable, setShowCareerTable] = useState(false);
  const [showSubordinateTable, setShowSubordinateTable] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const [showHide, setShowHide] = useState(false);
  const [careerData, setCareerData] = useState<{ employee: any; isUnderEmployees: any[] }>({ employee: {}, isUnderEmployees: [] });
  const isDarkMode = document.body.classList.contains('dark');
  const [id, setUserId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleId, setRoleId] = useState(0);
  const [type, setType] = useState("");
  const [isBypass, setIsBypassed] = useState(false);
  const [isHide, setIsHided] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [immediateBoss, setImmediateBoss] = useState("");

  const fetchCareerData = async (userId: number) => {
    console.log('Fetching career data for user ID:', userId);
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('/aceAndGoalAllIsUnderUsers', {
        id: userId
      });
      setCareerData({
        employee: response.data.employee,
        isUnderEmployees: response.data.isUnderEmployees
      });
      setShowCareerTable(true);
    } catch (error) {
      console.error('Error fetching career data:', error);
    }
  };

  const refreshCareerData = async () => {
    if (careerData.employee?.id) {
      await fetchCareerData(careerData.employee.id);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/roleListing');
        setDepartments(response.data);
        if (response.data.length > 0) {
          setSelectedDepartment({ id: response.data[0].id, name: response.data[0].name });
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axiosInstance.post('/getEmployeesKpiList', {
          role_id: selectedDepartment.id
        });
        const formattedData = response.data.map((employee: EmployeeData) => {
          // Remove duplicate roles from isUnderKpiRoles based on id
          const uniqueKpiRoles = employee.isUnderKpiRoles.filter((role, index, self) =>
            index === self.findIndex((r) => r.id === role.id)
          );

          return {
            id: employee.id,
            user_id: employee.user_id,
            name: employee.name,
            boss: employee.is_under.name,
            leadership: employee.leadership_kpi ? `${employee.leadership_kpi.name}\n(Target Nontransferable)` : '-',
            primary: `${employee.position} - ${employee.role.name}`,
            ancillary: employee.ancillary_roles_names.map(role => ({
              id: role.id,
              name: `${employee.position} - ${role.name}`,
              preferences: employee.ace_and_goal_preference.find(pref => pref.role_id === role.id)
            })),
            kpiRoles: uniqueKpiRoles.map(role => {
              const existingPreference = employee.ace_and_goal_preference.find(pref => pref.role_id === role.id);
              return {
                id: role.id,
                name: `${employee.position} - ${role.name}`,
                preferences: existingPreference || {
                  id: 0,
                  user_id: employee.user_id,
                  role_id: role.id,
                  isHidden: 1,  // Default to hidden
                  isBypass: 1,  // Default to bypassed
                  created_at: null,
                  updated_at: null
                }
              };
            }),
          };
        });
        setTableData(formattedData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setTableData([]);
      }
    };

    if (selectedDepartment.id) {
      fetchEmployeeData();
    }
  }, [selectedDepartment]);

  const handleShowBypass = () => setShowBypass(true);
  const handleCloseBypass = () => {
    setShowBypass(false);
    // Refresh data after bypass changes
    const fetchEmployeeData = async () => {
      try {
        const response = await axiosInstance.post('/getEmployeesKpiList', {
          role_id: selectedDepartment.id
        });
        const formattedData = response.data.map((employee: EmployeeData) => {
          // Remove duplicate roles from isUnderKpiRoles based on id
          const uniqueKpiRoles = employee.isUnderKpiRoles.filter((role, index, self) =>
            index === self.findIndex((r) => r.id === role.id)
          );

          return {
            id: employee.id,
            user_id: employee.user_id,
            name: employee.name,
            boss: employee.is_under.name,
            leadership: employee.leadership_kpi ? `${employee.leadership_kpi.name}\n(Target Nontransferable)` : '-',
            primary: `${employee.position} - ${employee.role.name}`,
            ancillary: employee.ancillary_roles_names.map(role => ({
              id: role.id,
              name: `${employee.position} - ${role.name}`,
              preferences: employee.ace_and_goal_preference.find(pref => pref.role_id === role.id)
            })),
            kpiRoles: uniqueKpiRoles.map(role => {
              const existingPreference = employee.ace_and_goal_preference.find(pref => pref.role_id === role.id);
              return {
                id: role.id,
                name: `${employee.position} - ${role.name}`,
                preferences: existingPreference || {
                  id: 0,
                  user_id: employee.user_id,
                  role_id: role.id,
                  isHidden: 1,  // Default to hidden
                  isBypass: 1,  // Default to bypassed
                  created_at: null,
                  updated_at: null
                }
              };
            }),
          };
        });
        setTableData(formattedData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setTableData([]);
      }
    };
    fetchEmployeeData();
  };
  const handleShowHide = () => setShowHide(true);
  const handleCloseHide = () => {
    setShowHide(false);
    // Refresh data after hide changes
    const fetchEmployeeData = async () => {
      try {
        const response = await axiosInstance.post('/getEmployeesKpiList', {
          role_id: selectedDepartment.id
        });
        const formattedData = response.data.map((employee: EmployeeData) => {
          // Remove duplicate roles from isUnderKpiRoles based on id
          const uniqueKpiRoles = employee.isUnderKpiRoles.filter((role, index, self) =>
            index === self.findIndex((r) => r.id === role.id)
          );

          return {
            id: employee.id,
            user_id: employee.user_id,
            name: employee.name,
            boss: employee.is_under.name,
            leadership: employee.leadership_kpi ? `${employee.leadership_kpi.name}\n(Target Nontransferable)` : '-',
            primary: `${employee.position} - ${employee.role.name}`,
            ancillary: employee.ancillary_roles_names.map(role => ({
              id: role.id,
              name: `${employee.position} - ${role.name}`,
              preferences: employee.ace_and_goal_preference.find(pref => pref.role_id === role.id)
            })),
            kpiRoles: uniqueKpiRoles.map(role => {
              const existingPreference = employee.ace_and_goal_preference.find(pref => pref.role_id === role.id);
              return {
                id: role.id,
                name: `${employee.position} - ${role.name}`,
                preferences: existingPreference || {
                  id: 0,
                  user_id: employee.user_id,
                  role_id: role.id,
                  isHidden: 1,  // Default to hidden
                  isBypass: 1,  // Default to bypassed
                  created_at: null,
                  updated_at: null
                }
              };
            }),
          };
        });
        setTableData(formattedData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setTableData([]);
      }
    };
    fetchEmployeeData();
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <RoleBypassPopup
        show={showBypass}
        id={id}
        role_id={roleId}
        roleName={roleName}
        isbypassed={isBypass}
        type={type}
        managerName={managerName}
        immediateBoss={immediateBoss}
        handleClose={handleCloseBypass}
        handleSave={handleCloseBypass}
      />

      <RoleHidePopup
        show={showHide}
        id={id}
        role_id={roleId}
        roleName={roleName}
        isHided={isHide}
        type={type}
        managerName={managerName}
        immediateBoss={immediateBoss}
        handleClose={handleCloseHide}
        handleSave={handleCloseHide}
      />

      {showSubordinateTable ? (
        <SubordinateTable
          onBack={() => setShowSubordinateTable(false)}
          activeTab={selectedDepartment.name}
          userId={id}
          roleId={roleId}
        />
      ) : showCareerTable ? (
        <CareerTable
          onBack={() => setShowCareerTable(false)}
          activeTab={selectedDepartment.id}
          employee={careerData.employee}
          isUnderEmployees={careerData.isUnderEmployees}
          onDataRefresh={refreshCareerData}
        />
      ) : (
        <>
          <div style={styles.tabs}>
            {departments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => setSelectedDepartment({ id: dept.id, name: dept.name })}
                style={{
                  ...styles.tabButton,
                  ...(selectedDepartment.id === dept.id ? styles.activeTabButton : {}),
                }}
              >
                {dept.name}
              </div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table
              bordered
              hover
              responsive
              style={{
                minWidth: '100%',
                fontSize: '16px',
                width: '1800px',
                height: '80px',
                flexGrow: 0,
                padding: '0 0 0 1px',
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', verticalAlign: 'middle', padding: '18px', fontSize: '16px', lineHeight: 1.2 }}>
                    Manager Name
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, visibility: 'hidden' }}>(subline)</div>
                  </th>
                  <th style={{ textAlign: 'center', verticalAlign: 'middle', padding: '18px', fontSize: '16px', lineHeight: 1.2 }}>
                    Immediate Boss
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, visibility: 'hidden' }}>(subline)</div>
                  </th>
                  <th style={{ textAlign: 'center', verticalAlign: 'middle', padding: '18px', fontSize: '16px', lineHeight: 1.2 }}>
                    Leadership KPI
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, visibility: 'hidden' }}>(subline)</div>
                  </th>
                  <th style={{ padding: '18px', fontSize: '16px', textAlign: 'center', lineHeight: 1.2 }}>
                    Primary Role KPI
                    <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 500, marginTop: 4 }}>(BT purpose)</div>
                  </th>
                  <th style={{ padding: '18px', fontSize: '16px', textAlign: 'center', lineHeight: 1.2 }}>
                    Ancillary Role KPI
                    <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 500, marginTop: 4 }}>(Team Management)</div>
                  </th>
                  <th style={{ padding: '18px', fontSize: '16px', textAlign: 'center', lineHeight: 1.2 }}>
                    Is under KPI Role
                    <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 500, marginTop: 4 }}>(Is Under KPI's)</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        padding: '15px',
                        fontWeight: 600,
                        fontSize: '16px',
                        minWidth: 240,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          maxWidth: 220,
                          margin: '0 auto',
                        }}
                      >
                        <span>{row.name}</span>
                        <img
                          src={Vector}
                          alt="vector icon"
                          style={{ ...styles.icon, marginLeft: 0, marginBottom: 0 }}
                          onClick={() => fetchCareerData(row.id)}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', fontSize: '16px' }}>{row.boss}</td>
                    <td style={{ whiteSpace: 'pre-line', padding: '16px', verticalAlign: 'middle', fontSize: '16px' }}>{row.leadership}</td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', fontSize: '16px', textAlign: 'center' }}>
                      <div>{row.primary}</div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {row.ancillary.map((role: any, index: number) => (
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
                              <img
                                src={Frame}
                                alt="frame icon"
                                style={styles.icon}
                                onClick={() => {
                                  setShowSubordinateTable(true);
                                  setUserId(row.id);
                                  setRoleId(role.id);
                                }}
                              />
                              {role.preferences ? (
                                <>
                                  {role.preferences.isBypass === 0 ? (
                                    <img
                                      src={ReverseBypass}
                                      alt="Bypass icon"
                                      style={styles.icon}
                                      onClick={() => {
                                        handleShowBypass();
                                        setType('bypass');
                                        setIsBypassed(false);
                                        setUserId(row.user_id);
                                        setRoleId(role.id);
                                        setRoleName(role.name);
                                        setManagerName(row.name);
                                        setImmediateBoss(row.boss);
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={Reverse}
                                      alt="Unbypass icon"
                                      style={{ ...styles.icon}}
                                      onClick={() => {
                                        handleShowBypass();
                                        setIsBypassed(true);
                                        setType('unbypass');
                                        setUserId(row.user_id);
                                        setRoleId(role.id);
                                        setRoleName(role.name);
                                        setManagerName(row.name);
                                        setImmediateBoss(row.boss);
                                      }}
                                    />
                                  )}
                                  {role.preferences.isHidden === 0 ? (
                                    <img
                                      src={HideButton}
                                      alt="Hide icon"
                                      style={styles.icon}
                                      onClick={() => {
                                        handleShowHide();
                                        setIsHided(false);
                                        setType('hide');
                                        setUserId(row.user_id);
                                        setRoleId(role.id);
                                        setRoleName(role.name);
                                        setManagerName(row.name);
                                        setImmediateBoss(row.boss);
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={Unhide}
                                      alt="Unhide icon"
                                      style={{ ...styles.icon}}
                                      onClick={() => {
                                        handleShowHide();
                                        setIsHided(true);
                                        setType('unhide');
                                        setUserId(row.user_id);
                                        setRoleName(role.name);
                                        setRoleId(role.id);
                                        setManagerName(row.name);
                                        setImmediateBoss(row.boss);
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
                                      handleShowBypass();
                                      setType('bypass');
                                      setUserId(row.user_id);
                                      setRoleId(role.id);
                                      setRoleName(role.name);
                                      setManagerName(row.name);
                                      setImmediateBoss(row.boss);
                                    }}
                                  />
                                  <img
                                    src={HideButton}
                                    alt="Hide icon"
                                    style={styles.icon}
                                    onClick={() => {
                                      handleShowHide();
                                      setType('hide');
                                      setUserId(row.user_id);
                                      setRoleId(role.id);
                                      setRoleName(role.name);
                                      setManagerName(row.name);
                                      setImmediateBoss(row.boss);
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {row.kpiRoles && row.kpiRoles.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {row.kpiRoles.map((role: any, i: number) => {
                            const isCommonRole = row.ancillary.some((ancillaryRole: any) =>
                              ancillaryRole.name === role.name
                            );

                            return (
                              <div
                                key={i}
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
                                  <img
                                    src={Frame}
                                    alt="frame icon"
                                    style={styles.icon}
                                    onClick={() => {
                                      setShowSubordinateTable(true);
                                      setUserId(row.id);
                                      setRoleId(role.id);
                                    }}
                                  />
                                  {!isCommonRole && (
                                    <>
                                      {role.preferences ? (
                                        <>
                                          {role.preferences.isBypass === 0 ? (
                                            <img
                                              src={ReverseBypass}
                                              alt="Bypass icon"
                                              style={styles.icon}
                                              onClick={() => {
                                                handleShowBypass();
                                                setType('bypass');
                                                setIsBypassed(false);
                                                setUserId(row.user_id);
                                                setRoleId(role.id);
                                                setRoleName(role.name);
                                                setManagerName(row.name);
                                                setImmediateBoss(row.boss);
                                              }}
                                            />
                                          ) : (
                                            <img
                                              src={Reverse}
                                              alt="Unbypass icon"
                                              style={{ ...styles.icon }}
                                              onClick={() => {
                                                handleShowBypass();
                                                setIsBypassed(true);
                                                setType('unbypass');
                                                setUserId(row.user_id);
                                                setRoleId(role.id);
                                                setRoleName(role.name);
                                                setManagerName(row.name);
                                                setImmediateBoss(row.boss);
                                              }}
                                            />
                                          )}
                                          {role.preferences.isHidden === 0 ? (
                                            <img
                                              src={HideButton}
                                              alt="Hide icon"
                                              style={styles.icon}
                                              onClick={() => {
                                                handleShowHide();
                                                setIsHided(false);
                                                setType('hide');
                                                setUserId(row.user_id);
                                                setRoleId(role.id);
                                                setRoleName(role.name);
                                                setManagerName(row.name);
                                                setImmediateBoss(row.boss);
                                              }}
                                            />
                                          ) : (
                                            <img
                                              src={Unhide}
                                              alt="Unhide icon"
                                              style={{ ...styles.icon }}
                                              onClick={() => {
                                                handleShowHide();
                                                setIsHided(true);
                                                setType('unhide');
                                                setUserId(row.user_id);
                                                setRoleId(role.id);
                                                setRoleName(role.name);
                                                setManagerName(row.name);
                                                setImmediateBoss(row.boss);
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
                                              handleShowBypass();
                                              setType('bypass');
                                              setUserId(row.user_id);
                                              setRoleId(role.id);
                                              setRoleName(role.name);
                                              setManagerName(row.name);
                                              setImmediateBoss(row.boss);
                                            }}
                                          />
                                          <img
                                            src={HideButton}
                                            alt="Hide icon"
                                            style={styles.icon}
                                            onClick={() => {
                                              handleShowHide();
                                              setType('hide');
                                              setUserId(row.user_id);
                                              setRoleId(role.id);
                                              setRoleName(role.name);
                                              setManagerName(row.name);
                                              setImmediateBoss(row.boss);
                                            }}
                                          />
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: 22, color: '#bdbdbd' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default ControlPanel;