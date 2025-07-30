import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
// import { DirectoryData } from './SalesCrmDashboard';
import { useAuth } from '../../../AuthContext';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import swal from 'sweetalert';
import React from 'react';
import { Card } from 'react-bootstrap';


export const LeadStatusTableColumns = (handleShow: (userId?: number) => void, handleViewDirectory: (id: number) => void): ColumnDef<DirectoryData>[] => [
    {
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <span>{id}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'list_opportunities',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Customer Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { customerName } = original;
            return (
                <span>{customerName}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'company_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Opportunity Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { oppDate } = original;
            return (
                <span>{oppDate}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        }
    },
  
    {
        accessorKey: 'company_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { productName } = original;
            return (
                <span>{productName}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'company_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Lead Current Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { status } = original;
            return (
                <span>{status}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        }
    },
];

const LeadStatusTable = () => {
    return (
        <Card className="d-flex  shadow-sm border-0  p-3 mt-3">
             <h4 className="mb-3 text-body-emphasis text-nowrap">Lead Status Ratio</h4>
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination />
        </div>
        </Card>
    );
};

export default LeadStatusTable;
