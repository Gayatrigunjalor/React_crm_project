import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faDownload, faPerson, faMoneyCheckDollar, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Button from '../../../components/base/Button';
import { IrmsDataType } from './Irms';
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

const handlePaymentHistory = (irmId: number) => {
    axiosInstance.post(`/historyIrm`, {
        id: irmId
    })
    .then(response => {
        if(response.data.length > 0){
            const data = response.data;

            // Step 2: Create HTML table from the data
            let htmlTable = '<div style="width: auto; overflow-x: auto;"><table style="width:100%; border-collapse: collapse;">';
            htmlTable += '<thead><tr>';

            // Assuming data is an array of objects, create headers
            htmlTable += `<th style="border: 1px solid black; padding: 4px;">Reference Number</th>
            <th style="border: 1px solid black; padding: 4px;">Received Amount</th>
            <th style="border: 1px solid black; padding: 4px;">Previous Outstanding Amount</th>
            <th style="border: 1px solid black; padding: 4px;">Invoice Amount</th>
            <th style="border: 1px solid black; padding: 4px;">Outstanding Amount</th>`;
            htmlTable += '</tr></thead><tbody>';

            // Populate rows
            data.forEach(item => {
                htmlTable += '<tr>';
                htmlTable += `<td colspan="5" style="border: 1px solid black; padding: 8px;"> ${item.invoice_number} </td>`;
                htmlTable += '</tr>';
                item.irms.forEach(irm => {
                    htmlTable += '<tr>';
                    htmlTable += `<td style="border: 1px solid black; padding: 8px;">${irm.reference_no}</td>
                    <td style="border: 1px solid black; padding: 8px;">${irm.received_amount}</td>
                    <td style="border: 1px solid black; padding: 8px;">${irm.old_outstanding_amount}</td>
                    <td style="border: 1px solid black; padding: 8px;">${irm.invoice_amount}</td>
                    <td style="border: 1px solid black; padding: 8px;">${irm.outstanding_amount}</td>`;
                    htmlTable += '</tr>';
                });
            });

            htmlTable += '</tbody></table></div>';
            // Step 3: Display the table in SweetAlert
            swal({
                title: "IRM Payment History",
                className: "w-70",
                content: {
                    element: "div",
                    attributes: {
                        innerHTML: htmlTable,
                    },
                },
            });
        } else {
            swal("No history!", 'Payment History not found', "warning");
        }
    })
    .catch(error => {
        swal("Error!", error.data.message, "error");
    });
};

export const irmsTableColumns = (handleShow: (userId?: number) => void, handleDeleteAttachment: (attachment_id: number,  irm_id: number) => void): ColumnDef<IrmsDataType>[] => [
    {
        accessorKey: 'irm_sys_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sys Id</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { irm_sys_id } = original;
            return (
                <span>{irm_sys_id ? irm_sys_id : ''}</span>
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
        id: 'business_task_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task } = original;
            return (
                <span>{business_task ? business_task.id : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ business_task }) => business_task
    },
    {
        id: 'proforma_invoice',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Proforma Invoice</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { quotations } = original;
            return (
                <>
                    {quotations && quotations.map((quotation) => (
                        <Button
                            key={quotation.id}
                            className="text-primary p-0"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(`/pdfWithSignatureQuotation/${quotation.id}`)}
                            startIcon={<FontAwesomeIcon icon={faDownload} />}
                        >
                            {quotation.pi_number}
                        </Button>
                    ))

                    }
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
        accessorKey: 'reference_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Ref No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { reference_no } = original;
            return (
                <span>{reference_no}</span>
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
        id: 'remittance_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Remittance Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { remittance_date } = original;
            return (
                <span>{remittance_date}</span>
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
        id: 'currency',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Currency</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { currency } = original;
            return (
                <span>{currency.name}</span>
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
        accessorFn: ({ currency }) => currency
    },
    {
        id: 'received_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Received Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { received_amount } = original;
            return (
                <span>{received_amount}</span>
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
        accessorFn: ({ received_amount }) => received_amount
    },
    {
        id: 'outstanding_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Final Balance Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { outstanding_amount } = original;
            return (
                <span>{outstanding_amount}</span>
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
        accessorFn: ({ outstanding_amount }) => outstanding_amount
    },
    {
        id: 'buyer',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Buyer Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { buyer } = original;
            return (
                <span>{buyer.name}</span>
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
        id: 'invoiceNumbers',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice Numbers</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { invoiceNumbers } = original;
            return (
                <>
                    {invoiceNumbers.map((invoice) => (
                        <span>{invoice.invoice_number}</span>
                    ))}
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
        id: 'attachments',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id, irm_attachments } = original;
            const { userPermission } = useAuth();
            return (
                <>
                    {irm_attachments.map((upload, index) => (
                        <span className="d-flex">
                            <Button
                                key={upload.id}
                                className="text-primary p-0 d-flex"
                                variant="link"
                                title="Download"
                                onClick={() => handleDownload(`/getFileDownload?filepath=uploads/irm/attachments/${upload.name}`)}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                            >
                                {upload.name}
                            </Button>
                            {userPermission.irm_delete == 1 && (
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
            const { userPermission, empData  } = useAuth(); //check userRole & permissions
            return (
                <>
                    {userPermission.irm_edit == 1 && (
                        <Button className='text-success' variant='link' title='Edit Irm' onClick={() => handleShow(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                    )}
                    {empData.emp_user.user_role == 0 && (
                        <Button className='text-info' variant='link' title='IRM Payment History' onClick={() => handlePaymentHistory(id)} startIcon={<FontAwesomeIcon icon={faMoneyCheckDollar} />}></Button>
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

const IrmsTable = () => {
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

export default IrmsTable;
