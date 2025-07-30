import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

const WebteamDashboard = () => {


    const kpiDistributionData = {
        labels: ["Sidhant", "Sammati", "Dev", "Sriya", "Harshal"],
        datasets: [
            {
                label: "Target: Number",
                backgroundColor: "#20c997",
                data: [10, 10, 8, 7, 5],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Done / Not Done",
                backgroundColor: "#0dcaf0",
                data: [6, 5, 4, 5, 6],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Currency",
                backgroundColor: "#b197fc",
                data: [0, 0, 0, 0, 0],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const kpiPerformanceData = {
        labels: ["Sidhant", "Sammati", "Dev", "Sriya", "Harshal"],
        datasets: [
            {
                label: "Total KPI's Assigned",
                backgroundColor: "#a259e6",
                data: [10, 10, 8, 7, 5],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Total KPI's Completed",
                backgroundColor: "#6f42c1",
                data: [6, 5, 4, 5, 6],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const kpiPerformanceSummaryData = {
        labels: ["Sidhant", "Sammati", "Dev", "Sriya", "Harshal"],
        datasets: [
            {
                label: "Target: Number",
                backgroundColor: "#20c997",
                data: [6, 4, 6, 5, 4],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Done / Not Done",
                backgroundColor: "#b197fc",
                data: [4, 6, 4, 3, 2],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
            {
                label: "Target: Currency",
                backgroundColor: "#0dcaf0",
                data: [0, 0, 0, 1, 0],
                barThickness: 15,
                categoryPercentage: 0.5,
                barPercentage: 0.5,
            },
        ],
    };

    const departmentWiseData = {
        labels: ["Data Science", "Web Development", "UI/UX"],
        datasets: [
            {
                data: [60, 30, 10],
                backgroundColor: ["#6f42c1", "#b197fc", "#0dcaf0"],
                borderWidth: 0,
            },
        ],
    };

    return (
        <Container fluid className="p-4" style={{ background: "#f6f9fc", minHeight: "100vh" }}>

            {/* Charts */}
            <Row className="mb-4">
                <ChartCard title="KPI Distribution Summary" data={kpiDistributionData} />
                <ChartCard title="KPI Performance Summary" data={kpiPerformanceData} />
            </Row>
            <Row>
                <Col md={6} className="mb-4">
                    <h3 className="mb-4 fw-bold" style={{ color: "#000" }}>{`Department Wise KPI Distribution`}</h3>
                    <Card className="shadow-sm rounded-5" style={{ minHeight: 380, padding: "3.5rem 3rem" }}>
                        <DoughnutChart data={departmentWiseData} />
                    </Card>
                </Col>
                <ChartCard title="KPI Performance Summary" data={kpiPerformanceSummaryData} />
            </Row>
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


const RoleButton = ({ title }: { title: string }) => (
    <button
        style={{
            flex: 1,
            background: "#fff",
            color: "#2563eb",
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
        <Card className="shadow-sm rounded-5" style={{ minHeight: 380, padding: "3.5rem 3rem" }}>
            <Bar
                data={data}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            align: "start",
                            labels: {
                                boxWidth: 14,
                                boxHeight: 14,
                                font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                color: "#000",
                                padding: 12,
                            },
                        },
                        datalabels: {
                            anchor: "end",
                            align: "end",
                            color: "#222",
                            font: { weight: "normal", size: 13, family: "'Inter', sans-serif" },
                            offset: -6,
                            display: true,
                        },
                    },
                    layout: {
                        padding: { top: 30, right: 25, left: 20, bottom: 10 },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                                color: "#000",
                            },
                        },
                        y: {
                            grid: {
                                color: "#e5e7eb",
                                borderDash: [4, 4],
                            },
                            ticks: {
                                display: false,
                            },
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Number of Tasks",
                                font: { size: 15, weight: "normal", family: "'Inter', sans-serif" },
                                color: "#000",
                                padding: { bottom: 8 },
                            },
                        },
                    },
                    borderRadius: 16,
                }}
                plugins={[ChartDataLabels]}
                height={270}
            />
        </Card>
    </Col>
);

const DoughnutChart = ({ data }: { data: any }) => (
    <div style={{ width: '100%', height: '100%', maxWidth: 400, margin: "0 auto" }}>
        <Doughnut
            data={data}
            options={{
                plugins: {
                    legend: {
                        display: true,
                        position: "right",
                        labels: {
                            font: { size: 13, weight: "normal", family: "'Inter', sans-serif" },
                            color: "#000",
                            padding: 10,
                        }
                    },
                    datalabels: {
                        color: "#fff",
                        font: { weight: "normal", size: 16, family: "'Inter', sans-serif" },
                        formatter: (value: number, ctx: any) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                            return `${Math.round((value / sum) * 100)}%`;
                        },
                        display: true,
                    },
                },
                cutout: '50%',
            }}
            plugins={[ChartDataLabels]}
            height={240}
        />
    </div>
);

export default WebteamDashboard;

