import { ColumnDef } from '@tanstack/react-table';
import { faEdit, faComputer, faSitemap, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Form } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import Button from '../../../components/base/Button';
import { EbrcDataType } from './Ebrc';
import { useAuth } from '../../../AuthContext';

export const ebrcTableColumns = (handleEbrcEdit: (ebrcId: number) => void): ColumnDef<EbrcDataType>[] => [
    {
        id: 'ebrc_index',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Sr No</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { id } = original;
            return (
                <>
                <span>{id}</span>
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
            const { invoice_details } = original;
            return (
                <span>{ invoice_details !== null ? invoice_details.invoice_number : '' }</span>
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
        id: 'e_brc_no',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>e-Brc Number</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { e_brc_no } = original;
            return (
                <span>{e_brc_no}</span>
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
        id: 'e_brc_dt',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Proforma Invoice</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { e_brc_date } = original;
            return (
                <>
                    <span>{e_brc_date}</span>
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
                {userPermission.ebrc_edit == 1 && (
                    <Button className='text-success' variant='link' title='Edit eBRC' onClick={() => handleEbrcEdit(id)} startIcon={<FontAwesomeIcon icon={faEdit} />}></Button>
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

const EbrcTable = () => {
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

export default EbrcTable;
