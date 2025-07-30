import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartOptions,
    ChartData,
    ScriptableContext
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import PrimaryDashboard from './PrimaryRole';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import WebdevlopmentDashboard from "./WebdevlopementDashboard";
import UxDashboard from './Ux';
import TeamDashboard from './TeamDashboard';
import axiosInstance from '../../axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

interface Role {
    id: number;
    name: string;
}

interface DashboardData {
    employee: {
        id: number;
        user_id: number;
        name: string;
        role_id: number;
        role_name: string;
        leadership_kpi_id: number;
        leadership_kpi_name: string;
        position: string;
        aceAndGoalPreference: Array<{
            role_id: number;
            isBypass: number;
            isHidden: number;
        }>;
    };
    ancillary_roles: Role[];
    totalKpiCount: number;
    kpiStatusGraph: Array<{
        to_do_count?: number;
        in_progress_count?: number;
        hold_count?: number;
        abort_count?: number;
        review_count?: number;
        complete_count?: number;
        false_report_count?: number;
    }>;
    kpiPriorityGraph: Array<{
        directors_priority_count?: number;
        salary_hold_count?: number;
        urgent_count?: number;
        high_count?: number;
        medium_count?: number;
        low_count?: number;
    }>;
    kpiTargetWiseProgressGraph: Array<{
        kpisTotalNumberCount?: number;
        kpisTotalDndCount?: number;
        kpisTotalCurrencyCount?: number;
        to_do_number_count?: number;
        to_do_currency_count?: number;
        to_do_dnd_count?: number;
        in_progress_number_count?: number;
        in_progress_currency_count?: number;
        in_progress_dnd_count?: number;
        hold_number_count?: number;
        hold_currency_count?: number;
        hold_dnd_count?: number;
        abort_number_count?: number;
        abort_currency_count?: number;
        abort_dnd_count?: number;
        review_number_count?: number;
        review_currency_count?: number;
        review_dnd_count?: number;
        complete_number_count?: number;
        complete_currency_count?: number;
        complete_dnd_count?: number;
        false_report_number_count?: number;
        false_report_currency_count?: number;
        false_report_dnd_count?: number;
    }>;
    targetDistributionGraph: {
        targetNumberPercent: number;
        targetCurrencyPercent: number;
        targetDndPercent: number;
    };
    performanceMatrixCounts: {
        kpisTotalCount: number;
        kpisTotalNumberCount: number;
        kpisTotalDndCount: number;
        kpisTotalCurrencyCount: number;
        kpisCompletedNumberCount: number;
        kpisCompletedDndCount: number;
        kpisCompletedCurrencyCount: number;
    };
}

const FirstLineDashboard = () => {
    const [mainTab, setMainTab] = useState<'my' | 'team'>('my');
    const [activeDashboard, setActiveDashboard] = useState<string | null>('main');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<{
        leadership: Role | null;
        primary: Role | null;
        ancillary: Role[];
    }>({
        leadership: null,
        primary: null,
        ancillary: []
    });

    useEffect(() => {
        if (!roles.leadership?.id) {
            axiosInstance.get('/kpiGraphsLevelZero').then(response => {
                if (response.data.employee) {
                    setRoles({
                        leadership: {
                            id: response.data.employee.leadership_kpi_id,
                            name: 'My KPI'
                        },
                        primary: {
                            id: response.data.employee.role_id,
                            name: response.data.employee.role_name
                        },
                        ancillary: response.data.ancillary_roles || []
                    });
                }
            });
        }
        // eslint-disable-next-line
    }, []);

    const fetchDashboardData = async (roleId?: number) => {
        try {
            setLoading(true);
            const url = roleId ? `/kpiGraphsLevelZero?role_id=${roleId}` : '/kpiGraphsLevelZero';
            const response = await axiosInstance.get(url);
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mainTab === 'my') {
            if (activeDashboard === 'main' && roles.leadership?.id) {
                fetchDashboardData(roles.leadership.id);
            } else if (activeDashboard === 'primary') {
                fetchDashboardData();
            } else if (activeDashboard === 'webdev') {
                fetchDashboardData(18);
            } else if (activeDashboard === 'Ux') {
                fetchDashboardData(21);
            } else if (
                activeDashboard &&
                activeDashboard !== 'main' &&
                activeDashboard !== 'primary' &&
                activeDashboard !== 'webdev' &&
                activeDashboard !== 'Ux'
            ) {
                fetchDashboardData(parseInt(activeDashboard));
            }
        }
    }, [mainTab, activeDashboard, roles.leadership?.id]);

    const chartOptions: ChartOptions<'bar'> = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            datalabels: {
                anchor: 'end',
                align: 'start',
                color: '#222',
                font: {
                    weight: 'bold',
                    size: 12
                },
                clip: false,
                formatter: (value: any) => {
                    if (typeof value === 'number' && Number.isFinite(value)) {
                        return Math.round(value);
                    }
                    if (Array.isArray(value) && typeof value[0] === 'number' && Number.isFinite(value[0])) {
                        return Math.round(value[0]);
                    }
                    return '';
                },
                padding: {
                    top: 0,
                    bottom: 0
                }
            }
        },
        responsive: true,
        layout: {
            padding: {
                top: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#eaeaea' },
                title: {
                    display: true,
                    text: 'Number of Tasks',
                    font: { size: 12, weight: 'bold' }
                },
                ticks: {
                    display: false
                }
            }
        }
    };

    const barChartOptions = chartOptions;
    const kpiStatusOptions = chartOptions;
    const targetProgressOptions = chartOptions;

    const barChartData: ChartData<'bar'> = {
        labels: [
            'Total Tasks',
            'Urgent',
            'Low',
            'Medium',
            'High',
            'Director Priority',
            'Salary Hold'
        ],
        datasets: [
            {
                label: 'Number of Tasks',
                data: dashboardData ? [
                    dashboardData.totalKpiCount,
                    dashboardData.kpiPriorityGraph[2]?.urgent_count || 0,
                    dashboardData.kpiPriorityGraph[5]?.low_count || 0,
                    dashboardData.kpiPriorityGraph[4]?.medium_count || 0,
                    dashboardData.kpiPriorityGraph[3]?.high_count || 0,
                    dashboardData.kpiPriorityGraph[0]?.directors_priority_count || 0,
                    dashboardData.kpiPriorityGraph[1]?.salary_hold_count || 0
                ] : [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: function (context: ScriptableContext<'bar'>) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return '#7b1fa2';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#7b1fa2");
                    gradient.addColorStop(1, "#e040fb");
                    return gradient;
                } as any,
                borderRadius: 12,
                barPercentage: 0.6,
                categoryPercentage: 0.6,
            },
        ],
    };

    const kpiStatusData: ChartData<'bar'> = {
        labels: [
            "Total Objectives",
            "To Do",
            "In Progress",
            "Hold",
            "Abort",
            "Review",
            "Complete",
            "False Report"
        ],
        datasets: [
            {
                label: "Number of Tasks",
                data: dashboardData ? [
                    dashboardData.totalKpiCount,
                    dashboardData.kpiStatusGraph[0]?.to_do_count || 0,
                    dashboardData.kpiStatusGraph[1]?.in_progress_count || 0,
                    dashboardData.kpiStatusGraph[2]?.hold_count || 0,
                    dashboardData.kpiStatusGraph[3]?.abort_count || 0,
                    dashboardData.kpiStatusGraph[4]?.review_count || 0,
                    dashboardData.kpiStatusGraph[5]?.complete_count || 0,
                    dashboardData.kpiStatusGraph[6]?.false_report_count || 0
                ] : [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: function (context: ScriptableContext<'bar'>) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return '#7b1fa2';
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#7b1fa2");
                    gradient.addColorStop(1, "#e040fb");
                    return gradient;
                } as any,
                borderRadius: 12,
                barPercentage: 0.6,
                categoryPercentage: 0.6,
            }
        ]
    };

    const targetProgressData: ChartData<'bar'> = {
        labels: [
            'Total Objectives',
            'To Do',
            'In Progress',
            'Hold',
            'Abort',
            'Review',
            'Complete',
            'False Report'
        ],
        datasets: [
            {
                label: 'Target : Number',
                data: dashboardData ? [
                    dashboardData.kpiTargetWiseProgressGraph[0]?.kpisTotalNumberCount || 0,
                    dashboardData.kpiTargetWiseProgressGraph[1]?.to_do_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[2]?.in_progress_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[3]?.hold_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[4]?.abort_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[5]?.review_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[6]?.complete_number_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[7]?.false_report_number_count || 0
                ] : [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#20c997',
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
            {
                label: 'Target : Done / Not Done',
                data: dashboardData ? [
                    dashboardData.kpiTargetWiseProgressGraph[0]?.kpisTotalDndCount || 0,
                    dashboardData.kpiTargetWiseProgressGraph[1]?.to_do_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[2]?.in_progress_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[3]?.hold_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[4]?.abort_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[5]?.review_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[6]?.complete_dnd_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[7]?.false_report_dnd_count || 0
                ] : [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#0dcaf0',
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
            {
                label: 'Target : Currency',
                data: dashboardData ? [
                    dashboardData.kpiTargetWiseProgressGraph[0]?.kpisTotalCurrencyCount || 0,
                    dashboardData.kpiTargetWiseProgressGraph[1]?.to_do_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[2]?.in_progress_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[3]?.hold_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[4]?.abort_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[5]?.review_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[6]?.complete_currency_count || 0,
                    dashboardData.kpiTargetWiseProgressGraph[7]?.false_report_currency_count || 0
                ] : [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#6f42c1',
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
        ],
    };

    const targetProgressDoughnutData: ChartData<'doughnut'> = {
        labels: ['Target : Number', 'Target : Done / Not Done', 'Target : Currency'],
        datasets: [
            {
                data: dashboardData ? [
                    dashboardData.targetDistributionGraph.targetNumberPercent || 0,
                    dashboardData.targetDistributionGraph.targetDndPercent || 0,
                    dashboardData.targetDistributionGraph.targetCurrencyPercent || 0
                ] : [0, 0, 0],
                backgroundColor: ['#0dcaf0', '#b197fc', '#6f42c1'],
                borderWidth: 0,
            },
        ],
    };

    const calculateTotalPercentage = () => {
        return 100;
    };

    const targetProgressDoughnutOptions: ChartOptions<'doughnut'> = {
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    const performanceMetrics = dashboardData ? [
        { label: "Total KPIs Assigned", value: dashboardData.performanceMatrixCounts.kpisTotalCount, max: dashboardData.performanceMatrixCounts.kpisTotalCount },
        { label: "KPI: Target in Number", value: dashboardData.performanceMatrixCounts.kpisTotalNumberCount, max: dashboardData.performanceMatrixCounts.kpisTotalNumberCount },
        { label: "KPI: Target Done/Not-Done", value: dashboardData.performanceMatrixCounts.kpisTotalDndCount, max: dashboardData.performanceMatrixCounts.kpisTotalDndCount },
        { label: "KPI: Target in Currency", value: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount, max: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount },
        { label: "KPI: Target in Number - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedNumberCount, max: dashboardData.performanceMatrixCounts.kpisTotalNumberCount },
        { label: "KPI: Target Done/Not Done - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedDndCount, max: dashboardData.performanceMatrixCounts.kpisTotalDndCount },
        { label: "KPI: Target in Currency - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedCurrencyCount, max: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount },
    ] : [];

    // Define a safe formatter function for datalabels
    const safeDataLabelFormatter = (value: any) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value > 0 ? Math.round(value) : '';
        }
        if (Array.isArray(value) && typeof value[0] === 'number' && Number.isFinite(value[0])) {
            return value[0] > 0 ? Math.round(value[0]) : '';
        }
        return '';
    };

    return (
        <Container fluid className="p-4 ">
            {/* Header Navigation */}
            <div className="d-flex align-items-center mb-2" style={{ gap: 30 }}>
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: mainTab === 'my' ? "#2563eb" : "#111",
                        borderBottom: mainTab === 'my' ? "3px solid #2563eb" : "none",
                        paddingBottom: 2,
                        cursor: "pointer"
                    }}
                    onClick={() => setMainTab('my')}
                >
                    My Dashboard
                </div>
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: mainTab === 'team' ? "#2563eb" : "#111",
                        borderBottom: mainTab === 'team' ? "3px solid #2563eb" : "none",
                        paddingBottom: 2,
                        cursor: "pointer"
                    }}
                    onClick={() => setMainTab('team')}
                >
                    Team Dashboard
                </div>
            </div>

            {mainTab === 'my' ? (
                <>
                    {/* Role Tabs */}
                    <div className="d-flex justify-content-between mb-4" style={{ gap: 30 }}>
                        {/* Leadership Role */}
                        <div style={{ flex: 1, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "8px 10px", minWidth: 120 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Leadership Role</div>
                            <button
                                style={{
                                    width: "100%",
                                    background: activeDashboard === 'main' ? "#22c55e" : "#fff",
                                    color: activeDashboard === 'main' ? "#fff" : "#22c55e",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    fontSize: 14,
                                    padding: "7px 0",
                                    marginBottom: 0,
                                    boxShadow: "0 1px 4px rgba(34,197,94,0.04)"
                                }}
                                onClick={() => setActiveDashboard('main')}
                            >
                                {roles.leadership?.name || 'My KPI'}
                            </button>
                        </div>

                        {/* Primary Role */}
                        <div style={{ flex: 1, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "10px 16px", minWidth: 120 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Primary Role</div>
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
                                    boxShadow: "0 1px 4px rgba(37,99,235,0.04)"
                                }}
                                onClick={() => setActiveDashboard('primary')}
                            >
                                {roles.primary?.name || 'Data Science'}
                            </button>
                        </div>

                        {/* Ancillary Role */}
                        <div style={{ flex: 2, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "10px 16px", minWidth: 440 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Ancillary Role</div>
                            <div className="d-flex" style={{ gap: 12, alignItems: "stretch" }}>
                                {roles.ancillary
                                    .filter(role => {
                                        const pref = dashboardData?.employee?.aceAndGoalPreference?.find(p => p.role_id === role.id);
                                        return !(pref && pref.isHidden === 1);
                                    })
                                    .map((role) => {
                                        const pref = dashboardData?.employee?.aceAndGoalPreference?.find(p => p.role_id === role.id);
                                        const isBypassed = pref && pref.isBypass === 1 && pref.isHidden === 0;
                                        const isSelected = activeDashboard === role.id.toString();

                                        return (
                                            <div key={role.id} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                                                <button
                                                    style={{
                                                        width: "100%",
                                                        background: isSelected ? "#2563eb" : "#fff",
                                                        color: isSelected ? "#fff" : "#2563eb",
                                                        border: "none",
                                                        borderRadius: 8,
                                                        fontWeight: 500,
                                                        fontSize: 12,
                                                        padding: "5px 0",
                                                        marginBottom: 0,
                                                        boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                                                        height: "100%",
                                                        opacity: isBypassed ? 0.5 : 1,
                                                        cursor: isBypassed ? "not-allowed" : "pointer"
                                                    }}
                                                    onClick={() => {
                                                        if (!isBypassed) setActiveDashboard(role.id.toString());
                                                    }}
                                                    disabled={isBypassed}
                                                >
                                                    {role.name}
                                                </button>
                                                {isBypassed && (
                                                    <div style={{ color: "#dc2626", fontSize: 14, marginTop: 2, textAlign: "center", fontWeight: 500 }}>
                                                        (You are Bypassed For this Role )
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                }
                                {roles.ancillary.filter(role => {
                                    const pref = dashboardData?.employee?.aceAndGoalPreference?.find(p => p.role_id === role.id);
                                    return !(pref && pref.isHidden === 1);
                                }).length === 0 && (
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
                                                padding: "5px 0",
                                                marginBottom: 0,
                                                position: "relative",
                                                flex: "1 1 auto"
                                            }}
                                            disabled
                                        >
                                            No Ancillary Roles
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Content Switch */}
                    {activeDashboard === 'main' ? (
                        <>
                            <style>
                                {`
.progress-bar.bg-custom-metric, .progress-bar.bg-custom-metric {
    background-color: #b197fc !important; /* Light purple */
}
`}
                            </style>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Status</h3>
                                    <Card className="p-4 shadow rounded-3 chart-card">
                                        <Bar
                                            options={{
                                                ...kpiStatusOptions,
                                                plugins: {
                                                    ...kpiStatusOptions.plugins,
                                                    datalabels: {
                                                        ...kpiStatusOptions.plugins?.datalabels,
                                                        formatter: safeDataLabelFormatter
                                                    }
                                                }
                                            }}
                                            data={kpiStatusData}
                                            height={250}
                                            plugins={[ChartDataLabels]}
                                        />
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Task Priority</h3>
                                    <Card className="p-4 shadow rounded-3 chart-card">
                                        <Bar
                                            options={{
                                                ...barChartOptions,
                                                plugins: {
                                                    ...barChartOptions.plugins,
                                                    datalabels: {
                                                        ...barChartOptions.plugins?.datalabels,
                                                        formatter: safeDataLabelFormatter
                                                    }
                                                }
                                            }}
                                            data={barChartData}
                                            height={250}
                                            plugins={[ChartDataLabels]}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-3">Target-wise Progress Overview</h3>
                                    <Card className="p-3 shadow rounded-4 chart-card">
                                        <Bar
                                            options={{
                                                ...barChartOptions,
                                                plugins: {
                                                    ...barChartOptions.plugins,
                                                    datalabels: {
                                                        ...barChartOptions.plugins?.datalabels,
                                                        formatter: safeDataLabelFormatter
                                                    }
                                                }
                                            }}
                                            data={targetProgressData}
                                            height={250}
                                        />
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <h3 className="mb-3">Target Distribution</h3>
                                    <Card className="p-3 shadow rounded-4 d-flex flex-row align-items-center chart-card" style={{ minHeight: 340 }}>
                                        <div className="position-relative" style={{ width: 240, height: 240 }}>
                                            <Doughnut data={targetProgressDoughnutData} options={targetProgressDoughnutOptions} />
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle fw-bold"
                                                style={{ fontSize: 32, color: "#222" }}
                                            >
                                                {calculateTotalPercentage()}%
                                            </div>
                                        </div>
                                        <div className="ms-5">
                                            <div className="mb-3 fw-bold" style={{ fontSize: 18 }}>Legend</div>
                                            <div className="d-flex align-items-center mb-2">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#0dcaf0',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Number</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#b197fc',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Done / Not Done</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#6f42c1',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Currency</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                        </>
                    ) : activeDashboard === 'primary' ? (
                        <PrimaryDashboard />
                    ) : activeDashboard === 'webdev' ? (
                        <WebdevlopmentDashboard />
                    ) : activeDashboard === 'Ux' ? (
                        <UxDashboard />
                    ) : (
                        <>
                            {/* KPI Status & Task Priority */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Status</h3>
                                    <Card className="p-4 shadow rounded-3">
                                        <Bar
                                            options={kpiStatusOptions}
                                            data={kpiStatusData}
                                            height={200}
                                            plugins={[ChartDataLabels]}
                                        />
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Task Priority</h3>
                                    <Card className="p-4 shadow rounded-3">
                                        <Bar options={barChartOptions} data={barChartData} height={200} plugins={[ChartDataLabels]} />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Target-wise Progress & Distribution */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-3">Target-wise Progress Overview</h3>
                                    <Card className="p-3 shadow rounded-4">
                                        <Bar options={barChartOptions} data={targetProgressData} height={200} />
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <h3 className="mb-3">Target Distribution</h3>
                                    <Card className="p-3 shadow rounded-4 d-flex flex-row align-items-center" style={{ minHeight: 340 }}>
                                        <div className="position-relative" style={{ width: 240, height: 240 }}>
                                            <Doughnut data={targetProgressDoughnutData} options={targetProgressDoughnutOptions} />
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle fw-bold"
                                                style={{ fontSize: 32, color: "#222" }}
                                            >
                                                {calculateTotalPercentage()}%
                                            </div>
                                        </div>
                                        <div className="ms-5">
                                            <div className="mb-3 fw-bold" style={{ fontSize: 18 }}>Legend</div>
                                            <div className="d-flex align-items-center mb-2">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#0dcaf0',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Number</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-2">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#b197fc',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Done / Not Done</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 18,
                                                    height: 18,
                                                    background: '#6f42c1',
                                                    borderRadius: 4,
                                                    marginRight: 10
                                                }}></span>
                                                <span style={{ color: '#555', fontSize: 16 }}>Target : Currency</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Performance Metrics */}
                            <Row>
                                <Col>
                                    <h3 className="mb-1">Performance Metrics Overview</h3>
                                    <div className="text-muted mb-3" style={{ fontSize: '0.98rem' }}>
                                        Productivity | Efficiency | Bottlenecks | Task Quality | Workflow Fluidity
                                    </div>
                                    <Card className="p-4 shadow rounded-4">
                                        {performanceMetrics.map((item, idx) => (
                                            <div key={item.label} className={idx === 0 ? "" : "mt-3"}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span>{item.label}</span>
                                                    <span className="fw-bold" style={{ minWidth: 32, textAlign: 'right' }}>{item.value}</span>
                                                </div>
                                                <ProgressBar
                                                    now={(item.value / item.max) * 100}
                                                    style={{
                                                        height: 10,
                                                        backgroundColor: "#f3f0fa"
                                                    }}
                                                    variant="custom-metric"
                                                />
                                            </div>
                                        ))}
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <TeamDashboard />
            )}

            <style>
                {`
.progress-bar.bg-custom-metric, .progress-bar.bg-custom-metric {
    background-color: #b197fc !important; /* Light purple */
}
`}
            </style>
        </Container>
    );
};

export default FirstLineDashboard;
