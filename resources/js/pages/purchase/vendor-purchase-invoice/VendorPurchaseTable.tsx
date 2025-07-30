import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { VendorPurchaseTblData } from './VendorPurchaseInvoice';
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

export const vpiTableColumns = (handleEdit: (vpiId: number) => void): ColumnDef<VendorPurchaseTblData>[] => [
    {
        accessorKey: 'purchase_order',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_order } = original;
            return (
                <span>{purchase_order ? purchase_order.purchase_order_number : ''}</span>
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
        accessorKey: 'purchase_invoice_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purchase Invoice No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_no } = original;
            return (
                <span>{purchase_invoice_no}</span>
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
        accessorKey: 'purchase_invoice_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Purch. Inv. Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { purchase_invoice_date } = original;
            return (
                <span>{purchase_invoice_date}</span>
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
        accessorKey: 'vendor_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { vendor } = original;
            return (
                <span>{vendor ? vendor.name : ''}</span>
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
        accessorKey: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task_id } = original;
            return (
                <span>{business_task_id? business_task_id : ''}</span> //redirect to BT ID
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
        accessorKey: 'base_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Base Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { base_amount } = original;
            return (
                <>
                    {base_amount}
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
        id: 'gst_percent',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST %</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_percent } = original;
            return (
                <span>{gst_percent? gst_percent + ' %' : ''}</span> //redirect to BT ID
            );
        },
        meta: {
            headerProps: {
                className: 'white-space-nowrap ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'gst_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { gst_amount } = original;
            return (
                <span>{gst_amount? gst_amount : ''}</span> //redirect to BT ID
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
        id: 'tds_deduction',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS %</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { tds_deduction } = original;
            return (
                <span>{tds_deduction? tds_deduction + ' %' : ''}</span> //redirect to BT ID
            );
        },
        meta: {
            headerProps: {
                className: 'white-space-nowrap ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'net_payable',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Net Payable</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { net_payable } = original;
            return (
                <span>{net_payable}</span>
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
        accessorKey: 'paid_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Paid Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { paid_amount } = original;
            return (
                <>
                    <span>{paid_amount? paid_amount : 0}</span>
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
        accessorKey: 'bank_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { bank_name } = original;
            return (
                <>
                    <span>{bank_name? bank_name : ''}</span>
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
        accessorKey: 'utr_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_number } = original;
            return (
                <>
                    <span>{utr_number? utr_number : ''}</span>
                </>
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
        accessorKey: 'utr_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { utr_date } = original;
            return (
                <>
                    <span>{utr_date? utr_date : ''}</span>
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
            const { id, attachments } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    {attachments.length > 0 ? (
                        attachments.map((upload) => (
                            <Button
                                key={upload.id}
                                className="text-primary p-0 d-flex"
                                variant="link"
                                title="Download"
                                onClick={() => handleDownload(`/getFileDownload?filepath=uploads/vendor-purchase-invoice/${upload.name}`)}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                            >
                                {upload.name}
                            </Button>
                            ))
                    ) : 'N/A'}
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
                    {userPermission.vendor_list == 1 && (
                        <Button className='text-success' variant='link' title='Edit Vendor Purchase Invoice' onClick={() => handleEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
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

const VendorPurchaseTable = () => {
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

export default VendorPurchaseTable;
