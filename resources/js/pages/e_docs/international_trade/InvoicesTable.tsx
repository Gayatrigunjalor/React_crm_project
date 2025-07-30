import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Form } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import Button from '../../../components/base/Button';
import { InvoicesDataType } from './Invoices';
import { useAuth } from '../../../AuthContext';

export const invoicesTableColumns = (handleInvoiceEdit: (quoteId: number) => void, handlePDFclicked: (quoteId: number, path: string) => void, handleScometClicked: (invoiceId: number) => void): ColumnDef<InvoicesDataType>[] => [
    {
        accessorKey: 'invoice_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { invoice_number } = original;
            return (
                <span>{invoice_number}</span>
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
        id: 'invoice_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice Date</span>
                </div>
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
        accessorFn: ({ invoice_date }) => invoice_date
    },
    {
        id: 'buyer_name',
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
                <span>{buyer ? buyer.name : '' }</span>
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
        accessorKey: 'consignee',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Consignee Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { consignee } = original;
            return (
                <span>{consignee ? consignee.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        }
    },

    {
        id: 'shipment_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Grand Total</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { shipment_type } = original;
            return (
                <span>{shipment_type}</span>
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
        id: 'exchange_rate',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Exchange Rate</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { exchange_rate } = original;
            return (
                <span>{exchange_rate}</span>
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
                <span>{currency}</span>
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
                className:
                'ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'remmittance_value',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Outstanding Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { remmittance_value } = original;
            return (
                <span>{remmittance_value}</span>
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
        id: 'grand_total',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice Value</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { grand_total } = original;
            return (
                <span>{grand_total}</span>
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
        id: 'final_balance_amount',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Final Balance Amount</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { remmittance_value, grand_total } = original;
            return (
                <span>{Number(remmittance_value) - Number(grand_total)}</span>
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
                <>
                {userPermission.invoice_edit == 1 && (
                    <Button className='text-success' variant='link' title='Edit Invoice' onClick={() => handleInvoiceEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                )}
                </>

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
        id: 'pdfs',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PDFs</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            const { userPermission, empData } = useAuth(); //check userRole & permissions
            return (
                <RevealDropdownTrigger>
                    <RevealDropdown>

                        <Dropdown.Item eventKey="2" title="Trade Invoice(signed)" onClick={() => handlePDFclicked(id, 'pdfInvoiceWithSign')}>TI with Signature</Dropdown.Item>
                        <Dropdown.Item eventKey="3" title="Trade Invoice" onClick={() => handlePDFclicked(id, 'pdfInvoice')}>TI without Signature</Dropdown.Item>
                        <Dropdown.Item eventKey="2" title="Packing List(signed)" onClick={() => handlePDFclicked(id, 'pdfPackingListWithSign')}>PL with Signature</Dropdown.Item>
                        <Dropdown.Item eventKey="3" title="Packing List" onClick={() => handlePDFclicked(id, 'pdfPackingList')}>PL without Signature</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="4" title="Shipper Letter" onClick={() => handlePDFclicked(id, 'pdfShipperLetter')}>Shipper Letter</Dropdown.Item>
                        <Dropdown.Item eventKey="5" title="Non-Hazardous Cargo" onClick={() => handlePDFclicked(id, 'pdfNonHazardousCargo')}>Non-Hazardous Cargo</Dropdown.Item>
                        <Dropdown.Item eventKey="6" title="AnnexureA" onClick={() => handlePDFclicked(id, 'pdfAnnexureA')}>AnnexureA</Dropdown.Item>
                        <Dropdown.Item eventKey="7" title="ppendixI" onClick={() => handlePDFclicked(id, 'pdfAppendixI')}>AppendixI</Dropdown.Item>
                        <Dropdown.Item eventKey="8" title="Delivery Challan" onClick={() => handlePDFclicked(id, 'pdfDeliveryChallan')}>Delivery Challan</Dropdown.Item>
                        <Dropdown.Item eventKey="9" title="AWB / BL" onClick={() => handlePDFclicked(id, 'pdfAWB_BL')}>AWB / BL</Dropdown.Item>
                        <Dropdown.Item eventKey="10" title="SCOMET" onClick={() => handleScometClicked(id)}>SCOMET</Dropdown.Item>
                    </RevealDropdown>
                </RevealDropdownTrigger>
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
];

const InvoicesTable = () => {
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

export default InvoicesTable;
