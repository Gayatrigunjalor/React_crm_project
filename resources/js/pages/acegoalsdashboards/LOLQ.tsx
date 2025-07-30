import React from 'react';
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
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const LOLQ = () => {
    const barChartOptions = {
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
                    display: false // Hide y-axis numbers
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
                data: [6, 3, 0, 1, 2, 0, 0],
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
                data: [14, 6, 4, 0, 0, 0, 0, 0],
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
                categoryPercentage: 0.6, // Increased from 0.5
            }
        ]
    };
    const kpiStatusOptions = {
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
                    display: false // Hide y-axis numbers
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
                data: [10, 6, 0, 3, 0, 0, 4, 0],
                backgroundColor: '#20c997', // greenish
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
            {
                label: 'Target : Done / Not Done',
                data: [6, 8, 0, 5, 0, 0, 7, 0],
                backgroundColor: '#0dcaf0', // blue
                borderRadius: 8,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
            },
            {
                label: 'Target : Currency',
                data: [8, 4, 0, 7, 0, 0, 3, 0],
                backgroundColor: '#6f42c1', // purple
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
                data: [40, 30, 30],
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
    const targetDistributionData = {
        labels: ['Target Number', 'Target Date / Not Done', 'Target Currency'],
        datasets: [
            {
                data: [40, 30, 30],
                backgroundColor: ['#6f42c1', '#20c997', '#0dcaf0'],
                borderWidth: 1,
            },
        ],
    };

    //     const targetProgressOptions = {
    //     plugins: {
    //         legend: {
    //             display: true,
    //             position: 'top',
    //             align: 'center',
    //             labels: {
    //                 boxWidth: 24,
    //                 font: { size: 18, weight: 'bold' },
    //                 color: '#555',
    //                 padding: 24,
    //             }
    //         },
    //         tooltip: { enabled: true },
    //         datalabels: {
    //             anchor: 'end',
    //             align: 'end',
    //             color: '#222',
    //             font: { weight: 'bold', size: 16 },
    //             formatter: Math.round,
    //         }
    //     },
    //     responsive: true,
    //     scales: {
    //         x: {
    //             grid: { display: false },
    //             ticks: { font: { size: 16 }, color: '#222' }
    //         },
    //         y: {
    //             beginAtZero: true,
    //             grid: { color: '#eaeaea' },
    //             title: {
    //                 display: true,
    //                 text: 'Number of Tasks',
    //                 font: { size: 18, weight: 'bold' },
    //                 color: '#222'
    //             },
    //             ticks: {
    //                 font: { size: 16 },
    //                 color: '#222',
    //                 stepSize: 2,
    //             }
    //         }
    //     }
    // };
    return (
        <Container fluid className="p-4 ">
           
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
                                57%
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
                            { label: "Total KPIs Assigned", value: 21, max: 21 },
                            { label: "KPI: Target in Number", value: 12, max: 21 },
                            { label: "KPI: Target Done/Not-Done", value: 6, max: 21 },
                            { label: "KPI: Target in Currency", value: 3, max: 21 },
                            { label: "KPI: Target in Number - Completed", value: 8, max: 12 },
                            { label: "KPI: Target Done/Not Done - Completed", value: 2, max: 6 },
                            { label: "KPI: Target in Currency - Completed", value: 1, max: 3 },
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

export default LOLQ;
