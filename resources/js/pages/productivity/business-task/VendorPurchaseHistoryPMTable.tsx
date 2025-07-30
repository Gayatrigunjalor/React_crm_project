import { ColumnDef } from '@tanstack/react-table';
import { faDownload, faEdit, faFileInvoiceDollar, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBox from '../../../components/common/SearchBox';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { Form } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import {VendorPurchaseHistory} from "./AccountsWorksheet";
export const vendorPurchaseTableColumns = (handleDownload: (fileName: string, path: string) => void): ColumnDef<VendorPurchaseHistory>[] => [
    {
        accessorKey: 'po_invoice_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO Number</span>
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
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
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
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
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
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
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
            const { vendor_name } = original;
            return (
                <span>{vendor_name ? vendor_name.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
    {
        id: 'base_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Base Amount</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ base_amount }) => base_amount
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
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ gst_percent }) => gst_percent
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
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ gst_amount }) => gst_amount
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
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ tds_deduction }) => tds_deduction
    },
    {
        id: 'tds_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS Amount</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ tds_amount }) => tds_amount
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
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ net_payable }) => net_payable
    },
    {
        id: 'paid_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Paid Amount</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ paid_amount }) => paid_amount
    },
    {
        id: 'bank_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank Name</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ bank_name }) => bank_name
    },
    {
        id: 'utr_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Number</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ utr_number }) => utr_number
    },
    {
        id: 'utr_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>UTR Date</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-translucent'
            }
        },
        accessorFn: ({ utr_date }) => utr_date
    },

    {
        id: 'actions',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Attachments</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { attachments } = original;
            return (
                <>
                {attachments.length > 0 && attachments.map((upload) => (
                        <Button
                            key={upload.id}
                            className="text-primary p-0"
                            variant="link"
                            title="Download"
                            onClick={() => handleDownload(upload.name, 'uploads/vendor-purchase-invoice')}
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
                className: 'ps-2 pe-2 border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-translucent'
            }
        }
    },
];
const VendorPurchaseHistoryPMTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

export default VendorPurchaseHistoryPMTable;
