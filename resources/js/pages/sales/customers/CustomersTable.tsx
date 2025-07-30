import { ColumnDef } from '@tanstack/react-table';
import { Dropdown } from 'react-bootstrap';
import AdvanceTable from '../../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../../components/base/AdvanceTableFooter';
import Avatar from 'components/base/Avatar';
import Badge from 'components/base/Badge';
import RevealDropdown, { RevealDropdownTrigger } from '../../../components/base/RevealDropdown';
import { CustomerDataType } from './Customers';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';

export const customersTableColumns = (handleView: (userId?: number) => void, handleShow: (userId?: number) => void, handleContacts: (id: number) => void, handleConsignees: (id: number) => void, handleAttachments: (id: number) => void, handleSuccess: () => void): ColumnDef<CustomerDataType>[] => [
    {
        accessorKey: 'cust_id',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>ID</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { cust_id } = original;
            return (
                <span>{cust_id}</span>
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
        accessorKey: 'name',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Customer Name</span>
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
        id: 'address',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Address</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { address } = original;
            return (
                <span>{address}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'customer_type',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Customer Type</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { customer_type } = original;
            return (
                <span>{customer_type?.name || 'N/A'}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'country',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Country</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { country } = original;
            return (
                <span>{country?.name || 'N/A'}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'segment',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Segment</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { segment } = original;
            return (
                <span>{segment?.name || 'N/A'}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'category',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Category</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { category } = original;
            return (
                <span>{category?.name || 'N/A'}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        }
    },
    {
        id: 'contact_person',
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ contact_person }) => contact_person
    },
    {
        id: 'contact_no',
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className:
                'fw-semibold ps-2 border-end border-translucent'
            }
        },
        accessorFn: ({ contact_no }) => contact_no
    },
    {
            id: 'leadDropdown',
            cell: ({ row: { original } }) => {
                const { id } = original;
                return (
                    <RevealDropdownTrigger>
                        <RevealDropdown>
                            <Dropdown.Item eventKey="1" onClick={() => handleView(id)}>View</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={() => handleShow(id)}>Edit</Dropdown.Item>
                            <Dropdown.Item eventKey="3" onClick={() => handleContacts(id)}>Contact Person</Dropdown.Item>
                            <Dropdown.Item eventKey="4" onClick={() => handleConsignees(id)}>Consignee</Dropdown.Item>
                            <Dropdown.Item eventKey="5" onClick={() => handleAttachments(id)}>Attachments</Dropdown.Item>
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

const CustomersTable = () => {
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

export default CustomersTable;
