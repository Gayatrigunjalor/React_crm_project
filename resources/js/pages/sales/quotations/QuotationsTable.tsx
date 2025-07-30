import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Form } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import Button from '../../../components/base/Button';
import { QuotationsDataType } from './Quotations';
import { useAuth } from '../../../AuthContext';

export const quotationsTableColumns = (handleQuotationEdit: (quoteId: number) => void, handlePDFclicked: (quoteId: number, path: string) => void, handleDelete: (quoteId: number) => void): ColumnDef<QuotationsDataType>[] => [
    {
        accessorKey: 'pi_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PI No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { pi_number } = original;
            return (
                <span>{pi_number}</span>
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
        id: 'pi_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PI Date</span>
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
        accessorFn: ({ pi_date }) => pi_date
    },
    {
        id: 'bt_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>BT ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { sde_attachment } = original;
            return (
                <span>{sde_attachment ? sde_attachment.business_task_id : '' }</span>
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
        accessorKey: 'buyer',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Buyer</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { buyer } = original;
            return (
                <span>{buyer ? buyer.name : ''}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'consignee',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Consignee</span>
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
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 border-end border-translucent'
            }
        },
    },
    {
        id: 'grand_total',
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
                <span>{grand_total}</span>
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
        accessorFn: ({ grand_total }) => grand_total
    },
    {
        id: 'bank_details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Bank</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { bank_details } = original;
            return (
                <span>{bank_details ? bank_details.bank_name : ''}</span>
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
        id: 'document_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Document Type</span>
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
        accessorFn: ({ document_type }) => document_type
    },
    {
        id: 'sales_manager_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sales Manager</span>
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
        accessorFn: ({ sales_manager_id }) => sales_manager_id
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
            const { id,document_type,consignee_id } = original;
            const { userPermission, empData } = useAuth(); //check userRole & permissions
            return (
                <RevealDropdownTrigger>
                    <RevealDropdown>
                        {userPermission.quotation_edit == 1 && (
                        <Dropdown.Item eventKey="1" onClick={() => handleQuotationEdit(id)}>Edit</Dropdown.Item>
                        )}
                        <Dropdown.Item eventKey="2" onClick={() => handlePDFclicked(id, 'pdfWithSignatureQuotation')}>PDF with Signature</Dropdown.Item>
                        <Dropdown.Item eventKey="3" onClick={() => handlePDFclicked(id, 'pdfWithOutSignatureQuotation')}>PDF without Signature</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="4" onClick={() => handleDelete(id)} className="text-danger">
                            Remove
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {document_type == 'International' && (consignee_id) && (
                        <>
                            <Dropdown.Item eventKey="5" title="Tri-party Agreement" onClick={() => handlePDFclicked(id, 'quotation_pdfTPA')}>Tri-party Agreement</Dropdown.Item>
                            <Dropdown.Item eventKey="6" title="Buyer Declaration" onClick={() => handlePDFclicked(id, 'quotation_pdfBD')}>Buyer Declaration</Dropdown.Item>
                            <Dropdown.Item eventKey="7" title="Consignee Declaration" onClick={() => handlePDFclicked(id, 'quotation_pdfCD')}>Consignee Declaration</Dropdown.Item>
                        </>

                        )}
                        <Dropdown.Item eventKey="8" title="Sales Contract" onClick={() => handlePDFclicked(id, 'quotation_pdfSC')}>Sales Contract</Dropdown.Item>
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

const QuotationsTable = () => {
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

export default QuotationsTable;
