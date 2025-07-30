import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import SalesKPIDashboard from "./SalesAceDashboard";
import axiosInstance from "../../axios";

const COLORS = ["#AA34E0", "#6B0899"];

interface PieDataItem {
  name: string;
  value: number;
  count: number;
}

const KPIDistributionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All Team Summary");
  const [tabList, setTabList] = useState<string[]>(["All Team Summary"]);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  // New state variables for dynamic data
  const [kpiSummaryData, setKpiSummaryData] = useState<any[]>([]);
  const [kpiDistributionData, setKpiDistributionData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<PieDataItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const updatePieData = (primaryCount: number, ancillaryCount: number) => {
    const total = primaryCount + ancillaryCount;
    setPieData([
      {
        name: "Primary Roles",
        value: Math.round((primaryCount / total) * 100),
        count: primaryCount
      },
      {
        name: "Ancillary Roles",
        value: Math.round((ancillaryCount / total) * 100),
        count: ancillaryCount
      }
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments for tabs
        const deptResponse = await axiosInstance.get('/roleListing');
        const departmentNames = deptResponse.data.map((dept: any) => dept.name);
        setTabList(["All Team Summary", ...departmentNames]);

        // Fetch all team summary data
        const summaryResponse = await axiosInstance.get('/allTeamSummary', {
          params: { role_id: 0, isAdmin: 1 }
        });
        setKpiSummaryData(summaryResponse.data.map((item: any) => ({
          department: item.role_name,
          total: item.total,
          primary: parseInt(item.primary_total),
          ancillary: parseInt(item.ancillary_total)
        })));

        // Fetch KPI distribution data
        const distributionResponse = await axiosInstance.get('/kpiDistributionAcrossDept', {
          params: { role_id: 0, isAdmin: 1 }
        });
        setKpiDistributionData(distributionResponse.data.roleWiseKpis.map((item: any) => ({
          department: item.role_name,
          value: item.total
        })));

        setTotalCount(distributionResponse.data.totalKpis);

        // Fetch role-based KPI distribution
        const roleBasedResponse = await axiosInstance.get('/roleBasedKpiDistribution', {
          params: { role_id: 0 }
        });
        updatePieData(roleBasedResponse.data.primaryCount, roleBasedResponse.data.ancillaryCount);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    setLoading(true);
    try {
      if (tab !== "All Team Summary") {
        const response = await axiosInstance.get('/roleListing');
        const department = response.data.find((dept: any) => dept.name === tab);
        if (department) {
          setActiveTabId(department.id);

          // Fetch data for specific department
          const [summaryResponse, distributionResponse, roleBasedResponse] = await Promise.all([
            axiosInstance.get('/allTeamSummary', { params: { role_id: department.id, isAdmin: 1 } }),
            axiosInstance.get('/kpiDistributionAcrossDept', { params: { role_id: department.id, isAdmin: 1 } }),
            axiosInstance.get('/roleBasedKpiDistribution', { params: { role_id: department.id } })
          ]);

          setKpiSummaryData(summaryResponse.data.map((item: any) => ({
            department: item.role_name,
            total: item.total,
            primary: parseInt(item.primary_total),
            ancillary: parseInt(item.ancillary_total)
          })));

          setKpiDistributionData(distributionResponse.data.roleWiseKpis.map((item: any) => ({
            department: item.role_name,
            value: item.total
          })));

          updatePieData(roleBasedResponse.data.primaryCount, roleBasedResponse.data.ancillaryCount);
        }
      } else {
        setActiveTabId(null);
        // Fetch data for all teams
        const [summaryResponse, distributionResponse, roleBasedResponse] = await Promise.all([
          axiosInstance.get('/allTeamSummary', { params: { role_id: 0, isAdmin: 1 } }),
          axiosInstance.get('/kpiDistributionAcrossDept', { params: { role_id: 0, isAdmin: 1 } }),
          axiosInstance.get('/roleBasedKpiDistribution', { params: { role_id: 0 } })
        ]);

        setKpiSummaryData(summaryResponse.data.map((item: any) => ({
          department: item.role_name,
          total: item.total,
          primary: parseInt(item.primary_total),
          ancillary: parseInt(item.ancillary_total)
        })));

        setKpiDistributionData(distributionResponse.data.roleWiseKpis.map((item: any) => ({
          department: item.role_name,
          value: item.total
        })));

        updatePieData(roleBasedResponse.data.primaryCount, roleBasedResponse.data.ancillaryCount);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "Nunito Sans, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "32px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        {tabList.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: activeTab === tab ? "2px solidrgb(66, 122, 245)" : "1px solid #e5e7eb",
              background: activeTab === tab ? "#2563eb" : "#fff",
              color: activeTab === tab ? "#fff" : "#2563eb",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(37,99,235,0.08)" : "none",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {(activeTab !== "All Team Summary") ? (
        <SalesKPIDashboard departmentId={activeTabId} />
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 800, marginBottom: "24px" }}>KPI Distribution Summary</h2>
            <ResponsiveContainer width="100%" height={480}>
              <BarChart
                data={kpiSummaryData}
                margin={{ top: 40, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total KPI" fill="#22E5C4" barSize={12} label={{ position: "top", fontWeight: 700, fontSize: 13 }} />
                <Bar dataKey="primary" name="Primary Role" fill="#1BCEFF" barSize={12} label={{ position: "top", fontWeight: 700, fontSize: 13 }} />
                <Bar dataKey="ancillary" name="Ancillary Role" fill="#3770FF" barSize={12} label={{ position: "top", fontWeight: 700, fontSize: 13 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: "32px", marginTop: "32px", flexWrap: "wrap" }}>
            <div style={{ flex: 2, background: "#fff", borderRadius: "16px", padding: "24px", minWidth: "340px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>KPI Distribution Across Departments</span>
                <span style={{ fontWeight: 700, color: "#CF9CF8" }}>Total: {totalCount}</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={kpiDistributionData}
                  margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis dataKey="department" type="category" width={120} tick={{ fontSize: 13 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7A5C92" radius={[8, 8, 8, 8]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, background: "#fff", borderRadius: "16px", padding: "24px", minWidth: "320px" }}>
              <span style={{ fontWeight: 700, marginBottom: 16, display: "block" }}>Role-Based KPI Distribution</span>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, value, x, y, textAnchor }) => (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        fill="#666"
                        fontSize={12}
                        fontWeight={600}
                        dy={8}
                      >
                        {`${name} (${value}%)`}
                      </text>
                    )}
                    labelLine={{ stroke: '#666', strokeWidth: 1 }}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      const data = props.payload as PieDataItem;
                      return [`${data.count} KPIs (${value}%)`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KPIDistributionDashboard;
