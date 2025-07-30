import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Button from '../../../components/base/Button';
import Badge from '../../../components/base/Badge';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { KpisDataType } from './KpiList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faAddressBook, faDownload } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import { useAuth } from '../../../AuthContext';
import { capitalize } from '../../../helpers/utils';

interface AssetsTableProps {
    handleShow: (userId?: number) => void;
    handleSuccess: () => void;
}

const handleDownload = async (url: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`${url}`, {
            method: 'GET',
            responseType: 'blob',
        });
        if (response.status !== 200) {
            throw new Error('Failed to download the file');
        }
        // Create a Blob from the response data
        const blob = response.data;
        // Retrieve the filename from the response headers or construct it
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded-file' : 'downloaded-file';
        //call download file function from utils
        downloadFile(blob, filename); //pass blob data and filename
    } catch (error: any) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};

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
            axiosInstance.delete(`/kpis/${userId}`)
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
export const kpiTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void): ColumnDef<KpisDataType>[] => [
    {
        accessorKey: 'kpi_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>KPI Name</span>
                </div>
            );
        },
        cell: ({ row: {original} }) => {
            const { kpi_name } = original;
            return (
                <span>{kpi_name}</span> // Adding 1 to start the index from 1 instead of 0
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
        accessorKey: 'roles',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Role</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { roles } = original;
            return (
                <span>{roles ? roles.name : ''}</span>
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
        accessorKey: 'users',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Users</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { users } = original;
            return (
                <>
                    {users.map((upload, index) => (
                        <Badge key={index} bg="primary" variant="phoenix" className='me-1'>
                            {upload.name}
                        </Badge>
                    ))}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'description',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Description</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { description } = original;
            return (
                <span>{description}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '50%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'target_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Target Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { target_type } = original;
            return (
                <span>{target_type ? (target_type == 'done_not_done') ? 'Done / Not Done' : capitalize(target_type) : ''}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '50%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'priority',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Priority</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { priority } = original;
            return (
                <span>{priority}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '50%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
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
            const { userPermission, empData } = useAuth(); //check userRole & permissions
            return (
                <div className="d-flex align-items-center gap-2">
                    {userPermission.kpi_edit == 1 && (
                        <Button className='text-success' variant='link' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.kpi_delete == 1 && (
                        <Button className='text-danger' variant='link' onClick={() => handleDelete(id, handleSuccess)}> <FontAwesomeIcon icon={faTrash} /></Button>
                    )}
                </div>
            );
        },
        meta: {
            headerProps: {
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'py-0 border-end border-translucent'
            }
        }
    }
];
const KpisTable: React.FC<AssetsTableProps> = ({ handleShow, handleSuccess }) => {

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

export default KpisTable;
