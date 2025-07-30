import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Button from '../../../components/base/Button';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { StagesDataType } from './Stages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

interface StagesTableProps {
    handleShow: (userId?: number) => void;
    handleSuccess: () => void;
}

export const stagesTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void): ColumnDef<StagesDataType>[] => [
    {
        accessorKey: 'index',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>#</span>
                </div>
            );
        },
        cell: ({ row }) => {
            return (
                <span>{row.index + 1}</span> // Adding 1 to start the index from 1 instead of 0
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'stage_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { stage_name } = original;
            return (
                <span>{stage_name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'stage_order',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Stage Order</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { stage_order } = original;
            return (
                <span>{stage_order}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'stage_bg_color',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Stage BG Color</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { stage_bg_color } = original;
            return (
                <span>{stage_bg_color}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'is_done_stage',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>IS Done</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { is_done_stage } = original;
            return (
                <span>{is_done_stage ? 'True' : 'False'}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Actions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <div className="d-flex align-items-center gap-2">
                    <Button variant='phoenix-info' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    }
];
const StagesTable: React.FC<StagesTableProps> = ({ handleShow, handleSuccess }) => {

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

export default StagesTable;
