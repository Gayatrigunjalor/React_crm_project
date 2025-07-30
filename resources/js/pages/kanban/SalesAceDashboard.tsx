import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from "recharts";
import axiosInstance from "../../axios";
import { useAuth } from '../../AuthContext';

// Data


const donutColors = ["#CF9CF8", "#68D7F0"];
const completionColors = ["#7B2FF2", "#e0e7ff"];

const barColors = {
    number: "#1da1f2",
    done: "#b388f9",
    currency: "#002147"
};

// Styles
const cardTitleStyle = {
    fontSize: "15px",
    color: "#64748b",
    fontWeight: 600,
    marginTop: 8,
    textAlign: "center" as const,
    letterSpacing: "0.01em",
    lineHeight: 1.3,
};

const cardValueStyle = {
    fontSize: "32px",
    fontWeight: 800,
    color: "#222",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
};

const chartTitleStyle = {
    fontWeight: 700,
    fontSize: 20,
    marginBottom: 18,
    display: "block",
    color: "#18181b",
    letterSpacing: "-0.01em",
};

const chartBoxStyle = {
    background: "#fff",
    borderRadius: "18px",
    padding: "28px 28px 20px 28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    minHeight: 320,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
};

const legendDotStyle = (color: string) => ({
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    marginRight: 8,
    marginTop: 2,
});

// Custom legends
const DonutLegend = ({ showCompletionStatus }: { showCompletionStatus: boolean }) => {
    if (showCompletionStatus) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18, marginLeft: 32 }}>
                <span style={{ color: "#CF9CF8", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                    <span style={legendDotStyle("#CF9CF8")} /> Completed
                </span>
                <span style={{ color: "#68D7F0", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                    <span style={legendDotStyle("#68D7F0")} /> Pending
                </span>
            </div>
        );
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18, marginLeft: 32 }}>
            <span style={{ color: "#CF9CF8", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                <span style={legendDotStyle("#CF9CF8")} /> Primary Roles
            </span>
            <span style={{ color: "#68D7F0", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                <span style={legendDotStyle("#68D7F0")} /> Ancillary Roles
            </span>
        </div>
    );
};

const CompletionLegend = ({ roleDistribution, selectedRole }: { roleDistribution: RoleDistribution | null, selectedRole: string }) => {
    if (!roleDistribution) return null;

    let completedPercentage, pendingPercentage;

    if (selectedRole === 'all') {
        // For all roles, combine primary and ancillary data
        const totalPrimary = roleDistribution.primaryCount;
        const totalAncillary = roleDistribution.ancillaryCount;
        const total = totalPrimary + totalAncillary;
        
        // Calculate completion percentage for all roles
        const completedPrimary = Math.round((roleDistribution.completed / totalPrimary) * 100);
        const completedAncillary = Math.round((roleDistribution.completed / totalAncillary) * 100);
        completedPercentage = Math.round((completedPrimary + completedAncillary) / 2);
    } else {
        // For specific roles, use direct completion data
        const total = roleDistribution.total;
        completedPercentage = Math.round((roleDistribution.completed / total) * 100);
    }
    
    pendingPercentage = 100 - completedPercentage;

    return (
        <div style={{ display: "flex", gap: 32, marginTop: 18, marginLeft: 8 }}>
            <span style={{ color: "#7B2FF2", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                <span style={legendDotStyle("#7B2FF2")} /> Completed <span style={{ fontWeight: 400, marginLeft: 4 }}>{completedPercentage}%</span>
            </span>
            <span style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center" }}>
                <span style={legendDotStyle("#e0e7ff")} /> Remaining <span style={{ fontWeight: 400, marginLeft: 4 }}>{pendingPercentage}%</span>
            </span>
        </div>
    );
};

const TargetLegend = () => (
    <div style={{ display: "flex", gap: 32, marginBottom: 18, marginLeft: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={legendDotStyle(barColors.number)} />
            <span style={{ color: "#2563eb", fontWeight: 500, fontSize: 16 }}>Target: Number</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={legendDotStyle(barColors.done)} />
            <span style={{ color: "#b388f9", fontWeight: 500, fontSize: 16 }}>Target: DND</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={legendDotStyle(barColors.currency)} />
            <span style={{ color: "#002147", fontWeight: 500, fontSize: 16 }}>Target: Currency</span>
        </span>
    </div>
);

// Custom label for stacked bars
const renderCustomBarLabel = (props: any) => {
    const { x, y, width, height, value, fill } = props;
    const textColor = fill === "#002147" ? "#fff" : "#222";
    return (
        <text
            x={x + width / 2}
            y={y + height / 2 + 6}
            fill={textColor}
            textAnchor="middle"
            fontWeight={700}
            fontSize={16}
        >
            {value}
        </text>
    );
};

// Custom semi-donut for completion rate
const SemiDonut = ({ roleDistribution, selectedRole }: { roleDistribution: RoleDistribution | null, selectedRole: string }) => {
    if (!roleDistribution) return null;

    let completedPercentage, pendingPercentage;

    if (selectedRole === 'all') {
        // For all roles, combine primary and ancillary data
        const totalPrimary = roleDistribution.primaryCount;
        const totalAncillary = roleDistribution.ancillaryCount;
        const total = totalPrimary + totalAncillary;
        
        // Calculate completion percentage for all roles
        const completedPrimary = Math.round((roleDistribution.completed / totalPrimary) * 100);
        const completedAncillary = Math.round((roleDistribution.completed / totalAncillary) * 100);
        completedPercentage = Math.round((completedPrimary + completedAncillary) / 2);
    } else {
        // For specific roles, use direct completion data
        const total = roleDistribution.total;
        completedPercentage = Math.round((roleDistribution.completed / total) * 100);
    }
    
    pendingPercentage = 100 - completedPercentage;

    const completionData = [
        { name: "Completed", value: completedPercentage },
        { name: "Pending", value: pendingPercentage }
    ];

    return (
        <ResponsiveContainer width="100%" height={340}>
            <PieChart>
                <Pie
                    data={completionData}
                    dataKey="value"
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={170}
                    outerRadius={230}
                    labelLine={false}
                    stroke="none"
                >
                    <Cell fill="#7B2FF2" />
                    <Cell fill="#e0e7ff" />
                </Pie>
                {/* Centered text */}
                <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fontWeight="400"
                    fill="#888"
                >
                    Total Target
                </text>
                <text
                    x="50%"
                    y="78%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="25"
                    fontWeight="bold"
                    fill="#240333"
                >
                    100%
                </text>
            </PieChart>
        </ResponsiveContainer>
    );
};

// Custom tooltip for target-wise distribution
const CustomTargetTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px'
            }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ margin: '0 0 3px 0', color: entry.color }}>
                        {entry.name === 'done' ? 'DND' : entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface SalesKPIDashboardProps {
    departmentId: number | null;
}

interface RoleDistribution {
    primaryCount: number;
    ancillaryCount: number;
    total: number;
    completed: number;
    not_completed: number;
}

interface PerformanceData {
    created_by: number;
    totalAssigned: number;
    employee_name: string;
    completed_total: string;
}

interface TargetWiseData {
    created_by: number;
    totalAssigned: number;
    employee_name: string;
    currencyCount: string;
    numberCount: string;
    dndCount: string;
}

interface KPIDistributionDetails {
    totalKpisCount: number;
    totalDndCount: number;
    targetNumberTotal: number;
    targetNumberCompleted: number;
    targetCurrencyTotal: number;
    targetCurrencyCompleted: number;
}

const SalesKPIDashboard: React.FC<SalesKPIDashboardProps> = ({ departmentId }) => {
    const [selectedRole, setSelectedRole] = useState('all');
    const [roleDistribution, setRoleDistribution] = useState<RoleDistribution | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [targetWiseData, setTargetWiseData] = useState<TargetWiseData[]>([]);
    const [kpiDistributionDetails, setKpiDistributionDetails] = useState<KPIDistributionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const { empData } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!departmentId) return;
            
            try {
                setLoading(true);
                const roleType = selectedRole === 'all' ? '' : selectedRole;
                const roleTypeParam = roleType ? `&role_type=${roleType}` : '';
                const isAdminParam = empData?.id === 1 ? '&isAdmin=1' : '';

                // Update role-based KPI distribution API endpoint
                const roleResponse = await axiosInstance.get(`/roleWiseAndCompletionRateGraph?role_id=${departmentId}${roleTypeParam}`);
                setRoleDistribution(roleResponse.data);

                // Fetch KPI performance summary
                const performanceResponse = await axiosInstance.get(`/kpiPerformanceSummary?role_id=${departmentId}${roleTypeParam}${isAdminParam}`);
                setPerformanceData(performanceResponse.data);

                // Fetch KPI target-wise distribution
                const targetResponse = await axiosInstance.get(`/kpiTargetWiseDistribution?role_id=${departmentId}${roleTypeParam}${isAdminParam}`);
                setTargetWiseData(targetResponse.data);

                // Fetch KPI distribution details
                const distributionResponse = await axiosInstance.get(`/kpiDistributionDetails?role_id=${departmentId}${roleTypeParam}`);
                setKpiDistributionDetails(distributionResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [departmentId, selectedRole, empData?.id]);

    // Transform KPI distribution details into sales stats
    const getSalesStats = () => {
        if (!kpiDistributionDetails) return [];

        return [
            { label: "Total KPI's", value: kpiDistributionDetails.totalKpisCount },
            { label: "Total KPI's Done/Not Done", value: kpiDistributionDetails.totalDndCount },
            { label: "Total Target : Number", value: kpiDistributionDetails.targetNumberTotal },
            { label: "Total Target : Currency", value: `${kpiDistributionDetails.targetCurrencyTotal}` },
            { label: "Complete Target in Number", value: kpiDistributionDetails.targetNumberCompleted },
            { label: "Complete Target in Currency", value: `${kpiDistributionDetails.targetCurrencyCompleted}` },
        ];
    };

    // Calculate percentages for donut chart
    const calculatePercentages = () => {
        if (!roleDistribution) return { primary: 0, ancillary: 0, completed: 0, pending: 0 };
        
        if (selectedRole !== 'all') {
            // For specific roles, calculate completion percentage
            const total = roleDistribution.total;
            const completedPercentage = Math.round((roleDistribution.completed / total) * 100);
            const pendingPercentage = 100 - completedPercentage;
            
            return {
                completed: completedPercentage,
                pending: pendingPercentage
            };
        }
        
        // For all roles, calculate role distribution
        const total = roleDistribution.primaryCount + roleDistribution.ancillaryCount;
        const primaryPercentage = Math.round((roleDistribution.primaryCount / total) * 100);
        const ancillaryPercentage = 100 - primaryPercentage;
        
        return {
            primary: primaryPercentage,
            ancillary: ancillaryPercentage
        };
    };

    const percentages = calculatePercentages();
    const donutData = selectedRole !== 'all' 
        ? [
            { name: "Completed", value: percentages.completed },
            { name: "Pending", value: percentages.pending }
        ]
        : [
            { name: "Primary Roles", value: percentages.primary },
            { name: "Ancillary Roles", value: percentages.ancillary }
        ];

    // Transform performance data for the chart
    const transformedPerformanceData = performanceData.map(item => ({
        name: item.employee_name,
        assigned: item.totalAssigned,
        completed: parseInt(item.completed_total)
    }));

    // Transform target-wise data for the chart
    const transformedTargetWiseData = targetWiseData.map(item => ({
        name: item.employee_name,
        number: parseInt(item.numberCount) || 0,
        done: parseInt(item.dndCount) || 0,
        currency: parseInt(item.currencyCount) || 0
    }));

    // Custom tooltip for donut chart
    const CustomDonutTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            let count;
            
            if (selectedRole !== 'all') {
                count = data.name === "Completed" 
                    ? roleDistribution?.completed 
                    : roleDistribution?.not_completed;
            } else {
                count = data.name === "Primary Roles" 
                    ? roleDistribution?.primaryCount 
                    : roleDistribution?.ancillaryCount;
            }

            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}>
                    <p style={{ margin: 0 }}>{`${data.name}: ${data.value}%`}</p>
                    <p style={{ margin: 0 }}>{`Count: ${count}`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "32px 18px" }}>
            {/* Role Selector */}
            <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                marginBottom: "20px",
                paddingRight: "20px"
            }}>
                <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        fontSize: "14px",
                        color: "#1e293b",
                        cursor: "pointer",
                        outline: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                >
                    <option value="all">All Roles</option>
                    <option value="primary">Primary Roles</option>
                    <option value="ancillary">Ancillary Roles</option>
                </select>
            </div>

            {/* Cards */}
            <div style={{
                display: "flex",
                gap: "18px",
                marginBottom: "32px",
                flexWrap: "wrap",
                justifyContent: "flex-start",
            }}>
                {getSalesStats().map((stat, idx) => (
                    <div key={idx} style={{
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "28px 36px",
                        minWidth: "180px",
                        flex: 1,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        maxWidth: 220,
                    }}>
                        <span style={cardValueStyle}>{stat.value}</span>
                        <span style={cardTitleStyle}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* 2x2 grid for charts */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "28px",
                marginBottom: "24px",
            }}>
                {/* Donut Chart */}
                <div style={chartBoxStyle}>
                    <span style={chartTitleStyle}>Role-wise Target Distribution</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ResponsiveContainer width={220} height={220}>
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    labelLine={false}
                                    stroke="none"
                                >
                                    {donutData.map((entry, idx) => (
                                        <Cell 
                                            key={`cell-${idx}`} 
                                            fill={donutColors[idx % donutColors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomDonutTooltip />} />
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="40"
                                    fontWeight="bold"
                                    fill="#18181b"
                                >
                                    100%
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                        <DonutLegend showCompletionStatus={selectedRole !== 'all'} />
                    </div>
                </div>

                {/* KPI Performance Summary */}
                <div style={{ ...chartBoxStyle, minHeight: 370 }}>
                    <span style={{ ...chartTitleStyle, fontSize: 20, marginBottom: 24 }}>KPI Performance Summary</span>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={transformedPerformanceData} barCategoryGap={46}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 15, fill: "#222", fontWeight: 400 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 15, fill: "#888" }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "Number of KPI's",
                                    angle: -90,
                                    position: "insideLeft",
                                    fontSize: 16,
                                    fill: "#888",
                                    fontWeight: 400,
                                    offset: 10,
                                }}
                            />
                            <Tooltip />
                            <Bar
                                dataKey="assigned"
                                name="Total KPI's Assigned"
                                fill="#6B0899"
                                radius={[10, 10, 0, 0]}
                                barSize={28}
                            >
                                <LabelList dataKey="assigned" position="top" fill="#222" fontWeight={500} fontSize={17} />
                            </Bar>
                            <Bar
                                dataKey="completed"
                                name="Total KPI's Completed"
                                fill="#240333"
                                radius={[10, 10, 0, 0]}
                                barSize={28}
                            >
                                <LabelList dataKey="completed" position="top" fill="#888" fontWeight={500} fontSize={17} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 27, marginTop: 15, marginLeft: 6 }}>
                        <span style={{ color: "#6B0899", fontWeight: 400, fontSize: 17, display: "flex", alignItems: "center" }}>
                            <span style={legendDotStyle("#6B0899")} /> Total KPI's Assigned
                        </span>
                        <span style={{ color: "#240333", fontWeight: 400, fontSize: 17, display: "flex", alignItems: "center" }}>
                            <span style={legendDotStyle("#240333")} /> Total KPI's Completed
                        </span>
                    </div>
                </div>

                {/* KPI Completion Rate (Semi Donut) */}
                <div style={chartBoxStyle}>
                    <span style={chartTitleStyle}>KPI Completion Rate</span>
                    <SemiDonut roleDistribution={roleDistribution} selectedRole={selectedRole} />
                    <CompletionLegend roleDistribution={roleDistribution} selectedRole={selectedRole} />
                </div>

                {/* Target Wise KPI Distribution */}
                <div style={chartBoxStyle}>
                    <span style={chartTitleStyle}>Target Wise KPI Distribution</span>
                    <TargetLegend />
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={transformedTargetWiseData}
                            barCategoryGap={30}
                            barGap={4}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 15, fill: "#444", fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 15, fill: "#888" }}
                                axisLine={false}
                                tickLine={false}
                                label={{
                                    value: "KPI Count",
                                    angle: -90,
                                    position: "insideLeft",
                                    fontSize: 16,
                                    fill: "#888",
                                    fontWeight: 400,
                                    offset: 10,
                                }}
                            />
                            <Tooltip content={<CustomTargetTooltip />} />
                            <Bar
                                dataKey="number"
                                stackId="a"
                                fill={barColors.number}
                                radius={[20, 20, 0, 0]}
                                barSize={30}
                                stroke="#fff"
                                strokeWidth={2}
                                name="Target: Number"
                            >
                                <LabelList dataKey="number" content={renderCustomBarLabel} />
                            </Bar>
                            <Bar
                                dataKey="done"
                                stackId="a"
                                fill={barColors.done}
                                radius={[0, 0, 0, 0]}
                                barSize={30}
                                stroke="#fff"
                                strokeWidth={2}
                                name="Target: DND"
                            >
                                <LabelList dataKey="done" content={renderCustomBarLabel} />
                            </Bar>
                            <Bar
                                dataKey="currency"
                                stackId="a"
                                fill={barColors.currency}
                                radius={[0, 0, 20, 20]}
                                barSize={30}
                                stroke="#fff"
                                strokeWidth={2}
                                name="Target: Currency"
                            >
                                <LabelList dataKey="currency" content={renderCustomBarLabel} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SalesKPIDashboard;