import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../components/base/AdvanceTableFooter';
import Button from '../../components/base/Button';
import { DirectoryData } from './Directories';
import { useAuth } from '../../AuthContext';
import axiosInstance from '../../axios';
import { downloadFile } from '../../helpers/utils';
import swal from 'sweetalert';

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
    } catch (error) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};

export const directoriesTableColumns = (handleShow: (userId?: number) => void, handleViewDirectory: (id: number) => void): ColumnDef<DirectoryData>[] => [
    {
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Dr No</span>
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
        id: 'created_at',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Created At</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { created_at } = original;
            return (
                <span>{created_at}</span>
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
                    <span>Company Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { company_name } = original;
            return (
                <span>{company_name}</span>
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
        id: 'services',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Product Or Services Offer</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { services } = original;
            return (
                <span>{services}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'created_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>DRT CREATED BY</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { created_name } = original;
            return (
                <>
                    <span>{created_name ? created_name.name : ''}</span>
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
        id: 'attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id, business_card } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    <span className="d-flex">
                    {business_card != null ? (
                        <Button
                            key={business_card}
                            className="text-primary p-0 d-flex"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(`/getFileDownload?filepath=uploads/directories/business-card/${business_card}`)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {business_card}
                        </Button>
                    ) : 'N/A'}
                    </span>
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
            const { userPermission, empData  } = useAuth(); //check userRole & permissions
            return (
                <>
                    {userPermission.directory_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Directory' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.directory_list == 1 && (
                        <Button className='text-info' variant='link' title='View Directory' onClick={() => handleViewDirectory(id)} startIcon={<FontAwesomeIcon icon={faEye} />}></Button>
                    )}
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold border-start ps-2 pe-2 border-end border-translucent'
            }
        }
    },
];

const DirectoriesTable = () => {
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

export default DirectoriesTable;
