import React from 'react';
import { Card, Form, OverlayTrigger } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend
} from 'recharts';

interface ThreeDStackedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  value?: number;
}

const ThreeDStackedBar = (props: ThreeDStackedBarProps) => {
  const { x, y, width, height, fill, value } = props;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      <polygon
        points={`${x},${y} ${x + 8},${y - 8} ${x + width + 8},${y - 8} ${x + width},${y}`}
        fill={shadeColor(fill, -10)}
      />
      <polygon
        points={`${x + width},${y} ${x + width + 8},${y - 8} ${x + width + 8},${y + height - 8} ${x + width},${y + height}`}
        fill={shadeColor(fill, -20)}
      />
    </g>
  );
};

const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

interface EmployeeData {
  name: string;
  fullName: string;
  sourcingDone: number;
  sourcingNotDone: number;
}

interface ReadyToShareTeamProps {
  totalReadyToSharePriceData: Array<{
    employee_name: string;
    ready_to_share_price: {
      price_shared: number;
      price_not_shared: number;
    };
  }>;
}

const ReadyToShareTeam: React.FC<ReadyToShareTeamProps> = ({ totalReadyToSharePriceData }) => {
  const employeeData: EmployeeData[] = totalReadyToSharePriceData?.map(emp => ({
    name: emp.employee_name.split(' ').map(word => word[0]).join('').toUpperCase(),
    fullName: emp.employee_name,
    sourcingDone: emp.ready_to_share_price?.price_shared || 0,
    sourcingNotDone: emp.ready_to_share_price?.price_not_shared || 0
  })) || [];

  const employeeCodes = employeeData.map(emp => emp.name);

  const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const fullName = payload[0].payload.fullName;
      const done = payload.find(p => p.dataKey === 'sourcingDone')?.value || 0;
      const notDone = payload.find(p => p.dataKey === 'sourcingNotDone')?.value || 0;
      const total = done + notDone;

      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Price Shared: {done}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Price Not Shared: {notDone}</p>
          <strong>Ready to Share Price: {total}</strong>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#000"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-3" style={{ height: "32.5rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column align-items-start">
          <h5 className="fw-bold">Ready To Share Price</h5>
          <h6>(Within two days after Sourcing)</h6>
        </div>

        {/* <Form.Select style={{ width: 250 }} className="mb-4">
          <option>Select Sales Employee</option>
          {employeeCodes.map((code, index) => (
            <option key={index} value={code}>
              {code}
            </option>
          ))}
        </Form.Select> */}
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              label={{ value: "Sales Employee Names", position: "bottom", offset: 20 }}  
              tick={({ x, y, payload }) => {
                const match = employeeData.find((item) => item.name === payload.value);
                const fullName = match ? match.fullName : payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <div
                          style={{
                            backgroundColor: 'rgba(42, 41, 41, 0.9)',
                            color: '#fff',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {fullName}
                        </div>
                      }
                    >
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="0.8rem"
                        style={{ cursor: 'pointer' }}
                      >
                        {payload.value}
                      </text>
                    </OverlayTrigger>
                  </g>
                );
              }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={76} />
            <Bar
              dataKey="sourcingDone"
              stackId="a"
              fill="#3b2fdb"
              name="Price Shared"
              shape={<ThreeDStackedBar />}
              barSize={20}
            >
              <LabelList content={renderCustomLabel} />
            </Bar>
            <Bar
              dataKey="sourcingNotDone"
              stackId="a"
              fill="#c17cff"
              name="Price Not Shared"
              shape={<ThreeDStackedBar />}
              barSize={20}
            >
              <LabelList content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ReadyToShareTeam;
