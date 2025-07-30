import React, { useEffect, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { useAppContext } from "../../providers/AppProvider";
import axiosInstance from "../../axios";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";




const KpiDashboards = ({
  height,
  width,
}: {
  height: string;
  width: string;
}) => {
  const { getThemeColor } = useAppContext();
  const [startDate, setStartDate] = useState(localStorage.getItem("start_dt"));
  const [endDate, setEndDate] = useState(localStorage.getItem("end_dt"));
  const empId = localStorage.getItem('employee_id');
  const [taskCountsExpired, setTaskCountsExpired] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [taskCountsWithinTAT, setTaskCountsWithinTAT] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [targetStatusIncomplete, setTargetStatusIncomplete] = useState([0, 0, 0, 0]);
  const [targetStatusComplete, setTargetStatusComplete] = useState([0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskCounts, setTaskCounts] = useState([]);
  const navigate = useNavigate();
  const params = {
    start_dt: startDate,
    end_dt: endDate,
    user_id: empId
  };


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

  const kpiStatusGraph = async (params) => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    try {
      const response = await axiosInstance.get('/kpiStageGraph', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        params: params, // Add the params here
      });

      // Update state with the fetched data
      setTaskCountsExpired(response.data.stageTATExpiredCount || []);
      setTaskCountsWithinTAT(response.data.stageWithinTATCount || []);
      setTaskCategories(response.data.stageCountXAxisPoints || []);

      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching Objective Status data:', error);
      //setError('Error fetching data'); // Set error state if an error occurs
      setLoading(false);
    }
  };

  useEffect(() => {
    kpiStatusGraph(params);
  }, [startDate, endDate]);

  // if (loading) {
  //   return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
  //     <Spinner animation="border" role="status" className="me-2">
  //       <span className="visually-hidden">Loading...</span>
  //     </Spinner>
  //   </div>
  // }

  // if (error) {
  //   return <div>{error}</div>; // Show an error message if an error occurs
  // }

  echarts.use([
    TooltipComponent,
    BarChart,
    CanvasRenderer,
    GridComponent,
    LegendComponent,
  ]);


  // let taskCategories = [
  //   "Total KPIs",
  //   "To Do",
  //   "In Progress",
  //   "Hold",
  //   "Abort",
  //   "Review",
  //   "Complete",
  //   "False Report",
  // ];


  // let taskCountsExpired = [0, 0, 0, 0, 0, 0, 0, 0]; // TAT expired
  // let taskCountsWithinTAT = [0, 0, 0, 0, 0, 0, 0, 0]; // Within TAT

  // const kpiStatusGraph = async () => {
  //   console.log("KPI");
  //   const token = localStorage.getItem('token');
  //   const cleanToken = token && token.split('|')[1]; 

  //   console.log(cleanToken); 

  //   try {
  //       const response = await axiosInstance.get('kpiStageGraph', {
  //           headers: {
  //               Authorization: `Bearer ${cleanToken}`, 
  //           },
  //       });


  //       taskCountsExpired = response.data.stageWithinTATCount || [];
  //       taskCountsWithinTAT = response.data.stageTATExpiredCount || [];
  //       taskCategories = response.data.stageCountXAxisPoints || [];

  //       console.log('Updated Stage Within TAT Count:', taskCountsExpired);
  //       console.log('Updated Stage TAT Expired Count:', taskCountsWithinTAT);

  //       return response.data.counts;
  //   } catch (error) {
  //       console.error('Error fetching Objective Status data:', error);
  //       return []; 
  //   }
  // };

  // kpiStatusGraph();


  const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
    color: [getThemeColor("primary"), getThemeColor("tertiary-bg")],
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
      formatter: (params: any) => {
        return params
          .map(
            (item: any) =>
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
      name: "Status",
      nameLocation: "center",
      nameGap: 70,
      nameTextStyle: {
        color: "#1a1a1a",
        fontFamily: "Nunito Sans",
        fontWeight: 700,
        fontSize: 14,
      },
      axisLabel: {
        color: getThemeColor("secondary-color"),
        fontFamily: "Nunito Sans",
        fontWeight: 600,
        fontSize: 12,
        interval: 0,
        rotate: 0,
        formatter: function (value: string) {
          return value.split(' ').join('\n');
        }
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
        show: true,
        color: getThemeColor("secondary-color"),
        fontFamily: "Nunito Sans",
        fontWeight: 600,
        fontSize: 12,
      },
    },
    series: [
      {
        name: "TAT expired",
        type: "bar",
        data: taskCountsExpired,
        barWidth: "20%",
        itemStyle: {
          color: getThemeColor("primary"),
        },
        label: {
          show: true,
          position: "top",
          color: getThemeColor("light-text-emphasis"),
          fontSize: 12,
          fontWeight: 600,
          align: "center",
          verticalAlign: "middle",
          distance: 10,
        },
      },
      {
        name: "Within TAT",
        type: "bar",
        data: taskCountsWithinTAT,
        barWidth: "20%",
        itemStyle: {
          color: getThemeColor("tertiary-bg"),
        },
        label: {
          show: true,
          position: "top",
          color: getThemeColor("light-text-emphasis"),
          fontSize: 12,
          fontWeight: 600,
          align: "center",
          verticalAlign: "middle",
          distance: 10,
        },
      },
    ],
    grid: {
      right: 0,
      left: 50,
      bottom: 80,
      top: "15%",
      containLabel: true,
    },
    graphic: {
      type: "text",
      left: "50%",
      bottom: "5%",
      style: {
        // text: "Number of Tasks",
        fill: getThemeColor("secondary-color"),
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "Nunito Sans",
        textAlign: "center",
      },
    },
  });

  const taskCategories2 = [
    "Total Tasks",
    "Urgent",
    "Low",
    "Medium",
    "High",
    "Directors Priority",
    "Salary Hold",
  ];

  const kpiPriorityGraph = async (params) => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];

    console.log(cleanToken);

    try {
      const response = await axiosInstance.get('/kpiPriorityGraph', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        params: params, // Add the params here
      });


      const KPIFlagCountPoints = response.data.kpiFlagCountPoints;
      console.log('Flag Count Points:', KPIFlagCountPoints);

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
      KPIFlagCountPoints.forEach(point => {
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
    kpiPriorityGraph(params);
  }, [startDate, endDate]);

  const getDefaultOptions2 = (getThemeColor: (name: string) => string) => ({
    color: [getThemeColor("primary")],
    xAxis: {
      type: "category",
      data: [
        "Total Tasks",
        "Urgent",
        "Low",
        "Medium",
        "High",
        "Directors Priority",
        "Salary Hold",
      ],
      name: "Priority",
      nameLocation: "center",
      nameGap: 80,
      nameTextStyle: {
        color: "#1a1a1a",
        fontFamily: "Nunito Sans",
        fontWeight: 700,
        fontSize: 14,
      },
      axisLabel: {
        color: getThemeColor("secondary-color"),
        fontFamily: "Nunito Sans",
        fontWeight: 600,
        fontSize: 12,
        interval: 0,
        rotate: 0,
        formatter: function (value: string) {
          return value.split(' ').join('\n');
        }
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
      nameGap: 40,
      axisLabel: {
        show: true,
        color: getThemeColor("secondary-color"),
        fontFamily: "Nunito Sans",
        fontWeight: 600,
        fontSize: 12,
      },
    },
    series: [
      {
        name: "Tasks",
        type: "bar",
        data: taskCounts,
        barWidth: "20%",
        itemStyle: {
          color: getThemeColor("primary"),
        },
        label: {
          show: true,
          position: "top",
          color: getThemeColor("light-text-emphasis"),
          fontSize: 12,
          fontWeight: 600,
          align: "center",
          verticalAlign: "middle",
          distance: 10,
        },
      },
    ],
    grid: {
      right: 0,
      left: 50,
      bottom: 80,
      top: "15%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any[]) => {
        return params
          .map((item) => `${item.marker} ${item.seriesName}: ${item.value}`)
          .join("<br/>");
      },
    },
  });
  const targetCategories = [
    "Number",
    "Currency",
    "Done / Not Done",
    "Without Target",
  ];

  const kpiTargetTrackerGraph = async (params) => {
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];
    console.log(cleanToken);

    try {
      const response = await axiosInstance.get('/kpiTargetGraph', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        params: params,
      });


      setTargetStatusIncomplete([
        response.data.targetNumberTotal,
        response.data.targetCurrencyTotal,
        response.data.targetDNDTotal,
        response.data.targetWithout
      ]);

      setTargetStatusComplete([
        response.data.targetNumberCompleted,
        response.data.targetCurrencyCompleted,
        response.data.targetDNDCompleted,
        0 // For 'Without Target', always 0
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
    kpiTargetTrackerGraph(params);
  }, [startDate, endDate]);

  const getTargetTrackerOptions = (getThemeColor) => ({
    color: [
      getThemeColor("warning"),
      getThemeColor("success"),
    ],
    xAxis: {
      type: "value",
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "category",
      data: targetCategories,
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
        name: "Total",
        type: "bar",
        stack: "status",
        data: targetStatusIncomplete,
        barWidth: "20%",
        itemStyle: {
          color: getThemeColor("warning"),
        },
        label: {
          show: true,
          position: "inside",
          color: getThemeColor("light-text-emphasis"),
          fontSize: 12,
          fontWeight: 600,
          padding: [0, -15, 0, 0],
        },
      },
      {
        name: "Complete",
        type: "bar",
        stack: "status",
        data: targetStatusComplete,
        barWidth: "20%",
        itemStyle: {
          color: getThemeColor("success"),
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
      right: 20,
      left: 100,
      bottom: 50,
      top: "15%",
      containLabel: true,
    },
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
      data: ["Total", "Complete"],
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
            <h3>KPI Status</h3>
          </center>
          <ReactEChartsCore
            echarts={echarts}
            option={getDefaultOptions(getThemeColor)}
            style={{ height: "300px", width: "100%" }}
          />
        </div>
        <div className="col-md-6" style={{ paddingRight: "1rem" }}>
          <center>
            <h3>KPI Tasks Priority</h3>
          </center>
          <ReactEChartsCore
            echarts={echarts}
            option={getDefaultOptions2(getThemeColor)}
            style={{ height: "300px", width: "100%" }}
          />
        </div>
        <div className="col-md-6" style={{ paddingRight: "1rem" }}>
          <center>
            <h3>Target Tracker</h3>
          </center>
          <ReactEChartsCore
            echarts={echarts}
            option={getTargetTrackerOptions(getThemeColor)}
            style={{ height: "700px", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default KpiDashboards;
