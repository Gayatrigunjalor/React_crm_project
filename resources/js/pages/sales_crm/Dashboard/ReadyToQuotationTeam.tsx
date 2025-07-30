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

const Custom3DBar = (props) => {
  const { fill, x, y, width, height } = props;
  const sideColor = '#aaa';
  const topColor = '#ddd';

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      <polygon
        points={`${x},${y} ${x + 5},${y - 5} ${x + width + 5},${y - 5} ${x + width},${y}`}
        fill={topColor}
      />
      <polygon
        points={`${x + width},${y} ${x + width + 5},${y - 5} ${x + width + 5},${y + height - 5} ${x + width},${y + height}`}
        fill={sideColor}
      />
    </g>
  );
};

const ReadyToQuotationTeam = ({totalReadyToShareQuotationData}) => {
  // Transform the data to match the required format
  const employeeData = totalReadyToShareQuotationData?.map(emp => {
    // Get initials from employee name
    const nameParts = emp.employee_name.split(' ');
    const initials = nameParts.map(part => part[0]).join('');
    
    return {
      name: initials,
      fullName: emp.employee_name,
      sourcingDone: emp.quotation_send_dashboard?.quotation_send || 0,
      sourcingNotDone: emp.quotation_send_dashboard?.quotation_not_send || 0
    };
  }) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const fullName = payload[0].payload.fullName;
      const done = payload.find(p => p.dataKey === 'sourcingDone')?.value || 0;
      const notDone = payload.find(p => p.dataKey === 'sourcingNotDone')?.value || 0;
      const total = done + notDone;

      return (
        <div className="bg-white p-2 border rounded shadow-sm">
           <p className="fw-bold mb-1">{fullName}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#3b2fdb' }}>●</span> Quotation Sent: {done}</p>
          <p style={{ margin: 0 }}><span style={{ color: '#c17cff' }}>●</span> Quotation Not Sent: {notDone}</p>
          <strong>Total: {total}</strong>
        </div>
      );
    }
    return null;
  };

  // Get employee codes from the data
  const employeeCodes = employeeData.map(emp => emp.name);

  return (
    <Card
      className="border-0 p-3 mt-3"
      style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',height:"32.5rem" }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div className="flex-grow-1">
          <h5 className="fw-bold mb-1">Ready to Quotation</h5>
          <h6 className="text-muted">(Within two days after Sourcing)</h6>
        </div>

        {/* <Form.Select className="w-100 w-md-auto">
          <option>Within TAT/TAT Exceed</option>
          {employeeCodes.map((code, index) => (
            <option key={index} value={code}>
              {code}
            </option>
          ))}
        </Form.Select> */}
      </div>

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <BarChart
            data={employeeData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" 
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

            <Bar dataKey="sourcingDone" stackId="a" fill="#3b2fdb" shape={<Custom3DBar />} name="Quotation Sent">
              <LabelList 
                dataKey="sourcingDone" 
                position="insideTop" 
                fill="#fff" 
                style={{ fontSize: "0.6rem" }}
                formatter={(value) => value > 0 ? value : ''}
              />
            </Bar>
            <Bar dataKey="sourcingNotDone" stackId="a" fill="#c17cff" shape={<Custom3DBar />} name="Quotation Not Sent">
              <LabelList 
                dataKey="sourcingNotDone" 
                position="insideTop" 
                fill="#000" 
                style={{ fontSize: "0.6rem" }}
                formatter={(value) => value > 0 ? value : ''}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ReadyToQuotationTeam;
