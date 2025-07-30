import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { useAuth } from '../../../AuthContext';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import swal from 'sweetalert';
import React from 'react';

export const keyOpportunityTableColumns = (handleShow: (userId?: number) => void, handleViewDirectory: (id: number) => void): ColumnDef<DirectoryData>[] => [
    {
        accessorKey: 'sr_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>SR NO</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'customer_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>CUSTOMER ID</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'customer_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>CUSTOMER NAME</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'opportunity_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>OPPORTUNITY ID</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'order_value',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>ORDER VALUE</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'opportunity_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>OPPORTUNITY DATE</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'buying_plan',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>BUYING PLAN</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'country',
        header: () => {
            return (
                <div className="d-inline-flex flex-center" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                    <span>COUNTRY</span>
                </div>
            );
        }
    }
];

interface DirectoryData {
    id: number;
    customer_id: string;
    customer_name: string;
    opportunity_id: string;
    order_value: number;
    opportunity_date: string;
    buying_plan: string;
    country: string;
}

const KeyOpportunitiesTable = () => {
    
    return (
        <div className="border-top border-translucent overflow-auto" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
            <AdvanceTable
                tableProps={{
                    className: 'phoenix-table fs-9 w-100', 
                }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
    );
};


export default KeyOpportunitiesTable;
