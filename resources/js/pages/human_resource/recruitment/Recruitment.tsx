import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../../components/base/Button';
import { useEffect, useState, ChangeEvent } from 'react';
import { Col, Row, Nav, Tab } from 'react-bootstrap';
import RecruitmentTable, { recruitmentTableColumns } from './RecruitmentTable';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';
import RecruitmentModal from './RecruitmentModal';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from "../../../providers/AppProvider";
import React from "react";
import ReactECharts from "echarts-for-react";
export interface RecruitmentDataType {
    id: number;
    post_name: string;
    opening_date: string;
    tat: string;
    closer_date: string;
    deviation: string;
    opening_status: string;
    assignee_name: { id: number; name: string; }
    created_name: { id: number; name: string; }
}

const Recruitment = () => {
    const [recruitmentData, setRecruitmentData] = useState<RecruitmentDataType[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); //modal
    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false); //History modal
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecId, setSelectedRecId] = useState<number | undefined>(undefined);
    const { userPermission } = useAuth(); //check userRole & permissions
    const navigate = useNavigate();

    const handleShow = (recId?: number) => {
        setSelectedRecId(recId);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false); //close modal function

    const handleHistoryShow = (irmId?: number) => {
        setSelectedRecId(irmId);
        setShowHistoryModal(true);
    };

    const handleHistoryClose = () => setShowHistoryModal(false); //close modal function

    const handleTaskCheckbox = (empId: number) => {
        console.log(empId);
    };

    const handleSuccess = () => {
        // Refresh data or perform any other action after successful submission
        setRefreshData(prev => !prev); // Toggle state to trigger re-fetch
    };

    const handleDeleteAttachment = async (attachment_id: number, irm_id: number) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: {
                confirm: {
                    text: "Delete",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                },
                cancel: {
                    text: "Cancel",
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true,
                }
            },
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    axiosInstance.delete(`/deleteIrmAttachment`, {
                        data: {
                            id: attachment_id,
                            irm_id: irm_id
                        }
                    })
                        .then(response => {
                            swal("Success!", response.data.message, "success");
                            handleSuccess();
                        })
                        .catch(error => {
                            swal("Error!", error.data.message, "error");
                        });
                } else {
                    swal("Your record is safe!");
                }
            });
    };


    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };

    const handleCandidatesList = (recId: number) => {
        navigate(`/recruitment/candidates/${recId}`);
    }

    const table = useAdvanceTable({
        data: recruitmentData,
        columns: recruitmentTableColumns(handleShow, handleCandidatesList),
        pageSize: 10,
        pagination: true,
        sortable: true,
        selection: false,
    });

    //  const [userId, setUserId] = useState("");
    const userPermissions = localStorage.getItem('emp_data');
    const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;
    const userId = parsedPermissions ? parsedPermissions.user_id : null;

    //fetch employees table data on component load and update data on edit
    useEffect(() => {
        const fetchRecruitmentData = async () => {
            try {
                const response = await axiosInstance.get('/recruitment'); // Replace with your API URL
                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }
                const data: RecruitmentDataType[] = await response.data;
                console.log("****", data);
                console.log("****", data[0].assignee_name);
                console.log("****", data[0].assignee_name.user_id);
                // setUserId(data[0].assignee_name.user_id); 
                setRecruitmentData(data)
            } catch (err: any) {
                setError(err.message);
            } finally {
            }
        };
        fetchRecruitmentData();
    }, [refreshData]); // Empty array ensures this runs once on mount

    // console.log("User Id**",userId);
    // if (error) return <div>Error: {error}</div>;

    //  console.log("User Id",recruitmentData[0].assignee_name);
    //for Total Recuirtment chart
    const { getThemeColor } = useAppContext();

    const options = {
        title: {
            text: "Total Recruitments",
            left: "center",
            top: "5%",
            textStyle: {
                fontSize: 20,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)",
        },
        legend: {
            orient: "horizontal",
            bottom: 0,
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 20,
            data: ["Ongoing", "Closed", "Abort"],
            textStyle: {
                fontWeight: 600,
            },
        },
        series: [
            {
                name: "Total Recruitments",
                type: "pie",
                top: "10%",
                radius: ["50%", "70%"], // Donut chart effect
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
                        value: 80,
                        name: "Ongoing",
                        itemStyle: { color: getThemeColor("primary") },
                    },
                    {
                        value: 10,
                        name: "Closed",
                        itemStyle: { color: getThemeColor("secondary") },
                    },
                    {
                        value: 10,
                        name: "Abort",
                        itemStyle: { color: getThemeColor("tertiary-bg") },
                    },
                ],
            },
        ],
    };


    const [post_count, setPostCount] = useState("");
    const [delay, setDelay] = useState("");
    const [completed, setCompleted] = useState("");
    const [emp_name, setEmpName] = useState("");
    const [taskData, setTaskData] = useState([
        { name: "Developer", delayed: 3, completed: 4, selfCreated: 2 },
    ]);
    //for self created chart
    useEffect(() => {
        const fetchSelfCreated = async () => {
            try {
                const response = await axiosInstance.post('/fetchSelfCreatedGraphData', {
                    user_id: userId, // Replace 'yourUserId' with the actual user ID variable
                });

                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data: RecruitmentDataType[] = response.data;
                console.log("****all", data);
                console.log("****Post Count", data.post_count);
                setEmpName(data.emp_name[0]);
                setPostCount(data.post_count);
                setDelay(data.delay);
                setCompleted(data.complete);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchSelfCreated();
    }, [refreshData, userId]); // Add 'yourUserId' as a dependency if it changes dynamically

    // Update taskData whenever post_count, delay, or completed change
    useEffect(() => {
        setTaskData([
            {
                name: emp_name,
                delayed: delay,
                completed: completed,
                selfCreated: post_count,
            },
        ]);
    }, [post_count, delay, completed, emp_name]);

    // const options2 = {
    //   title: {
    //       text: "Self Created",
    //       left: "center",
    //       textStyle: {
    //         fontSize: 16,
    //         fontWeight: "bold",
    //       },
    //     },
    //     tooltip: {
    //       trigger: "axis",
    //       axisPointer: { type: "shadow" },
    //       formatter: (params) => {
    //         return `${params[0].name}<br/>
    //                 ${params[0].marker} Delayed: ${params[0].value}<br/>
    //                 ${params[1].marker} Completed under TAT: ${params[1].value}<br/>
    //                 ${params[2].marker} Self created post: ${params[2].value}`;
    //       },
    //     },
    //     legend: {
    //       data: ["Delayed", "Completed under TAT", "Completed under TAT","Self created post"],
    //       right: "right",
    //       textStyle: {
    //         fontSize: 12,
    //         fontWeight: "bold",
    //       },
    //       selectedMode: "multiple", // ✅ Allows re-enabling on click
    //     },
    //     xAxis: {
    //       type: "value",
    //       name: "Counts",
    //       nameLocation: "middle",
    //       nameGap: 30,
    //       splitLine: { show: false },
    //       axisLabel: { fontSize: 12 },
    //     },
    //     yAxis: {
    //       type: "category",
    //       name: "Name of Employee",
    //       data: taskData.map((item) => item.name),
    //       axisLabel: { fontSize: 12, fontWeight: "bold" },
    //     },
    //     // series: [
    //     //   {
    //     //     name: "Delayed",
    //     //     type: "bar",
    //     //     stack: "total",
    //     //     data: taskData.map((item) => item.delayed),
    //     //     barWidth: 30,
    //     //     itemStyle: { color: "#FF69B4" }, // Pink
    //     //     label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
    //     //   },
    //     //   {
    //     //     name: "Completed under TAT",
    //     //     type: "bar",
    //     //     stack: "total",
    //     //     data: taskData.map((item) => item.completed),
    //     //     barWidth: 30,
    //     //     itemStyle: { color: "#FFD700" }, // Yellow
    //     //     label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
    //     //   },

    //     //   {
    //     //     name: "Self created post",
    //     //     type: "bar",
    //     //     stack: "total",
    //     //     data: taskData.map((item) => item.selfCreated),
    //     //     barWidth: 30,
    //     //     itemStyle: { color: "#DC143C" }, // Red
    //     //     label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
    //     //   },
    //     // ],

    //     grid: {
    //       left: 50,
    //       right: 50,
    //       bottom: 50,
    //       top: 50,
    //       containLabel: true,
    //     },
    //   };




    //for Assigned By Others chart
    const options2 = {
        title: {
            text: "Self Created",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params) => {
                return `${params[0].name}<br/>
                      ${params[0].marker} Delayed: ${params[0].value}<br/>
                      ${params[1].marker} Completed under TAT: ${params[1].value}<br/>
                      ${params[2].marker} Self created post: ${params[2].value}`;
            },
        },
        legend: {
            data: ["Delayed", "Completed under TAT", "Self created post"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
            selectedMode: "multiple",
        },
        xAxis: {
            type: "value",
            name: "Counts",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: { fontSize: 12 },
        },
        yAxis: {
            type: "category",
            name: "Name of Employee",
            data: taskData.map((item) => item.name),
            axisLabel: { fontSize: 12, fontWeight: "bold" },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData.map((item) => item.delayed),
                barWidth: 30,
                itemStyle: { color: "#FF69B4" }, // Pink
                label: {
                    show: true,
                    position: "insideMiddle",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 14,
                    formatter: (params) => params.value === 0 ? "0" : params.value, // Show zero values
                },
            },
            {
                name: "Completed under TAT",
                type: "bar",
                stack: "total",
                data: taskData.map((item) => item.completed),
                barWidth: 30,
                itemStyle: { color: "#FFD700" }, // Yellow
                label: {
                    show: true,
                    position: "insideMiddle",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 14,
                    formatter: (params) => params.value === 0 ? "0" : params.value, // Show zero values
                },
            },
            {
                name: "Self created post",
                type: "bar",
                stack: "total",
                data: taskData.map((item) => item.selfCreated),
                barWidth: 30,
                itemStyle: { color: "#DC143C" }, // Red
                label: {
                    show: true,
                    position: "insideMiddle",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 14,
                    formatter: (params) => params.value === 0 ? "0" : params.value, // Show zero values
                },
            },
        ],
        grid: {
            left: 50,
            right: 50,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };




    //for Assigned By others
    const [post_count_assigned, setPostCountAssigned] = useState("");
    const [delayAssigned, setDelayAssigned] = useState("");
    const [completedAssigned, setCompletedAssigned] = useState("");
    const [emp_name_assigned, setEmpNameAssigned] = useState("");
    const [taskData2, setTaskData2] = useState([
        { name: "Developer", delayed: 0, completed: 0, selfCreated: 0 },
    ]);
    useEffect(() => {
        const fetchAssignedGraphData = async () => {
            try {
                const response = await axiosInstance.post('/fetchAssignedGraphData', {
                    user_id: userId, // Replace 'yourUserId' with the actual user ID variable
                });

                if (response.status !== 200) {
                    throw new Error('Failed to fetch data');
                }

                const data: RecruitmentDataType[] = response.data;
                console.log("****all assigned", data);
                console.log("****all assigned", data);
                console.log("Employee Name:", data.emp_name[0]);
                setEmpNameAssigned(data?.emp_name[0]);
                setPostCountAssigned(data.post_count);
                setDelayAssigned(data.delay);
                setCompletedAssigned(data.complete);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchAssignedGraphData();
    }, [refreshData, userId]);
    // Update taskData whenever post_count, delay, or completed change
    useEffect(() => {
        setTaskData2([
            {
                name: emp_name_assigned,
                delayed: delayAssigned,
                completed: completedAssigned,
                selfCreated: post_count_assigned,
            },
        ]);
    }, [post_count_assigned, delayAssigned, completedAssigned, emp_name_assigned]);

    const options3 = {
        title: {
            text: "Assigned By Others",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params) => {
                return `${params[0].name}<br/>
                      ${params[0].marker} Delayed: ${params[0].value}<br/>
                      ${params[1].marker} Completed under TAT: ${params[1].value}<br/>
                      ${params[2].marker} Self created post: ${params[2].value}`;
            },
        },
        legend: {
            data: ["Delayed", "Completed under TAT", "Completed under TAT", "Self created post"],
            right: "right",
            textStyle: {
                fontSize: 12,
                fontWeight: "bold",
            },
            selectedMode: "multiple", // ✅ Allows re-enabling on click
        },
        xAxis: {
            type: "value",
            name: "Counts",
            nameLocation: "middle",
            nameGap: 30,
            splitLine: { show: false },
            axisLabel: { fontSize: 12 },
        },
        yAxis: {
            type: "category",
            name: "Name of Employee",
            data: taskData2.map((item) => item.name),
            axisLabel: { fontSize: 12, fontWeight: "bold" },
        },
        series: [
            {
                name: "Delayed",
                type: "bar",
                stack: "total",
                data: taskData2.map((item) => item.delayed),
                barWidth: 30,
                itemStyle: { color: "#FF69B4" }, // Pink
                label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
            },
            {
                name: "Completed under TAT",
                type: "bar",
                stack: "total",
                data: taskData2.map((item) => item.completed),
                barWidth: 30,
                itemStyle: { color: "#FFD700" }, // Yellow
                label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
            },

            {
                name: "Self created post",
                type: "bar",
                stack: "total",
                data: taskData2.map((item) => item.selfCreated),
                barWidth: 30,
                itemStyle: { color: "#DC143C" }, // Red
                label: { show: true, position: "inside", color: "black", fontWeight: "bold" },
            },
        ],
        grid: {
            left: 50,
            right: 50,
            bottom: 50,
            top: 50,
            containLabel: true,
        },
    };


    return (
        <>
            <Tab.Container id="basic-tabs-example" defaultActiveKey="enabled">
                <Row>
                    <Col>
                        <Nav variant="underline">
                            <Nav.Item>
                                <Nav.Link eventKey="enabled" className='fs-8'>Recruitment List</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="disabled" className='fs-8'>Recruitment Dashboard</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>


                <Tab.Content>
                    <Tab.Pane eventKey="enabled">

                        <AdvanceTableProvider {...table}>
                            <Row className="g-3 justify-content-between my-2">
                                <Col xs="auto">
                                    <div className="d-flex">
                                        <SearchBox
                                            placeholder="Search Recruitment"
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
                                        Add New Recruitment
                                    </Button>
                                </Col>
                            </Row>
                            <RecruitmentTable />
                        </AdvanceTableProvider>
                    </Tab.Pane>

                    <Tab.Pane eventKey="disabled">

                        <div className="mt-5">
                            <div className="row justify-content-center g-2">
                                <div className="col-md-6 col-6">
                                    <ReactECharts option={options} style={{ height: "300px", width: "90%" }} />
                                </div>
                                <div className="col-md-6 col-6">

                                    <center><h5>Recuritment Individual Report</h5></center>
                                    {/* <ReactECharts option={optionsIndividualReport} style={{ height: "300px", width: "90%" }} /> */}
                                </div>
                            </div>
                            <div className="row justify-content-center g-2 " style={{ marginTop: "3rem" }}>
                                <div className="col-md-6 col-6">
                                    <ReactECharts option={options2} style={{ height: "300px", width: "90%" }} />
                                </div>
                                <div className="col-md-6 col-6">
                                    <ReactECharts option={options3} style={{ height: "300px", width: "90%" }} />
                                </div>
                            </div>
                        </div>



                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {showModal && (
                <RecruitmentModal recId={selectedRecId} onHide={handleClose} onSuccess={handleSuccess} />
            )}


        </>
    )
};

export default Recruitment;
