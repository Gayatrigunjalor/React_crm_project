import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Card, Col, Row, Nav, Tab } from 'react-bootstrap';
import ProcurementsTable, { procurementsTableColumns } from './ProcurementsTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import ProcurementsModal from './ProcurementsModal';
import ProcurementProductsModal from './ProcurementProductsModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import React from "react";
import ReactECharts from "echarts-for-react";
import { useAppContext } from "../../../providers/AppProvider";

export interface ProcurementsDataType {
    id: number;
    proc_number: string;
    product_service_name: string;
    description: string;
    target_cost: string;
    tat: string;
    status: string;
    completion_date: string;
    products_count: number;
    lead_id: number;
    lead_customer_id: number;
    uploads: [{ id: number; procurement_id: number; name: string; }]
    products: [{ id: number; procurement_id: number; product_service_name: string; description: string; target_cost: string; quantity: string; }]
}

const Procurements = () => {
    const [procurements, setProcurements] = useState<ProcurementsDataType[]>([]);
    const [leadData, setLeadData] = useState({ lead_id: null, lead_customer_id: null })
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showProductModal, setShowProductModal] = useState<boolean>(false); //modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuoteId, setSelectedQuoteId] = useState<number>();
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();
    const [pieChartData, setPieChartData] = useState([]);
    const [closedProcurementData, setClosedProcurementData] = useState([]);
    const [openProcurementData, setOpenProcurementData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    //getting the user id from localstorage
    const userPermissions = localStorage.getItem('emp_data');
    const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;
    const userId = parsedPermissions ? parsedPermissions.user_id : null;

    useEffect(() => {
        const userRole = localStorage.getItem('user_role');
        setIsAdmin(userRole !== null && userRole.replace(/"/g, '') === "ADMIN");
    }, []);

    const handleShow = (userId?: number) => {
        setSelectedQuoteId(userId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleProductsClose = () => setShowProductModal(false); //close modal function

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const handleProcVendors = (id: number) => {
        navigate(`/procurement/vendors/${id}`);
    }

    const handleShowProducts = (id: number) => {
        setSelectedQuoteId(id);
        setShowProductModal(true);
    }

    const table = useAdvanceTable({
        data: procurements,
        columns: procurementsTableColumns(handleShow, handleShowProducts, handleProcVendors),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
        initialState: {
            columnVisibility: {
                product_service_name: false,
                description: false,
                target_cost: false,
            }
        }
    });


    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchProcurementsData = async () => {
            try {
                const response = await axiosInstance.get('/procurements');
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: ProcurementsDataType[] = await response.data;
                setProcurements(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchProcurementsData();
    }, [refreshData]);


    useEffect(() => {
        const fetchAdminGraphData = async () => {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            try {
                const [totalSourcingResponse, closedResponse, openResponse, pieResponse] = await Promise.all([
                    axiosInstance.get('/procurementTotalSourcing'),
                    axiosInstance.get('/procurementClosedAdminGraph'),
                    axiosInstance.get('/procurementOpenAdminGraph'),
                    axiosInstance.get('/procurementPieChart')
                ]);

                if (totalSourcingResponse.status !== 200 || closedResponse.status !== 200 || openResponse.status !== 200 || pieResponse.status !== 200) {
                    throw new Error('Failed to fetch admin graph data');
                }
                //TOTAL S
                const xAxisData = totalSourcingResponse.data.x_axis;
                const closedData = totalSourcingResponse.data.series[0].data;
                const openData = totalSourcingResponse.data.series[1].data;

                setTaskData([
                    {
                        name: xAxisData[0], // "Admin"
                        open: openData[0],   // 3
                        closed: closedData[0], // 0
                    },
                ]);

                setClosedProcurementData(closedResponse.data);
                // setTaskData2(closedResponse.data);

                //CLOSED PROCUREMENT
                // setClosedProcurementData(closedResponse.data);
                const xAxis1Data = closedResponse.data.x_axis;
                const closed1Data = closedResponse.data.series[0].data;
                const open1Data = closedResponse.data.series[1].data;

                setTaskData2([
                    {
                        name: xAxis1Data[0],
                        Delayed: open1Data[0],
                        closed: closed1Data[0],
                    },
                ]);

                //OPEN PROCUREMENT
                const xAxis2Data = openResponse.data.x_axis;
                const closed2Data = openResponse.data.series[0].data;
                const open2Data = openResponse.data.series[1].data;


                setTaskData3([
                    {
                        name: xAxis2Data[0],
                        Delayed: open2Data[0],
                        closed: closed2Data[0],
                    },
                ]);

                setPieChartData(pieResponse.data);
                setOpenProcurementData(openResponse.data)

            } catch (error) {
                console.error("Error fetching admin graph data:", error);
            }
        };


        if (isAdmin) {
            fetchAdminGraphData();
        }
    }, [isAdmin]);

    if (error) return <div>Error: {error}</div>;

    //for Total Sourscing graph
    const [taskData, setTaskData] = useState([{ name: "Admin", open: 24, closed: 26 },]);

    const options = {
        title: {
            text: "Total Sourcing",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                return `${params[0].name}<br/>
                    ${params[0].marker} Open: ${params[0].value} days<br/>
                    ${params[1].marker} Closed: ${params[1].value} days`;
            },
        },
        legend: {
            data: ["Open", "Closed"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        xAxis: {
            type: "value",
            name: "Number of Days",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: {
                fontSize: 12,
            },
        },
        yAxis: {
            type: "category",
            name: "Name of Product",
            data: taskData.map((item) => item.name),  // Dynamically mapping from taskData
            axisLabel: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        series: [
            {
                name: "Open",
                type: "bar",
                stack: "total",
                data: taskData.map((item) => item.open),  // Dynamically mapping open data
                barWidth: 50,
                itemStyle: { color: "#D0021B" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
            {
                name: "Closed",
                type: "bar",
                stack: "total",
                data: taskData.map((item) => item.closed),  // Dynamically mapping closed data
                barWidth: 50,
                itemStyle: { color: "#FFD700" },
                label: {
                    show: true,
                    position: "inside",
                    color: "blue",
                    fontWeight: "bold",
                },
            },
        ],
        grid: {
            left: 10,
            right: 20,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };


    //for Sum of Close
    const { getThemeColor } = useAppContext();
    const options2 = {
        title: {
            text: "Total Sourcing",
            subtext: pieChartData.total,
            left: "center",
            top: "45%",
            textStyle: {
                fontSize: 20,
                fontWeight: "bold",
            },
            subtextStyle: {
                fontSize: 24,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)",
        },
        legend: {
            orient: "horizontal",
            bottom: 0, // Keep it at the bottom
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 120,
            data: ["Closed", "Open"],
            textStyle: {
                fontWeight: 600,
            },
        },
        series: [
            {
                name: "Total Sourcing",
                type: "pie",
                radius: ["60%", "80%"],
                center: ["50%", "50%"],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    position: "outside",
                    formatter: "{b} \n {d}%",
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                    },
                },
                data: [
                    {
                        value: pieChartData.closedSum,
                        name: "Closed",
                        itemStyle: { color: getThemeColor("primary") },
                    },
                    {
                        value: pieChartData.openSum,
                        name: "Open",
                        itemStyle: { color: getThemeColor("tertiary-bg") },
                    },
                ],
            },
        ],
    };

    //for closed procurement
    const [taskData2, setTaskData2] = useState([
        { name: "Admin", Delayed: 24, closed: 2 },
    ]);

    const options3 = {
        title: {
            text: "Closed Procurements",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                return `${params[0].name}<br/>
                        ${params[0].marker} Delayed: ${params[0].value} days<br/>
                        ${params[1].marker} Under TAT: ${params[1].value} days`;
            },
        },
        legend: {
            data: ["Delayed", "Under TAT"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        xAxis: {
            type: "value",
            name: "Number of Days",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: {
                fontSize: 12,
                formatter: (value) => (value % 2 === 0 ? value : ""), // Show only even numbers
            },
            min: 0,  // Set the minimum value
            interval: 2, // Force ticks to appear at intervals of 2
        },
        yAxis: {
            type: "category",
            name: "Name of Product",
            data: taskData2.map((item) => item.name),
            axisLabel: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData2.map((item) => item.Delayed),
                barWidth: 50,
                itemStyle: { color: "#D0021B" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
            {
                name: "Under TAT",
                type: "bar",
                stack: "total",
                data: taskData2.map((item) => item.closed),
                barWidth: 50,
                itemStyle: { color: "#FFD700" },
                label: {
                    show: true,
                    position: "inside",
                    color: "blue",
                    fontWeight: "bold",
                },
            },
        ],
        grid: {
            left: 10,
            right: 20,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };

    //for open procurement
    const [taskData3, setTaskData3] = useState([
        { name: "Admin", Delayed: 24, closed: 2 },
    ]);

    const options4 = {
        title: {
            text: "Open Procurements",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                return `${params[0].name}<br/>
                        ${params[0].marker} Delayed: ${params[0].value} days<br/>
                        ${params[1].marker} Under TAT: ${params[1].value} days`;
            },
        },
        legend: {
            data: ["Delayed", "Under TAT"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        xAxis: {
            type: "value",
            name: "Number of Days",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: {
                fontSize: 12,
                formatter: (value) => (value % 2 === 0 ? value : ""), // Show only even numbers
            },
            min: 0,  // Set the minimum value
            interval: 2, // Force ticks to appear at intervals of 2
        },
        yAxis: {
            type: "category",
            name: "Name of Product",
            data: taskData3.map((item) => item.name),
            axisLabel: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData3.map((item) => item.Delayed),
                barWidth: 50,
                itemStyle: { color: "#D0021B" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
            {
                name: "Under TAT",
                type: "bar",
                stack: "total",
                data: taskData3.map((item) => item.closed),
                barWidth: 50,
                itemStyle: { color: "#FFD700" },
                label: {
                    show: true,
                    position: "inside",
                    color: "blue",
                    fontWeight: "bold",
                },
            },
        ],
        grid: {
            left: 10,
            right: 20,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };

    //for procurementClosedIndividualChart for chart per user wise
    const [taskData4, setTaskData4] = useState([
        { name: "Admin", Delayed: 24, underTAT: 4, totalClosed:1 },
    ]);


    useEffect(() => {
        const fetchprocurementClosed = async () => {
            try {
                const response = await axiosInstance.post('/procurementClosedIndividualChart', {
                    user_id: userId,
                });

                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data = response.data;

                // Update taskData4 directly
                setTaskData4([
                    {
                        name: data.x_axis[0], // Extract first name
                        Delayed: data.series[0].data[0],
                        underTAT: data.series[1].data[0],
                        totalClosed: data.series[2].data[0],
                    }
                ]);

            } catch (err) {
                console.error(err.message);
            }
        };

        fetchprocurementClosed();
    }, [userId]);
    const options5 = {
        title: {
            text: "Close Individual Procurements",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                return `${params[0].name}<br/>
                        ${params[0].marker} Delayed: ${params[0].value} days<br/>
                        ${params[1].marker} Under TAT: ${params[1].value} days<br/>
                        ${params[1].marker} Total Closed: ${params[2].value} days`;
            },
        },
        legend: {
            data: ["Delayed", "Under TAT","Total Closed"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        xAxis: {
            type: "value",
            name: "Number of Days",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: {
                fontSize: 12,
                formatter: (value) => (value % 2 === 0 ? value : ""), // Show only even numbers
            },
            min: 0,  // Set the minimum value
            interval: 2, // Force ticks to appear at intervals of 2
        },
        yAxis: {
            type: "category",
            name: "Name of Product",
            data: taskData4.map((item) => item.name),
            axisLabel: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData4.map((item) => item.Delayed),
                barWidth: 50,
                itemStyle: { color: "#D0021B" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
            {
                name: "Under TAT",
                type: "bar",
                stack: "total",
                data: taskData4.map((item) => item.underTAT),
                barWidth: 50,
                itemStyle: { color: "#FFD700" },
                label: {
                    show: true,
                    position: "inside",
                    color: "blue",
                    fontWeight: "bold",
                },
            },
            {
                name: "Total Closed",
                type: "bar",
                stack: "total",
                data: taskData4.map((item) => item.totalClosed),
                barWidth: 50,
                itemStyle: { color: "#2e783f" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
        ],
        grid: {
            left: 10,
            right: 20,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };

      //for procurementOpenIndividualChart for chart per user wise
    const [taskData5, setTaskData5] = useState([
        { name: "Admin", Delayed: 24, underTAT: 4, totalOpen:1 },
    ]);


    useEffect(() => {
        const fetchprocurementOpened = async () => {
            try {
                const response = await axiosInstance.post('/procurementOpenedIndividualChart', {
                    user_id: userId,
                });

                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data = response.data;

                // Update taskData4 directly
                setTaskData5([
                    {
                        name: data.x_axis[0], // Extract first name
                        Delayed: data.series[0].data[0],
                        underTAT: data.series[1].data[0],
                        totalOpen: data.series[2].data[0],
                    }
                ]);

            } catch (err) {
                console.error(err.message);
            }
        };

        fetchprocurementOpened();
    }, [userId]);

    const options6 = {
        title: {
            text: "Open Individual Procurements",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params) => {
                return `${params[0].name}<br/>
                        ${params[0].marker} Delayed: ${params[0].value} days<br/>
                        ${params[1].marker} Under TAT: ${params[1].value} days<br/>
                        ${params[1].marker} Total Open: ${params[2].value} days`;
            },
        },
        legend: {
            data: ["Delayed", "Under TAT","Total Open"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        xAxis: {
            type: "value",
            name: "Number of Days",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: {
                fontSize: 12,
                formatter: (value) => (value % 2 === 0 ? value : ""), // Show only even numbers
            },
            min: 0,  // Set the minimum value
            interval: 2, // Force ticks to appear at intervals of 2
        },
        yAxis: {
            type: "category",
            name: "Name of Product",
            data: taskData5.map((item) => item.name),
            axisLabel: {
                fontSize: 12,
                fontWeight: "bold",
            },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData5.map((item) => item.Delayed),
                barWidth: 50,
                itemStyle: { color: "#D0021B" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
            {
                name: "Under TAT",
                type: "bar",
                stack: "total",
                data: taskData5.map((item) => item.underTAT),
                barWidth: 50,
                itemStyle: { color: "#FFD700" },
                label: {
                    show: true,
                    position: "inside",
                    color: "blue",
                    fontWeight: "bold",
                },
            },
            {
                name: "Total Open",
                type: "bar",
                stack: "total",
                data: taskData5.map((item) => item.totalOpen),
                barWidth: 50,
                itemStyle: { color: "#2e783f" },
                label: {
                    show: true,
                    position: "inside",
                    color: "white",
                    fontWeight: "bold",
                },
            },
        ],
        grid: {
            left: 10,
            right: 20,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };

    return (
        <>
            <h2 className="mb-5">Procurements</h2>
            <Card>
                <Card.Body>
                    <Tab.Container id="basic-tabs-example" defaultActiveKey="enabled">
                        <Row>
                            <Col>
                                <Nav variant="underline">
                                    <Nav.Item>
                                        <Nav.Link eventKey="enabled" className='fs-8'>Admin Dashboard</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="disabled" className='fs-8'>Procurement List</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                        </Row>


                        <Tab.Content>
                            <Tab.Pane eventKey="disabled">
                                <AdvanceTableProvider {...table}>
                                    <Row className="g-3 justify-content-between my-2">
                                        <Col xs="auto">
                                            <div className="d-flex">
                                                <SearchBox
                                                    placeholder="Search..."
                                                    className="me-2"
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </Col>

                                        <Col className="d-flex justify-content-end">
                                            <Button
                                                variant="primary"
                                                className=""
                                                startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                                onClick={() => handleShow()}
                                            >
                                                Add New Procurement
                                            </Button>
                                        </Col>
                                    </Row>
                                    <ProcurementsTable />
                                </AdvanceTableProvider>
                            </Tab.Pane>

                            <Tab.Pane eventKey="enabled">
                                <Col xs="auto" className='mt-4'>
                                    <div className="d-flex justify-content-between">
                                        <SearchBox
                                            placeholder="Search..."
                                            className="me-2 "
                                            onChange={handleSearchInputChange}
                                        />
                                        <Button
                                            variant="primary"
                                            className=""
                                            startIcon={<FontAwesomeIcon icon={faPlus} className="me-2" />}
                                            onClick={() => handleShow()}
                                        >
                                            Add New Procurement
                                        </Button>
                                    </div>
                                </Col>

                                <div className="mt-5">
                                    <div className="row justify-content-center g-2">
                                        <div className="col-md-6 col-6">
                                            <ReactECharts option={options} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                        <div className="col-md-6 col-6">
                                            <center> <h5>Sum of Closed and Sum of Open by Total Sourcing</h5></center>

                                            <ReactECharts option={options2} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                    </div>
                                    <div className="row justify-content-center g-2 " style={{ marginTop: "3rem" }}>
                                        <div className="col-md-6 col-6">
                                            <ReactECharts option={options3} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                        <div className="col-md-6 col-6">


                                            <ReactECharts option={options4} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                    </div>
                                    <div className="row justify-content-center g-2 " style={{ marginTop: "3rem" }}>
                                        <div className="col-md-6 col-6">
                                            <ReactECharts option={options5} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                        <div className="col-md-6 col-6">
                                            <ReactECharts option={options6} style={{ height: "300px", width: "90%" }} />
                                        </div>
                                    </div>
                                </div>


                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {showModal && (
                <ProcurementsModal quoteId={selectedQuoteId} lead_id={leadData.lead_id} lead_customer_id={leadData.lead_customer_id} onHide={handleClose} onSuccess={handleSuccess} />
            )}

            {showProductModal && (
                <ProcurementProductsModal quoteId={selectedQuoteId} onHide={handleProductsClose} onSuccess={handleSuccess} />
            )}
        </>
    )
};

export default Procurements;
