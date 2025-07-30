import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface TeamDashboardData {
    employee: {
        id: number;
        user_id: number;
        name: string;
        role_id: number;
        role_name: string;
        leadership_kpi_id: number;
        leadership_kpi_name: string;
        aceAndGoalPreference: Array<{
            id: number;
            user_id: number;
            role_id: number;
            isHidden: number;
            isBypass: number;
            created_at: string;
            updated_at: string;
        }>;
    };
    ancillary_roles: Array<{
        id: number;
        name: string;
    }>;
    kpiDistributionSummary: Array<{
        user_id: number;
        employee_name: string;
        total_number: number;
        total_currency: number;
        target_dnd: number;
    }>;
    kpiPerformanceSummary: Array<{
        user_id: number;
        employee_name: string;
        total_assigned: number;
        target_completed: number;
    }>;
    deptWiseKpiDistribution: Record<string, number>;
    kpiPerformanceCompletedSummary: Array<{
        user_id: number;
        employee_name: string;
        targets: Array<{
            target_type: string;
            total_assigned: number;
            total_completed: number;
        }>;
    }>;
}

interface PrimaryTeamDashboardProps {
    dashboardData: TeamDashboardData | null;
}

const PrimaryTeamDashboard: React.FC<PrimaryTeamDashboardProps> = ({ dashboardData }) => {
    if (!dashboardData) {
        return <div className="text-center py-5">Loading...</div>;
    }

    const kpiDistributionData = {
        labels: dashboardData.kpiDistributionSummary.map(item => item.employee_name),
        datasets: [
            {
                label: "Target: Number",
                backgroundColor: "#20c997",
                data: dashboardData.kpiDistributionSummary.map(item => item.total_number),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Done / Not Done",
                backgroundColor: "#0dcaf0",
                data: dashboardData.kpiDistributionSummary.map(item => item.target_dnd),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Currency",
                backgroundColor: "#b197fc",
                data: dashboardData.kpiDistributionSummary.map(item => item.total_currency),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const kpiPerformanceData = {
        labels: dashboardData.kpiPerformanceSummary.map(item => item.employee_name),
        datasets: [
            {
                label: "Total KPI's Assigned",
                backgroundColor: "#a259e6",
                data: dashboardData.kpiPerformanceSummary.map(item => item.total_assigned),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Total KPI's Completed",
                backgroundColor: "#6f42c1",
                data: dashboardData.kpiPerformanceSummary.map(item => item.target_completed),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const kpiPerformanceSummaryData = {
        labels: dashboardData.kpiPerformanceCompletedSummary.map(item => item.employee_name),
        datasets: [
            {
                label: "Target: Number",
                backgroundColor: "#20c997",
                data: dashboardData.kpiPerformanceCompletedSummary.map(item =>
                    item.targets.find(t => t.target_type === 'number')?.total_assigned || 0
                ),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Done / Not Done",
                backgroundColor: "#b197fc",
                data: dashboardData.kpiPerformanceCompletedSummary.map(item =>
                    item.targets.find(t => t.target_type === 'Done/Not Done')?.total_assigned || 0
                ),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Currency",
                backgroundColor: "#0dcaf0",
                data: dashboardData.kpiPerformanceCompletedSummary.map(item =>
                    item.targets.find(t => t.target_type === 'currency')?.total_assigned || 0
                ),
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const departmentWiseData = {
        labels: Object.keys(dashboardData.deptWiseKpiDistribution),
        datasets: [
            {
                data: Object.values(dashboardData.deptWiseKpiDistribution),
                backgroundColor: ["#6f42c1", "#b197fc", "#0dcaf0"],
                borderWidth: 0,
            },
        ],
    };

    return (
        <Container fluid className="p-4" style={{ background: "#f6f9fc", minHeight: "100vh" }}>
            {/* Charts */}
            <Row className="mb-4" style={{ display: 'flex' }}>
               <Row className="mb-4" style={{ display: 'flex' }}>
    <ChartCard title="KPI Distribution Summary" data={kpiDistributionData} />
    <ChartCard title="KPI Performance Summary" data={kpiPerformanceData} />
</Row>

            </Row>
            <Row style={{ display: 'flex' }}>
                <Col md={6} className="mb-4 d-flex flex-column">
                    <h3 className="mb-4 fw-bold" style={{ color: "#000" }}>{`Department Wise KPI Distribution`}</h3>
                    <Card className="shadow-sm rounded-5 flex-grow-1" style={{ minHeight: 500, padding: "3.5rem 3rem" }}>
                        <DoughnutChart data={departmentWiseData} />
                    </Card>
                </Col>
                <ChartCardOutsideTitle title="KPI Performance Summary" data={kpiPerformanceSummaryData} />
            </Row>
        </Container>
    );
};
const ChartCard = ({ title, data }: { title: string; data: any }) => (
    <Col md={6} className="mb-4 d-flex flex-column">
        {/* Title outside the Card */}
        <h3 className="mb-3 fw-bold" style={{ color: "#000" }}>{title}</h3>
        <Card className="shadow-sm rounded-5 flex-grow-1" style={{ padding: "2rem" }}>
            <div style={{ height: "500px", position: "relative" }}>
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
                                font: { weight: "normal", size: 12, family: "'Inter', sans-serif" },
                                offset: -6,
                                display: (context) => {
                                    const value = context.dataset.data[context.dataIndex];
                                    return value > 0;
                                },
                                formatter: (value: number) => value.toLocaleString(),
                            },
                        },
                        layout: {
                            padding: { top: 40, right: 25, left: 20, bottom: 10 },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    maxRotation: 45,
                                    minRotation: 45,
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
                                },
                                beginAtZero: true,
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


const ChartCardOutsideTitle = ({ title, data }: { title: string; data: any }) => (
    <Col md={6} className="mb-4 d-flex flex-column">
        <h3 className="mb-3 fw-bold" style={{ color: "#000" }}>{title}</h3>
        <Card className="shadow-sm rounded-5 flex-grow-1" style={{ padding: "2rem" }}>
            <div style={{ height: "500px", position: "relative" }}>
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
                                font: { weight: "normal", size: 12, family: "'Inter', sans-serif" },
                                offset: -6,
                                display: (context) => {
                                    const value = context.dataset.data[context.dataIndex];
                                    return value > 0;
                                },
                                formatter: (value: number) => value.toLocaleString(),
                            },
                        },
                        layout: {
                            padding: { top: 40, right: 25, left: 20, bottom: 10 },
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: {
                                    font: { size: 12, weight: "normal", family: "'Inter', sans-serif" },
                                    color: "#000",
                                    maxRotation: 45,
                                    minRotation: 45,
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
                                },
                                beginAtZero: true,
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                            return percentage > 5 ? `${percentage}%` : '';
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
                                return `${label}: ${value} (${percentage}%)`;
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

export default PrimaryTeamDashboard;

