import { ColumnDef } from '@tanstack/react-table';
import { Dropdown } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import { useAuth } from '../../../AuthContext';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import { VendorsDataType } from './Vendors';
import { formatDateToDayMonthYear } from '../../../helpers/utils';

export const vendorsTableColumns = (handleView: (userId?: number) => void, handleShow: (userId?: number) => void, handleContacts: (id: number) => void, handleAttachments: (id: number) => void): ColumnDef<VendorsDataType>[] => [
    {
        accessorKey: 'id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor ID</span>
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
                style: { width: '5%' },
                className: 'ps-2 pe-2 border-start border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-start border-end border-translucent'
            }
        }
    },
    {
        id: 'created_at',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Created At</span>
                </div>
            );
        },
        meta: {
            headerProps: {
                className: 'white-space-nowrap ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'ps-2 border-end border-translucent'
            }
        },
        cell: ({ row: { original } }) => {
            const { created_at } = original;
            return (
                <span>{formatDateToDayMonthYear(created_at)}</span>
            );
        },
    },
    {
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { name } = original;
            return (
                <span>{name}</span>
            );
        },
        meta: {
            headerProps: {
                style: { width: '15%' },
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'white-space-nowrap fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'employee_name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>PVV Head</span>
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
        accessorFn: ({ employee_name }) => employee_name
    },
    {
        id: 'vender_type_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Type</span>
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
        accessorFn: ({ vender_type_id }) => vender_type_id
    },
    {
        id: 'entity_type_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Entity Type</span>
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
        accessorFn: ({ entity_type_id }) => entity_type_id
    },
    {
        id: 'segment_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Segment Type</span>
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
        accessorFn: ({ segment_id }) => segment_id
    },
    {
        id: 'vendor_behavior_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Vendor Behavior</span>
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
        accessorFn: ({ vendor_behavior_id }) => vendor_behavior_id
    },
    {
        id: 'contact_person',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Contact Person</span>
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
        accessorFn: ({ contact_person }) => contact_person
    },

    {
            id: 'leadDropdown',
            cell: ({ row: { original } }) => {
                const { id } = original;
                const { userPermission, empData  } = useAuth(); //check userRole & permissions
                return (
                    <RevealDropdownTrigger>
                        <RevealDropdown>
                            <Dropdown.Item eventKey="1" onClick={() => handleView(id)}>View</Dropdown.Item>
                            {userPermission.vendor_edit == 1 && (
                                <Dropdown.Item eventKey="2" onClick={() => handleShow(id)}>Edit</Dropdown.Item>
                            )}
                            {userPermission.vendor_contact_list == 1 && (
                                <Dropdown.Item eventKey="3" onClick={() => handleContacts(id)}>Contacts</Dropdown.Item>
                            )}
                            {userPermission.vendor_attachment_list == 1 && (
                                <Dropdown.Item eventKey="4" onClick={() => handleAttachments(id)}>Attachments</Dropdown.Item>
                            )}
                            {/* <Dropdown.Divider />
                            <Dropdown.Item eventKey="4" className="text-danger">
                                Remove
                            </Dropdown.Item> */}
                        </RevealDropdown>
                    </RevealDropdownTrigger>
                );
            },
            meta: {
                headerProps: {
                    className: 'ps-2 pe-2 border-end border-translucent'
                },
                cellProps: {
                    className: 'text-end pe-2 ps-2 border-end border-translucent'
                }
            }
    },
];

const VendorsTable = () => {
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

export default VendorsTable;
