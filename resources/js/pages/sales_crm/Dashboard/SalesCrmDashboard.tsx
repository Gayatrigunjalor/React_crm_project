import React, { useEffect, useState } from "react";
import { Col, Row, Nav, Tab, Card, Tabs } from "react-bootstrap";
import useAdvanceTable from "../../../hooks/useAdvanceTable";
import AdvanceTableProvider from "../../../providers/AdvanceTableProvider";
import KeyOpportunitiesTable from "./KeyOpportunitiesTable";
import PerformanceTable, { performanceTableColumns } from "./PerformanceTable";
import LeadStatusTable, { LeadStatusTableColumns } from "./LeadStatusTable";
import { keyOpportunityTableColumns } from "./KeyOpportunitiesTable";
import CalendarDashboard from "./calendar/CalendarDashboard";
import Meeting from "./Meeting";
import { BsCheckCircle, BsCalendar, BsKey, BsPerson } from "react-icons/bs";
import Reminder from "./Reminder";
import Todaystask from "./Todaystask";
import StatsGrid from "./StatsGrid";
import StatsGrid2 from "./StatsGrid2";
import TotalCustomer from "./TotalCustomer";
import TotalTeamCustomer from "./TotalTeamCustomer";
import InquiryRecivedDashboard from "./InquiryRecievedDashboard";
import LeadAckBySoftware from "./LeadAckBySoftware";
import LeadAckByAgent from "./LeadAckByAgent";
import PerformanceAnalysis from "./PerformanceAnalysis";
import ProductSourcingDashboard from "./ProductSourcingDashboard";
import ProductSourcingTable, { ProductSourcingColumns } from "./ProductSourcingTable";
import PriceSharedDashboard from "./PriceSharedDashboard";
import TotalQualifiedEnquiries from "./TotalQualifiedEnquiries";
import VictoryDashboard from "./VictoryDashboard";
import VictoryDashboardTeam from "./VictoryDashboardTeam";
import FollowUpDashboard from "./FollowUpDashboard";
import OpportunityTimeline from "./OpportunityTimeline";
import axiosInstance from "../../../axios";
import MeetCalDasboard from "./MeetingCalender/MeetCalDasboard";
import ReminderCalDashboard from "./ReminderCalender/ReminderCalDashboard";
import ProductSourcingTracker from "./ProductSourcingTracker";
import ProductDoneVsNotdone from "./ProductDoneVsNotdone";
import AssignedVsUnassigned from "./AssignedVsUnassigned";
import SourcingTatWise from "./SourcingTatWise";
import SourcingTargetCostWise from "./SourcingTargetCostWise";
import TatAnalysis from "./TatAnalysis";
import ReadyToShare from "./ReadyToShare";
import QuotationSendDashboard from "./QuotationSendDashboard";
import OpportunityTracker from "./OpportunityTracker";
import FollowupTrackerCharts from "./FollowupTrackerCharts";
import TotalCustomerTeamChart from "./TotalCustomerTeamChart";
import TotalInquiriesTeam from "./TotalInquiriesTeam";
import CustomerCategoryTeam from "./CustomerCategoryTeam";
import ProductSourcingTeam from "./ProductSourcingTeam";
import InquirySourceTeam from "./InquirySourceTeam";
import LeadAckSoftwareTeam from "./LeadAckSoftwareTeam"
import LeaDAckyByAgent2 from "./LeadAckByAgent2";
import ProductSourcingTrackerTeam from "./ProductSourcingTrackerTeam";
import SalesPerson from "./SalesPerson";
import SourcingPerformanceTat from "./SourcingPerformanceTat";
import SourcingPerformanceTarget from "./SourcingPerformanceTarget";
import ReadyToShareTeam from "./ReadyToShareTeam";
import ReadyToQuotationTeam from "./ReadyToQuotationTeam";
import FollowUpTrackerTeam from "./FollowUpTrackerTeam";
import OpportunityTracker2 from "./OpportunityTracker2";
import DatePicker from '../../../components/base/DatePicker';
const staticData = [
  { id: 1, opp: "ABC Corp", value: "Consulting" },
  { id: 2, opp: "XYZ Ltd", value: "Software Development" },
  { id: 3, opp: "PQR Inc", value: "Marketing" },
];

const staticData2 = [
  { id: 'op-1001', customerName: "ABC ", oppDate: 'fjsjkl', productName: 'asndjs', status: 'Clarity Pending' },
  { id: 'op-1001', customerName: "XYZ", oppDate: 'fjsjkl', productName: 'asndjs', status: 'Clarity Pending' },
  { id: 'op-1001', customerName: "PQR", oppDate: 'fjsjkl', productName: 'asndjs', status: 'Clarity Pending' },
  { id: 'op-1001', customerName: "ABCD", oppDate: 'fjsjkl', productName: 'asndjs', status: 'Clarity Pending' },
  { id: 'op-1001', customerName: "PQRS", oppDate: 'fjsjkl', productName: 'asndjs', status: 'Clarity Pending' },
];
const staticData3 = [
  { name: 'abc', count: '5' },
  { name: 'abc', count: '5' },
  { name: 'abc', count: '5' },
  { name: 'abc', count: '5' },
  { name: 'abc', count: '5' },
];
const SalesCrmDashboard = () => {
  const [activeTab, setActiveTab] = useState("To-Do");
  const [activeSubTab, setActiveSubTab] = useState("todays-tasks");
  const [activeCalendarTab, setActiveCalendarTab] = useState("todays-tasks");
  const [activeKeyOpportunitiesTab, setActiveKeyOpportunitiesTab] = useState("deal-won");
  const [activePerformanceTab, setActivePerformanceTab] = useState("my-dashboard");
  const [activePerformanceSubTab, setActivePerformanceSubTab] = useState("dashboard");
  const [activeTeamTab, setActiveTeamTab] = useState("team-dashboard");
  const [opportunitiesData, setOpportunitiesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState();
  const [inquiriesData, setInquiries] = useState();
  const [customerBreakdown, setCustomerBreakdown] = useState();
  const [inquirieReceived, setInquirieReceived] = useState<any>();
  const [leadAckByAgent, setleadAckByAgent] = useState();
  const [leadAckBySoftware, setleadAckBySoftware] = useState();
  const [sourcingsTracker, setProductSourcingTracker] = useState();
  const [sourcingsTypeCount, setProductSourcingTypeCount] = useState();
  const [doneNotDoneCount, setProductSourcingdoneNotDoneCount] = useState();
  const [victoryCount, setVictoryCount] = useState();
  const [readyToShareCount, setReadyToShareCount] = useState();
  const [trackerTATWiseCount, setTrackerTATWiseCount] = useState();
  const [trackerCostWiseCount, setTrackerCostWiseCount] = useState();
  const [tatAnalysisCount, setTatAnalysisCount] = useState();
  const [quotationSendCount, setQuotationSendCount] = useState();
  const [followupTrackerChartCount, setFollowupTrackerChartCount] = useState();
  const [followupTrackerCount, setFollowupTrackerCount] = useState();
  const [opportunityTrackerCount, setopportunityTrackerCount] = useState();
  const [stages, setStages] = useState<any[]>([]);
  //TEAM DASHBOARD
  const [teamStatsData, setTeamStatsData] = useState<any[]>([]);
  const [opportunityStatsData, setOpportunityStatsData] = useState<any[]>([]);
  const [victoryStatsData, setVictoryStatsData] = useState<any[]>([]);
  const [FollowupTableData, setFollowupsTableData] = useState<any>({});
  const [teamCustomersData, setTeamCustomersData] = useState<any[]>([]);
  const [teamInquiryData, setTeamInquiryData] = useState<any[]>([]);
  const [teamInquiryBySourceData, setTeamInquiryBySourceData] = useState<any[]>([]);
  const [teamCustomerStatusBySourceData, setTeamCustomerStatusBySource] = useState<any[]>([]);
  const [teamLeadAckBySoftwareData, setTeamLeadAckBySoftwareData] = useState<any[]>([]);
  const [teamLeadAckByAgentData, setTeamLeadAckByAgentData] = useState<any[]>([]);
  const [followupChartsData, setFollowupChartsData] = useState<any[]>([]);
  const [teamSourcingData, setTeamSourcing] = useState<any[]>([]);
  const [totalReadyToSharePriceData, setTotalReadyToSharePriceData] = useState<any[]>([]);
  const [totalReadyToShareQuotationData, setTotalReadyToShareQuotationData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const handleShow = (userId: any) => {
    console.log("Show details for user:", userId);
  };

  const handleViewDirectory = (id: any) => {
    console.log("View directory with ID:", id);
  };

  const table = useAdvanceTable({
    data: opportunitiesData,
    columns: keyOpportunityTableColumns(handleShow, handleViewDirectory),
    pageSize: 10,
    pagination: true,
    sortable: true,
    selection: false,
  });

  const table2 = useAdvanceTable({
    data: staticData,
    columns: performanceTableColumns(handleShow, handleViewDirectory),
    pageSize: 10,
    pagination: true,
    sortable: true,
    selection: false,
  });

  const leadTable = useAdvanceTable({
    data: staticData2,
    columns: LeadStatusTableColumns(handleShow, handleViewDirectory),
    pageSize: 10,
    pagination: true,
    sortable: true,
    selection: false,
  });
  const productSourcingTable = useAdvanceTable({
    data: staticData3,
    columns: ProductSourcingColumns(handleShow, handleViewDirectory),
    pageSize: 10,
    pagination: true,
    sortable: true,
    selection: false,
  });
  const followUpData = Object.entries(FollowupTableData || {}).map(([status, count]: [any, any]) => ({
    status,
    count
  }));


  // const stages = [
  //   { label: "100%", count: 100 },
  //   { label: "70%", count: 70 },
  //   { label: "60%", count: 60 },
  //   { label: "50%", count: 50 },
  //   { label: "30%", count: 30 },
  //   { label: "40%", count: 40 },
  //   { label: "20%", count: 20 },
  // ];

  const stages2 = [
    "Inquiry Received",
    "Lead Acknowledgment",
    "Product Sourcing",
    "Price Shared",
    "Quotation Sent",
    "Follow Up",
    "Victory Stage",
  ];

  // Handle API call when tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
      try {
        const endpoint = activeKeyOpportunitiesTab === 'deal-won'
          ? '/get_deal_won'
          : '/getKeyOpportunities';

        const response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          }
        });

        if (response.data.status) {
          setOpportunitiesData(response.data.data);
        } else {
          // Handle failure (show message or empty state)
          setOpportunitiesData([]);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeKeyOpportunitiesTab]);


  useEffect(() => {
    const fetchSalesFunnelCount = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      try {
        setLoading(true);

        const response = await axiosInstance.get("/getSalesFunnelCount", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });


        const funnelData = response.data.sales_funnel;

        const dynamicStages = Object.entries(funnelData).map(([key, value]) => ({
          label: formatLabel(key),
          count: value,
        }));

        setStages(dynamicStages);
      } catch (error) {
        console.error("Error:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchSalesFunnelCount();
  }, []);
  ``
  const totalCount = stages.reduce((sum: number, stage: any) => sum + stage.count, 0);

  const formatLabel = (key: any) => {
    // Convert snake_case to Title Case
    return key
      .split("_")
      .map((word: any) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Add a helper function for local YYYY-MM-DD formatting
  function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add a handler to fetch dashboard data with date filters
  const fetchPerformanceData = async (startDateParam?: string, endDateParam?: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];
    try {
      const endpoint = activePerformanceSubTab === 'dashboard'
        ? '/getDashboardSummary'
        : '';
      let url = endpoint;
      if (startDateParam && endDateParam) {
        url += `?start_date=${startDateParam}&end_date=${endDateParam}`;
      }
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        }
      });

      console.log("!!!!!!!!!!!!!!!", response.data);
      setTotalCustomers(response.data.total_customers);
      setInquiries(response.data.inquiries);
      setCustomerBreakdown(response.data.customer_breakdown);
      setInquirieReceived(response.data.inquiry_received);
      setleadAckByAgent(response.data.lead_acknowledgment_agent);
      setleadAckBySoftware(response.data.lead_acknowledgment_software)
      setProductSourcingTracker(response.data.Product_Sourcing_Tracker);
      setProductSourcingTypeCount(response.data['Assigned vs Unassigned Sourcing']);
      setProductSourcingdoneNotDoneCount(response.data['Product Sourcing Done or not done']);
      setVictoryCount(response.data.Victory);
      setTrackerTATWiseCount(response.data['Sourcing Performance Status Tracker-TAT Wise']);
      setTrackerCostWiseCount(response.data['Sourcing Performance Status Tracker - Target Cost Wise']);
      setReadyToShareCount(response.data['Ready To Share Price (Within 2 days after sourcing)']);
      setTatAnalysisCount(response.data['TAT Analysis For Price Shared']);
      setQuotationSendCount(response.data['Quotation Send Dashboard']);
      setFollowupTrackerChartCount(response.data['Follow Up Tracker Charts']);
      setFollowupTrackerCount(response.data['Follow Up Tracker'].follow_up_count);
      setopportunityTrackerCount(response.data['Opportunity Tracker']);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDashboardData = async (startDateParam?: string, endDateParam?: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const cleanToken = token && token.split('|')[1];
    try {
      const endpoint = activeTeamTab === 'team-dashboard'
        ? '/getTeamDashboard'
        : '';
      let url = endpoint;
      if (startDateParam && endDateParam) {
        url += `?start_date=${startDateParam}&end_date=${endDateParam}`;
      }
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        }
      });
      setTeamStatsData(response.data.overall_stats);
      setOpportunityStatsData(response.data.opportunity_tracker);
      setVictoryStatsData(response.data.victory_stats);
      setFollowupsTableData(response.data.follow_up_dashboard);
      const totalCustomers = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        total_customers: emp.total_customers,
      }));
      setTeamCustomersData(totalCustomers);
      const totalInquiries = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        total_inquiries: emp.total_inquiries,
        total_software_qualified: emp.total_software_qualified,
        total_agent_qualified: emp.total_agent_qualified,
      }));
      setTeamInquiryData(totalInquiries);
      const totalInquiriesBySource = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        platform_wise_stats: emp.platform_wise_stats,
      }));
      setTeamInquiryBySourceData(totalInquiriesBySource);
      const totalleadAckBySoftware = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        lead_ack_bySoftware_stats: emp.lead_ack_bySoftware_stats,
      }));
      setTeamLeadAckBySoftwareData(totalleadAckBySoftware);
      const totalleadAckByAgent = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        lead_ack_byAgent_stats: emp.lead_ack_byAgent_stats,
      }));
      setTeamLeadAckByAgentData(totalleadAckByAgent);
      const followupCharts = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        follow_up_tracker_charts: emp.follow_up_tracker_charts,
      }));
      setFollowupChartsData(followupCharts);
      const totalCustomerStatusBySource = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        customer_status_stats: emp.customer_status_stats,
      }));
      setTeamCustomerStatusBySource(totalCustomerStatusBySource);
      const totalTeamSourcing = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        sourcing_stats: emp.sourcing_stats,
      }));
      setTeamSourcing(totalTeamSourcing);
      const totalReadyToSharePrice = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        ready_to_share_price: emp.ready_to_share_price,
      }));
      setTotalReadyToSharePriceData(totalReadyToSharePrice);
      const totalReadyToQuotation = response.data.employee_stats.map((emp: any) => ({
        employee_name: emp.employee_name,
        employee_id: emp.employee_id,
        quotation_send_dashboard: emp.quotation_send_dashboard,
      }));
      setTotalReadyToShareQuotationData(totalReadyToQuotation);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to use the new fetchers with date filters
  useEffect(() => {
    // Only fetch if both dates are selected, otherwise fetch all
    if (startDate && endDate) {
      const startStr = startDate instanceof Date ? formatDateLocal(startDate) : '';
      const endStr = endDate instanceof Date ? formatDateLocal(endDate) : '';
      fetchPerformanceData(startStr, endStr);
    } else {
      fetchPerformanceData();
    }
  }, [activePerformanceSubTab, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      const startStr = startDate instanceof Date ? formatDateLocal(startDate) : '';
      const endStr = endDate instanceof Date ? formatDateLocal(endDate) : '';
      fetchTeamDashboardData(startStr, endStr);
    } else {
      fetchTeamDashboardData();
    }
  }, [activeTeamTab, startDate, endDate]);

  const inquiries = [
    { title: "CH-i7PRV", total: inquirieReceived?.purvee || 0, online: inquirieReceived?.purvee_online_Leads || 0, offline: inquirieReceived?.purvee_offline_Leads || 0 },
    { title: "CH-i7IRB", total: inquirieReceived?.healthcare || 0, online: inquirieReceived?.healthcare_online_Leads || 0, offline: inquirieReceived?.healthcare_offline_Leads || 0 },
    { title: "CH-i7VX", total: inquirieReceived?.vortex || 0, online: inquirieReceived?.vortex_online_Leads || 0, offline: inquirieReceived?.vortex_offline_Leads || 0 },

  ];

  const otherInquiries = [
    { title: "Trade Inquiries", total: inquirieReceived ? inquirieReceived.trade : 0 },
    { title: "Chat-bot Inquiries", total: inquirieReceived ? inquirieReceived.chatbot : 0 },
    // { title: "Manual Inquiries", total: inquirieReceived ? inquirieReceived.manual : 0 },
    { title: "E-Mail Inquiries", total: 0 },
    { title: "Website/Manual Inquiries", total: inquirieReceived ? inquirieReceived.manual : 0 },
  ];
  return (
    <>
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)} >
        <Row className="justify-content-center align-items-center">
          <Col md="auto" className="w-100" >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Nav
                variant="underline"
                className="d-flex w-100"
                style={{ justifyContent: "space-between", gap: "10px" }}
              >
                <Nav.Link eventKey="To-Do" className="text-center" style={{ fontSize: "1.3rem" }} >
                  {/* <BsCheckCircle size={24} /> <br />  */}
                  To-Do
                </Nav.Link>

                <Nav.Item>
                  <Nav.Link eventKey="calendar" className="text-center" style={{ fontSize: "1.3rem" }} >
                    {/* <BsCalendar size={24} /> <br />  */}
                    Calendar
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="keyOpportunities" className="text-center" style={{ fontSize: "1.3rem" }} >
                    {/* <BsKey size={24} /> <br /> */}
                    Key Opportunities
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="performance" className="text-center" style={{ fontSize: "1.3rem" }} >
                    {/* <BsPerson size={24} /> <br />  */}
                    Performance
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              {/* <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginRight: '20px' }}>
                <DatePicker
                  value={startDate ? [startDate] : []}
                  onChange={dates => setStartDate(dates[0] || null)}
                  options={{ dateFormat: 'Y-m-d' }}
                  placeholder="Start Date"
                />
                <span style={{ fontWeight: 600 }}>to</span>
                <DatePicker
                  value={endDate ? [endDate] : []}
                  onChange={dates => setEndDate(dates[0] || null)}
                  options={{ dateFormat: 'Y-m-d' }}
                  placeholder="End Date"
                />
              </div> */}
            </div>
          </Col>
        </Row>

        <Tab.Content>
          {/* To-Do Section */}
          <Tab.Pane eventKey="To-Do">
            <hr />
            <Tab.Container activeKey={activeSubTab} onSelect={(k) => setActiveSubTab(k)}>
              <Row className="justify-content-start">
                <Col md="auto" className="w-100" >
                  <Nav variant="underline" className="d-flex" style={{ paddingLeft: "30px", gap: "25px" }}>
                    <Nav.Item><Nav.Link eventKey="todays-tasks" style={{ fontSize: "1rem" }} >Today's Task</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="reminder" style={{ fontSize: "1rem" }}>Reminder</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="meeting" style={{ fontSize: "1rem" }}>Meeting</Nav.Link></Nav.Item>
                  </Nav>
                </Col>
              </Row>

              <Tab.Content>
                <Tab.Pane eventKey="todays-tasks"><hr /><Todaystask /></Tab.Pane>
                <Tab.Pane eventKey="reminder"><hr /><Reminder /></Tab.Pane>
                <Tab.Pane eventKey="meeting"><hr /><Meeting /></Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>

          {/* Calendar Section */}

          <Tab.Pane eventKey="calendar">
            <hr />
            <Tab.Container activeKey={activeCalendarTab} onSelect={(k) => setActiveCalendarTab(k)}>
              <Row className="justify-content-start">
                <Col md="auto" className="w-100">
                  <Nav variant="underline" className="d-flex" style={{ paddingLeft: "30px", gap: "25px" }}>
                    <Nav.Item><Nav.Link eventKey="todays-tasks" style={{ fontSize: "1rem" }}>Today's Task</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="reminder" style={{ fontSize: "1rem" }}>Reminder</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="meeting" style={{ fontSize: "1rem" }}>Meeting</Nav.Link></Nav.Item>
                  </Nav>
                </Col>
              </Row>
              <hr />

              {/* Show different calendar components based on active tab */}
              <Tab.Content>
                <Tab.Pane eventKey="todays-tasks">
                  <CalendarDashboard />
                </Tab.Pane>
                <Tab.Pane eventKey="reminder">
                  <ReminderCalDashboard />
                </Tab.Pane>
                <Tab.Pane eventKey="meeting">
                  <MeetCalDasboard />
                </Tab.Pane>
              </Tab.Content>

            </Tab.Container>
          </Tab.Pane>
          {/* Key Opportunities Section */}
          <Tab.Pane eventKey="keyOpportunities">
            <hr />
            <Tab.Container activeKey={activeKeyOpportunitiesTab} onSelect={(k) => setActiveKeyOpportunitiesTab(k)}>
              <Row className="justify-content-start">
                <Col md="auto" className="w-100">
                  <Nav variant="underline" className="d-flex" style={{ paddingLeft: "30px", gap: "40px" }}>
                    <Nav.Item><Nav.Link eventKey="deal-won" style={{ fontSize: "1rem" }}>Deal Won</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="in-progress" style={{ fontSize: "1rem" }}>In Progress</Nav.Link></Nav.Item>
                  </Nav>
                </Col>
              </Row>

              <Tab.Content>
                <Tab.Pane eventKey="deal-won">
                  <hr />
                  <AdvanceTableProvider {...table}>
                    <KeyOpportunitiesTable />
                  </AdvanceTableProvider>
                </Tab.Pane>
                <Tab.Pane eventKey="in-progress">
                  <hr />
                  <AdvanceTableProvider {...table}>
                    <KeyOpportunitiesTable />
                  </AdvanceTableProvider>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>

          {/* Performance Section */}
          <Tab.Pane eventKey="performance">
            <hr />
            <Tab.Container activeKey={activePerformanceTab} onSelect={(k) => setActivePerformanceTab(k)}>
              <Row className="justify-content-start align-items-center">
                <Col md="auto" className="w-100">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Nav variant="underline" className="d-flex" style={{ paddingLeft: "30px", gap: "40px" }}>
                      <Nav.Item><Nav.Link eventKey="my-dashboard" style={{ fontSize: "1rem" }}>My Dashboard</Nav.Link></Nav.Item>
                      <Nav.Item><Nav.Link eventKey="team-dashboard" style={{ fontSize: "1rem" }}>Team Dashboard</Nav.Link></Nav.Item>
                    </Nav>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginRight: '20px' }}>
                      <DatePicker
                        value={startDate ? [startDate] : []}
                        onChange={(dates: Date[]) => setStartDate(dates[0] || null)}
                        options={{ dateFormat: 'Y-m-d' }}
                        placeholder="Start Date"
                      />
                      <span style={{ fontWeight: 600 }}>to</span>
                      <DatePicker
                        value={endDate ? [endDate] : []}
                        onChange={(dates: Date[]) => setEndDate(dates[0] || null)}
                        options={{ dateFormat: 'Y-m-d' }}
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </Col>
              </Row>

              <Tab.Content>
                <Tab.Pane eventKey="my-dashboard">
                  <Card className="d-flex  shadow-sm border-0 mt-2 p-3">
                    <Tab.Container activeKey={activePerformanceSubTab} onSelect={(k) => setActivePerformanceSubTab(k)}>
                      <Row className="justify-content-start">
                        <Col md="auto" className="w-100">
                          <Nav variant="underline" className="d-flex" style={{ paddingLeft: "30px", gap: "40px" }}>
                            <Nav.Item><Nav.Link eventKey="dashboard">Dashboard</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="sales-funnel">Sales Funnel</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="opp-timeline">Opportunity Timeline</Nav.Link></Nav.Item>
                          </Nav>
                        </Col>
                      </Row>


                      <Tab.Content>
                        <Tab.Pane eventKey="dashboard">
                          <hr />
                          <StatsGrid totalCustomers={totalCustomers} inquiriesData={inquiriesData} />
                          <div className="mt-4">

                            <Row className="g-4">
                              {/* Left Column - Total Customer */}
                              <Col xs={12} md={6}>
                                <TotalCustomer customerBreakdown={customerBreakdown} />
                              </Col>

                              {/* Right Column - Inquiry Received Dashboard */}
                              <Col xs={12} md={6}>
                                <Card className="d-flex flex-column shadow-sm border-0 p-2  align-items-center" style={{ height: "23rem" }}>
                                  <h4 className="text-body-emphasis text-nowrap">Inquiry Received Dashboard</h4>
                                  <div className="container d-flex flex-column justify-content-center align-items-center" style={{ height: "25rem" }}>


                                    {/* First Row - 3 Cards on Large Screens, 2 Cards on Medium Screens */}
                                    <div className="row g-2  w-100 justify-content-center">
                                      {inquiries.slice(0, 3).map((item, index) => (
                                        <div key={index} className="inquiryContainer" >
                                          <div className="card text-center shadow-sm p-1 w-100">
                                            <h4 className="text-primary fw-bold ">{item.total}</h4>
                                            <p className="fw-bold" style={{ fontSize: "0.6rem" }}>{item.title}</p>
                                            <div className="d-flex border-top" style={{ marginTop: '-1rem' }}>
                                              <div className="w-50 border-end">
                                                <h5 className="text-primary">{item.online}</h5>
                                                <p className="mb-0" style={{ fontSize: "0.7rem" }}>Online</p>
                                              </div>
                                              <div className="w-50">
                                                <h5 className="text-primary">{item.offline}</h5>
                                                <p className="mb-0" style={{ fontSize: "0.7rem" }}>Offline</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Second Row - 4 Cards on Large Screens, 2 Cards on Medium Screens */}
                                    <div className="row g-2 w-100 justify-content-center" style={{ margin: '0 auto' }}>
                                      {otherInquiries.slice(0, 4).map((item, index) => (
                                        <div key={index} className=" inquiryContainer " >
                                          <div className="card text-center shadow-sm p-1 w-100">
                                            <h4 className="text-primary fw-bold">{item.total}</h4>
                                            <p className="fw-semibold mb-0" style={{ fontSize: "0.7rem" }}>{item.title}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </Card>
                              </Col>

                              <style>{`  
.inquiryContainer{
  display: flex;
  justify-content: center;
  
  width: 20%;
}
  @media (max-width: 1700px) {
  
    .inquiryContainer {
    width: 50%;
    flex-wrap: wrap;
    }
}
  
`}</style>
                            </Row>

                            <Row>
                              <Col xs={12} md={6}>
                                <LeadAckBySoftware leadAckBySoftware={leadAckBySoftware} />
                              </Col>
                              <Col xs={12} md={6}>
                                <LeadAckByAgent leadAckByAgent={leadAckByAgent} />
                              </Col>
                            </Row>
                            <Row>
                              {/* <Col xs={12} md={6}>
                                <AdvanceTableProvider {...leadTable}>
                                  <LeadStatusTable />
                                </AdvanceTableProvider>
                              </Col> */}
                              <Col xs={12} md={4}>
                                <ProductSourcingTracker sourcingsTracker={sourcingsTracker} />
                              </Col>
                              <Col xs={12} md={4}>
                                <AssignedVsUnassigned sourcingsTypeCount={sourcingsTypeCount} />
                              </Col>
                              <Col xs={12} md={4}>
                                <ProductDoneVsNotdone doneNotDoneCount={doneNotDoneCount} />
                              </Col>
                              {/* <Col xs={12} md={6}>
                                <PerformanceAnalysis />
                              </Col> */}
                            </Row>

                            <Row>
                              <Col xs={12} md={6}>
                                {/* <ProductSourcingDashboard /> */}
                                <SourcingTatWise trackerTATWiseCount={trackerTATWiseCount} />
                              </Col>
                              <Col xs={12} md={6}>
                                {/* <AdvanceTableProvider {...productSourcingTable}> <ProductSourcingTable /></AdvanceTableProvider> */}
                                <SourcingTargetCostWise trackerCostWiseCount={trackerCostWiseCount} />

                              </Col>
                            </Row>

                            <Row>
                              <Col xs={12} md={3}>
                                <ReadyToShare readyToShareCount={readyToShareCount} />

                              </Col>
                              <Col xs={12} md={3}>
                                <TatAnalysis tatAnalysisCount={tatAnalysisCount} />
                              </Col>

                              <Col xs={12} md={6}>
                                <QuotationSendDashboard quotationSendCount={quotationSendCount} />
                              </Col>

                              {/* <Col xs={12} md={6}>
                                <PriceSharedDashboard />
                              </Col>
                              <Col xs={12} md={6}>
                                <TotalQualifiedEnquiries />
                              </Col> */}
                            </Row>
                            <Col xs={12} md={12}>
                              <FollowupTrackerCharts followupTrackerCount={followupTrackerCount} followupTrackerChartCount={followupTrackerChartCount} />
                            </Col>



                            <Row>

                            </Row>


                            <Row>
                              <Col xs={12} md={12}>
                                <OpportunityTracker opportunityTrackerCount={opportunityTrackerCount} />
                              </Col>

                            </Row>
                            {/* <Row>
                              <h4 className="mb-3 text-body-emphasis text-nowrap mt-4">Follow Up Dashboard</h4>
                              <Card className="d-flex flex-column shadow-sm border-0 p-4 mt-2 align-items-center">
                                <div className="container mt-4">
                                  <div className="table-responsive">
                                    <table className="table border">
                                      <thead className="bg-light">
                                        <tr>
                                          <th className="py-3 px-4 text-secondary" style={{ fontWeight: "600" }}>
                                            FOLLOW UP STATUS <span className="text-muted">⬍</span>
                                          </th>
                                          <th className="py-3 px-4 text-secondary " style={{ fontWeight: "600" }}>
                                            COUNT <span className="text-muted">⬍</span>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody >
                                        {followUpData.map((item, index) => (
                                          <tr key={index}>
                                            <td className="py-3 px-4">{item.status}</td>
                                            <td className="py-3 px-4 ">{item.count}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </Card>
                            </Row> */}


                            {/* <FollowUpDashboard/> */}


                            <Row>
                              <Col xs={12} md={6} className="overflow-hidden">
                                <VictoryDashboard victoryCount={victoryCount} />
                              </Col>
                              <Col xs={12} md={6} >
                                <PerformanceAnalysis />
                              </Col>
                            </Row>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="sales-funnel">
                          <hr />
                          {/* <SalesFunnel/> */}
                          <div className="d-flex flex-row justify-content-center align-items-center " style={{ marginTop: '20px' }}>
                            <div className="d-flex flex-column align-items-center mt-4" style={{ gap: '10px' }}>
                              {stages.map((stage, index) => {
                                const percentage = totalCount > 0 ? ((stage.count / totalCount) * 100).toFixed(1) : 0;

                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: "5px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: "#4A8491",
                                        color: "white",
                                        padding: "10px 15px",
                                        width: "200px",
                                        fontWeight: "600",
                                        clipPath:
                                          "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)",
                                        position: "relative",
                                        fontFamily: "Nunito Sans, sans-serif",
                                      }}
                                    >
                                      <div style={{ fontSize: "16px" }}>{percentage}%</div>
                                      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                                        {stage.count}
                                      </div>
                                    </div>

                                    {/* Bottom Info Row */}
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        textAlign: "center",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "200px",
                                        padding: "0 5px",
                                        fontFamily: "Nunito Sans, sans-serif",
                                      }}
                                    >
                                      <span>Average Lead Response Time</span>
                                      {/* <span>Lead Count</span> */}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="d-flex flex-column align-items-center">
                              <img
                                src="/assets/funnel.png"
                                alt="Sales Funnel"
                                style={{ width: "450px", height: "560px", objectFit: "contain" }}
                              />
                            </div>

                            <div className="d-flex flex-column align-items-center " style={{ gap: '34px' }}>
                              {stages2.map((stage, index) => (
                                <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#4A8491",
                                      color: "white",
                                      padding: "10px 15px",
                                      width: "220px",
                                      fontWeight: "600",
                                      clipPath: "polygon(5% 0%, 100% 0%, 95% 50%, 100% 100%, 5% 100%, 0% 50%)",
                                      position: "relative",
                                      fontFamily: "Nunito Sans, sans-serif",
                                      textAlign: "center",
                                      height: "40px"
                                    }}
                                  >
                                    <span>{stage}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="opp-timeline">
                          <hr />
                          <OpportunityTimeline />
                        </Tab.Pane>
                      </Tab.Content>

                    </Tab.Container>
                  </Card>
                </Tab.Pane>




                <Tab.Pane eventKey="team-dashboard">
                  <hr />
                  <Tab.Container activeKey={activeTeamTab} onSelect={(k) => setActiveTeamTab(k)}>
                    <StatsGrid2 teamStatsData={teamStatsData} />
                    <div className="mt-4">

                      <Row className="g-4">
                        {/* Left Column - Total Customer */}
                        <Col xs={12} md={6}>
                          <TotalCustomerTeamChart teamCustomersData={teamCustomersData} />
                          {/* <TotalTeamCustomer /> */}
                        </Col>

                        {/* Right Column - Inquiry Received Dashboard */}
                        <Col xs={12} md={6}>
                          <TotalInquiriesTeam teamInquiryData={teamInquiryData} />

                        </Col>


                      </Row>

                      <Row>
                        <Col xs={12} md={6}>
                          <CustomerCategoryTeam teamCustomerStatusBySourceData={teamCustomerStatusBySourceData} />
                        </Col>
                        <Col xs={12} md={6}>
                          {/* <ProductSourcingTeam/> */}
                          <InquirySourceTeam teamInquiryBySourceData={teamInquiryBySourceData} />
                        </Col>
                      </Row>
                      <Row>

                        <Col xs={12} md={6}>
                          {/* <AdvanceTableProvider {...leadTable}>
                          <LeadStatusTable />
                        </AdvanceTableProvider> */}
                          <LeadAckSoftwareTeam teamLeadAckBySoftwareData={teamLeadAckBySoftwareData} />
                        </Col>
                        <Col xs={12} md={6}>
                          <LeaDAckyByAgent2 teamLeadAckByAgentData={teamLeadAckByAgentData} />
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} md={12}>
                          <ProductSourcingTrackerTeam teamSourcingData={teamSourcingData} />
                        </Col>
                        {/* <Col xs={12} md={6}>
                        <AdvanceTableProvider {...productSourcingTable}> <ProductSourcingTable /></AdvanceTableProvider>

                      </Col> */}
                      </Row>

                      <Row>
                        <Col xs={12} md={6}>
                          <SalesPerson />
                        </Col>
                        <Col xs={12} md={6}>
                          <ProductSourcingTeam />
                        </Col>

                      </Row>

                      <Row>
                        <Col xs={12} md={6}>
                          <SourcingPerformanceTat />
                        </Col>
                        <Col xs={12} md={6}>
                          <SourcingPerformanceTarget />
                        </Col>

                      </Row>
                      <Row>
                        <Col xs={12} md={6}>
                          <ReadyToShareTeam totalReadyToSharePriceData={totalReadyToSharePriceData} />
                        </Col>
                        <Col xs={12} md={6}>
                          <ReadyToQuotationTeam totalReadyToShareQuotationData={totalReadyToShareQuotationData} />
                        </Col>

                      </Row>

                      <Row>
                        <Col xs={12} md={12}>
                          <FollowUpTrackerTeam  followupChartsData={followupChartsData}/>
                        </Col>

                      </Row>

                      <Col xs={12} md={12}>
                        <OpportunityTracker2 opportunityStatsData={opportunityStatsData} />
                      </Col>

                      <Row>
                        <Col xs={12} md={6} className="overflow-hidden">
                          <VictoryDashboardTeam victoryStatsData={victoryStatsData} />
                        </Col>

                        <Col xs={12} md={6} >
                          {/* <h4 className="mb-3 text-body-emphasis text-nowrap mt-4">Follow Up Dashboard</h4> */}
                          <Card
                            className="d-flex shadow-sm border-0 p-3 mt-3 pb-4"
                            style={{
                              height: "30rem",
                              marginBottom: "2rem",
                              boxShadow: `
                                 0 4px 12px rgba(0, 0, 0, 0.08),        
                                 0 8px 16px rgba(0, 0, 0, 0.1),         
                                 inset 0 2px 4px rgba(255, 255, 255, 0.6), 
                                 inset 0 -2px 6px rgba(0, 0, 0, 0.05)    
                               `,
                            }}
                          >
                            <h4 className="mb-3 text-body-emphasis text-nowrap mt-4">Follow Up Dashboard</h4>

                            <div className="container mt-4">
                              <div className="table-responsive">
                                <table className="table border">
                                  <thead className="bg-light">
                                    <tr>
                                      <th className="py-3 px-4 text-secondary" style={{ fontWeight: "600" }}>
                                        FOLLOW UP STATUS
                                      </th>
                                      <th className="py-3 px-4 text-secondary " style={{ fontWeight: "600" }}>
                                        COUNT
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody >
                                    {followUpData.map((item, index) => (
                                      <tr key={index}>
                                        <td className="py-3 px-4">{item.status}</td>
                                        <td className="py-3 px-4 ">{item.count}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                      <Row>

                      </Row>


                      {/* <FollowUpDashboard/> */}



                    </div>
                    {/* <AdvanceTableProvider {...table2}>
                    <PerformanceTable />
                  </AdvanceTableProvider> */}
                  </Tab.Container>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

export default SalesCrmDashboard;
