import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Form } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import Button from '../../../components/base/Button';
import { PsdDataType } from './Psd';
import { useAuth } from '../../../AuthContext';

export const psdTableColumns = (handlePsdEdit: (inwardId: number) => void, handlePsdDelete: (inwardId: number) => void): ColumnDef<PsdDataType>[] => [
    {
        id: 'psd_sys_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PSD ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { psd_sys_id, psd_date } = original;
            return (
                <>
                <span>{psd_sys_id}</span> <br />
                <span>{psd_date}</span>
                </>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className: 'white-space-nowrap ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'invoice_number',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Invoice Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { invoice } = original;
            return (
                <span>{ invoice.invoice_number }</span>
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
        id: 'inward_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Inward ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { inward } = original;
            return (
                <>
                <span>{inward.inward_sys_id}</span><br />
                <span>{inward.inward_date}</span>
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
        id: 'inward_sys_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Proforma Invoice</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { inward } = original;
            return (
                <>
                    <span>{inward.proforma_invoice.pi_number}</span>
                </>
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
        id: 'business_task',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Business Task</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { inward } = original;
            return (
                <span>{inward.business_task ? `(${inward.business_task.id}) - ${inward.business_task.customer_name}` : ''}</span>
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
            const { inward } = original;
            return (
                <span>{inward.port_of_loading}</span>
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
            const { inward } = original;
            return (
                <span>{inward.port_of_discharge}</span>
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
            const { inward } = original;
            return (
                <span>{inward.inco_term ? inward.inco_term.inco_term : '' }</span>
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
            const { inward } = original;
            return (
                <>
                    {inward.grns.map((grn, index) => (
                        <span key={index}>{grn.grn_number}{((inward.grns.length - 1) != index) && (', ')}</span>
                    ))}
                </>
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
                <span>{boxes_count ?? ''}</span>
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
                    <Button className='text-success' variant='link' title='Edit PSD' onClick={() => handlePsdEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
                )}
                {userPermission.warehouse_delete == 1 && (
                    <Button className='text-danger' variant='link' title='Delete PSD' onClick={() => handlePsdDelete(id)} startIcon={<FontAwesomeIcon icon={faTrash} />}></Button>
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

const PsdTable = () => {
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

export default PsdTable;
