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


export const performanceTableColumns = (handleShow: (userId?: number) => void, handleViewDirectory: (id: number) => void): ColumnDef<DirectoryData>[] => [
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
                    <span>Monthly Deals</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { opp } = original;
            return (
                <span>{opp}</span>
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
                    <span>Deals In Qualified List</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { value } = original;
            return (
                <span>{value}</span>
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

const PerformanceTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};

export default PerformanceTable;
