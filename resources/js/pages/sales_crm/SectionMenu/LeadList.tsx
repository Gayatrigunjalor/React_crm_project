import React, { useState, useEffect } from 'react';
import AdvanceTable from '../../../../js/components/base/AdvanceTable';

import AdvanceTableFooter from '../../../..//js/components/base/AdvanceTableFooter';
import useAdvanceTable from '../../../../js/hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../../js/providers/AdvanceTableProvider';
import { ColumnDef } from '@tanstack/react-table';
import SearchBox from '../../../../js/components/common/SearchBox';
import {
    faCheck,
    faTimes

} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Button, Col, Row } from 'react-bootstrap';
import { formatDate } from 'date-fns';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';

interface Lead {
    unique_query_id: string;
    query_type: string;
    query_time: Date;
    sender_name: string;
    sender_mobile: string;
    sender_email: string;
    sender_company: string;
    sender_address: string;
    sender_city: string;
    sender_state: string;
    sender_pincode: string;
    sender_country_iso: string;
    sender_mobile_alt: string;
    sender_email_alt: string;
    query_product_name: string;
    product_quantity: number;
    query_mcat_name: string;
    call_duration: string;
    receiver_mobile: string;
    created_at: Date;
    platform: string;
    qualified: number;
    disqualified: number;
}

const LeadList = () => {
    const { customer_id, id } = useParams<{ customer_id: string; id: string }>();
    const [leadData, setLeadData] = useState<Lead[]>([]);
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return ""; // Handle null or undefined values

        const date = new Date(dateString);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

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
            cell: ({ row }) => formatDate(row.original.query_time),
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
        data: leadData,
        columns,
        pageSize: 5,
        pagination: true,
        selection: false,
        sortable: true,
    });


    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const cleanToken = token && token.split('|')[1];
            const config = {
                headers: {
                    Authorization: `Bearer ${cleanToken}`,
                },
                params: {
                    customer_id,
                },
            };

            let endpoint = '';
            if (id === '0') {
                endpoint = '/showAcceptedInquiries';
            } else if(id === '1') {
                endpoint = '/showAcceptedLeadAcknowledgment'; 
            }
            else if(id === '2') {
                endpoint = '/showAcceptedProductSourcings'; 
            }
            else if(id === '3') {
                endpoint = '/showAcceptedPriceShareds'; 
            }
            else if(id === '4') {
                endpoint = '/showAcceptedQuotationSents'; 
            }
            else if(id === '5') {
                endpoint = '/showAcceptedFollowups';
            }
            else{
                endpoint = '/showAcceptedVictories';
            }

            const response = await axiosInstance.get(endpoint, config);
            setLeadData(response.data?.data || []); // update state
        } catch (error) {
            console.error('Error fetching lead data:', error);
        }
    };

    useEffect(() => {
        if (customer_id && id !== undefined) {
            fetchLeads();
        }
    }, [customer_id, id]);


    return (
        <div className="container" style={{ padding: '0 20px' }}>
            <AdvanceTableProvider {...table}>
                <div className="d-flex justify-content-between mb-4">
                    <h2 className="mt-4" style={{ fontFamily: 'Nunito Sans, sans-serif', fontWeight: '700' }}>Lead Details</h2>
                    <Row className="g-3 justify-content-between my-2">
                        <Col xs="auto">
                            <div className="d-flex">
                                <SearchBox
                                    placeholder="Search Customer Lead"
                                    // onChange={handleSearchInputChange}
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
                            style: { cursor: 'pointer' }
                        }}
                        rowClassName="hover-actions-trigger btn-reveal-trigger"
                    // onRowClick={(row) => handleRowClick(row.original.id,row.original.customer_id)}
                    />

                </div>
                <AdvanceTableFooter pagination navBtn className="py-4" />
            </AdvanceTableProvider>

        </div>
    );
};

export default LeadList;
