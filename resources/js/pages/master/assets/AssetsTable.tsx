import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Button from '../../../components/base/Button';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { AssetDataType } from './Assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faAddressBook, faDownload } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import { useAuth } from '../../../AuthContext';

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
            axiosInstance.delete(`/assets/${userId}`)
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
export const assetTableColumns = ( handleShow: (userId?: number) => void, handleSuccess: () => void, handleHistoryShow: (userId: number) => void): ColumnDef<AssetDataType>[] => [
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
        accessorKey: 'asset_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Asset ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { asset_id } = original;
            return (
                <span>{asset_id}</span>
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
        accessorKey: 'asset_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { asset_name } = original;
            return (
                <span>{asset_name}</span>
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
        accessorKey: 'asset_desc',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Description</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { asset_desc } = original;
            return (
                <span>{asset_desc}</span>
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
        accessorKey: 'asset_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Asset Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { asset_type } = original;
            return (
                <span>{asset_type.name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'purchase_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Date</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ purchase_date }) => purchase_date
    },
    {
        id: 'warranty_exp_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Warranty Expiry</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ warranty_exp_date }) => warranty_exp_date
    },
    {
        accessorKey: 'vendors',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendors } = original;
            return (
                <span>{vendors.name}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'warranty_card',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Warranty Card</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { warranty_card, id } = original;
            return (
                <span>{warranty_card ? (
                    <Button
                        key={id}
                        className="text-primary p-0 d-flex"
                        variant="link"
                        title="Download"
                        onClick={() => handleDownload(`/getFileDownload?filepath=uploads/master/assets/${warranty_card}`)}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                    >
                        {warranty_card}
                    </Button>
                ) : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'invoice',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { invoice, id } = original;
            return (
                <span>{invoice ? (
                    <Button
                        key={id}
                        className="text-primary p-0 d-flex"
                        variant="link"
                        title="Download"
                        onClick={() => handleDownload(`/getFileDownload?filepath=uploads/master/assets/${invoice}`)}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                    >
                        {invoice}
                    </Button>
                ) : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'assigned_to_emp',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Status</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { assigned_to_emp } = original;
            return (
                <span>{assigned_to_emp != null ? 'Assigned' : 'Unassigned'}</span>
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
        },
        accessorFn: ({ assigned_to_emp }) => assigned_to_emp
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
                    {userPermission.assets_edit == 1 && (
                        <Button className='text-success' variant='link' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.assets_delete == 1 && (
                        <Button className='text-danger' variant='link' onClick={() => handleDelete(id, handleSuccess)}> <FontAwesomeIcon icon={faTrash} /></Button>
                    )}
                    <Button className='text-info' variant='link' onClick={() => handleHistoryShow(id)} startIcon={<FontAwesomeIcon icon={faAddressBook} />}></Button>
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
const AssetsTable: React.FC<AssetsTableProps> = ({ handleShow, handleSuccess }) => {

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

export default AssetsTable;
