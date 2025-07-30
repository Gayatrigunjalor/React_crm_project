import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faFileInvoiceDollar, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBox from '../../../components/common/SearchBox';
import useAdvanceTable from '../../../hooks/useAdvanceTable';
import AdvanceTableProvider from '../../../providers/AdvanceTableProvider';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { Form } from 'react-bootstrap';
import Button from '../../../components/base/Button';
import {PaymentHistory} from "./AccountsWorksheet";
export const paymentHistoryTableColumns = (handlePaymentModal: (payId?: number) => void): ColumnDef<PaymentHistory>[] => [
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
            const { po_invoice_number } = original;

            return (
                <span>{po_invoice_number}</span>
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
        accessorKey: 'po_invoice_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PO Grand Total</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { po_invoice_amount } = original;
            return (
                <span>{po_invoice_amount}</span>
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
        accessorKey: 'paid_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Paid amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { paid_amount } = original;
            return (
                <span>{paid_amount}</span>
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
        accessorKey: 'balance_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Balance Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { balance_amount } = original;
            return (
                <span>{balance_amount}</span>
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
        id: 'tds_rate',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>TDS Rate</span>
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
        accessorFn: ({ tds_rate }) => tds_rate
    },
    {
        id: 'gst_rate',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GST Rate</span>
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
        accessorFn: ({ gst_rate }) => gst_rate
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
    // {
    //     id: 'actions',
    //     header: () => {
    //         return (
    //             <div className="d-inline-flex flex-center">
    //                 <span>Actions</span>
    //             </div>
    //         );
    //     },
    //     cell: ({ row: { original } }) => {
    //         const { id } = original;
    //         return (
    //             <Button variant='link' title='Pay History' onClick={() => handlePaymentModal(id)} startIcon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}></Button>
    //         );
    //     },
    //     meta: {
    //         headerProps: {
    //             className: 'ps-2 pe-2 border-translucent'
    //         },
    //         cellProps: {
    //             className:
    //             'white-space-nowrap fw-semibold ps-2 border-translucent'
    //         }
    //     }
    // },
];
const PaymentHistoryBTTable = () => {
    return (
        <div className="border-top border-translucent">
            <AdvanceTable
                tableProps={{ className: 'phoenix-table fs-9' }}
                rowClassName="hover-actions-trigger btn-reveal-trigger"
            />
        </div>
    );
};

export default PaymentHistoryBTTable;
