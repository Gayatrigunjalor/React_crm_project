import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Button from '../../../components/base/Button';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { ProductConditionDataType } from './ProductCondition';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';

interface ProductConditionTableProps {
    handleShow: (userId?: number) => void;
    handleSuccess: () => void;
}

const handleDelete = (userId: number, handleSuccess: () => void) => {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this record!",
        icon: "warning",
        buttons: {
            confirm: {
                text: "Delete",
                value: true,
                visible: true,
                className: "",
                closeModal: true
            },
            cancel: {
                text: "Cancel",
                value: null,
                visible: true,
                className: "",
                closeModal: true,
            }
        },
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            axiosInstance.delete(`/product-condition/${userId}`)
            .then(response => {
                swal("Success!", response.data.message, "success");
                handleSuccess();
            })
            .catch(error => {
                swal("Error!", error.data.message, "error");
            });
        } else {
            swal("Your record is safe!");
        }
    });
};
export const productConditionTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void): ColumnDef<ProductConditionDataType>[] => [
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
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name</span>
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
                    <Button variant="phoenix-danger" onClick={() => handleDelete(id, handleSuccess)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
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
const ProductConditionTable: React.FC<ProductConditionTableProps> = ({ handleShow, handleSuccess }) => {

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

export default ProductConditionTable;
