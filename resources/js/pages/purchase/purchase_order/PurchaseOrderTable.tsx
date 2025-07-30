import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faEye, faTrash, faFileCircleCheck, faMoneyBillTransfer, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { PurchaseOrderTblData } from './PurchaseOrder';
import { useAuth } from '../../../AuthContext';
import axiosInstance from '../../../axios';
import { downloadFile } from '../../../helpers/utils';
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
    } catch (error: any) {
        if (error.status === 404) {
            swal("Error!", 'File not found', "error");
        }
        console.error('Error downloading the file:', error);
    }
};

export const poTableColumns = (handlePOedit: (poId: number) => void, handlePOdownload: (quoteId: number, path: string) => void, handleDeleteAttachment: (attachment_id: number,  po_id: number) => void, handleAttachQuotations: (poId: number) => void, handlePaymentShow: (poId: number) => void, handleGoToBt: (btId: number) => void): ColumnDef<PurchaseOrderTblData>[] => [
    {
        accessorKey: 'po_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Po Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { po_type } = original;
            return (
                <span>{po_type}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 fw-semibold border-start border-end border-translucent'
            }
        }
    },
    {
        accessorKey: 'purchase_order_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Po No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order_number } = original;
            return (
                <span>{purchase_order_number}</span>
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
        accessorKey: 'order_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Order Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { order_date } = original;
            return (
                <span>{order_date}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    {(userPermission.business_task_edit == 1) && business_task_id ? (
                        <Button className='text-primary' variant='link' title='Go TO Edit BT' onClick={() => handleGoToBt(business_task_id)}>{business_task_id}</Button>
                    ) : (
                        <span>{business_task_id? business_task_id : ''}</span> //redirect to BT ID
                    )}
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
        }
    },
    {
        accessorKey: 'supplier',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Supplier/FFD Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ffd_id, vendor_id, ffd, vendor } = original;
            return (
                <>
                    {ffd_id && (
                        <span>{ffd.name}</span>
                    )}
                    {vendor && (
                        <span>{vendor.name}</span>
                    )}
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
        }
    },
    {
        id: 'expected_delivery_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Expected Delivery Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { expected_delivery_date } = original;
            return (
                <span>{expected_delivery_date}</span>
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
        accessorKey: 'grand_total',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Grand Total</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { grand_total } = original;
            return (
                <>
                    <span>{grand_total}</span>
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
                    <span>PO Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id, quotation_attach } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    <span>
                    {quotation_attach.length > 0 ? (
                        quotation_attach.map((upload) => (
                            <span className="d-flex">
                            <Button
                                key={upload.id}
                                className="text-primary p-0 d-flex"
                                variant="link"
                                title="Download"
                                onClick={() => handleDownload(`/getFileDownload?filepath=uploads/purchase-order/quotations/${upload.name}`)}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                            >
                                {upload.name}
                            </Button>
                            {userPermission.purchase_order_edit && (
                                <Button
                                    className="text-danger p-0 ms-2"
                                    variant="link"
                                    title="Delete Attachment"
                                    onClick={() => handleDeleteAttachment(upload.id, id)}
                                    startIcon={<FontAwesomeIcon icon={faTrash} />}
                                >
                                </Button>
                            )}
                            </span>

                            ))
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
                    {userPermission.purchase_order_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Purchase Order' onClick={() => handlePOedit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {userPermission.purchase_order_list == 1 && (
                        <Button className='text-info' variant='link' title="Download With Signature" onClick={() => handlePOdownload(id, 'pdfWithSignature')} startIcon={<FontAwesomeIcon icon={faFileCircleCheck} />}></Button>
                    )}
                    {userPermission.purchase_order_list == 1 && (
                        <Button className='text-danger' variant='link' title="Download Without Signature" onClick={() => handlePOdownload(id, 'pdfWithOutSignature')} startIcon={<FontAwesomeIcon icon={faFileCircleCheck} />}></Button>
                    )}
                    {userPermission.purchase_order_edit == 1 && (
                        <Button className='text-info' variant='link' title='Payment' onClick={() => handlePaymentShow(id)} startIcon={<FontAwesomeIcon icon={faMoneyBillTransfer} />}></Button>
                    )}
                    {userPermission.purchase_order_edit == 1 && (
                        <Button className='text-info' variant='link' title='Attach Quotations' onClick={() => handleAttachQuotations(id)} startIcon={<FontAwesomeIcon icon={faPaperclip} />}></Button>
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

const PurchaseOrderTable = () => {
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

export default PurchaseOrderTable;
