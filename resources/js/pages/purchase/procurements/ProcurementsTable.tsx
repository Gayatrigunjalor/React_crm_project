import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faPerson, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { ProcurementsDataType } from './Procurements';
import { useAuth } from '../../../AuthContext';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
import swal from 'sweetalert';

const handleDownload = async (fileName: string) => {
    try {
        // Fetch the file from the server using the upload ID
        const response = await axiosInstance.get(`/getFileDownload?filepath=uploads/procurement/attachments/${fileName}`, {
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

export const procurementsTableColumns = (handleShow: (userId?: number) => void, handleShowProducts: (userId?: number) => void, handleProcVendors: (id: number) => void): ColumnDef<ProcurementsDataType>[] => [
    {
        accessorKey: 'proc_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Proc No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { proc_number } = original;
            return (
                <span>{proc_number}</span>
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
        id: 'product_counts',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product Count</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ products_count }) => products_count
    },
    {
        id: 'product_service_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product / Services Name</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ product_service_name }) => product_service_name
    },
    {
        id: 'description',
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
                <span>{ description }</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
    },
    {
        accessorKey: 'target_cost',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Target Cost</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { target_cost } = original;
            return (
                <span>{target_cost}</span>
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
        id: 'status',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Status</span>
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
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'tat',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TAT</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tat } = original;
            return (
                <span>{tat}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ tat }) => tat
    },
    {
        id: 'attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { uploads } = original;
            return (
                <>
                    {uploads.map((upload) => (
                        <Button
                            key={upload.id}
                            className="text-primary p-0"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(upload.name)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {upload.name}
                        </Button>
                    ))}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
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
                <>
                    {userPermission.procurement_list == 1 && (
                        <Button className='text-primary' variant='link' title='View Products' onClick={() => handleShowProducts(id)} startIcon={<FontAwesomeIcon icon={faEye} />}></Button>
                    )}
                    {userPermission.procurement_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Procurement' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.procurement_vendor_list == 1 && (
                        <Button className='text-success' variant='link' title='Procurement Vendors' onClick={() => handleProcVendors(id)} startIcon={<FontAwesomeIcon icon={faPerson} />}></Button>
                    )}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold border-start ps-2 pe-2 border-end border-translucent'
            }
        }
    },
];

const ProcurementsTable = () => {
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

export default ProcurementsTable;
