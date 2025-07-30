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
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
  leads_count: number;
  customer_status: string;
};

const ViewCustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCustomers = async () => {

      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1];

      // Define the body content


      try {
        setLoading(true);

        const response = await axiosInstance.get("/sales_customer_list", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });


        const data = response.data;
        setAllCustomers(data.customer_list);
        setCustomers(data.customer_list);

      } catch (error) {
        console.error("Error :", error);

      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Filter customers based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setCustomers(allCustomers);
    } else {
      const filtered = allCustomers.filter(customer => 
        customer.customer_status?.toLowerCase() === statusFilter.toLowerCase()
      );
      setCustomers(filtered);
    }
  }, [statusFilter, allCustomers]);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'sender_name', header: 'Customer Name',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:
            'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      accessorKey: 'sender_company', header: 'Company Name',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:
            'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      accessorKey: 'sender_mobile', header: 'Mobile', meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:
            'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },

        }
      }
    },
    {
      accessorKey: 'sender_country_iso', header: 'Country',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:
            'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      accessorKey: 'sender_email',
      header: 'Email',
      cell: ({ row: { original } }) => (
        <Link to={`mailto:${original.sender_email}`}>{original.sender_email}</Link>
      ),
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      accessorKey: 'leads_count',
      header: 'Total Leads',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      accessorKey: 'customer_status',
      header: 'Customer Status',
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:'white-space-nowrap ps-2 border-end border-translucent',
            style: { fontFamily: 'Nunito Sans, sans-serif' },
        }
      }
    },
    {
      id: 'enquiry',
      header: 'Enquiries',
      cell: ({ row: { original } }) => (
        <Link to={`/view-enquiry/${original.id}`} className="btn btn-info btn-sm" style={{ fontFamily:'Nunito Sans, sans-serif',fontWeight: 'normal' }}>
          View Enquiries
        </Link>
      ),
      meta: {
        headerProps: {
          className: 'ps-2 pe-2 border-end border-translucent',
          style: { fontFamily: 'Nunito Sans, sans-serif',fontWeight: '700' }
        },
        cellProps: {
          className:
            'white-space-nowrap fw-semibold ps-2 border-end border-translucent',

        }
      }

    },

  ];

  const table = useAdvanceTable({
    data: customers,
    columns,
    pageSize: 10,
    pagination: true,
    selection: false,
    sortable: true,

  });

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value || undefined);
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return <div>Loading customers...</div>; // Display a loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Display an error message
  }

  return (
    <AdvanceTableProvider {...table} >
      <div className="d-flex justify-content-between mt-4">
      <h3 className="mb-5" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' }}>Customers</h3>
        <div className="d-flex gap-3 align-items-center">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="form-select form-select-sm"
            style={{ 
              fontSize: '14px', 
              width: '150px', 
              fontFamily: 'Nunito Sans, sans-serif',
              border: '1px solid #d1d7e0'
            }}
          >
            <option value="all">All Status</option>
            <option value="vip">VIP</option>
            <option value="blacklist">Blacklist</option>
            <option value="genuine">Genuine</option>
          </select>
          <SearchBox
            placeholder="Search Customer"
            size="sm"
            onChange={handleSearchInputChange}
            className="ms-2"
            style={{ fontSize: '14px', width: '100%', maxWidth: '350px', fontFamily: 'Nunito Sans, sans-serif' }}
          />
        </div>
      </div>


      <div className="border border-translucent">
        <AdvanceTable
          tableProps={{ className: 'phoenix-table fs-9' }}
          rowClassName="hover-actions-trigger btn-reveal-trigger"
        />
      </div>
      <AdvanceTableFooter navBtn className="py-4" />
    </AdvanceTableProvider>
  );
};

export default ViewCustomerPage;