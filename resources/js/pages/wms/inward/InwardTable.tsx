import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap, faTrash, faPrint, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Form } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import Button from '../../../components/base/Button';
import { InwardDataType } from './Inward';
import { useAuth } from '../../../AuthContext';

export const inwardTableColumns = (handleInwardEdit: (quoteId: number) => void, handleInwardDelete: (inwardId: number) => void, handlePDFclicked: (quoteId: number, path: string) => void, handleFreightclicked: (inwardID: number) => void): ColumnDef<InwardDataType>[] => [
    {
        accessorKey: 'invoice_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr. No.</span>
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
        id: 'inward_sys_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Inward ID</span>
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
        accessorFn: ({ inward_sys_id }) => inward_sys_id
    },
    {
        id: 'inward_date',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Inward Date</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { inward_date } = original;
            return (
                <span>{inward_date}</span>
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
        accessorKey: 'proforma_invoice',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Proforma Invoice</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { proforma_invoice } = original;
            return (
                <span>{proforma_invoice ? proforma_invoice.pi_number : ''}</span>
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
        id: 'business_task',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Business Task</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { business_task } = original;
            return (
                <span>{business_task ? `(${business_task.id}) - ${business_task.customer_name}` : ''}</span>
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
        id: 'port_of_loading',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Port of Loading</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { port_of_loading } = original;
            return (
                <span>{port_of_loading}</span>
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
        id: 'port_of_discharge',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Port of Discharge</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { port_of_discharge } = original;
            return (
                <span>{port_of_discharge}</span>
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
        id: 'inco_term',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Inco Term</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { inco_term } = original;
            return (
                <span>{inco_term ? inco_term.inco_term : '' }</span>
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
        id: 'grns',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>GRN IDs</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { grns } = original;
            return (
                <span>{grns.map((grn, index) => (
                    <>
                        {grn.grn_number}{((grns.length - 1) != index) && (', ')}
                    </>
                ))}</span>
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
        id: 'boxes_count',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Box Count</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { boxes_count } = original;
            return (
                <span>{boxes_count}</span>
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
                {userPermission.warehouse_edit == 1 && (
                    <Button className='text-success' variant='link' title='Edit Inward' onClick={() => handleInwardEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                )}
                {userPermission.warehouse_delete == 1 && (
                    <Button className='text-danger' variant='link' title='Delete Inward' onClick={() => handleInwardDelete(id)} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
                )}
                {userPermission.warehouse_list == 1 && (
                    <Button className='text-info' variant='link' title='Print Sticker' onClick={() => handlePDFclicked(id, 'pdfInward')} startIcon={<FontAwesomeIcon icon={faPrint} />}></Button>
                )}
                {userPermission.warehouse_list == 1 && (
                    <Button className='text-warning' variant='link' title='Freight Enquiry' onClick={() => handleFreightclicked(id)} startIcon={<FontAwesomeIcon icon={faFile} />}></Button>
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
    }
];

const InwardTable = () => {
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

export default InwardTable;
