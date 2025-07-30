import React, { ChangeEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import SearchBox from '../../../components/common/SearchBox';
import axiosInstance from '../../../axios';

type Customer = {
  id: number;
  name: string;
  manager_name: string;
  total_leads: number;
  platforms: {
    name: string;
    count: number;
  }[];
  [key: string]: any; // allows dynamic keys for platforms
};


const ViewAssigneeLeads = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformNames, setPlatformNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];
  
      try {
        setLoading(true);
  
        const response = await axiosInstance.get("/Salesperson_List_new", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });
  
        const data = response.data;
        const employeeList = data.employee_list;
  
        // Get all unique platform names
        const platformSet = new Set<string>();
        employeeList.forEach(emp => {
          emp.platforms.forEach((platform: any) => {
            platformSet.add(platform.name);
          });
        });
  
        const uniquePlatforms = Array.from(platformSet);
  
        // Add platform counts to each employee
        const enrichedData = employeeList.map((emp: any) => {
          const platformMap: { [key: string]: number } = {};
          emp.platforms.forEach((p: any) => {
            platformMap[p.name] = p.count;
          });
  
          // Add 0 for any platform not present
          uniquePlatforms.forEach(name => {
            emp[name] = platformMap[name] || 0;
          });
  
          return emp;
        });
  
        setPlatformNames(uniquePlatforms); // we'll store this in state
        setCustomers(enrichedData);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to fetch salespersons");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCustomers();
  }, []);
  
  const platformDisplayNames: Record<string, string> = {
    Purvee: 'CH-i7PRV',
    Inorbvict: 'CH-i7IRB',
    Vortex: 'CH-i7VX',
    TradeIndia: 'TradeInquiry',
    IndiaMart: 'CH-T9IM'
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Sales Person Name',
      meta: {
        headerProps: { className: 'ps-2 pe-2 border-end border-translucent', style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
        cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' }, className: 'white-space-nowrap ps-2 border-end border-translucent' },
      },
    },
    {
      accessorKey: 'manager_name',
      header: 'Sales Manager',
      meta: {
        headerProps: { className: 'ps-2 pe-2 border-end border-translucent', style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
        cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' }, className: 'white-space-nowrap ps-2 border-end border-translucent' },
      },
    },
    // Dynamic platform columns
    ...platformNames.map((platform) => ({
      accessorKey: platform,
     header: platformDisplayNames[platform] || platform,
      meta: {
        headerProps: { className: 'ps-2 pe-2 border-end border-translucent', style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
        cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' }, className: 'white-space-nowrap ps-2 border-end border-translucent' },
      },
    })),
    {
      header: 'CHATBOT/EMAIL',
      cell: ({ row }) => {
     return <span>-</span>;
      },
      meta: {
        headerProps: { className: 'ps-2 pe-2 border-end border-translucent', style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
        cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' }, className: 'white-space-nowrap ps-2 border-end border-translucent' },
      },
    },
    
    {
      id: 'enquiry',
      header: 'Leads',
      cell: ({ row: { original } }) => (
        <Link to={`/view-leads/${original.id}`} className="btn btn-info btn-sm" style={{ fontWeight: 'normal' }}>
          View Leads
        </Link>
      ),
      meta: {
        headerProps: { className: 'ps-2 pe-2 border-end border-translucent', style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
        cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' }, className: 'white-space-nowrap ps-2 border-end border-translucent' },
      },
    },
  ];
  

  const table = useAdvanceTable({
    data: customers,
    columns,
    pageSize: 5,
    pagination: true,
    selection: false,
    sortable: true,
  });

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value || undefined);
  };

  if (loading) {
    return <div>Loading Sales Persons...</div>; // Display a loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Display an error message
  }

  return (
    <AdvanceTableProvider {...table}>
      <div className="d-flex justify-content-between mt-4">
        <h3 className="mb-5"  style={{fontFamily: 'Nunito Sans, sans-serif' }}>Sales Persons</h3>
        <SearchBox
          placeholder="Search Sales Person"
          size="sm"
          onChange={handleSearchInputChange}
          className="ms-2"
          style={{ fontSize: '14px', width: '100%', maxWidth: '350px', fontFamily: 'Nunito Sans, sans-serif' }}
        />
      </div>

      <div className="border border-translucent">
        <AdvanceTable
          tableProps={{ className: 'phoenix-table fs-9' }}
          rowClassName="hover-actions-trigger btn-reveal-trigger"
        />
       
      </div>
      <AdvanceTableFooter navBtn className="py-4"/>
    </AdvanceTableProvider>
  );
};

export default ViewAssigneeLeads;