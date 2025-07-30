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
import { Card, Col } from 'react-bootstrap';


export const ProductSourcingColumns = (handleShow: (userId?: number) => void, handleViewDirectory: (id: number) => void): ColumnDef<DirectoryData>[] => [
    {
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Assignee Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { name } = original;
            return (
                <span>{name}</span>
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
                    <span>Count Of Product</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { count } = original;
            return (
                <span>{count}</span>
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
  
 
   
];

const ProductSourcingTable = () => {
    return (
         <Card className="d-flex flex-column shadow-sm border-0 p-4 mt-3 align-items-center">
             <Col xs={12} className="d-flex justify-content-between">
             <h4 className="mb-3 text-body-emphasis text-nowrap">Product Sourcing Required</h4></Col>
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
            <AdvanceTableFooter pagination className="py-4" />
        </div>
        </Card>
    );
};

export default ProductSourcingTable;
