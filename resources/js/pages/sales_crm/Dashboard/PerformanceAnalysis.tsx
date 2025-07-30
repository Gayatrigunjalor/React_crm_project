import React, { useState, useEffect } from 'react';
import { Col, Row, Form, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../../axios';

interface SalesPerson {
  id: number;
  user_id: number;
  name: string;
}

interface Platform {
  name: string;
  count: number;
}

interface AgentDetails {
  id: number;
  user_id: number;
  name: string;
  manager_name: string;
  platforms: Platform[];
  total_leads: number;
}

interface PlatformStats {
  total_inquiries: number;
  total_acknowledgments: number;
  total_sourcings: number;
  total_price_shared: number;
  total_quotations: number;
  total_victories: number;
  total_business_tasks: number;
}

// Platform name mapping
const platformNameMapping: { [key: string]: string } = {
  'IndiaMart': 'CH-T9IM',
  'Purvee':'CH-i7PRV',
  'Vortex': 'CH-i7VX',
  'Inorbvict': 'CH-i7IRB',
  'TradeIndia': 'TradeInquiry'
};

const IssuesDiscovered = () => {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [issueStats, setIssueStats] = useState([
    { type: 'Total Enquiry Received', value: 0, color: '#4CAF50', percentage: '0%' },
    { type: 'Total Price Shared', value: 0, color: '#1E90FF', percentage: '0%' },
    { type: 'Total Quotation Send', value: 0, color: '#87CEFA', percentage: '0%' },
    { type: 'Lead Won', value: 0, color: '#FF6347', percentage: '0%' },
    { type: 'BT Created', value: 0, color: '#FFA500', percentage: '0%' }
  ]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    const fetchSalesPersons = async () => {
      try {
        const response = await axiosInstance.get("/Salesperson_List");
        const data = response.data;
        setSalesPersons(data.employee_list || []);
      } catch (error) {
        console.error("Error fetching sales person data:", error);
      }
    };

    fetchSalesPersons();
  }, []);

  const fetchPlatformStats = async (salespersonId: string, platformName: string) => {
    try {
      const response = await axiosInstance.get('/salesperson/platform-stats', {
        params: {
          salesperson_id: salespersonId,
          platform: platformName
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const stats: PlatformStats = response.data.data;
      setPlatformStats(stats); // <-- store stats
      // Update issueStats with new values
      setIssueStats([
        { type: 'Total Enquiry Received', value: stats.total_inquiries, color: '#4CAF50', percentage: '100%' },
        { type: 'Total Price Shared', value: stats.total_price_shared, color: '#1E90FF', percentage: '24.51%' },
        { type: 'Total Quotation Send', value: stats.total_quotations, color: '#87CEFA', percentage: '21.79%' },
        { type: 'Lead Won', value: stats.total_victories, color: '#FF6347', percentage: '14.01%' },
        { type: 'BT Created', value:stats.total_business_tasks, color: '#FFA500', percentage: '9.34%' }
      ]);
    } catch (error) {
      console.error("Error fetching platform statistics:", error);
    }
  };

  const handleAgentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    setSelectedAgent(agentId);
    setSelectedPlatform(''); // Reset platform selection when agent changes

    if (agentId) {
      try {
        const response = await axiosInstance.get(`/salesperson/platforms`, {
          params: { id: agentId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data: AgentDetails = response.data.data;
        setPlatforms(data.platforms || []);
      } catch (error) {
        console.error("Error fetching platforms:", error);
        setPlatforms([]);
      }
    } else {
      setPlatforms([]);
    }
  };

  const handlePlatformChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const platformName = e.target.value;
    setSelectedPlatform(platformName);
    
    if (platformName && selectedAgent) {
      await fetchPlatformStats(selectedAgent, platformName);
    }
  };

   const totalIssues = issueStats.reduce((acc, issue) => acc + issue.value, 0);
    

  return (
    <Card className="d-flex  shadow-sm border-0  p-3 mt-3 pb-4" style={{height:"26rem"}}>
    <Row className="g-3 mb-3">
      <Col xs={12} className="d-flex justify-content-between">
      <h4 className='mb-3 text-body-emphasis text-nowrap'>Performance Analysis</h4>
      </Col>
      <Col xs={12} md={6} className='gap-2'>
        <Form.Select 
          className="mb-3"
          value={selectedAgent}
          onChange={handleAgentChange}
        >
          <option value="">Select Agent</option>
          {salesPersons.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Form.Select>
        <Form.Select 
          className="mb-4"
          value={selectedPlatform}
          onChange={handlePlatformChange}
          disabled={!selectedAgent}
        >
          <option value="">Select Account</option>
          {platforms.map((platform) => (
            <option key={platform.name} value={platform.name}>
              {platformNameMapping[platform.name] || platform.name}
            </option>
          ))}
        </Form.Select>

        {/* <div className="d-flex align-items-center justify-content-between mt-3">
          <p className="mb-0 fw-bold">Issue type </p>
          <p className="mb-0 fs-9 fw-bold">
            Total count <span >{totalIssues}</span>
          </p>
        </div> */}
        <hr className="bg-body-secondary mb-3 mt-3" />

        {issueStats.map(issue => (
          <div className="d-flex align-items-center mb-1" key={issue.type}>
            <span
              className="d-inline-block bullet-item me-2"
              style={{ backgroundColor: issue.color, width: 10, height: 10, borderRadius: '50%' }}
            />
            <p className="mb-1 fw-semibold text-body lh-sm flex-1">
              {issue.type}
            </p>
            <h5 className="mb-0 text-body">{issue.value}</h5>
          </div>
        ))}
      </Col>
      <Col xs={12} md={6} className="d-flex justify-content-center align-items-center">
  <div style={{ position: 'relative', width: 280, height: 280 }}> {/* Adjusted size */}
    <ResponsiveContainer width="103%" height="100%"> {/* Set to full container */}
      <PieChart>
        <Pie
          data={issueStats.filter(issue => issue.type !== 'Total Enquiry Received')}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          innerRadius={70}  // Adjusted radius
          outerRadius={110}  // Adjusted outer radius
          fill="#8884d8"
          // label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(2)}%)`}
        >
          {issueStats.filter(issue => issue.type !== 'Total Enquiry Received').map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          wrapperStyle={{ top: '10rem', left: '50%', transform: 'translateX(-50%)' }} 
        />
      </PieChart>
    </ResponsiveContainer>
    <div className = "mb-2" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      fontSize: '20px', 
      fontWeight: 'bold'
    }}>
      {issueStats.find(issue => issue.type === 'Total Enquiry Received')?.value || 0}
      <br />
      <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#555' }}>Total Enquiries</span>
    </div>
  </div>
</Col>


    </Row>
    </Card>
  );
};

export default IssuesDiscovered;
