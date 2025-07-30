import { ColumnDef } from '@tanstack/react-table';
import AdvanceTable from '../../components/base/AdvanceTable';
import AdvanceTableFooter from '../../components/base/AdvanceTableFooter';
import { ActivityDataType } from './ActivityLogs';


export const activityTableColumns = (): ColumnDef<ActivityDataType>[] => [
    {
        accessorKey: 'employee_details',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Employee Name</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { employee_details } = original;
            return (
                <span>{employee_details ? employee_details.name : ''}</span>
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
        accessorKey: 'ip_address',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Ip Address</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { ip_address } = original;
            return (
                <span>{ip_address}</span>
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
        id: 'browser',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Browser</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { user_agent } = original;
            return (
                <span>{user_agent}</span>
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
        accessorKey: 'login_at',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Login At</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { login_at } = original;
            return (
                <span>{login_at ? login_at : ''}</span>
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
        accessorKey: 'login_successful',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Login Successful</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { login_successful } = original;
            return (
                <span>{login_successful == '1' ? 'Yes' : 'No'}</span>
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
        id: 'logout_at',
        header: () => {
            return (
                <div className="d-inline-flex flex-center">
                    <span>Logout At</span>
                </div>
            );
        },
        cell: ({ row: { original } }) => {
            const { logout_at } = original;
            return (
                <span>{logout_at ? logout_at : ''}</span>
            );
        },
        meta: {
            headerProps: {
                className: 'ps-2 pe-2 border-end border-translucent'
            },
            cellProps: {
                className: 'ps-2 fw-semibold border-end border-translucent'
            }
        }
    },
];

const ActivityTable = () => {
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

export default ActivityTable;
