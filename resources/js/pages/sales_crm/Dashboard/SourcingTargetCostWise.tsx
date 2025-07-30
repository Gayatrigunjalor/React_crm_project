import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from 'recharts';

interface TrackerCostWiseCount {
  product_sourcing_done: number;
  under_target_cost: {
    under_tat: number;
    tat_expired: number;
  };
  not_assigned_target_cost: {
    under_tat: number;
    tat_expired: number;
  };
  exceed_target_cost: {
    under_tat: number;
    tat_expired: number;
  };
  under_target_cost_products: number;
  target_cost_not_assigned_products: number;
  exceed_target_cost_products: number;
  procurement_done: number;
  procurement_not_done: number;
  procurement_products_count: number;
  procurement_vendors_count: number;
}

const SourcingTargetCostWise = ({ trackerCostWiseCount }: { trackerCostWiseCount: TrackerCostWiseCount }) => {
  // Calculate total values for pie chart
  const underTargetTotal = (trackerCostWiseCount?.under_target_cost_products || 0) + (trackerCostWiseCount?.under_target_cost?.tat_expired || 0);
  const notAssignedTotal = (trackerCostWiseCount?.target_cost_not_assigned_products|| 0) + (trackerCostWiseCount?.not_assigned_target_cost?.tat_expired || 0);
  const exceedTargetTotal = (trackerCostWiseCount?.exceed_target_cost_products || 0) + (trackerCostWiseCount?.exceed_target_cost?.tat_expired || 0);

  const pieData = [
    { type: 'Under Target Cost', value: underTargetTotal, color: '#1E90FF' },
    { type: 'Target Cost Not Assigned', value: notAssignedTotal, color: '#7CB342' },
    { type: 'Target Cost Exceed', value: exceedTargetTotal, color: '#FF6B6B' }
  ];
  
  const totalSourcing = trackerCostWiseCount?.product_sourcing_done || 0;
  const totalProcurements = (trackerCostWiseCount?.procurement_done || 0) + (trackerCostWiseCount?.procurement_not_done || 0);
  const procurementProductsCount = trackerCostWiseCount?.procurement_products_count || 0;
  const procurementVendorsCount = trackerCostWiseCount?.procurement_vendors_count || 0;

  const barData = [
    { 
      category: 'Under Target Cost', 
      "Under TAT": trackerCostWiseCount?.under_target_cost?.under_tat || 0, 
      "TAT Expired": trackerCostWiseCount?.under_target_cost?.tat_expired || 0 
    },
    { 
      category: 'Target Cost Not Assigned', 
      "Under TAT": trackerCostWiseCount?.not_assigned_target_cost?.under_tat || 0, 
      "TAT Expired": trackerCostWiseCount?.not_assigned_target_cost?.tat_expired || 0 
    },
    { 
      category: 'Target Cost Exceed', 
      "Under TAT": trackerCostWiseCount?.exceed_target_cost?.under_tat || 0, 
      "TAT Expired": trackerCostWiseCount?.exceed_target_cost?.tat_expired || 0 
    }
  ];

  return (
    <Card className="d-flex shadow-sm border-0 p-4 mt-3 text-center" style={{height:"22rem"}}>
      <h4 className='mb-1 text-start'>Sourcing Performance Status Tracker - Target Cost Wise</h4>
      <div className="d-flex flex-row align-items-start justify-content-start w-100" style={{position: 'relative'}}>
        {/* Pie Chart Container - moved more left */}
        <div style={{ position: 'relative', width: 220, minWidth: 180, marginRight: 24 }}>
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
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {totalSourcing}
            <br />
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#555' }}>Sourcing Done</span>
          </div>
        </div>
        {/* Product Sourcing Summary and Procurement Stats */}
        <div className="d-flex flex-column gap-2 text-start align-items-start flex-grow-1 w-100" style={{overflowWrap: 'break-word'}}>
          {/* First column: Pie chart categories */}
          <div>
            <p className="fw-bold mb-2" style={{ fontSize: '15px' }}>Product Sourcing Done {totalSourcing}</p>
            <hr className="my-2" />
            {pieData.map(item => (
              <div className="d-flex align-items-center justify-content-between mb-2" key={item.type} style={{ minHeight: '28px' }}>
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ backgroundColor: item.color, width: 12, height: 12, borderRadius: '50%' }} />
                  <p className="mb-0 fw-semibold" style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{item.type}</p>
                </div>
                <h6 className="mb-0" style={{ fontSize: '13px' }}>{item.value}</h6>
              </div>
            ))}
            {/* Total Procurements row moved here */}
            <div className="d-flex align-items-center justify-content-between mb-2" style={{ minHeight: '28px' }}>
              <span className="d-inline-block me-2" style={{ backgroundColor: '#1E90FF', width: 12, height: 12, borderRadius: '50%' }} />
              <span className="fw-semibold flex-grow-1" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Total Procurements</span>
              <span className="fw-bold ms-1" style={{ fontSize: '13px' }}>{totalProcurements}</span>
            </div>
          </div>
          {/* Remaining procurement stats */}
          <div style={{ fontSize: '12px', minWidth: '0', width: '100%' }}>
            <div className="d-flex align-items-center justify-content-between mb-2" style={{ minHeight: '28px' }}>
              <span className="d-inline-block me-2" style={{ backgroundColor: '#7CB342', width: 12, height: 12, borderRadius: '50%' }} />
              <span className="fw-semibold flex-grow-1" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Total Procurement Products</span>
              <span className="fw-bold ms-1" style={{ fontSize: '13px' }}>{procurementProductsCount}</span>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-2" style={{ minHeight: '28px' }}>
              <span className="d-inline-block me-2" style={{ backgroundColor: '#FF6B6B', width: 12, height: 12, borderRadius: '50%' }} />
              <span className="fw-semibold flex-grow-1" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Total Procurement Product Vendors</span>
              <span className="fw-bold ms-1" style={{ fontSize: '13px' }}>{procurementVendorsCount}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Bar Chart Section (remains commented) */}
      {/* <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Under TAT" fill="#1E90FF" barSize={30}>
            <LabelList dataKey="Under TAT" position="top" fill="#000" />
          </Bar>
          <Bar dataKey="TAT Expired" fill="#FF6B6B" barSize={30}>
            <LabelList dataKey="TAT Expired" position="top" fill="#000" />
          </Bar>
        </BarChart>
      </ResponsiveContainer> */}
    </Card>
  );
};

export default SourcingTargetCostWise;
