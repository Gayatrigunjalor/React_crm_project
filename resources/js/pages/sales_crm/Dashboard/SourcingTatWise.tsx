import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from 'recharts';

const SourcingTatWise = ({trackerTATWiseCount}) => {
  const pieData = [
    { type: 'Under TAT', value: trackerTATWiseCount ? trackerTATWiseCount.under_tat :0, color: '#1E90FF' },
    { type: 'TAT Expired',value: trackerTATWiseCount ? trackerTATWiseCount.tat_expired :0, color: '#FF6B6B' }
  ];
  const totalSourcing = trackerTATWiseCount ? trackerTATWiseCount.product_sourcing_done :0;
  const totalProcurements = trackerTATWiseCount ? trackerTATWiseCount.procurement_done : 0;
  const barData = [
    { 
      category: 'Under TAT', 
      "Under Target Cost": trackerTATWiseCount ? trackerTATWiseCount.under_target_cost : 0, 
      "Target Cost Not Assigned": trackerTATWiseCount ? trackerTATWiseCount.target_cost_not_assigned : 0, 
      "Target Cost Exceed": trackerTATWiseCount ? trackerTATWiseCount.exceed_target_cost : 0 
    },
    { 
      category: 'TAT Expired', 
      "Under Target Cost": trackerTATWiseCount ? trackerTATWiseCount.under_target_cost_tat_expired : 0, 
      "Target Cost Not Assigned": trackerTATWiseCount ? trackerTATWiseCount.not_assigned_target_cost_tat_expired : 0, 
      "Target Cost Exceed": trackerTATWiseCount ? trackerTATWiseCount.exceed_target_cost_tat_expired : 0 
    }
  ];

  return (
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center" style={{height:"22rem"}}>
      <h4 className='mb-3 text-start' >Sourcing Performance Status Tracker-TAT Wise</h4>
      <div className="d-flex align-items-center justify-content-center" style={{position: 'relative' }}>
        {/* Pie Chart Container */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                label={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
             <Tooltip 
               wrapperStyle={{ top: '10rem', left: '50%', transform: 'translateX(-50%)' }} 
             />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Sourcing Text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {totalSourcing}
            <br />
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#555' }}>Sourcing Done</span>
          </div>
        </div>
        
        {/* Product Sourcing Summary */}
        <div className="text-start" style={{ minWidth: '180px' }}>
          <p className="fw-bold">Product Sourcing Done   {totalSourcing}</p>
            <p className="fw-bold">Procurements Done   {totalProcurements}</p>
          {/* <h6></h6> */}
          <hr className="my-2" />
          {pieData.map(item => (
            <div className="d-flex align-items-center justify-content-between mb-1" key={item.type}>
              <div className="d-flex align-items-center">
                <span className="d-inline-block me-2" style={{ backgroundColor: item.color, width: 12, height: 12, borderRadius: '50%' }} />
                <p className="mb-0 fw-semibold" style={{ whiteSpace: 'nowrap',fontSize:"12px" }}>{item.type}</p>
              </div>
              <h6 className="mb-0">{item.value}</h6>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bar Chart Section */}
      {/* <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Under Target Cost" fill="#1E90FF" barSize={30}>
            <LabelList dataKey="Under Target Cost" position="top" fill="#000" />
          </Bar>
          <Bar dataKey="Target Cost Not Assigned" fill="#7CB342" barSize={30}>
            <LabelList dataKey="Target Cost Not Assigned" position="top" fill="#000" />
          </Bar>
          <Bar dataKey="Target Cost Exceed" fill="#FF6B6B" barSize={30}>
            <LabelList dataKey="Target Cost Exceed" position="top" fill="#000" />
          </Bar>
        </BarChart>
      </ResponsiveContainer> */}
    </Card>
  );
};

export default SourcingTatWise;