import React, { useEffect, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
} from "echarts/components";
import { BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers"; // Import the renderer
import { useAppContext } from "../../providers/AppProvider";
import axiosInstance from "../../axios";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { color } from "echarts";




const ObjectiveDashboard = ({
    height,
    width,
}: {
    height: string;
    width: string;
}) => {
    const { getThemeColor } = useAppContext();
    // Register the necessary ECharts components
    echarts.use([
        TooltipComponent,
        BarChart,
        CanvasRenderer,
        GridComponent,
        LegendComponent,
    ]);

    const [startDate, setStartDate] = useState(localStorage.getItem("start_dt"));
    const [endDate, setEndDate] = useState(localStorage.getItem("end_dt"));
    const empId = localStorage.getItem('employee_id');
    const [taskCountsExpired, setTaskCountsExpired] = useState([0, 0, 0, 0, 0, 0, 0, 0]); // Initial state
    const [taskCountsWithinTAT, setTaskCountsWithinTAT] = useState([0, 0, 0, 0, 0, 0, 0, 0]); // Initial state
    const [colleguetaskCountsExpired, setCollegueTaskCountsExpired] = useState([0, 0, 0, 0, 0, 0, 0, 0]); // Initial state
    const [colleguetaskCountsWithinTAT, setCollegueTaskCountsWithinTAT] = useState([0, 0, 0, 0, 0, 0, 0, 0]); // Initial state
    const [taskDates, setDates] = useState([]); // Initial state
    const [taskCounts2, setCounts] = useState([]);
    const [targetStatusIncomplete, setTargetStatusIncomplete] = useState([0, 0, 0, 0]);
    const [targetStatusComplete, setTargetStatusComplete] = useState([0, 0, 0]);
    const [targetStatusTasks, setTargetStatusTasks] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [taskDates3, setDates3] = useState([]); // Initial state
    const [taskCounts4, setCounts4] = useState([]);
    const [taskDates2, setDates2] = useState([]); // Initial state
    const [taskCounts3, setCounts3] = useState([]);
    const [taskCounts, setTaskCounts] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const navigate = useNavigate();
    // console.log('Start Date:', startDate);
    // console.log('End Date:', endDate);
    // console.log('Employee ID:', empId);


    //1] for Objective status chart
  let priorities = [
        "High",
        "Low",
        "Medium",
        "Salary Hold",
        "Directors Priority",
    ];
    let taskCategories = [
        "Total Objectives",
        "To Do",
        "In Progress",
        "Hold",
        "Abort",
        "Review",
        "Complete",
        "False Report",
    ];

    let colleguetaskCategories = [
        "Total Colleague Obj.",
        "To Do",
        "In Progress",
        "Hold",
        "Abort",
        "Review",
        "Complete",
        "False Report",
    ];

    useEffect(() => {
        const handleStorageChange = () => {
            setTimeout(() => {
                setStartDate(localStorage.getItem("start_dt"));
                setEndDate(localStorage.getItem("end_dt"));
            }, 200); // Small delay to ensure values are updated
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Add window resize listener for responsive charts
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const objectiveStatusGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveStageGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });

            // Use setState to update the arrays, ensuring React re-renders the component
            setTaskCountsExpired(response.data.stageTATExpiredCount || []);
            setTaskCountsWithinTAT(response.data.stageWithinTATCount || []);

            console.log('Updated Stage Within TAT Count:', response.data.stageWithinTATCount);
            console.log('Updated Stage TAT Expired Count:', response.data.stageTATExpiredCount);

            return response.data.counts;
        } catch (error) {
            console.error('Error fetching Objective Status data:', error);
            return [];
        }
    };


    useEffect(() => {
        objectiveStatusGraph(params);
    }, [startDate, endDate]); // Add startDate and endDate as dependencies
    // objectiveStatusGraph(params);

    const objectiveCollegueStatusGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveStageColleagueGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });

            // Use setState to update the arrays, ensuring React re-renders the component
            setCollegueTaskCountsExpired(response.data.stageTATExpiredCount || []);
            setCollegueTaskCountsWithinTAT(response.data.stageWithinTATCount || []);



            return response.data.counts;
        } catch (error) {
            console.error('Error fetching collegue Objective Status data:', error);
            return [];
        }
    };

    useEffect(() => {
        objectiveCollegueStatusGraph(params);
    }, [startDate, endDate]);
    const params = {
        start_dt: startDate,
        end_dt: endDate,
        user_id: empId
    };

    const getDefaultOptions = (getThemeColor: {
        (name: string): string;
        (arg0: string): any;
    }) => ({
        color: ["red", "yellow"],
        tooltip: {
            trigger: "axis",
            padding: [7, 10],
            backgroundColor: getThemeColor("body-highlight-bg"),
            borderColor: getThemeColor("border-color"),
            textStyle: { color: getThemeColor("light-text-emphasis") },
            borderWidth: 1,
            transitionDuration: 0,
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item: { marker: any; seriesName: any; value: any }) =>
                            `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
        legend: {
            data: ["TAT expired", "Within TAT"],
            right: "right",
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 10,
            top: 3,
            textStyle: {
                color: getThemeColor("body-color"),
                fontWeight: 600,
                fontFamily: "Nunito Sans",
            },
        },
        xAxis: {
            type: "category",
            data: taskCategories,
            axisLabel: {
                color: getThemeColor("secondary-color"),
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12.8,
                rotate: 0,
                interval: 0,
                formatter: function (value) {
                    return value.replace(/ /g, "\n");  // ✅ Break text by space into new line
                },
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
        },

        yAxis: {
            type: "value",
            name: "Number of tasks",
            color: "black",
            nameTextStyle: {
                fontSize: 12,
                fontWeight: 500,
                align: "center",
                verticalAlign: "middle",
            },
            nameLocation: "center",
            nameGap: 30,
            axisLabel: {
                show: false,
            },
        },
        series: [
            {
                name: "TAT expired",
                type: "bar",
                data: taskCountsExpired,
                barWidth: "20%",
                itemStyle: {
                    color: "red", // Changed to red
                },
                label: {
                    show: true,
                    position: "top",
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                    // align: "center",
                    // verticalAlign: "middle",
                    // offset: [0, -60],
                },
            },
            {
                name: "Within TAT",
                type: "bar",
                data: taskCountsWithinTAT,
                barWidth: "20%",
                itemStyle: {
                    color: "yellow", // Changed to yellow
                },
                label: {
                    show: true,
                    position: "top",
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                    // align: "center",
                    // verticalAlign: "middle",
                    // offset: [0, -60],
                },
            },
        ],
        grid: {
            right: 0,
            left: 50,
            bottom: 50,
            top: "15%",
            containLabel: true,
        },
        graphic: {
            type: "text",
            left: "50%",
            bottom: "5%",
            style: {
                text: "Status",
                fill: getThemeColor("secondary-color"),
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "Nunito Sans",
                textAlign: "center",
            },
        },
    });



    const getDefaultCollegueOptions = (getThemeColor: {
        (name: string): string;
        (arg0: string): any;
    }) => ({
        color: ["red", "yellow"],
        tooltip: {
            trigger: "axis",
            padding: [7, 10],
            backgroundColor: getThemeColor("body-highlight-bg"),
            borderColor: getThemeColor("border-color"),
            textStyle: { color: getThemeColor("light-text-emphasis") },
            borderWidth: 1,
            transitionDuration: 0,
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item: { marker: any; seriesName: any; value: any }) =>
                            `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
        legend: {
            data: ["TAT expired", "Within TAT"],
            right: "right",
            itemWidth: 16,
            itemHeight: 8,
            itemGap: 10,
            top: 3,
            textStyle: {
                color: getThemeColor("body-color"),
                fontWeight: 600,
                fontFamily: "Nunito Sans",
            },
        },
        xAxis: {
            type: "category",
            data: colleguetaskCategories,
            axisLabel: {
                color: getThemeColor("secondary-color"),
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12.8,
                rotate: 0,
                interval: 0,
                formatter: function (value) {
                    return value.replace(/ /g, "\n");
                },
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
        },

        yAxis: {
            type: "value",
            name: "Number of tasks",
            nameTextStyle: {
                fontSize: 12,
                fontWeight: 500,
                align: "center",
                verticalAlign: "middle",
            },
            nameLocation: "center",
            nameGap: 30,
            axisLabel: {
                show: false,
            },
        },
        series: [
            {
                name: "TAT expired",
                type: "bar",
                data: colleguetaskCountsExpired,
                barWidth: "20%",
                itemStyle: {
                    color: "red",
                },
                label: {
                    show: true,
                    position: "top", // 👈 moved from 'inside' to 'top'
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                },
            },
            {
                name: "Within TAT",
                type: "bar",
                data: colleguetaskCountsWithinTAT,
                barWidth: "20%",
                itemStyle: {
                    color: "yellow",
                },
                label: {
                    show: true,
                    position: "top", // 👈 moved from 'inside' to 'top'
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                },
            },
        ],
        grid: {
            right: 0,
            left: 50,
            bottom: 50,
            top: "15%",
            containLabel: true,
        },
        graphic: {
            type: "text",
            left: "50%",
            bottom: "5%",
            style: {
                text: "Status",
                fill: getThemeColor("secondary-color"),
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "Nunito Sans",
                textAlign: "center",
            },
        },
    });





    //2]for Flag counts  chart
    const taskCategories2 = [
        "Total Tasks",
        "Urgent",
        "Low",
        "Medium",
        "High",
        "Directors Priority",
        "Salary Hold",
    ];

    //const taskCounts = [0, 3, 4, 0, 2, 0, 3];

    const objectivePriorityGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectivePriorityGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });


            const FlagCountPoints = response.data.flagCountPoints;
            console.log('Flag Count Points:', FlagCountPoints);
            //  const taskCounts = FlagCountPoints.map(point => point.y);
            //  setTaskCounts(taskCounts);

            // Define all possible categories
            const allCategories = [
                "Total Tasks",
                "Urgent",
                "Low",
                "Medium",
                "High",
                "Directors Priority",
                "Salary Hold"
            ];

            // Initialize an object with 0 values for all categories
            const taskCountsMap = allCategories.reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {});

            // Map the flagCountPoints to set the actual counts for present categories
            FlagCountPoints.forEach(point => {
                if (taskCountsMap.hasOwnProperty(point.name)) {
                    taskCountsMap[point.name] = point.y;
                }
            });

            // Now, taskCountsMap will have the mapped values
            console.log(taskCountsMap);

            // If you need to use setTaskCounts, you can pass the object or values
            setTaskCounts(Object.values(taskCountsMap));
            //  return response.data.counts;
        } catch (error) {
            console.error('Error fetching Objective Status data:', error);
            return [];
        }
    };



    useEffect(() => {
        objectivePriorityGraph(params);
    }, [startDate, endDate]);

    const getDefaultOptions2 = (getThemeColor: {
        (name: string): string;
        (arg0: string): any;
    }) => {
        // Use screenWidth state for responsive design
        const isSmallScreen = screenWidth < 1200; // Adjust threshold as needed
        const isVerySmallScreen = screenWidth < 768; // Very small screens
        
        // Create abbreviated labels for very small screens
        const getLabelText = (value) => {
            if (isVerySmallScreen) {
                const abbreviations = {
                    "Total Tasks": "Total",
                    "Directors Priority": "Dir. Priority",
                    "Salary Hold": "Salary"
                };
                return abbreviations[value] || value;
            }
            return value;
        };
        
        return {
            color: [getThemeColor("primary"), getThemeColor("tertiary-bg")],
            xAxis: {
                type: "category",
                name: "Priority", // ✅ Label for x-axis
                nameLocation: "center", // Position the label at the center
                nameGap: 70, // Gap between the label and the axis
                nameTextStyle: {
                    fontSize: 12,
                    color: getThemeColor("secondary-color"),
                    fontFamily: "Nunito Sans",
                    fontWeight: 600,
                },
                data: taskCategories2,
                axisLabel: {
                    rotate: isSmallScreen ? 45 : 0, // Rotate only on smaller screens
                    formatter: function (value) {
                        const labelText = getLabelText(value);
                        return labelText.split(" ").join("\n");
                    },
                    fontSize: isSmallScreen ? 10 : 11, // Smaller font on small screens
                    color: getThemeColor("secondary-color"),
                    fontFamily: "Nunito Sans",
                    fontWeight: 600,
                    interval: 0, // Show all labels
                    margin: isSmallScreen ? 20 : 15, // More margin on small screens
                },
                axisLine: {
                    lineStyle: {
                        color: getThemeColor("tertiary-bg"),
                    },
                },
            },
            yAxis: {
                type: "value",
                name: "Number of tasks", // ✅ Label for y-axis
                nameTextStyle: {
                    fontSize: 12,
                    color: "black",
                    align: "center", //to show the "Number of tasks" text vertically
                    verticalAlign: "middle",
                },
                nameLocation: "center", //to show the "Number of tasks" vertically
                nameGap: 30,
                //   axisLabel: {
                //     formatter: "{value}",
                //     color: getThemeColor("secondary-color"),
                //   },
                axisLabel: {
                    show: false, // Hides the y-axis numbers
                },
            },
            series: [
                {
                    name: "Tasks",
                    type: "bar",
                    data: taskCounts,
                    barWidth: "40%",
                    itemStyle: {
                        color: getThemeColor("primary"),
                    },
                    label: {
                        show: true,
                        position: "top",
                        color: getThemeColor("light-text-emphasis"),
                        fontSize: 12,
                        fontWeight: 600,
                        align: "center", // Align horizontally to the center
                        verticalAlign: "middle", // Vertically align the label in the middle
                        offset: [0, -10],
                    },
                },
            ],
            grid: {
                right: 20, // Add some right margin
                left: 50,
                bottom: isVerySmallScreen ? 150 : (isSmallScreen ? 120 : 80), // More bottom margin on smaller screens
                top: "15%",
                containLabel: true,
            },
            // title: {
            //     text: "KPI Tasks Priority",
            //     left: "center",
            //     textStyle: {
            //         color: getThemeColor("secondary-color"),
            //         fontSize: 16,
            //         fontWeight: 700,
            //         fontFamily: "Nunito Sans",
            //     },
            // },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                formatter: (params: any[]) => {
                    return params
                        .map(
                            (item) => `${item.marker} ${item.seriesName}: ${item.value}`
                        )
                        .join("<br/>");
                },
            },
        };
    };


    //3] Created By Developer chart
    const objectiveCreatedByMeGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveCreatedByMeGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });

            // Use setState to update the arrays, ensuring React re-renders the component
            setDates(response.data.selected_dates || []);
            setCounts(response.data.counts || []);

            console.log('Seleted Dates:', response.data.selected_dates);
            console.log('Counts', response.data.counts);

            return response.data.counts;
        } catch (error) {
            console.error('Error fetching Developer Status data:', error);
            return [];
        }
    };

    useEffect(() => {
        objectiveCreatedByMeGraph(params);
    }, [startDate, endDate]);

    const getDefaultOptions3 = (getThemeColor: (arg0: string) => any) => ({
        color: [getThemeColor("highlight")],
        xAxis: {
            type: "value",
            name: "Number of Tasks",
            color: "black",// Updated text for the x-axis
            nameLocation: "middle",
            nameGap: 35, // Adds space to position the label properly
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                fontSize: 10,
                color: getThemeColor("body-color"),
                formatter: "{value}",
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            splitLine: {
                show: true, // Show grid lines for better readability
                lineStyle: {
                    type: "dashed",
                    color: getThemeColor("tertiary-bg"),
                },
            },
            min: 0, // Start from 0 for proper scaling
            max: function(value) {
                // Set max to the highest value plus some padding
                return Math.ceil(value.max * 1.2);
            },
        },
        yAxis: {
            type: "category",
            data: taskDates,
            name: "Selected Dates", // Adds "Selected Dates" label before the dates
            nameLocation: "middle",
            nameGap: 60, // Adjusts spacing between the label and the axis
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 10,
                color: getThemeColor("secondary-color"),
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            inverse: true, // To align dates from top to bottom
        },
        series: [
            {
                name: "Tasks",
                type: "bar",
                data: taskCounts2,
                barWidth: "50%",
                itemStyle: {
                    color: "#FF69B4",
                },
                label: {
                    show: true,
                    position: "insideRight",
                    formatter: "{c}",
                    fontSize: 10,
                    fontWeight: 600,
                    color: getThemeColor("light-text-emphasis"),
                    padding: [0, -15, 0, 0],
                },
            },
        ],
        grid: {
            left: 100,
            right: 20,
            bottom: 50,
            top: "10%",
            containLabel: true,
        },
        // title: {
        //     text: "Created By Developer",
        //     left: "center",
        //     textStyle: {
        //         fontFamily: "Nunito Sans",
        //         fontWeight: 700,
        //         fontSize: 16,
        //         color: getThemeColor("secondary-color"),
        //     },
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item: { marker: any; seriesName: any; value: any }) =>
                            `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
    });

    //4]code for My Pass-On Tasks chart

    const objectiveAssignedByMeGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveAssignedByMeGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });

            // Use setState to update the arrays, ensuring React re-renders the component
            setDates2(response.data.selected_dates || []);
            setCounts3(response.data.counts || []);

            console.log('Seleted Dates:', response.data.selected_dates);
            console.log('Counts', response.data.counts);

            return response.data.counts;
        } catch (error) {
            console.error('Error fetching Developer Status data:', error);
            return [];
        }
    };

    useEffect(() => {
        objectiveAssignedByMeGraph(params);
    }, [startDate, endDate]);

    const getDefaultOptions4 = (getThemeColor: (arg0: string) => any) => ({
        color: [getThemeColor("highlight")],
        xAxis: {
            type: "value",
            name: "Number of Tasks",
            color: "black",// Updated text for the x-axis
            nameLocation: "middle",
            nameGap: 35,
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                show: true, // Show the x-axis labels for proper scaling
                fontSize: 10,
                color: getThemeColor("body-color"),
                formatter: "{value}",
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            splitLine: {
                show: true, // Show grid lines for better readability
                lineStyle: {
                    type: "dashed",
                    color: getThemeColor("tertiary-bg"),
                },
            },
            min: 0, // Start from 0 for proper scaling
            max: function(value) {
                // Set max to the highest value plus some padding
                return Math.ceil(value.max * 1.2);
            },
        },
        yAxis: {
            type: "category",
            data: taskDates2,
            name: "Selected Dates", // Adds "Selected Dates" label before the dates
            nameLocation: "middle",
            nameGap: 60, // Adjusts spacing between the label and the axis
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 10,
                color: getThemeColor("secondary-color"),
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            inverse: true, // To align dates from top to bottom
        },
        series: [
            {
                name: "Tasks",
                type: "bar",
                data: taskCounts3,
                barWidth: "50%",
                itemStyle: {
                    color: "#FF69B4",
                },
                label: {
                    show: true,
                    position: "insideRight",
                    formatter: "{c}",
                    fontSize: 10,
                    fontWeight: 600,
                    color: getThemeColor("light-text-emphasis"),
                    padding: [0, -300, 0, 0], //number count '0' left side sathi
                },
            },
        ],
        grid: {
            left: 100,
            right: 20,
            bottom: 50,
            top: "10%",
            containLabel: true,
        },
        // title: {
        //     text: "Created By Developer",
        //     left: "center",
        //     textStyle: {
        //         fontFamily: "Nunito Sans",
        //         fontWeight: 700,
        //         fontSize: 16,
        //         color: getThemeColor("secondary-color"),
        //     },
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item: { marker: any; seriesName: any; value: any }) =>
                            `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
    });




    //5]code for Collegue Task chart


    const objectiveAssignedToMeGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];

        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveAssignedToMeGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params, // Add the params here
            });

            // Use setState to update the arrays, ensuring React re-renders the component
            setDates3(response.data.selected_dates || []);
            setCounts4(response.data.counts || []);

            console.log('Seleted Dates:', response.data.selected_dates);
            console.log('Counts', response.data.counts);

            return response.data.counts;
        } catch (error) {
            console.error('Error fetching Developer Status data:', error);
            return [];
        }
    };

    useEffect(() => {
        objectiveAssignedToMeGraph(params);
    }, [startDate, endDate]);



    const getDefaultOptions5 = (getThemeColor: (arg0: string) => any) => ({
        color: [getThemeColor("highlight")],
        xAxis: {
            type: "value",
            name: "Number of Tasks", // Updated text for the x-axis
            nameLocation: "middle",
            nameGap: 35,
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                show: true, // Show the x-axis labels for proper scaling
                fontSize: 10,
                color: getThemeColor("body-color"),
                formatter: "{value}",
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            splitLine: {
                show: true, // Show grid lines for better readability
                lineStyle: {
                    type: "dashed",
                    color: getThemeColor("tertiary-bg"),
                },
            },
            min: 0, // Start from 0 for proper scaling
            max: function(value) {
                // Set max to the highest value plus some padding
                return Math.ceil(value.max * 1.2);
            },
        },
        yAxis: {
            type: "category",
            data: taskDates3,
            name: "Selected Dates", // Adds "Selected Dates" label before the dates
            nameLocation: "middle",
            nameGap: 60, // Adjusts spacing between the label and the axis
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 10,
                color: getThemeColor("secondary-color"),
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            inverse: true, // To align dates from top to bottom
        },
        series: [
            {
                name: "Tasks",
                type: "bar",
                data: taskCounts4,
                barWidth: "50%",
                itemStyle: {
                    color: "#FF69B4",
                },
                label: {
                    show: true,
                    position: "insideRight",
                    formatter: "{c}",
                    fontSize: 10,
                    fontWeight: 600,
                    color: getThemeColor("light-text-emphasis"),
                    padding: [0, -15, 0, 0], // Fixed padding to make labels visible
                },
            },
        ],
        grid: {
            left: 100,
            right: 20,
            bottom: 50,
            top: "10%",
            containLabel: true,
        },
        // title: {
        //     text: "Created By Developer",
        //     left: "center",
        //     textStyle: {
        //         fontFamily: "Nunito Sans",
        //         fontWeight: 700,
        //         fontSize: 16,
        //         color: getThemeColor("secondary-color"),
        //     },
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item: { marker: any; seriesName: any; value: any }) =>
                            `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
    });

    //6]code for Target Tracker chart
    const targetCategories = [
        "Number",
        "Currency",
        "Done / Not Done",
        "Without Target",
    ];


    const objectiveTargetTrackerGraph = async (params) => {
        const token = localStorage.getItem('token');
        const cleanToken = token && token.split('|')[1];
        console.log(cleanToken);

        try {
            const response = await axiosInstance.get('/objectiveTargetTrackerGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params,
            });


            setTargetStatusIncomplete([
                response.data.targetNumberCompleted,
                response.data.targetCurrencyCompleted,
                response.data.targetDNDCompleted,
                response.data.targetWithout
            ]);

            setTargetStatusComplete([
                response.data.targetNumberTotal,
                response.data.targetCurrencyTotal,
                response.data.targetDNDTotal,

            ]);

            console.log("Updated targetStatusIncomplete: ", targetStatusIncomplete);
            console.log("Updated targetStatusComplete: ", targetStatusComplete);


            return response.data.counts;
        } catch (error) {
            console.error('Error fetching target tracker data:', error);
            return [];
        }
    };

    useEffect(() => {
        objectiveTargetTrackerGraph(params);
    }, [startDate, endDate]);
    // Call the function
    // objectiveTargetTrackerGraph(params);

    const getTargetTrackerOptions = (getThemeColor: {
        (name: string): string;
        (arg0: string): any;
    }) => ({
        color: [
            getThemeColor("success"), // Color for "Completed" - now green
            getThemeColor("warning"), // Color for "Total" - now orange
        ],
        xAxis: {
            type: "value",
            axisLabel: {
                show: false, // Hides the x-axis labels
            },
            axisLine: {
                show: false, // Hides the x-axis line
            },
            splitLine: {
                show: false, // Hides grid lines
            },
        },
        yAxis: {
            type: "category",
            data: targetCategories,
            name: "Target Types", // Adds label to y-axis as seen in the provided image
            nameLocation: "middle",
            nameGap: 80, // Positions the label properly
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12.8,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                color: getThemeColor("secondary-color"),
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12.8,
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
        },
        series: [
            {
                name: "Completed",
                type: "bar",
                stack: "status",
                data: targetStatusIncomplete,
                barWidth: "40%", // Increase the bar width
                itemStyle: {
                    color: getThemeColor("success"), // Changed to green for "Completed"
                },
                label: {
                    show: true,
                    position: "inside",
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                    padding: [0, -15, 0, 0],
                },
                tooltip: {
                    show: false,
                },
            },
            {
                name: "Total",
                type: "bar",
                stack: "status",
                data: targetStatusComplete,
                barWidth: "40%", // Match the same bar width
                itemStyle: {
                    color: getThemeColor("warning"), // Changed to orange for "Total"
                },
                label: {
                    show: true,
                    position: "insideRight",
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                    padding: [0, -30, 0, 0],
                },
            },
        ],
        grid: {
            right: 50, // Increase the right grid spacing for label overflow
            left: 100,
            bottom: 50,
            top: "15%",
            containLabel: true,
        },

        // title: {
        //     text: "Target Tracker",
        //     left: "center",
        //     textStyle: {
        //         color: getThemeColor("secondary-color"),
        //         fontSize: 16,
        //         fontWeight: 700,
        //         fontFamily: "Nunito Sans",
        //     },
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .filter((item) => item.seriesName === "Total") // Show only tooltip for Total
                    .map(
                        (item) => `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
        legend: {
            data: ["Completed", "Total"],
            bottom: 10,
            itemWidth: 16,
            itemHeight: 8,
            textStyle: {
                color: getThemeColor("body-color"),
                fontWeight: 600,
                fontFamily: "Nunito Sans",
            },
        },
    });


    //7]code for Caution List chart
    const taskCategories3 = [
        "Total Task",
        "Zero Days",
        "Less than 3/day",
        "Less than 5/day",
        "More than 5/day",
        "False Reporting",
        "Missing TAT",
    ];


    const objectiveCautionListGraph = async (params) => {
        const token = localStorage.getItem('token');

        // Get the part of the token after the '|'
        const cleanToken = token && token.split('|')[1]; // This will take the part after the '|'

        console.log(cleanToken); // To verify the cleaned token

        try {
            const response = await axiosInstance.get('/objectiveCautionListGraph', {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: params,
            });

            setTargetStatusTasks(response.data.counts);



            return response.data.counts;
        } catch (error) {
            console.error('Error fetching caution list data:', error);
            return [];
        }
    };


    useEffect(() => {
        objectiveCautionListGraph(params);
    }, [startDate, endDate]);
    // Call the function
    //objectiveCautionListGraph();


    const getTargetTrackerOptions2 = (getThemeColor: {
        (name: string): string;
        (arg0: string): any;
    }) => ({
        color: [
            getThemeColor("danger"), // Color for tasks
        ],
        xAxis: {
            type: "value",
            axisLabel: {
                show: true,
                fontSize: 12,
                fontWeight: 600,
                color: getThemeColor("secondary-color"),
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
            splitLine: {
                show: true, // Enables grid lines
                lineStyle: {
                    type: "dashed",
                    color: getThemeColor("tertiary-bg"),
                },
            },
        },
        yAxis: {
            type: "category",
            data: taskCategories3,
            nameTextStyle: {
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 14,
                color: getThemeColor("secondary-color"),
            },
            axisLabel: {
                color: getThemeColor("secondary-color"),
                fontFamily: "Nunito Sans",
                fontWeight: 600,
                fontSize: 12.8,
            },
            axisLine: {
                lineStyle: {
                    color: getThemeColor("tertiary-bg"),
                },
            },
        },
        series: [
            {
                name: "Tasks",
                type: "bar",
                data: targetStatusTasks,
                barWidth: "40%", // Adjusted bar width to fit within the graph
                itemStyle: {
                    color: getThemeColor("danger"),
                },
                label: {
                    show: true,
                    position: "inside",
                    color: getThemeColor("light-text-emphasis"),
                    fontSize: 12,
                    fontWeight: 600,
                    formatter: (params: any) => params.value, // Displays task count inside the bar
                },
            },
        ],
        grid: {
            right: 20,
            left: 100,
            bottom: 50,
            top: "15%",
            containLabel: true,
        },
        // title: {
        //     text: "Caution List",
        //     left: "center",
        //     textStyle: {
        //         color: getThemeColor("secondary-color"),
        //         fontSize: 16,
        //         fontWeight: 700,
        //         fontFamily: "Nunito Sans",
        //     },
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: (params: any[]) => {
                return params
                    .map(
                        (item) => `${item.marker} ${item.seriesName}: ${item.value}`
                    )
                    .join("<br/>");
            },
        },
        legend: {
            data: ["Tasks"],
            bottom: 10,
            itemWidth: 16,
            itemHeight: 8,
            textStyle: {
                color: getThemeColor("body-color"),
                fontWeight: 600,
                fontFamily: "Nunito Sans",
            },
        },
    });

    const handleNavigate = () => {
        navigate('/inorbvictHierarchy');
    };

    const handleNavigateKPI = () => {
        navigate('/inorbvictHierarchyKPI');
    };
    return (
        <div className="container-fluid mt-2">
            <div className="container-fluid mb-4">
                <Button
                    variant="primary"
                    onClick={handleNavigate}
                    className="me-2"
                >
                    Inorbvict Hierarchy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNavigateKPI}
                    className="me-2"
                >
                    Inorbvict Hierarchy with KPI
                </Button>
            </div>
            <div className="row justify-content-between">
                <div className="col-md-6" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Objective Status</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getDefaultOptions(getThemeColor)}
                        style={{ height: "400px", width: "100%" }}
                    />
                </div>

                <div className="col-md-6" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Collegue Objective Status</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getDefaultCollegueOptions(getThemeColor)}
                        style={{ height: "400px", width: "100%" }}
                    />
                </div>
                <div className="col-md-6" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Flag Counts</h3>
                    </center>
                    <ReactEChartsCore
                        key={`flag-counts-${screenWidth}`}
                        echarts={echarts}
                        option={getDefaultOptions2(getThemeColor)}
                        style={{ height: "500px", width: "100%" }}
                    />
                </div>
                <div className="col-md-6 mt-5" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Created by Developer</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getDefaultOptions3(getThemeColor)}
                        style={{ height: "700px", width: "100%" }}
                    />
                </div>
                <div className="col-md-6 mt-5" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>My Pass-On Tasks</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getDefaultOptions4(getThemeColor)}
                        style={{ height: "700px", width: "100%" }}
                    />
                </div>
                <div className="col-md-6 mt-5" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Colleague Task</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getDefaultOptions5(getThemeColor)}
                        style={{ height: "700px", width: "100%" }}
                    />
                </div>
                <div className="col-md-6 mt-5" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Target Tracker</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getTargetTrackerOptions(getThemeColor)}
                        style={{ height: "700px", width: "90%" }}
                    />
                </div>
                <div className="col-md-6 mt-5" style={{ paddingRight: "1rem" }}>
                    <center>
                        <h3>Caution List</h3>
                    </center>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={getTargetTrackerOptions2(getThemeColor)}
                        style={{ height: "700px", width: "90%" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ObjectiveDashboard;
