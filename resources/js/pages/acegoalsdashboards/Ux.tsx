import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, ProgressBar, Badge } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axiosInstance from '../../axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

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
    };
    ancillary_roles: Array<{
        id: number;
        name: string;
    }>;
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

const UxDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/kpiGraphsLevelZero?role_id=21');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const barChartOptions: ChartOptions<'bar'> = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            datalabels: {
                anchor: 'end',
                align: 'end',
                color: '#222',
                font: { weight: 'bold', size: 12 }
            }
        },
        responsive: true,
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

    const targetProgressDoughnutOptions: ChartOptions<'doughnut'> = {
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Calculate total percentage for the center text
    const calculateTotalPercentage = () => {
        if (!dashboardData) return 0;
        const { targetNumberPercent, targetDndPercent, targetCurrencyPercent } = dashboardData.targetDistributionGraph;
        return Math.round((targetNumberPercent + targetDndPercent + targetCurrencyPercent) / 3);
    };

    // Performance metrics data
    const performanceMetrics = dashboardData ? [
        { label: "Total KPIs Assigned", value: dashboardData.performanceMatrixCounts.kpisTotalCount, max: dashboardData.performanceMatrixCounts.kpisTotalCount },
        { label: "KPI: Target in Number", value: dashboardData.performanceMatrixCounts.kpisTotalNumberCount, max: dashboardData.performanceMatrixCounts.kpisTotalNumberCount },
        { label: "KPI: Target Done/Not-Done", value: dashboardData.performanceMatrixCounts.kpisTotalDndCount, max: dashboardData.performanceMatrixCounts.kpisTotalDndCount },
        { label: "KPI: Target in Currency", value: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount, max: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount },
        { label: "KPI: Target in Number - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedNumberCount, max: dashboardData.performanceMatrixCounts.kpisTotalNumberCount },
        { label: "KPI: Target Done/Not Done - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedDndCount, max: dashboardData.performanceMatrixCounts.kpisTotalDndCount },
        { label: "KPI: Target in Currency - Completed", value: dashboardData.performanceMatrixCounts.kpisCompletedCurrencyCount, max: dashboardData.performanceMatrixCounts.kpisTotalCurrencyCount },
    ] : [];

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <Container fluid className="p-4">
            <Row className="mb-4">
                <Col md={6}>
                    <h3 className="mb-5">KPI Status</h3>
                    <Card className="p-4 shadow rounded-3">
                        <Bar
                            options={barChartOptions}
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
        </Container>
    );
};

export default UxDashboard;
