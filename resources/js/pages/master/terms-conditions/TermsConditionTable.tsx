import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Button from '../../../components/base/Button';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { TermsConditionDataType } from './TermsCondition';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';
import { useAuth } from '../../../AuthContext';

interface DesignationTableProps {
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
            axiosInstance.delete(`/terms-and-conditions/${userId}`)
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
export const tncTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void): ColumnDef<TermsConditionDataType>[] => [
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
        accessorKey: 'order',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Orders</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { order } = original;
            return (
                <span>{order}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'tc',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Terms And Conditions</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { terms_and_conditions } = original;
            return (
                <span>{terms_and_conditions}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
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
            const { userPermission } = useAuth(); //check userRole & permissions
            return (
                <div className="d-flex align-items-center gap-2">
                    {userPermission.terms_and_conditions_edit == 1 && (
                        <Button className='text-success' variant='link' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.terms_and_conditions_delete == 1 && (
                        <Button className='text-danger' variant='link' onClick={() => handleDelete(id, handleSuccess)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    )}
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '10%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    }
];
const TermsConditionTable: React.FC<DesignationTableProps> = () => {

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

export default TermsConditionTable;
