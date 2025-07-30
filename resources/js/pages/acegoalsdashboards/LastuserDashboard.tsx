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
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import LOsales from './LOsales';
import LOLQ from './LOLQ';
import axiosInstance from '../../axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const LastuserDashboard = () => {
    const [activeDashboard, setActiveDashboard] = useState<'main' | 'LOLQ' | 'LOsales' | string>('main');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const fetchDashboardData = async (roleId?: number) => {
        try {
            setLoading(true);
            const url = roleId ? `/kpiGraphsLevelZero?role_id=${roleId}` : '/kpiGraphsLevelZero';
            const response = await axiosInstance.get(url);
            setDashboardData(response.data);
            setSelectedRoleId(roleId || null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeDashboard === 'LOLQ') {
            fetchDashboardData(19); // Legal role ID
        } else if (activeDashboard === 'LOsales') {
            fetchDashboardData(21); // Deputy HOD Operations role ID
        } else if (activeDashboard === 'main') {
            fetchDashboardData(); // Fetch default data
        }
    }, [activeDashboard]);

    const barChartOptions = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            datalabels: {
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#222',
                font: { weight: 'bold' as const, size: 12 }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
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
                    font: { size: 12, weight: 'bold' as const }
                },
                ticks: {
                    display: false
                }
            }
        }
    };

    const barChartData = {
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
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#7b1fa2");
                    gradient.addColorStop(1, "#e040fb");
                    return gradient;
                },
                borderRadius: 12,
                barPercentage: 0.6,
                categoryPercentage: 0.6,
            },
        ],
    };

    const kpiStatusData = {
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
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "#7b1fa2");
                    gradient.addColorStop(1, "#e040fb");
                    return gradient;
                },
                borderRadius: 12,
                barPercentage: 0.6,
                categoryPercentage: 0.6,
            }
        ]
    };

    const kpiStatusOptions = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            datalabels: {
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#222',
                font: { weight: 'bold' as const, size: 12 }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
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
                    font: { size: 12, weight: 'bold' as const }
                },
                ticks: {
                    display: false
                }
            }
        }
    };

    const targetProgressData = {
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

    const targetProgressDoughnutData = {
        labels: ['Target : Number', 'Target : Done / Not Done', 'Target : Currency'],
        datasets: [
            {
                data: dashboardData ? [
                    dashboardData.targetDistributionGraph.targetNumberPercent,
                    dashboardData.targetDistributionGraph.targetDndPercent,
                    dashboardData.targetDistributionGraph.targetCurrencyPercent
                ] : [0, 0, 0],
                backgroundColor: ['#0dcaf0', '#b197fc', '#6f42c1'],
                borderWidth: 0,
            },
        ],
    };

    const targetProgressDoughnutOptions = {
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    const targetProgressOptions = {
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
            datalabels: {
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#222',
                font: { weight: 'bold' as const, size: 12 }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
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
                    font: { size: 12, weight: 'bold' as const }
                },
                ticks: {
                    display: false
                }
            }
        }
    };

    return (
        <Container fluid className="p-4">
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    {/* Role Tabs */}
                    <div className="d-flex justify-content-between mb-4" style={{ gap: 30 }}>
                        {/* Primary Role */}
                        <div style={{ flex: 1, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "10px 16px", minWidth: 120 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Primary Role</div>
                            <button
                                style={{
                                    width: "100%",
                                    background: activeDashboard === 'main' ? "#2563eb" : "#fff",
                                    color: activeDashboard === 'main' ? "#fff" : "#2563eb",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    fontSize: 14,
                                    padding: "7px 0",
                                    marginBottom: 0,
                                    boxShadow: "0 1px 4px rgba(37,99,235,0.04)"
                                }}
                                onClick={() => {
                                    setActiveDashboard('main');
                                    fetchDashboardData();
                                }}
                            >
                                {dashboardData?.employee?.role_name || 'LO-UI/UX Designer'}
                            </button>
                        </div>

                        {/* Ancillary Role */}
                        <div style={{ flex: 2, border: "1.5px solid #dbeafe", borderRadius: 12, padding: "7px 8px", minWidth: 240 }}>
                            <div style={{ fontWeight: 500, fontSize: 12, marginBottom: 10 }}>Ancillary Role</div>
                            <div className="d-flex" style={{ gap: 12, alignItems: "stretch" }}>
                                {dashboardData?.ancillary_roles?.map((role: any) => (
                                    <button
                                        key={role.id}
                                        style={{
                                            flex: 1,
                                            background: selectedRoleId === role.id ? "#2563eb" : "#fff",
                                            color: selectedRoleId === role.id ? "#fff" : "#2563eb",
                                            border: "none",
                                            borderRadius: 8,
                                            fontWeight: 500,
                                            fontSize: 12,
                                            padding: "5px 0",
                                            marginBottom: 0,
                                            boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                                            height: "100%"
                                        }}
                                        onClick={() => {
                                            setActiveDashboard(role.name);
                                            fetchDashboardData(role.id);
                                        }}
                                    >
                                        {role.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Content Switch */}
                    {activeDashboard === 'main' || selectedRoleId ? (
                        <>
                            {/* KPI Status & Task Priority */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Status</h3>
                                    <Card className="p-4 shadow rounded-3" style={{ height: '400px' }}>
                                        <Bar
                                            options={kpiStatusOptions}
                                            data={kpiStatusData}
                                            plugins={[ChartDataLabels]}
                                        />
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <h3 className="mb-5">KPI Task Priority</h3>
                                    <Card className="p-4 shadow rounded-3" style={{ height: '400px' }}>
                                        <Bar 
                                            options={barChartOptions} 
                                            data={barChartData} 
                                            plugins={[ChartDataLabels]} 
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Target-wise Progress & Distribution */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h3 className="mb-3">Target-wise Progress Overview</h3>
                                    <Card className="p-3 shadow rounded-4" style={{ height: '400px' }}>
                                        <Bar 
                                            options={targetProgressOptions} 
                                            data={targetProgressData} 
                                        />
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
                                                {dashboardData?.targetDistributionGraph?.targetNumberPercent || 0}%
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
                                        {[
                                            { label: "Total KPIs Assigned", value: dashboardData?.performanceMatrixCounts?.kpisTotalCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalCount || 1 },
                                            { label: "KPI: Target in Number", value: dashboardData?.performanceMatrixCounts?.kpisTotalNumberCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalCount || 1 },
                                            { label: "KPI: Target Done/Not-Done", value: dashboardData?.performanceMatrixCounts?.kpisTotalDndCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalCount || 1 },
                                            { label: "KPI: Target in Currency", value: dashboardData?.performanceMatrixCounts?.kpisTotalCurrencyCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalCount || 1 },
                                            { label: "KPI: Target in Number - Completed", value: dashboardData?.performanceMatrixCounts?.kpisCompletedNumberCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalNumberCount || 1 },
                                            { label: "KPI: Target Done/Not Done - Completed", value: dashboardData?.performanceMatrixCounts?.kpisCompletedDndCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalDndCount || 1 },
                                            { label: "KPI: Target in Currency - Completed", value: dashboardData?.performanceMatrixCounts?.kpisCompletedCurrencyCount || 0, max: dashboardData?.performanceMatrixCounts?.kpisTotalCurrencyCount || 1 },
                                        ].map((item, idx) => (
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
                    ) : activeDashboard === 'LOLQ' ? (
                        <LOLQ />
                    ) : activeDashboard === 'LOsales' ? (
                        <LOsales />
                    ) : null}
                </>
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

export default LastuserDashboard;