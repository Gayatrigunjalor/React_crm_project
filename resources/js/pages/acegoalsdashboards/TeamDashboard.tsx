import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PrimaryTeamDashboard from "../acegoalsdashboards/PrimaryTeamDash";
import WebteamDashboard from "../acegoalsdashboards/WebteamDashboard";
import UxTeamDashboard from "../acegoalsdashboards/UxTeamDashboard";
import axiosInstance from '../../axios';

interface Role {
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

interface KpiDistributionSummary {
    user_id: number;
    employee_name: string;
    total_number: number;
    total_currency: number;
    target_dnd: number;
}

interface KpiPerformanceSummary {
    user_id: number;
    employee_name: string;
    total_assigned: number;
    target_completed: number;
}

interface Target {
    target_type: string;
    total_assigned: number;
    total_completed: number;
}

interface KpiPerformanceCompletedSummary {
    user_id: number;
    employee_name: string;
    targets: Target[];
}

interface TeamDashboardData {
    employee: {
        id: number;
        user_id: number;
        name: string;
        role_id: number;
        role_name: string;
        leadership_kpi_id: number;
        leadership_kpi_name: string;
        aceAndGoalPreference: AceAndGoalPreference[];
    };
    ancillary_roles: Role[];
    kpiDistributionSummary: KpiDistributionSummary[];
    kpiPerformanceSummary: KpiPerformanceSummary[];
    deptWiseKpiDistribution: Record<string, number>;
    kpiPerformanceCompletedSummary: KpiPerformanceCompletedSummary[];
}

type DashboardType = 'main' | 'primary' | 'WebteamDashboard' | 'UxTeamDashboard';

interface DepartmentMapping {
    [key: string]: string;
}

const departmentNames: DepartmentMapping = {
    "234": "Development",
    "137": "Design",
    "38": "Marketing"
};

const TeamDashboard = () => {
    const [activeDashboard, setActiveDashboard] = useState<DashboardType>('main');
    const [dashboardData, setDashboardData] = useState<TeamDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

    const fetchTeamDashboardData = async (roleId: number = 0) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/firstLineTeamDashboard?role_id=' + roleId);
            if (response.data) {
                setDashboardData(response.data);
                setCurrentRoleId(roleId);
            }
        } catch (error) {
            console.error('Error fetching team dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTeamDashboardData();
    }, []);

    useEffect(() => {
        const fetchDataForRole = async () => {
            if (activeDashboard === 'main') {
                await fetchTeamDashboardData();
            } else if (activeDashboard === 'primary' && dashboardData?.employee.role_id) {
                const roleId = dashboardData.employee.role_id;
                if (roleId !== currentRoleId) {
                    await fetchTeamDashboardData(roleId);
                }
            } else if (typeof activeDashboard === 'string' && !isNaN(Number(activeDashboard))) {
                const roleId = Number(activeDashboard);
                if (roleId !== currentRoleId) {
                    await fetchTeamDashboardData(roleId);
                }
            }
        };

        fetchDataForRole();
    }, [activeDashboard, dashboardData?.employee.role_id]);

    const handleRoleChange = (roleType: DashboardType) => {
        setActiveDashboard(roleType);
        setCurrentRoleId(null);
    };

    const getVisibleRoles = () => {
        if (!dashboardData) return { ancillary: [], bypassed: [] };

        const visibleRoles = dashboardData.ancillary_roles.filter(role => {
            const preference = dashboardData.employee.aceAndGoalPreference.find(
                pref => pref.role_id === role.id
            );
            return !preference || (preference && preference.isHidden === 0);
        });

        const bypassedRoles = visibleRoles.filter(role => {
            const preference = dashboardData.employee.aceAndGoalPreference.find(
                pref => pref.role_id === role.id
            );
            return preference && preference.isBypass === 1;
        });

        const activeRoles = visibleRoles.filter(role => {
            const preference = dashboardData.employee.aceAndGoalPreference.find(
                pref => pref.role_id === role.id
            );
            return !preference || (preference && preference.isBypass === 0);
        });

        return {
            ancillary: activeRoles,
            bypassed: bypassedRoles
        };
    };

    const { ancillary, bypassed } = getVisibleRoles();

    const getKpiDistributionData = () => {
        if (!dashboardData?.kpiDistributionSummary) return {
            labels: [],
            datasets: []
        };

        const labels = dashboardData.kpiDistributionSummary.map(item => item.employee_name);

        return {
            labels,
            datasets: [
                {
                    label: "Target: Number",
                    backgroundColor: "#20c997",
                    data: dashboardData.kpiDistributionSummary.map(item => item.total_number),
                    barThickness: 12,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
                {
                    label: "Target: Done / Not Done",
                    backgroundColor: "#0dcaf0",
                    data: dashboardData.kpiDistributionSummary.map(item => item.target_dnd),
                    barThickness: 12,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
                {
                    label: "Target: Currency",
                    backgroundColor: "#b197fc",
                    data: dashboardData.kpiDistributionSummary.map(item => item.total_currency),
                    barThickness: 12,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
            ],
        };
    };

    const getKpiPerformanceData = () => {
        if (!dashboardData?.kpiPerformanceSummary) return {
            labels: [],
            datasets: []
        };

        const labels = dashboardData.kpiPerformanceSummary.map(item => item.employee_name);

        return {
            labels,
            datasets: [
                {
                    label: "Total KPI's Assigned",
                    backgroundColor: "#a259e6",
                    data: dashboardData.kpiPerformanceSummary.map(item => item.total_assigned),
                    barThickness: 12,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
                {
                    label: "Total KPI's Completed",
                    backgroundColor: "#6f42c1",
                    data: dashboardData.kpiPerformanceSummary.map(item => item.target_completed),
                    barThickness: 12,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
            ],
        };
    };

    const getKpiPerformanceSummaryData = () => {
        if (!dashboardData?.kpiPerformanceCompletedSummary) return {
            labels: [],
            datasets: []
        };

        const labels = dashboardData.kpiPerformanceCompletedSummary.map((item: KpiPerformanceCompletedSummary) => item.employee_name);

        const numberData = dashboardData.kpiPerformanceCompletedSummary.map((item: KpiPerformanceCompletedSummary) =>
            item.targets.find((t: Target) => t.target_type === 'number')?.total_assigned || 0
        );
        const currencyData = dashboardData.kpiPerformanceCompletedSummary.map((item: KpiPerformanceCompletedSummary) =>
            item.targets.find((t: Target) => t.target_type === 'currency')?.total_assigned || 0
        );
        const dndData = dashboardData.kpiPerformanceCompletedSummary.map((item: KpiPerformanceCompletedSummary) =>
            item.targets.find((t: Target) => t.target_type === 'Done/Not Done')?.total_assigned || 0
        );

        return {
            labels,
            datasets: [
                {
                    label: "Target: Number",
                    backgroundColor: "#20c997",
                    data: numberData,
                    barThickness: 14,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
                {
                    label: "Target: Done / Not Done",
                    backgroundColor: "#b197fc",
                    data: dndData,
                    barThickness: 14,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
                {
                    label: "Target: Currency",
                    backgroundColor: "#0dcaf0",
                    data: currencyData,
                    barThickness: 14,
                    categoryPercentage: 0.5,
                    barPercentage: 0.4,
                },
            ],
        };
    };

    const getDepartmentWiseData = () => {
        if (!dashboardData?.deptWiseKpiDistribution) return {
            labels: [],
            datasets: []
        };

        const deptData = Object.entries(dashboardData.deptWiseKpiDistribution);
        const labels = deptData.map(([deptName]) => deptName);
        const data = deptData.map(([, count]) => count);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ["#6f42c1", "#b197fc", "#0dcaf0"],
                    borderWidth: 0,
                    hoverOffset: 15,
                },
            ],
        };
    };

    const renderDashboardContent = () => {
        if (loading) {
            return <div className="text-center py-5">Loading...</div>;
        }

        const commonCharts = (
            <>
                <Row className="mb-4 g-4">
                    <ChartCard title="KPI Distribution Summary" data={getKpiDistributionData()} />
                    <ChartCard title="KPI Performance Summary" data={getKpiPerformanceData()} />
                </Row>

                <Row className="g-4 mb-4">
                    <Col md={6} className="mb-4">
                        <h3 className="mb-4 fw-bold" style={{ color: "#000", marginTop: "20px" }}>Department Wise KPI Distribution</h3>
                        <Card className="shadow-sm rounded-5 h-100" style={{ padding: "2rem", marginTop: "20px" }}>
                            <div style={{ height: "400px", position: "relative" }}>
                                <DoughnutChart data={getDepartmentWiseData()} />
                            </div>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <h3 className="mb-4 fw-bold" style={{ color: "#000", marginTop: "20px" }}>KPI Performance Completed Summary</h3>
                        <Card className="shadow-sm rounded-5 h-100" style={{ padding: "2rem", marginTop: "20px" }}>
                            <div style={{ height: "400px", position: "relative" }}>
                                <Bar
                                    data={getKpiPerformanceSummaryData()}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                align: "start",
                                                position: "top",
                                                labels: {
                                                    boxWidth: 14,
                                                    boxHeight: 14,
                                                    font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                                    color: "#000",
                                                    padding: 10,
                                                    usePointStyle: true,
                                                },
                                            },
                                            datalabels: {
                                                anchor: "end",
                                                align: "end",
                                                color: "#222",
                                                font: { weight: "bold", size: 12, family: "'Inter', sans-serif" },
                                                offset: 12,
                                                display: (context) => {
                                                    const value = context.dataset.data[context.dataIndex];
                                                    return value > 0;
                                                },
                                                formatter: (value: number) => value.toLocaleString(),
                                            }
                                        },
                                        layout: {
                                            padding: { top: 50, right: 25, left: 20, bottom: 10 },
                                        },
                                        scales: {
                                            x: {
                                                grid: { display: false },
                                                ticks: {
                                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                                    color: "#000",
                                                    maxRotation: 0,
                                                    minRotation: 0,
                                                    padding: 10,
                                                },
                                            },
                                            y: {
                                                grid: {
                                                    color: "#e5e7eb",
                                                    display: true,
                                                },
                                                ticks: {
                                                    display: false,
                                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                                    color: "#000",
                                                    padding: 10,
                                                    callback: (value) => value,
                                                },
                                                beginAtZero: true,
                                                suggestedMax: (() => {
                                                    const rawMax = Math.max(...getKpiPerformanceSummaryData().datasets.flatMap(d => d.data as number[]));
                                                    return Math.ceil(rawMax * 1.15);
                                                })(),
                                                title: {
                                                    display: true,
                                                    text: "Number of Tasks",
                                                    font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                                    color: "#000",
                                                    padding: { bottom: 8 },
                                                },
                                            },
                                        },
                                        interaction: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                    }}
                                    plugins={[ChartDataLabels]}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </>
        );

        switch (activeDashboard) {
            case 'main':
                return commonCharts;
            case 'primary':
                return <PrimaryTeamDashboard dashboardData={dashboardData} />;
            case 'WebteamDashboard':
                return <WebteamDashboard />;
            case 'UxTeamDashboard':
                return <UxTeamDashboard />;
            default:
                return commonCharts;
        }
    };

    return (
        <Container fluid className="p-4" style={{ background: "#f6f9fc", minHeight: "100vh" }}>
            <div className="d-flex justify-content-between mb-4" style={{ gap: 30 }}>
                <RoleTab
                    title="All Team Dashboard"
                    isActive={activeDashboard === 'main'}
                    onClick={() => handleRoleChange('main')}
                />

                <div style={{ flex: 1, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "8px 10px", minWidth: 120 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#000" }}>Primary Role</div>
                    <button
                        style={{
                            width: "100%",
                            background: activeDashboard === 'primary' ? "#2563eb" : "#fff",
                            color: activeDashboard === 'primary' ? "#fff" : "#2563eb",
                            border: "none",
                            borderRadius: 8,
                            fontWeight: 500,
                            fontSize: 14,
                            padding: "7px 0",
                            marginBottom: 0,
                            boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                            cursor: "pointer",
                        }}
                        onClick={() => handleRoleChange('primary')}
                    >
                        {dashboardData?.employee.role_name || 'Loading...'}
                    </button>
                </div>

                <div style={{ flex: 2, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "10px 16px", minWidth: 440 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#000" }}>Ancillary Role</div>
                    <div className="d-flex" style={{ gap: 12, alignItems: "stretch" }}>
                        {ancillary.map((role) => (
                            <RoleButton
                                key={role.id}
                                title={role.name}
                                isActive={activeDashboard === role.id.toString()}
                                onClick={() => handleRoleChange(role.id.toString() as DashboardType)}
                            />
                        ))}
                        {bypassed.map((role) => (
                            <DisabledRoleButton key={role.id} title={role.name} />
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">Loading...</div>
            ) : (
                renderDashboardContent()
            )}
        </Container>
    );
};

const RoleTab = ({
    title,
    isActive,
    onClick,
}: {
    title: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <div style={{ flex: 1, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "8px 10px", minWidth: 120 }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "#000" }}>{title}</div>
        <button
            style={{
                width: "100%",
                background: isActive ? "#2563eb" : "#fff",
                color: isActive ? "#fff" : "#2563eb",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                padding: "7px 0",
                marginBottom: 0,
                boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                cursor: "pointer",
            }}
            onClick={onClick}
            type="button"
        >
            {title}
        </button>
    </div>
);

const RoleButton = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void }) => (
    <button
        style={{
            flex: 1,
            background: isActive ? "#2563eb" : "#fff",
            color: isActive ? "#fff" : "#2563eb",
            border: "none",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 12,
            padding: "6px 0",
            marginBottom: 0,
            boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
            height: "100%",
            cursor: "pointer",
        }}
        type="button"
        onClick={onClick}
    >
        {title}
    </button>
);

const DisabledRoleButton = ({ title }: { title: string }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <button
            style={{
                width: "100%",
                background: "#e5e7eb",
                color: "#d1d5db",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 12,
                padding: "6px 0",
                marginBottom: 0,
                position: "relative",
                flex: "1 1 auto",
                cursor: "not-allowed",
            }}
            disabled
            type="button"
        >
            {title}
        </button>
        <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4, textAlign: "center", fontWeight: 500 }}>
            (You are Bypassed For this Role)
        </div>
    </div>
);

const ChartCard = ({ title, data }: { title: string; data: any }) => (
    <Col md={6} className="mb-4">
        <h3 className="mb-4 fw-bold" style={{ color: "#000" }}>{title}</h3>
        <Card className="shadow-sm rounded-5 h-100" style={{ padding: "2rem" }}>
            <div style={{ height: "400px", position: "relative" }}>
                <Bar
                    data={data}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                align: "start",
                                position: "top",
                                labels: {
                                    boxWidth: 14,
                                    boxHeight: 14,
                                    font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    padding: 12,
                                    usePointStyle: true,
                                },
                            },
                            datalabels: {
                                anchor: "end",
                                align: "end",
                                color: "#222",
                                font: { weight: "bold", size: 12, family: "'Inter', sans-serif" },
                                offset: 12,
                                display: (context) => {
                                    const value = context.dataset.data[context.dataIndex];
                                    return value > 0;
                                },
                                formatter: (value: number) => value.toLocaleString(),
                            },
                        },
                        layout: {
                            padding: { top: 50, right: 25, left: 20, bottom: 10 },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    maxRotation: 0,
                                    minRotation: 0,
                                    padding: 10,
                                },
                            },
                            y: {
                                grid: {
                                    color: "#e5e7eb",
                                    display: true,
                                },
                                ticks: {
                                    display: false,
                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    padding: 10,
                                    callback: (value) => value,
                                },
                                beginAtZero: true,
                                suggestedMax: (() => {
                                    const rawMax = Math.max(...data.datasets.flatMap(d => d.data as number[]));
                                    return Math.ceil(rawMax * 1.15);
                                })(),
                                title: {
                                    display: true,
                                    text: "Number of Tasks",
                                    font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    padding: { bottom: 8 },
                                },
                            },
                        },
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                    }}
                    plugins={[ChartDataLabels]}
                />
            </div>
        </Card>
    </Col>
);

const DoughnutChart = ({ data }: { data: any }) => (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
        <Doughnut
            data={data}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "right",
                        align: "center",
                        labels: {
                            font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                            color: "#000",
                            padding: 15,
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                        }
                    },
                    datalabels: {
                        color: "#fff",
                        font: { weight: "bold", size: 14, family: "'Inter', sans-serif" },
                        formatter: (value: number, ctx: any) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a: number, b: number) => a + (b as number), 0);
                            const percentage = Math.round(((value as number) / sum) * 100);
                            return percentage > 5 ? percentage + '%' : ''; // Changed to string concatenation
                        },
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return label + ': ' + value + ' (' + percentage + '%)'; // Changed to string concatenation
                            }
                        }
                    }
                },
                cutout: '60%',
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
            }}
            plugins={[ChartDataLabels]}

        />
    </div>
);

export default TeamDashboard;

