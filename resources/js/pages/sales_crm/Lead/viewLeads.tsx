import React, { useState, useEffect, ChangeEvent } from 'react';
import axiosInstance from '../../../axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../../../js/components/base/AdvanceTable';
import AdvanceTableFooter from '../../../..//js/components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../../js/hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../../js/providers/AdvanceTableProvider';
import SearchBox from '../../../../js/components/common/SearchBox';
import {
    faCheck,
    faTimes

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Button, Col, Row } from 'react-bootstrap';

interface Lead {
    id: number;
    unique_query_id: string;
    query_type: string;
    query_time: string;
    sender_name: string;
    sender_mobile: string;
    sender_email: string;
    sender_company: string | null;
    sender_address: string | null;
    sender_city: string;
    sender_state: string;
    sender_pincode: string | null;
    sender_country_iso: string;
    sender_mobile_alt: string | null;
    sender_email_alt: string | null;
    query_product_name: string;
    product_quantity: string | null;
    query_message: string;
    query_mcat_name: string | null;
    call_duration: string | null;
    receiver_mobile: string | null;
    created_at: string;
    updated_at: string;
    platform: string;
    qualified: number;
    disqualified: number;
    customer_id: number;
}


interface LeadResponse {
    message: string;
    leads: Lead[];
}

const ViewLeads = () => {
    const { id } = useParams<{ id: string }>();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const columns: ColumnDef<Lead>[] = [
        { 
            accessorKey: 'unique_query_id', 
            header: 'Query ID',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'query_type', 
            header: 'Query Type',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'query_time', 
            header: 'Query Time',
            cell: ({ row }) => formatTime(row.original.query_time),
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_name', 
            header: 'Customer Name',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_mobile', 
            header: 'Customer Mobile',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_email', 
            header: 'Customer Email',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_company', 
            header: 'Company Name',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_address', 
            header: 'Address',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_city', 
            header: 'City',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_state', 
            header: 'State',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_pincode', 
            header: 'Pincode',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_country_iso', 
            header: 'Country',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_mobile_alt', 
            header: 'Alt. Mobile',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'sender_email_alt', 
            header: 'Alt. Email',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'query_product_name', 
            header: 'Product Name',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'product_quantity', 
            header: 'Product Quantity',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'query_mcat_name', 
            header: 'Query Category',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'call_duration', 
            header: 'Call Duration',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'receiver_mobile', 
            header: 'Receiver Mobile',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'created_at', 
            header: 'Date',
            cell: ({ row }) => formatDate(row.original.created_at),
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'platform', 
            header: 'Lead Source',
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            },
            cell: ({ getValue }) => {
                const platform = getValue();
                if (platform === 'Purvee') return 'CH-i7PRV';
                if (platform === 'Vortex') return 'CH-i7VX';
                if (platform === 'Inorbvict') return 'CH-i7IRB';

                return platform; // fallback to original if no match
            }
        },
        { 
            accessorKey: 'qualified', 
            header: 'Qualified',
            cell: ({ row }) => {
                const value = row.original.qualified;
                return value === 1 ? (
                    <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
                ) : (
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                );
            },
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
        { 
            accessorKey: 'disqualified', 
            header: 'Disqualified',
            cell: ({ row }) => {
                const value = row.original.disqualified;
                return value === 1 ? (
                    <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
                ) : (
                    <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} />
                );
            },
            meta: {
                headerProps: { style: { fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' } },
                cellProps: { style: { fontFamily: 'Nunito Sans, sans-serif' } }
            }
        },
    ];
    
    const table = useAdvanceTable({
        data: leads,
        columns,
        pageSize: 5,
        pagination: true,
        selection: false,
        sortable: true,
    });

    const handleRowClick = (leadId: number,customerId:number,uniqueQueryId:number) => {
        navigate(`/sales_crm/inquiryRecived/MainSection/${leadId}/${customerId}/${uniqueQueryId}`);
    };
    useEffect(() => {
        const fetchEnquiryDetails = async () => {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];

            const body = JSON.stringify({ salesperson_id: id });
            try {
                const response = await axiosInstance.get('/getLeadsBySalesperson',
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${cleanToken}`,
                        },
                        params: { salesperson_id: id },
                    });

                const data = response.data;
                if (data.leads && data.leads.length > 0) {
                    setLeads(data.leads);
                }

                else {
                    setError("No leads available for this customer.");
                }

            } catch (err: any) {
                console.error("Error fetching enquiry details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEnquiryDetails();
    }, [id]);

    if (loading) {
        return <div>Loading Leads details...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (leads.length === 0) {
        return <div>No leads available for this customer.</div>; //redundant check as it's already handled above, but good to have
    }
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return ""; // Handle null or undefined values

        const date = new Date(dateString);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Format to HH:MM:SS
    };
    const lead = leads[0]; // Assuming you only want to display the first lead, or you can map over leads to show all.





    const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        table.setGlobalFilter(e.target.value || undefined);
    };
    return (
      
       
      
        <AdvanceTableProvider {...table}>
             <div className="d-flex justify-content-between mb-4">
                <h2 className="mt-4"  style={{fontFamily: 'Nunito Sans, sans-serif',fontWeight:'700' }}>Lead Details</h2>
                <Row className="g-3 justify-content-between my-2">
                    <Col xs="auto">
                        <div className="d-flex">
                            <SearchBox
                                placeholder="Search Customer Lead"
                                onChange={handleSearchInputChange}
                                className="me-2"
                                style={{ fontSize: '14px', width: '100%', maxWidth: '350px', fontFamily: 'Nunito Sans, sans-serif' }}
                            />
                        </div>
                    </Col>
                    <Col xs="auto"> {/* Added a new Col for the buttons */}
                        <div className="d-flex gap-3"> {/* Removed inline styles */}
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const tableContainer = document.querySelector('.scrollbar');
                                    if (tableContainer) {
                                        tableContainer.scrollLeft -= 200;
                                    }
                                }}
                                className="scroll-button" // Added a class for styling
                            >
                                <FaArrowLeft size={10} />
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const tableContainer = document.querySelector('.scrollbar');
                                    if (tableContainer) {
                                        tableContainer.scrollLeft += 200;
                                    }
                                }}
                                className="scroll-button" // Added a class for styling
                            >
                                <FaArrowRight size={10} />
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="border border-translucent">
                <AdvanceTable
                    tableProps={{
                        className: 'phoenix-table fs-12',
                        striped: true,
                        bordered: true,
                        style: { cursor: 'pointer'}
                      
                    }}
                    rowClassName="hover-actions-trigger btn-reveal-trigger"
                    onRowClick={(row) => handleRowClick(row.original.id,row.original.customer_id,row.original.unique_query_id)}
                />
                
            </div>
            <AdvanceTableFooter pagination navBtn className="py-4"/>
        </AdvanceTableProvider>
        
    );
};

export default ViewLeads;